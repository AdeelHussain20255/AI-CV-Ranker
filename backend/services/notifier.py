import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

def send_email(to_email: str, subject: str, body: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_server or not smtp_username or not smtp_password:
        print("Email configuration missing. Skipping email send.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_slack_notification(message: str):
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url or webhook_url == "your-slack-webhook-url":
        print("Slack Webhook URL missing. Skipping Slack notification.")
        return

    try:
        response = requests.post(
            webhook_url,
            json={"text": message},
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code != 200:
            print(f"Failed to send Slack message. Status: {response.status_code}")
    except Exception as e:
        print(f"Error sending Slack message: {e}")

def notify_interview_scheduled(candidate_name: str, candidate_email: str, job_title: str, ai_score: int):
    # 1. Send Email to Candidate (Interview Invite)
    subject = f"Interview Invitation: {job_title}"
    body = f"""
    <html>
      <body>
        <h2>Hi {candidate_name},</h2>
        <p>Congratulations! Your profile is a strong match for the <strong>{job_title}</strong> position.</p>
        <p>We would love to schedule an interview with you.</p>
        <p>Please use our scheduling link below to pick a time that works for you:</p>
        <a href="https://calendly.com/your-company-link" style="display:inline-block;padding:10px 20px;background-color:#2563eb;color:white;text-decoration:none;border-radius:5px;">Schedule Interview</a>
        <br><br>
        <p>Best regards,<br>HR Team</p>
      </body>
    </html>
    """
    send_email(candidate_email, subject, body)

    # 2. Send Slack Notification to HR
    slack_message = f"🎉 *New Top Candidate Alert!*\n*{candidate_name}* just scored *{ai_score}%* for the *{job_title}* role. An automated interview invite has been sent to them!"
    send_slack_notification(slack_message)

def notify_rejection(candidate_email: str, job_title: str):
    # Optional: Send a polite rejection email
    pass
