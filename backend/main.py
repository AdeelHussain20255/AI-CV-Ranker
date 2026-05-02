from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load env before importing services!
load_dotenv()

from services.cv_parser import extract_text_from_pdf
from services.ai_scorer import score_candidate
from services.notifier import send_email, send_slack_notification

app = FastAPI(title="CV ATS Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze-cv")
async def analyze_cv(
    file: UploadFile = File(...),
    email: str = Form(None),
    name: str = Form("Candidate")
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # 1. Parse PDF
        file_bytes = await file.read()
        cv_text = extract_text_from_pdf(file_bytes)
        
        # 2. Analyze with Gemini
        ai_result = score_candidate(cv_text)
        
        score = ai_result["score"]
        improvements = ai_result["improvements"]

        # 3. Trigger Notifications!
        # Slack alert for admin
        slack_msg = f"📄 *New CV Analyzed!*\n*{name}* just scanned their resume and got an ATS Score of *{score}%*."
        send_slack_notification(slack_msg)

        # Email the result to the user
        if email:
            subject = f"Your ATS Resume Score is {score}%"
            html_body = f"""
            <html>
                <body>
                    <h2>Hi {name},</h2>
                    <p>We finished analyzing your resume. Your overall ATS score is <strong>{score}/100</strong>.</p>
                    <h3>Here is how you can improve it:</h3>
                    <p>{improvements.replace(chr(10), '<br>')}</p>
                </body>
            </html>
            """
            send_email(email, subject, html_body)
        
        return ai_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CV: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
