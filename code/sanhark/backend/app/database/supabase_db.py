from supabase import create_client, Client
from app.config import settings

# Supabase 클라이언트
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase() -> Client:
    return supabase