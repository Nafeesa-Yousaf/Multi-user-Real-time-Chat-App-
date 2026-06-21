import json
from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from connection_manager import ConnectionManager

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

connection_manager = ConnectionManager()

@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse(request, "index.html")

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await connection_manager.connect(websocket)
    await connection_manager.broadcast(
        json.dumps({"user": "System", "message": f"{username} joined the chat"})
    )

    try:
        while True:
            data = await websocket.receive_text()
            await connection_manager.broadcast(
                json.dumps({"user": username, "message": data})
            )

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        await connection_manager.broadcast(
            json.dumps({"user": "System", "message": f"{username} left the chat"})
        )