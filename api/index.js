const express = require("express");
const cors = require("cors");
const youtubedl = require("youtube-dl-exec");
const router = express.Router();

router.use(cors());

function getInfo(url) {
    return youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true
    });
}

router.get("/view", async (req, res) => {
    const { url } = req.query;
    try {
        const info = await getInfo(url);
        const videoFormats = info.formats.filter(format => format.vcodec !== "none" && format.acodec !== "none");
        const videoUrl = videoFormats[videoFormats.length - 1].url; // 最も高い品質の動画URLを選択
        res.redirect(videoUrl);
    } catch (error) {
        console.error("Error fetching video info:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
