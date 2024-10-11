const form = document.querySelector("form");
const url = document.querySelector("input");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    var videoUrl = url.value;
    console.log(videoUrl);
    var video = document.createElement("video");
    video.src = "/api/view?url=" + encodeURIComponent(videoUrl);
    video.controls = true;
    video.playsInline = true;
    document.body.appendChild(video);
});

