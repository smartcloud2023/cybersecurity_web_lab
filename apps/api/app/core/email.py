import logging
import smtplib
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger("cyberlab.email")


def _log_fallback(to_email: str, code: str) -> None:
    message = f"[CyberLab email] Verification code for {to_email}: {code}"
    print(message)
    logger.warning(message)


def send_verification_email(to_email: str, code: str) -> None:
    if not settings.smtp_host:
        # No SMTP provider configured (see .env.example for setup) — fall
        # back to a console log so local/dev deployments stay usable.
        _log_fallback(to_email, code)
        return

    message = MIMEText(
        f"Your CyberLab verification code is: {code}\n\n"
        "This code expires in 10 minutes. If you didn't request this, "
        "you can ignore this email."
    )
    message["Subject"] = "Your CyberLab verification code"
    message["From"] = settings.smtp_from_email
    message["To"] = to_email

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_from_email, [to_email], message.as_string())
        logger.info("Sent verification email to %s", to_email)
    except Exception:
        # A transient SMTP failure shouldn't break registration/resend —
        # log it loudly and fall back to the console so the code is still
        # recoverable operator-side.
        logger.exception("Failed to send verification email to %s", to_email)
        _log_fallback(to_email, code)
