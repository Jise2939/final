document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // 1. 麥理浩徑地圖與海拔圖表邏輯 (預設展開)
    // ==========================================
    const toggleBtn = document.getElementById('toggle-map-btn');
    const mapWrapper = document.getElementById('map-wrapper');
    let map; // 儲存地圖實例

    // 網頁載入時直接初始化地圖 (因為預設是展開的)
    if (document.getElementById('map-container')) {
        initMap();
    }

    // 點擊按鈕時收起/展開地圖
    if (toggleBtn && mapWrapper) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // 如果地圖目前是顯示狀態 (或沒有設定 display 屬性)，就把它隱藏
            if (mapWrapper.style.display !== 'none') {
                mapWrapper.style.display = 'none';
                toggleBtn.textContent = '查看路線與海拔圖'; // 還原按鈕文字
            } else {
                // 如果是隱藏的，就把它顯示出來
                mapWrapper.style.display = 'block';
                toggleBtn.textContent = '收起路線與海拔圖'; // 改變按鈕文字
                
                // 🌟 關鍵修復：每次重新展開時，必須觸發 resize 事件，
                // 否則 Leaflet 地圖會加載不全，D3 圖表寬度會算錯
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                    }
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            }
        });
    }

    // 初始化地圖與圖表的函式
    function initMap() {
        // 修正 Leaflet 預設 Icon 路徑問題
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // 建立地圖
        map = L.map('map-container', { scrollWheelZoom: false });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // 地點 1：浪茄灣
        const marker2 = L.marker([22.3780, 114.3750]).addTo(map);
        marker2.bindPopup("<b>浪茄灣</b><br>直升機救援熱點，需翻越崎嶇山徑。");

        // 海拔圖表設定
        const elevationOptions = {   
            theme: 'steelblue-theme', 
            detached: true,             
            elevationDiv: "#elevation-container", 
            autohide: false,            
            position: "bottomright",
            imperial: false,  
            time: false,          
            waypoints: false,
            followMarker: false,        // 防止地圖亂跑
            zoomAnimation: false,
            summary: false ,
            downloadLink: false,
            responsive: true,
            // 限制圖表高度並設定邊距，防止藍色區塊往下溢出
            height: 250, 
            margins: {
                top: 30,
                right: 20,
                bottom: 10, // 確保底部留有空間給公里數顯示
                left: 50
            },
        };

        const controlElevation = L.control.elevation(elevationOptions).addTo(map);

        // 👉 填寫你的 GPX 檔案路徑
        const gpxFilePath = 'Four Trails Mini_Maclehose Trail.gpx'; 

        controlElevation.load(gpxFilePath);

        // 載入後自動縮放視角並修正圖表寬度
        controlElevation.on('eledata_loaded', function(e) {
            map.fitBounds(e.layer.getBounds(), { padding: [30, 30] });
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
        });
    }

    // ==========================================
    // 2. Spotlight 滾動動畫邏輯
    // ==========================================
    // 偵測 Spotlight 區塊是否進入畫面，進入時觸發滑動效果
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible'); // 加入 class 觸發 CSS 動畫
                observer.unobserve(entry.target); // 觸發一次後解除觀察
            }
        });
    }, { 
        threshold: 0.2 // 當區塊出現 20% 在畫面上時觸發
    });

    // 綁定所有帶有 spotlight 的區塊
    document.querySelectorAll('.spotlight').forEach(el => observer.observe(el));

});

// ====== youtube-player.js ======

var player;

// 當 YouTube API 準備好時，會自動呼叫這個函數
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        // ⚠️ 注意：請把下方的 ID 換成你真實的 YouTube 影片 ID！
        // 例如網址是 https://www.youtube.com/watch?v=dQw4w9WgXcQ，ID 就是 dQw4w9WgXcQ
        videoId: 'NZRBftmY7_k', 
        playerVars: {
            'playsinline': 1,
            'rel': 0, // 播放結束不顯示無關推薦
            'controls': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    var poster = document.getElementById('video-poster');
    
    // 點擊封面圖時，隱藏封面並播放影片
    if (poster) {
        poster.addEventListener('click', function() {
            poster.style.display = 'none';
            player.playVideo();
        });
    }
}