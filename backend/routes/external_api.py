import urllib.request
import json
from fastapi import APIRouter, Depends

from models.db_models import User
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/external", tags=["External API"])

@router.get("/advice")
def get_daily_advice(current_user: User = Depends(get_current_user)):
    """Fetches a random advice slip from an external public API."""
    try:
        # Call the external API
        req = urllib.request.Request("https://api.adviceslip.com/advice", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {"text": data["slip"]["advice"]}
    except Exception as e:
        # Fallback if the external API is down
        return {"text": "Stay focused and keep shipping great work."}
    