document.addEventListener("DOMContentLoaded", () => {
    const scroller = document.getElementById('scroll-stack-container');
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    const endElement = scroller.querySelector('.scroll-stack-end');
    
    // 設定參數
    const itemStackDistance = 40; 
    const itemScale = 0.04;       
    const baseScale = 0.85; // 稍微把最小比例調低一點，景深效果會更好
    const stackPositionPx = window.innerHeight * 0.05; 

    // 🌟 緩存卡片的初始絕對座標，徹底避免滾動時重算 DOM 造成的卡頓
    let initialOffsets = [];
    function calculateOffsets() {
        // 先清除所有 transform 才能抓到最準的原始位置
        cards.forEach(card => {
            card.style.transition = 'none'; // 測量時關閉動畫
            card.style.transform = 'none';
        });
        
        initialOffsets = cards.map(card => card.getBoundingClientRect().top + window.scrollY);
        
        // 測量完畢後恢復 transition
        requestAnimationFrame(() => {
            cards.forEach(card => card.style.transition = '');
        });
    }

    // 初始化與視窗變動時重新測量
    calculateOffsets();
    window.addEventListener('resize', calculateOffsets);

    let isUpdating = false;

    function updateCardTransforms() {
        if (isUpdating) return;
        isUpdating = true;

        const scrollTop = window.scrollY;
        const containerHeight = window.innerHeight;
        // 抓取最後一個隱形元素的位置，用來判斷何時解除堆疊
        const endElementTop = endElement.getBoundingClientRect().top + window.scrollY;

        cards.forEach((card, i) => {
            // 直接使用快取的初始座標
            const cardTop = initialOffsets[i];
            
            // 計算這張卡片該停在哪裡
            const pinStart = cardTop - stackPositionPx - (itemStackDistance * i);
            const pinEnd = endElementTop - containerHeight / 2;

            let translateY = 0;
            let scale = 1;

            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
            const isPastPin = scrollTop > pinEnd;

            if (isPinned || isPastPin) {
                // 如果滾動超過了底部，就把數值鎖死在最大值，跟著網頁一起往上滾
                const maxScroll = isPastPin ? pinEnd : scrollTop;
                
                translateY = maxScroll - pinStart;
                
                // 🌟 絲滑的魔法：使用「連續的距離」來計算縮放，而不是「有幾張卡片」
                // 假設每滾動 600px，卡片就縮小 0.04 (itemScale)
                const overscroll = maxScroll - pinStart;
                const smoothDepth = overscroll / 600; 
                
                scale = Math.max(baseScale, 1 - (smoothDepth * itemScale));
            }

            // 使用 toFixed 限制小數點位數，減少瀏覽器渲染壓力
            card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
            card.style.filter = 'none'; 
        });

        isUpdating = false;
    }

    // 監聽滾動事件，使用 passive: true 提升滾動效能
    let rafId = null;
    window.addEventListener('scroll', () => {
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                updateCardTransforms();
                rafId = null;
            });
        }
    }, { passive: true });

    // 初始執行一次
    updateCardTransforms();
});