from fastapi import FastAPI
from fastapi.responses import JSONResponse
import requests
import json
import urllib.parse
import time
import datetime
from typing import List, Dict

app = FastAPI()

# 変数定義
apis = [
    "http://invidious.materialio.us/",
    "http://invidious.perennialte.ch/",
    "http://yewtu.be/",
     "https://iv.datura.network/",
    "https://invidious.private.coffee/",
    "https://invidious.protokolla.fi/",
    "https://yt.cdaut.de/",
    "https://invidious.fdn.fr/",
    "https://inv.tux.pizza/",
    "https://invidious.privacyredirect.com/",
    "https://invidious.drgns.space/",
    "https://vid.puffyan.us/",
    "https://invidious.jing.rocks/",
    "https://youtube.076.ne.jp/",
    "https://inv.riverside.rocks/",
    "https://invidio.xamh.de/",
    "https://y.com.sb/",
    "https://invidious.sethforprivacy.com/",
    "https://invidious.tiekoetter.com/",
    "https://inv.bp.projectsegfau.lt/",
    "https://inv.vern.cc/",
    "https://invidious.nerdvpn.de/",
    "https://inv.privacy.com.de/",
    "https://invidious.rhyshl.live/",
    "https://invidious.slipfox.xyz/",
    "https://invidious.weblibre.org/",
    "https://invidious.namazso.eu/",
    "https://invidious.jing.rocks",
    "https://inv.nadeko.net/",
]
max_time = 10  # タイムアウト
max_api_wait_time = 5  # APIの最大待機時間

class APItimeoutError(Exception):
    pass

def is_json(myjson):
    try:
        json_object = json.loads(myjson)
    except ValueError:
        return False
    return True

def apirequest(url):
    global apis
    starttime = time.time()
    for api in apis:
        if time.time() - starttime >= max_time - 1:
            break
        try:
            res = requests.get(api + url, timeout=max_api_wait_time)
            if res.status_code == 200 and is_json(res.text):
                return res.text
            else:
                print(f"エラー: {api}")
                apis.append(api)
                apis.remove(api)
        except:
            print(f"タイムアウト: {api}")
            apis.append(api)
            apis.remove(api)
    raise APItimeoutError("APIがタイムアウトしました")

# データ取得用の関数
def get_data(videoid):
    t = json.loads(apirequest(r"api/v1/videos/" + urllib.parse.quote(videoid)))
    return [
        {"id": i["videoId"], "title": i["title"], "authorId": i["authorId"], "author": i["author"]}
        for i in t["recommendedVideos"]
    ], list(reversed([i["url"] for i in t["formatStreams"]]))[:2], t["descriptionHtml"].replace("\n", "<br>"), t["title"], t["authorId"], t["author"], t["authorThumbnails"][-1]["url"]

def get_search(q, page):
    t = json.loads(apirequest(fr"api/v1/search?q={urllib.parse.quote(q)}&page={page}&hl=jp"))
    def load_search(i):
        if i["type"] == "video":
            return {
                "title": i["title"], "id": i["videoId"], "authorId": i["authorId"],
                "author": i["author"], "length": str(datetime.timedelta(seconds=i["lengthSeconds"])),
                "published": i["publishedText"], "type": "video"
            }
        elif i["type"] == "playlist":
            return {"title": i["title"], "id": i["playlistId"], "thumbnail": i["videos"][0]["videoId"], "count": i["videoCount"], "type": "playlist"}
        else:
            return {"author": i["author"], "id": i["authorId"], "thumbnail": i["authorThumbnails"][-1]["url"], "type": "channel"}
    return [load_search(i) for i in t]

@app.get("/api/videos/{videoid}")
async def read_video(videoid: str):
    try:
        data = get_data(videoid)
        return JSONResponse(content=data)
    except APItimeoutError as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/search")
async def search(query: str, page: int = 1):
    try:
        results = get_search(query, page)
        return JSONResponse(content=results)
    except APItimeoutError as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
