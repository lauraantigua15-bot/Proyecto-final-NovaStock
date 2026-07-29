import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

backend_path = Path(__file__).resolve().parent.parent
env_path = backend_path / ".env"

load_dotenv(env_path, override=True)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SECRET_KEY")

if not supabase_url or not supabase_key:
    raise ValueError(
        "Faltan las variables de entorno de Supabase."
    )

# Cliente exclusivo para consultar y modificar los datos.
supabase_admin: Client = create_client(
    supabase_url,
    supabase_key
)

# Cliente separado, utilizado únicamente para autenticación.
supabase_auth: Client = create_client(
    supabase_url,
    supabase_key
)