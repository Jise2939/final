document.addEventListener("DOMContentLoaded", () => {
    const scroller = document.getElementById('scroll-stack-container');
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    const splitLayout = document.querySelector('.split-layout');
    const galleryContainer = document.getElementById('masonry-gallery-container');
    const masonryList = document.getElementById('masonry-list');

    const itemScale = 0.04;       
    const baseScale = 0.85; 

    // 1. 測量卡片的原始位置
    let initialOffsets = [];
    function calculateOffsets() {
        // 測量時暫時解除 sticky，以獲取精準的文檔流座標
        cards.forEach(card => card.style.position = 'static');
        initialOffsets = cards.map(card => card.getBoundingClientRect().top + window.scrollY);
        cards.forEach(card => card.style.position = ''); 
    }

    calculateOffsets();
    window.addEventListener('resize', calculateOffsets);

    // 2. 瀑布流照片庫
    const galleryItems = [
        { id: 1, img: 'images/pic04.jpg', heightRatio: 1.2 },
        { id: 2, img: 'images/pic05.jpg', heightRatio: 0.8 },
        { id: 3, img: 'images/pic06.jpg', heightRatio: 1.4 },
        { id: 4, img: 'images/pic07.jpg', heightRatio: 1.0 },
        { id: 5, img: 'images/pic04.jpg', heightRatio: 1.1 },
        { id: 6, img: 'images/pic05.jpg', heightRatio: 1.3 },
        { id: 7, img: 'images/pic06.jpg', heightRatio: 0.9 }
    ];

    let hasRenderedMasonry = false;

    function renderMasonry() {
        if (!masonryList) return;
        masonryList.innerHTML = ''; 
        
        const containerWidth = masonryList.clientWidth;
        const columns = containerWidth > 400 ? 2 : 1; 
        const columnWidth = containerWidth / columns;
        const colHeights = new Array(columns).fill(0);

        galleryItems.forEach((item, index) => {
            let shortestColIndex = 0;
            let minHeight = colHeights[0];
            for (let i = 1; i < columns; i++) {
                if (colHeights[i] < minHeight) {
                    minHeight = colHeights[i];
                    shortestColIndex = i;
                }
            }

            const x = shortestColIndex * columnWidth;
            const y = colHeights[shortestColIndex];
            const itemHeight = columnWidth * item.heightRatio;

            const el = document.createElement('div');
            el.className = 'item-wrapper';
            el.style.transform = `translate(${x}px, ${y + 100}px)`;
            el.style.width = `${columnWidth}px`;
            el.style.height = `${itemHeight}px`;
            el.style.opacity = '0';
            el.innerHTML = `<div class="item-img" style="background-image: url('${item.img}')"></div>`;
            masonryList.appendChild(el);

            colHeights[shortestColIndex] += itemHeight;

            setTimeout(() => {
                el.style.transform = `translate(${x}px, ${y}px)`;
                el.style.opacity = '1';
            }, 100 + (index * 100)); 
        });
    }

    // 3. 滾動動畫核心
    let isUpdating = false;

    function updateScrollEffects() {
        if (isUpdating) return;
        isUpdating = true;

        const scrollTop = window.scrollY;
        let activeIndex = 0;

        cards.forEach((card, i) => {
            const cardTop = initialOffsets[i];
            
            // 計算這張卡片何時會「撞到」它該黏住的位置 (15vh + 階梯高度)
            const stickyPoint = cardTop - (window.innerHeight * 0.15 + i * 75);

            // 如果滾動超過了黏著點，代表這張卡片正在畫面上方
            if (scrollTop >= stickyPoint - 100) {
                activeIndex = i;
            }

            // 計算背後卡片的縮小比例 (完全不用 translateY，只做縮放)
            let scale = 1;
            if (scrollTop > stickyPoint) {
                const overscroll = scrollTop - stickyPoint;
                scale = Math.max(baseScale, 1 - (overscroll / 800 * itemScale));
            }
            
            card.style.transform = `scale(${scale.toFixed(4)})`;
        });

        // 判斷是否需要將整體版面往左平移，並呼叫右側瀑布流
        if (splitLayout) {
            // 當開始閱讀第二張卡片時，觸發分裂
            if (activeIndex > 0) {
                splitLayout.classList.add('is-split');
                if (galleryContainer && !hasRenderedMasonry) {
                    hasRenderedMasonry = true;
                    // 等待左移運鏡進行到一半，右側照片牆再優雅出現
                    setTimeout(renderMasonry, 300); 
                }
            } else {
                splitLayout.classList.remove('is-split');
            }
        }

        isUpdating = false;
    }

    let rafId = null;
    window.addEventListener('scroll', () => {
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                updateScrollEffects();
                rafId = null;
            });
        }
    }, { passive: true });

    updateScrollEffects();
});