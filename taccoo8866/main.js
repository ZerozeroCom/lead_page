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

// Simple character tab switcher (matches raw.mhtml structure)
function initCharacterTabs(){
  const tabs = document.querySelectorAll('.chara-tab ul li');
  tabs.forEach(tab=>{
    tab.addEventListener('click', e=>{
      e.preventDefault();
      const id = tab.id; // e.g. c-tab-1
      if(!id) return;
      // remove active
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const idx = id.split('-').pop();
      // show corresponding box
      document.querySelectorAll('.chara-box').forEach(box=>box.style.display='none');
      const target = document.getElementById('c-'+idx);
      if(target) target.style.display='block';
    });
  });
}

// Auto-init on DOM ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', ()=>{ initCharacterTabs(); });
} else { initCharacterTabs(); }


const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (index != 0){
      if (entry.isIntersecting) {
          // 增加延遲感，讓對話框像是一個個跳出來
          setTimeout(() => {
            entry.target.classList.add('fade-in-visible');
          }, index * 200); 
      }
    }else{
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
      }
    }
  });
}, { threshold: 0.2 });

// 選取所有對話框
document.querySelectorAll('.chat-row').forEach(row => {
  row.classList.add('fade-in-hidden'); // 初始隱藏
  observer.observe(row);
});
let scrollLock = 0;
let a = 0;
try {
    //禁用
    document.oncontextmenu = function() {
        return false;
    }
    document.ondragstart = function() {
        return false;
    }
} catch (e) {
    console.error(e.message);
}
function addMacClass() {
  // 偵測 Mac 電腦，不包含 iPhone / iPad
  const isMac = /Mac/i.test(navigator.platform) && !/iPhone|iPad|iPod/i.test(navigator.userAgent);
  console.log
  if (isMac) {
    document.documentElement.classList.add('mac');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  addMacClass();
  // const track = document.getElementById('game-system');
  // const cards = document.querySelectorAll('.intro-effect');
  // function onScroll() {
  //     const now = Date.now();
  //     if (now - scrollLock < 300) return;
  //     scrollLock = now;

  //   const rect = track.getBoundingClientRect();
  //   // console.log('rect',rect);
  //   console.log(window.innerHeight);
  //   const startOffset = window.innerHeight / 2; // 保留你的初始限制
  //   const progress = (startOffset - rect.top) / (rect.height - startOffset );
  //   const step = Math.floor(progress * 5);
  //   const clampedStep = Math.max(0, Math.min(step, 4));
  //   console.log(rect.top,progress,step,clampedStep);
  //   console.log("動畫翻頁",clampedStep);
    

  //   cards.forEach((card, index) => {
  //     if (index === clampedStep*2 || index  === (clampedStep*2 + 1) ) {
  //       card.classList.add('aos-animate');
  //     }else{
  //       card.classList.remove('aos-animate');
  //     }
  //   });
  const sections = document.querySelectorAll('.game-system'); // 每個 100vh
  const cards = document.querySelectorAll('.intro-effect');
  const characterInfo = document.getElementById('character-info');
   const promoVideo = document.getElementById('promo_video');
  

  let isInOutside = false; //  是否進入 character 區

  function updateStep(step) {
    if (isInOutside) return;
    cards.forEach((card, index) => {
      if (index === step * 2 || index === step * 2 + 1) {
        card.classList.add('aos-animate');
      } else {
        card.classList.remove('aos-animate');
      }
    });
  }

  function clearAll() {
    cards.forEach(card => card.classList.remove('aos-animate'));
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = Array.from(sections).indexOf(entry.target);
        console.log("目前 step:", step);
        updateStep(step);
      }
          //  character-info 控制「清空」
      if (entry.target.id === 'character-info' || entry.target.id === 'promo_video') {
        if (entry.isIntersecting) {
          isInOutside = true;
          clearAll(); // 進入時清掉
        } else {
          isInOutside = false;
        }
      }
    });


  }, {
    rootMargin: "-20% 0px -20% 0px",
    threshold: 0
  });

  // 觀察每個 section
  sections.forEach(section => observer.observe(section));
  // 觀察 AOS 元素
  document.querySelectorAll('[data-native-aos]')
    .forEach(el => observer.observe(el));

  // 觀察 character-info promo_video
  if (characterInfo) observer.observe(characterInfo);
  if (promoVideo) observer.observe(promoVideo);
});

const area = document.getElementById("app");
const pages = area.querySelectorAll(".intro-effect");

let lock = 0;
const scrollStep = window.innerHeight; // 固定每次滾動 100vh

function updatePage(scroll) {
  area.scrollTop = area.scrollTop + scroll;
}


// 初始化
updatePage();

