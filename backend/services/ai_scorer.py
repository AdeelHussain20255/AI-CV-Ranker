import os
import google.generativeai as genai
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

def score_candidate(cv_text: str) -> dict:
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) Analyzer and Senior HR Professional.
    Analyze the following CV text and provide an overall ATS score (0-100) based on:
    - Formatting and parsability
    - Clarity and impact
    - Use of strong action verbs
    - Inclusion of quantifiable achievements
    - Overall professional presentation
    
    Then, provide a bulleted list of specific, actionable improvements the candidate should make to improve their CV.
    
    Candidate CV:
    {cv_text}
    
    Return the result EXACTLY as a JSON object with two keys:
    - "score": integer
    - "improvements": string (can include markdown bullets or newlines)
    """
    
    response = model.generate_content(prompt)
    
    try:
        result_text = response.text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:-3]
        elif result_text.startswith("```"):
            result_text = result_text[3:-3]
            
        data = json.loads(result_text)
        return {
            "score": int(data.get("score", 0)),
            "improvements": str(data.get("improvements", "Failed to generate improvements."))
        }
    except Exception as e:
        print("Error parsing Gemini response:", e)
        return {
            "score": 0,
            "improvements": "Failed to parse AI response."
        }
