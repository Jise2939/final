document.addEventListener("DOMContentLoaded", function() {
    
    // ====== 參數設定 (請根據實際路徑微調) ======
    const BLUE_SRC = "photo/蓝色帐篷.png"; 
    const RED_SRC = "photo/红色帐篷.png";
    const BLUE_TOTAL = 50;
    const RED_TOTAL = 400;

    // ====== 取得 DOM 元素 ======
    const section = document.getElementById("campSection");
    const field = document.getElementById("tentField");
    const redCountEl = document.getElementById("redCount");
    const totalCountEl = document.getElementById("totalCount");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");

    // 如果頁面上沒有這個區塊，就直接退出程式，避免報錯
    if (!section || !field) return;

    const blueTents = [];
    const redTents = [];

    // ====== 核心功能 ======
    function seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function createTent(type) {
        const img = document.createElement("img");
        img.src = type === "blue" ? BLUE_SRC : RED_SRC;
        img.className = "tent " + type;
        img.alt = type === "blue" ? "藍色帳篷" : "紅色帳篷";
        field.appendChild(img);
        return img;
    }

    function createAllTents() {
        field.innerHTML = "";
        blueTents.length = 0;
        redTents.length = 0;
        for (let i = 0; i < BLUE_TOTAL; i++) blueTents.push(createTent("blue"));
        for (let i = 0; i < RED_TOTAL; i++) redTents.push(createTent("red"));
        layoutTents();
    }

    function layoutTents() {
        const w = field.clientWidth;
        const h = field.clientHeight;
        const tentW = window.innerWidth <= 768 ? 28 : 42;
        const tentH = window.innerWidth <= 768 ? 22 : 32;

        // 藍色帳篷佈局
        const blueCols = 10;
        const blueRows = 5;
        const blueGapX = w / blueCols;
        const blueGapY = h / blueRows;
        
        blueTents.forEach((tent, i) => {
            const row = Math.floor(i / blueCols);
            const col = i % blueCols;
            const jitterX = (seededRandom(i * 3.11) - 0.5) * blueGapX * 0.18;
            const jitterY = (seededRandom(i * 5.23) - 0.5) * blueGapY * 0.18;
            const left = col * blueGapX + blueGapX / 2 - tentW / 2 + jitterX;
            const top = row * blueGapY + blueGapY / 2 - tentH / 2 + jitterY;
            
            tent.style.left = `${Math.max(0, Math.min(left, w - tentW))}px`;
            tent.style.top = `${Math.max(0, Math.min(top, h - tentH))}px`;
            tent.style.setProperty("--rot", "0deg");
            tent.style.setProperty("--scale", "1");
            tent.style.zIndex = 40;
            tent.classList.add("show");
        });

        // 紅色帳篷佈局
        const redCols = 25;
        const redRows = Math.ceil(RED_TOTAL / redCols);
        const redGapX = w / redCols;
        const redGapY = h / redRows;
        
        redTents.forEach((tent, i) => {
            const row = Math.floor(i / redCols);
            const col = i % redCols;
            const jitterX = (seededRandom(i * 7.17) - 0.5) * redGapX * 0.45;
            const jitterY = (seededRandom(i * 9.41) - 0.5) * redGapY * 0.45;
            let left = col * redGapX + redGapX / 2 - tentW / 2 + jitterX;
            let top = row * redGapY + redGapY / 2 - tentH / 2 + jitterY;
            
            left = Math.max(0, Math.min(left, w - tentW));
            top = Math.max(0, Math.min(top, h - tentH));
            const rot = (seededRandom(i * 11.9) - 0.5) * 16;
            const scale = 0.82 + seededRandom(i * 6.4) * 0.18;
            
            tent.style.left = `${left}px`;
            tent.style.top = `${top}px`;
            tent.style.setProperty("--rot", `${rot}deg`);
            tent.style.setProperty("--scale", scale.toFixed(2));
            tent.style.zIndex = 8 + Math.floor(seededRandom(i * 13.8) * 22);
        });
    }

    function updateVisual() {
        const rect = section.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), totalScrollable);
        const progress = totalScrollable > 0 ? scrolled / totalScrollable : 0;
        
        const visibleRed = Math.floor(progress * RED_TOTAL);
        const visibleTotal = BLUE_TOTAL + visibleRed;
        
        redTents.forEach((tent, i) => {
            tent.classList.toggle("show", i < visibleRed);
        });
        
        redCountEl.textContent = visibleRed;
        totalCountEl.textContent = visibleTotal;
        progressFill.style.width = `${progress * 100}%`;
        
        if (progress < 0.18) {
            progressText.innerHTML = "官方建議容量下，50個營位可較平均分布在營地內。";
        } else if (progress < 0.75) {
            progressText.innerHTML = `紅色帳篷逐步填入空隙，營地密度正在上升：<span>${visibleRed}</span> 個額外帳篷`;
        } else {
            progressText.innerHTML = `最終狀態：50個建議營位 + <span>400</span> 個額外帳篷，帳篷間距大幅縮小。`;
        }
    }

    // ====== 初始化與事件監聽 ======
    createAllTents();
    updateVisual();
    
    window.addEventListener("scroll", updateVisual);
    window.addEventListener("resize", () => {
        layoutTents();
        updateVisual();
    });
});