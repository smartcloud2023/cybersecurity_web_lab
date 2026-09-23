import logging
import subprocess
import uuid
from dataclasses import dataclass
from typing import Protocol

from app.core.config import settings
from app.models.lab import Lab, LabVariant
from app.models.lab_session import LabSession

logger = logging.getLogger("cyberlab.provisioner")


class ProvisioningError(Exception):
    pass


@dataclass
class ProvisionResult:
    resource_ref: str
    port: int
    connection_info: str


class LabProvisioner(Protocol):
    def provision(
        self, session: LabSession, lab: Lab, variant: LabVariant, flag: str
    ) -> ProvisionResult: ...

    def destroy(self, session: LabSession) -> None: ...


class DockerProvisioner:
    """Runs each session's target as its own container on the same Docker
    host as the API (the "DooD" pattern — the api container needs
    /var/run/docker.sock mounted in, see docker-compose.yml). A legitimate
    single-host MVP approach, not the final architecture: the blueprint's
    own plan is to move this to AWS Fargate/ECS once there's real usage to
    justify it. Mounting the Docker socket gives the api container
    effectively root-equivalent access to the host, so treat that mount as
    seriously as SECRET_KEY — never expose it beyond this one container.
    """

    def provision(
        self, session: LabSession, lab: Lab, variant: LabVariant, flag: str
    ) -> ProvisionResult:
        container_name = f"cyberlab-session-{session.id}"
        param_name = (variant.param_names or ["q"])[0]

        try:
            subprocess.run(
                [
                    "docker",
                    "run",
                    "-d",
                    "--rm",
                    "--name",
                    container_name,
                    "--network",
                    settings.lab_docker_network,
                    "-p",
                    "5000",  # let Docker pick a free host port
                    "-e",
                    f"FLAG={flag}",
                    "-e",
                    f"VULN_PARAM={param_name}",
                    lab.template,
                ],
                check=True,
                capture_output=True,
                text=True,
                timeout=30,
            )
        except subprocess.CalledProcessError as exc:
            raise ProvisioningError(f"docker run failed: {exc.stderr}") from exc
        except subprocess.TimeoutExpired as exc:
            raise ProvisioningError("docker run timed out") from exc

        try:
            port_output = subprocess.run(
                ["docker", "port", container_name, "5000"],
                check=True,
                capture_output=True,
                text=True,
                timeout=10,
            ).stdout.strip()
            # e.g. "0.0.0.0:32768"
            port = int(port_output.rsplit(":", 1)[-1])
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ValueError) as exc:
            self.destroy(session, container_name_override=container_name)
            raise ProvisioningError(f"couldn't read published port: {exc}") from exc

        connection_info = f"http://{settings.lab_public_host}:{port}/"
        return ProvisionResult(
            resource_ref=container_name, port=port, connection_info=connection_info
        )

    def destroy(self, session: LabSession, container_name_override: str | None = None) -> None:
        container_name = container_name_override or session.resource_ref
        if not container_name:
            return
        try:
            subprocess.run(
                ["docker", "stop", "-t", "5", container_name],
                capture_output=True,
                text=True,
                timeout=15,
            )
        except subprocess.TimeoutExpired:
            logger.warning("docker stop timed out for %s", container_name)


class FakeProvisioner:
    """Tracks sessions through the real state machine without touching
    Docker — lets every other piece (quota, heartbeat, idle reaping, flag
    validation) be exercised for real in an environment without a Docker
    daemon. Never use this outside of that — set LAB_PROVISIONER=docker for
    any deployment meant to actually run labs.
    """

    def provision(
        self, session: LabSession, lab: Lab, variant: LabVariant, flag: str
    ) -> ProvisionResult:
        fake_port = 40000 + (uuid.uuid4().int % 10000)
        return ProvisionResult(
            resource_ref=f"fake-{session.id}",
            port=fake_port,
            connection_info=f"http://{settings.lab_public_host}:{fake_port}/ (fake — no container was started)",
        )

    def destroy(self, session: LabSession) -> None:
        pass


def get_provisioner() -> LabProvisioner:
    if settings.lab_provisioner == "docker":
        return DockerProvisioner()
    return FakeProvisioner()
