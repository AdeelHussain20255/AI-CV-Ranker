import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client, Client

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

def get_job(job_id: str):
    response = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if response.data:
        return response.data[0]
    return None

def save_candidate(data: dict):
    response = supabase.table("candidates").insert(data).execute()
    return response.data[0] if response.data else None
