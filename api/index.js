const express = require("express");
const cors = require("cors");
const axios = require("axios");
const router = express.Router();

router.use(cors());

// Invidious APIのエンドポイントリスト
const apis = [
    "https://invidious.jing.rocks",
    "https://invidious.nerdvpn.de",
    "https://inv.nadeko.net"
];

// 動画検索
router.get("/search", async (req, res) => {
    const { query } = req.query;
    const randomApi = apis[Math.floor(Math.random() * apis.length)]; // ランダムにAPIを選択

    try {
        const response = await axios.get(`${randomApi}/api/v1/search`, {
            params: { query: query }
        });

        const videos = response.data.map(video => ({
            title: video.title,
            thumbnail: video.thumbnail_url,
            url: video.video_id // Invidiousの動画IDを使う
        }));

        res.json(videos);
    } catch (error) {
        console.error("Error fetching video search results:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 動画視聴処理
router.get("/view", async (req, res) => {
    const { url } = req.query;
    try {
        const videoUrl = `${apis[0]}/watch?v=${url}`; // InvidiousのURLにリダイレクト
        res.redirect(videoUrl);
    } catch (error) {
        console.error("Error processing video view request:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
