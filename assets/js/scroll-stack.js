document.addEventListener("DOMContentLoaded", () => {
    // === 1. 取得 DOM 元素 ===
    const scroller = document.getElementById('scroll-stack-container');
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    const masonryList = document.getElementById('masonry-list');

    // === 2. 定義圖片資料庫 (綁定卡片) ===
    // 這裡的 h 代表圖片的高度比例。 
    // 若寬度是 1，16:9 的高度約是 0.56，2:3 的高度約是 1.5
    const galleryGroups = [
        // 01 / 直升機盤旋之下 (卡片 1)
        [
            { img: 'photo/pic04.jpg', h: 0.6 },  // 橫圖
            { img: 'photo/pic05.jpg', h: 1.5 },  // 直圖
            { img: 'photo/pic04.jpg', h: 0.6 },
            { img: 'photo/pic05.jpg', h: 0.6 },
            { img: 'photo/pic04.jpg', h: 1.5 }
        ],
        // 02 / 垃圾與污染 (卡片 2)
        [
            { img: 'photo/pic06.jpg', h: 1.5 },
            { img: 'photo/pic07.jpg', h: 0.6 },
            { img: 'photo/pic06.jpg', h: 0.6 },
            { img: 'photo/pic07.jpg', h: 1.5 }
        ],
        // 03 / 生態邊界模糊 (卡片 3)
        [
            { img: 'photo/pic05.jpg', h: 0.6 },
            { img: 'photo/pic04.jpg', h: 1.5 },
            { img: 'photo/pic06.jpg', h: 0.6 }
        ],
        // 04 / 承載力超負荷 (卡片 4)
        [
            { img: 'photo/pic07.jpg', h: 1.5 },
            { img: 'photo/pic05.jpg', h: 0.6 },
            { img: 'photo/pic04.jpg', h: 1.5 }
        ]
    ];

    // === 3. 卡片堆疊與縮放邏輯 (保留你原本的優雅效果) ===
    const itemScale = 0.04;       
    const baseScale = 0.85; 
    let initialOffsets = [];

    function calculateOffsets() {
        cards.forEach(card => card.style.position = 'static');
        initialOffsets = cards.map(card => card.getBoundingClientRect().top + window.scrollY);
        cards.forEach(card => card.style.position = ''); 
    }
    
    // 初始化並監聽視窗改變
    calculateOffsets(); // 網頁初步載入時算一次
    window.addEventListener('load', calculateOffsets); 
    
    window.addEventListener('resize', () => {
        calculateOffsets();
        if(currentActiveCard !== -1) {
            renderMasonry(currentActiveCard);
        }
    });

    let currentActiveCard = -1;
    let isUpdating = false;

    // === 4. 渲染右側絕對定位瀑布流 (參考 Masonry 框架邏輯) ===
    function renderMasonry(groupIndex) {
        if (!masonryList) return;
        
        const itemsToRender = galleryGroups[groupIndex] || galleryGroups[0];
        const containerWidth = masonryList.clientWidth;
        
        // 設定欄數：螢幕夠寬就 2 欄，太窄就 1 欄[cite: 5]
        const columns = containerWidth > 350 ? 2 : 1; 
        const colWidth = containerWidth / columns;
        
        // 追蹤每欄目前累積的高度[cite: 5]
        const colHeights = new Array(columns).fill(0);

        // 先清空原本的 DOM
        masonryList.innerHTML = ''; 

        itemsToRender.forEach((item, index) => {
            // 找出目前最短的那一欄，把圖片塞進去[cite: 5]
            let minCol = colHeights.indexOf(Math.min(...colHeights));
            
            const x = minCol * colWidth;
            const y = colHeights[minCol];
            const itemHeight = colWidth * item.h;

            // 創建圖片包裝層[cite: 4]
            const el = document.createElement('div');
            el.className = 'item-wrapper';
            el.style.width = `${colWidth}px`;
            el.style.height = `${itemHeight}px`;
            
            // 初始狀態：往下掉 100px 且透明，準備進場
            el.style.transform = `translate3d(${x}px, ${y + 100}px, 0)`;
            el.style.opacity = '0';
            
            el.innerHTML = `<div class="item-img" style="background-image: url('${item.img}')"></div>`;
            masonryList.appendChild(el);

            // 更新該欄的高度[cite: 5]
            colHeights[minCol] += itemHeight;

            // 觸發階梯式滑入動畫
            setTimeout(() => {
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                el.style.opacity = '1';
            }, 50 + (index * 100)); 
        });

        // 必須手動設定父容器高度，以免 overflow 異常[cite: 5]
        masonryList.style.height = `${Math.max(...colHeights)}px`;
    }

    // === 5. 滾動偵測與觸發 ===
    function updateScrollEffects() {
        if (isUpdating) return;
        isUpdating = true;

        const scrollTop = window.scrollY;
        let detectedActiveIndex = 0;

        // 計算卡片縮小與目前激活的卡片[cite: 1]
        cards.forEach((card, i) => {
            const cardTop = initialOffsets[i];
            const stickyPoint = cardTop - (window.innerHeight * 0.15 + i * 75);

            // 稍微提早一點觸發切換，讓體驗更好
            if (scrollTop >= stickyPoint - window.innerHeight * 0.3) {
                detectedActiveIndex = i;
            }

            // 處理卡片堆疊時的縮小特效[cite: 1]
            let scale = 1;
            if (scrollTop > stickyPoint) {
                const overscroll = scrollTop - stickyPoint;
                scale = Math.max(baseScale, 1 - (overscroll / 1000 * itemScale));
            }

            if (i === cards.length - 1) {
                scale = 1; 
            }
            
            card.style.transform = `scale(${scale.toFixed(4)})`;
        });

        // 如果目前激活的卡片變了，就切換右邊的圖[cite: 1]
        if (detectedActiveIndex !== currentActiveCard) {
            currentActiveCard = detectedActiveIndex;
            
            // 讓舊照片牆淡出
            masonryList.classList.add('fade-out');
            
            setTimeout(() => {
                renderMasonry(currentActiveCard);
                masonryList.classList.remove('fade-out');
            }, 300);
        }

        isUpdating = false;
    }

    // 綁定滾動事件
    let rafId = null;
    window.addEventListener('scroll', () => {
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                updateScrollEffects();
                rafId = null;
            });
        }
    }, { passive: true });

    // 初始化第一次渲染
    updateScrollEffects();
});