from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import sys

# Add parent directory to path so we can import agentic.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic import run_agent

app = FastAPI()

# Allow React frontend to talk to backend
# Note: React dev server might be on 5173 or 5174, adding both just in case
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...), location: str = "India"):
    # Create an uploads directory if it doesn't exist
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    # Save uploaded file temporarily
    temp_path = os.path.join(upload_dir, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        print(f">>>>> [API v2.0] Processing request for location: {location} <<<<<")
        # Pass to your agentic AI backend
        absolute_path = os.path.abspath(temp_path)
        result = run_agent(absolute_path, location)
        
        return result
    except Exception as e:
        return {"error": str(e)}
    # Cleanup is optional if you want to keep history, 
    # but here's how to do it if needed:
    # finally:
    #     if os.path.exists(temp_path):
    #         os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)