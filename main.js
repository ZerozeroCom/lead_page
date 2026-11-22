let isProcessing = false; // 冷卻旗標
// 監控所有帶有放大需求的圖片點擊
document.addEventListener('click', (e) => {
    // 檢查點擊的元素是否有指定類別 (zoomable)
    if (e.target.classList.contains('zoomable') && !isProcessing) {
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        
        // 這會讓彈窗顯示當前解析度下最輕量的 AVIF 或 WebP
        lbImg.src = e.target.currentSrc;
        lightbox.classList.add('active');// 防止頁面在彈窗開啟時還能捲動
        document.body.style["overflow-y"] = 'hidden';
        // 設定 1 秒後解除鎖定，防止連點
        setTimeout(() => {
            isProcessing = false;
        }, 1000);
    }
});
// 點擊遮罩關閉
document.getElementById('lightbox').addEventListener('click', () => {
  if (isProcessing) return; // 如果還在跑打開動畫，先不準關閉
    isProcessing = true;
    document.getElementById('lightbox').classList.remove('active');
    document.body.style["overflow-y"] = 'auto'; // 恢復捲動
    setTimeout(() => {
        isProcessing = false;
    }, 500); // 關閉動畫通常較快，設 0.5 秒即可
});

// 平滑滾動
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const href=a.getAttribute('href');
    if(href && href.length>1){
      e.preventDefault();
      const el=document.querySelector(href);
      if(el) el.scrollIntoView({behavior:'smooth'});
    }
  });
});

// 促銷影片延遲載入：使用者一捲動就抓影片並播放，首屏不下載（IntersectionObserver 為保險）
(() => {
  const video = document.querySelector('video[data-lazy-video]');
  if (!video) return;
  let loaded = false;
  const targets = [window, document, document.body];
  const loadVideo = () => {
    if (loaded) return;
    loaded = true;
    video.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; });
    video.load();
    const p = video.play();
    if (p && p.catch) p.catch(() => {}); // 忽略自動播放被拒
    targets.forEach(t => {
      t.removeEventListener('scroll', loadVideo);
      t.removeEventListener('touchmove', loadVideo);
    });
  };
  // 一捲動就載入（body 是本頁捲動容器，三個目標都掛以涵蓋滾輪與觸控）
  targets.forEach(t => {
    t.addEventListener('scroll', loadVideo, { passive: true });
    t.addEventListener('touchmove', loadVideo, { passive: true });
  });
  // 保險：影片若已在視窗內（未捲動）也會載入
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { loadVideo(); obs.disconnect(); } });
    }, { rootMargin: '300px 0px' });
    io.observe(video);
  }
})();
