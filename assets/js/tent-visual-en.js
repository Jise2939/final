// assets/js/tent-visual.js

document.addEventListener("DOMContentLoaded", () => {
    // 🌟 請確保這兩張圖片已經放在您的 photo 資料夾中
    const BLUE_SRC = "photo/蓝色帐篷.png"; 
    const RED_SRC = "photo/红色帐篷.png";

    const BLUE_TOTAL = 50;
    const RED_TOTAL = 400;

    const section = document.getElementById("campSection");
    const field = document.getElementById("tentField");
    if(!section || !field) return;

    const redCountEl = document.getElementById("redCount");
    const totalCountEl = document.getElementById("totalCount");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");

    const blueTents = [];
    const redTents = [];
    let blueBoxes = [];

    function seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function createTent(type) {
        const img = document.createElement("img");
        img.src = type === "blue" ? BLUE_SRC : RED_SRC;
        img.className = "tent " + type;
        field.appendChild(img);
        return img;
    }

    function boxesOverlap(a, b) {
        const padding = 6;
        return !(a.x + a.w - padding < b.x || a.x + padding > b.x + b.w || a.y + a.h - padding < b.y || a.y + padding > b.y + b.h);
    }

    function layoutTents() {
        if(!field.clientWidth) return;
        const w = field.clientWidth;
        const h = field.clientHeight;
        const tentW = 38, tentH = 28;
        blueBoxes = [];

        blueTents.forEach((tent, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            const left = w * 0.1 + col * (w/12);
            const top = 15 + row * 40;
            tent.style.left = `${left}px`;
            tent.style.top = `${top}px`;
            tent.style.setProperty("--rot", "0deg");
            tent.style.setProperty("--scale", "1");
            tent.classList.add("show");
            blueBoxes.push({ x: left, y: top, w: tentW, h: tentH });
        });

        let placed = 0;
        for (let i = 0; i < RED_TOTAL; i++) {
            const tent = redTents[i];
            let left, top, safe = false, tries = 0;
            while (!safe && tries < 60) {
                left = seededRandom(i * 13 + tries) * (w - tentW);
                top = seededRandom(i * 21 + tries) * (h - tentH);
                safe = !blueBoxes.some(b => boxesOverlap({x: left, y: top, w: tentW, h: tentH}, b));
                tries++;
            }
            if(!safe) top = Math.min(h - tentH, top + 40);
            tent.style.left = `${left}px`;
            tent.style.top = `${top}px`;
            tent.style.setProperty("--rot", `${(seededRandom(i) - 0.5) * 20}deg`);
            tent.style.setProperty("--scale", (0.8 + seededRandom(i*6)*0.2).toFixed(2));
            tent.style.zIndex = Math.floor(seededRandom(i*13)*20);
        }
    }

    for (let i = 0; i < BLUE_TOTAL; i++) blueTents.push(createTent("blue"));
    for (let i = 0; i < RED_TOTAL; i++) redTents.push(createTent("red"));
    
    setTimeout(layoutTents, 100);

    window.addEventListener("scroll", () => {
        const rect = section.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
        const progress = totalScrollable > 0 ? scrolled / totalScrollable : 0;

        const visibleRed = Math.floor(progress * RED_TOTAL);
        redTents.forEach((tent, i) => tent.classList.toggle("show", i < visibleRed));
        
        redCountEl.textContent = visibleRed;
        totalCountEl.textContent = BLUE_TOTAL + visibleRed;
        progressFill.style.width = `${progress * 100}%`;

        if (progress < 0.1) {
            progressText.innerHTML = "Currently showing: 50 blue tents";
        } else if (progress < 0.95) {
            progressText.innerHTML = `Red tents are pouring in: <span style="color:#d33a2c;">${visibleRed}</span> additional tents`;
        } else {
            progressText.innerHTML = `Final state: 50 blue tents + <span style="color:#d33a2c;">400</span> red tents`;
        }
    }, { passive: true });

    window.addEventListener("resize", layoutTents);
});

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('youtube-player-container');
    const poster = document.getElementById('video-poster');
    const iframe = document.getElementById('youtube-iframe');

    if (container && poster && iframe) {
        container.addEventListener('click', () => {
            // 隱藏封面圖層
            poster.style.display = 'none';
            // 顯示並加載 YouTube 影片
            iframe.style.display = 'block';
        });
    }
});

var player;
// 1. 這個函數必須叫這個名字，API 載入後會自動執行
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'NZRBftmY7_k', // YouTube 影片 ID
        playerVars: {
            'autoplay': 0,      // 初始不自動播放
            'controls': 1,      // 顯示控制條
            'rel': 0,           // 結尾不顯示推薦影片
            'enablejsapi': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    const container = document.getElementById('youtube-player-container');
    const poster = document.getElementById('video-poster');

    if (container && poster) {
        container.addEventListener('click', () => {
            // 隱藏封面
            poster.style.display = 'none';
            // 指令：靜音並播放（靜音是為了確保 100% 成功播放，之後用戶可手動開聲）
            // 如果你堅持要大聲播放，就拿掉 mute()，但在部分瀏覽器可能會失敗
            player.playVideo();
        });
    }
}