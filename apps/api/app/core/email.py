import logging

logger = logging.getLogger("cyberlab.email")


def send_verification_email(to_email: str, code: str) -> None:
    # No real email provider is wired up yet — this is the one function to
    # replace with a real transport (e.g. Amazon SES, matching the
    # blueprint's AWS choice) before relying on email verification in front
    # of real users. Until then the code lands in the API's own logs, which
    # is fine for local/dev use but not a substitute for real delivery.
    message = f"[CyberLab email] Verification code for {to_email}: {code}"
    print(message)
    logger.warning(message)
