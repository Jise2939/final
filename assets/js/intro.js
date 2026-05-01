// assets/js/dam-scroll.js

document.addEventListener("DOMContentLoaded", () => {
    // 獲取 DOM 元素
    const damSection = document.getElementById("damScrollSection");
    const damImg = document.getElementById("damCrowdedImg");
    const damT1 = document.getElementById("damText1");
    const damT2 = document.getElementById("damText2");
    const damT3 = document.getElementById("damText3");

    // 確保區塊存在才執行，避免在沒有這個區塊的頁面報錯
    if (damSection) {
        window.addEventListener("scroll", () => {
            const rect = damSection.getBoundingClientRect();
            const h = window.innerHeight;

            // 計算滾動進度
            const total = rect.height - h;
            const scrolled = Math.min(Math.max(-rect.top, 0), total);
            const p = scrolled / total;

            // 改變人群圖片的透明度 (0 到 1)
            if (damImg) damImg.style.opacity = p;

            // 依據滾動百分比，切換文字框的顯示狀態
            if (damT1) damT1.classList.toggle("show", p > 0.08 && p < 0.35);
            if (damT2) damT2.classList.toggle("show", p > 0.35 && p < 0.7);
            if (damT3) damT3.classList.toggle("show", p > 0.72);
        }, { passive: true }); // 提升滾動性能
    }
});