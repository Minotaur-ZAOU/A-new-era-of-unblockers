import json
import requests
import urllib.parse
import time
import os
import subprocess
from fastapi import FastAPI, Depends, Cookie, Request, Response
from fastapi.responses import HTMLResponse, RedirectResponse as redirect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.templating import Jinja2Templates
from typing import Union, List

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(GZipMiddleware, minimum_size=1000)

templates = Jinja2Templates(directory='templates')

apis = [
    "https://invidious.jing.rocks",
    "https://invidious.nerdvpn.de",
    "https://inv.nadeko.net"
]

def check_cookie(cookie):
    return cookie == "True"

@app.get("/", response_class=HTMLResponse)
def home(response: Response, request: Request, yuki: Union[str] = Cookie(None)):
    if check_cookie(yuki):
        response.set_cookie("yuki", "True", max_age=60 * 60 * 24 * 7)
        return templates.TemplateResponse("home.html", {"request": request})
    return redirect("/search")

@app.get('/search', response_class=HTMLResponse)
def search(q: str, response: Response, request: Request, page: Union[int, None] = 1, yuki: Union[str] = Cookie(None)):
    if not check_cookie(yuki):
        return redirect("/")
    response.set_cookie("yuki", "True", max_age=60 * 60 * 24 * 7)
    return templates.TemplateResponse("search.html", {"request": request, "results": get_search(q, page), "word": q, "next": f"/search?q={q}&page={page + 1}"})

def get_search(query: str, page: int) -> List[dict]:
    url = f"{apis[0]}/api/v1/search?q={urllib.parse.quote(query)}&page={page}"
    response = requests.get(url)
    if response.status_code == 200:
        return [{"title": i["title"], "url": f"/watch?v={i['videoId']}", "thumbnail": f"https://img.youtube.com/vi/{i['videoId']}/0.jpg"} for i in response.json()["videos"]]
    return []

@app.get("/watch", response_class=HTMLResponse)
def video(v: str, response: Response, request: Request, yuki: Union[str] = Cookie(None)):
    if not check_cookie(yuki):
        return redirect("/")
    videoid = v
    response.set_cookie("yuki", "True", max_age=60 * 60 * 24 * 7)
    # Here would be additional logic to fetch video data and pass it to the template
    return templates.TemplateResponse("video.html", {"request": request, "video_id": videoid})

@app.exception_handler(500)
def page(request: Request, __):
    return templates.TemplateResponse("APIwait.html", {"request": request}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
