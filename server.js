const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ytdl = require("ytdl-core");
const getSubtitles = require("youtube-captions-scraper").getSubtitles;
const cors = require("cors");

app.use(cors({
    origin: "*"
}));

app.use(express.static("public"));

function getInfo(url) {
    if (!url || !ytdl.validateURL(url)) return Promise.reject(new Error('無効なURL'));
    return ytdl.getInfo(url);
}

app.get("/info", async (req, res) => {
    getInfo(req.query.url)
        .then(info => {
            res.json(info);
        })
        .catch(e => {
            console.log(e);
            res.status(400).send('Invalid URL');
        });
});

app.get("/download", async (req, res) => {
    getInfo(req.query.url)
        .then(info => {
            res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp4"`);
            ytdl(req.query.url, { format: "mp4", filter: "audioandvideo", quality: "lowestvideo" })
                .pipe(res);
        })
        .catch(e => {
            console.log(e);
            res.status(400).send('Invalid URL');
        });
});

app.get("/captions", async (req, res) => {
    var info = await getInfo(req.query.url);
    if (!info) return res.end();
    getSubtitles({
        videoID: info.videoDetails.videoId,
        lang: "en"
    })
        .then(captions => {
            res.json(captions);
        })
        .catch(e => {
            res.end(e.message);
        });
});

app.get("/view", async (req, res) => {
    var { url, quality } = req.query;
    if (!url || !ytdl.validateURL(url)) return res.status(400).send('無効なURL');
    
    getInfo(url)
        .then(info => {
            var formats = info.formats.filter(format => format.hasVideo && format.hasAudio);
            if (!formats.length) return res.status(400).send('Invalid URL');

            var video = quality === "lowest" ? formats[0] : formats[formats.length - 1];
            res.redirect(video.url);
        })
        .catch(e => {
            console.log(e);
            res.status(400).send('エラーが発生しました。');
        });
});

server.listen(8080, () => {
    console.log("Listening on *: 8080");
});
