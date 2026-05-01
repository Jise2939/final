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
        {
            type: 'video',
            src: '../../video/hali.mp4',      // 替換成你的影片路徑
            poster: '../../video/hali-cover.jpg' // 替換成你的影片封面圖
        },
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

// === 4. 渲染右側絕對定位瀑布流與影片 (增強版) ===
    function renderMasonry(groupIndex) {
        if (!masonryList) return;
        
        const contentData = galleryGroups[groupIndex] || galleryGroups[1]; // 獲取當前卡片對應的內容
        masonryList.innerHTML = ''; // 先清空原本的 DOM
        
        // 🌟 判斷 A：如果這組數據是影片
        if (!Array.isArray(contentData) && contentData.type === 'video') {
            const el = document.createElement('div');
            el.className = 'item-wrapper video-wrapper';
            // 讓影片在右側置中並撐滿容器
            el.style.position = 'relative';
            el.style.width = '100%';
            el.style.height = '75vh'; // 配合您 CSS 中 .right-sticky 的高度
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            
            // 載入影片標籤 
            el.innerHTML = `
                <video style="height: 100%; width: auto; max-width: 100%; border-radius: 12px; box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.1); background: transparent; outline: none;" 
                       controls playsinline poster="${contentData.poster}">
                    <source src="${contentData.src}" type="video/mp4">
                    您的瀏覽器不支援影片播放。
                </video>
            `;
            
            masonryList.appendChild(el);
            masonryList.style.height = '75vh'; // 固定外層高度
            
            // 觸發淡入動畫
            setTimeout(() => el.style.opacity = '1', 50);
            return; // 結束，不往下執行瀑布流邏輯
        }

        // 🌟 判斷 B：如果這組數據是原本的圖片瀑布流
        const itemsToRender = contentData;
        const containerWidth = masonryList.clientWidth;
        
        // 設定欄數：螢幕夠寬就 2 欄，太窄就 1 欄
        const columns = containerWidth > 350 ? 2 : 1; 
        const colWidth = containerWidth / columns;
        
        // 追蹤每欄目前累積的高度
        const colHeights = new Array(columns).fill(0);

        itemsToRender.forEach((item, index) => {
            // 找出目前最短的那一欄，把圖片塞進去
            let minCol = colHeights.indexOf(Math.min(...colHeights));
            
            const x = minCol * colWidth;
            const y = colHeights[minCol];
            const itemHeight = colWidth * item.h;

            // 創建圖片包裝層
            const el = document.createElement('div');
            el.className = 'item-wrapper';
            el.style.width = `${colWidth}px`;
            el.style.height = `${itemHeight}px`;
            
            // 初始狀態：往下掉 100px 且透明，準備進場
            el.style.transform = `translate3d(${x}px, ${y + 100}px, 0)`;
            el.style.opacity = '0';
            
            el.innerHTML = `<div class="item-img" style="background-image: url('${item.img}')"></div>`;
            masonryList.appendChild(el);

            // 更新該欄的高度
            colHeights[minCol] += itemHeight;

            // 觸發階梯式滑入動畫
            setTimeout(() => {
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                el.style.opacity = '1';
            }, 50 + (index * 100)); 
        });

        // 必須手動設定父容器高度，以免 overflow 異常
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