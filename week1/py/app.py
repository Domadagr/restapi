from fastapi import FastAPI
from typing import List
from datetime import datetime
import psutil

app = FastAPI()
start_time = datetime.now()


@app.get("/api/status", response_model=dict)
async def status():
    # Calculate uptime
    uptime = datetime.now() - start_time
    # Get memory usage
    memory_usage = psutil.virtual_memory()._asdict()
    return{
        "status": "Running",
        "uptime": str(uptime),
        "date": datetime.now().isoformat(),
        "memory usage": memory_usage
        }




