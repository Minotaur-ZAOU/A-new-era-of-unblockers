const form = document.querySelector("#form");
const queryInput = document.querySelector("#query");
const resultsDiv = document.querySelector("#results");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = queryInput.value;

    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error("ネットワークエラーが発生しました");
        }

        const data = await response.json();
        resultsDiv.innerHTML = ""; // 最初に結果をクリア
        data.forEach(video => {
            const videoElement = document.createElement("div");
            videoElement.classList.add("video-item");
            videoElement.innerHTML = `
                <h3>${video.title}</h3>
                <img src="${video.thumbnail}" alt="${video.title}" />
                <button data-url="${video.url}" class="view-video">視聴</button>
            `;
            resultsDiv.appendChild(videoElement);
        });

        // 動画視聴ボタンのイベントリスナーを追加
        document.querySelectorAll('.view-video').forEach(button => {
            button.addEventListener('click', (e) => {
                const videoUrl = e.target.dataset.url;
                const video = document.createElement("video");
                video.src = `/api/view?url=${encodeURIComponent(videoUrl)}`;
                video.controls = true;
                video.playsInline = true;
                document.body.appendChild(video);
                video.play(); // 自動再生
            });
        });
    } catch (error) {
        alert("検索中にエラーが発生しました。" + error.message);
    }
});

