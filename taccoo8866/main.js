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

  if (isMac) {
    const el = document.getElementById("game-system");
    if (el) {
      el.classList.add("mac"); // 追加 mac class
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  addMacClass();
  const track = document.getElementById('game-system');
  const cards = document.querySelectorAll('.intro-effect');
  function onScroll() {
      const now = Date.now();
      if (now - scrollLock < 300) return;
      scrollLock = now;

    const rect = track.getBoundingClientRect();
    // console.log('rect',rect);
    console.log(window.innerHeight);
    const startOffset = window.innerHeight / 2; // 保留你的初始限制
    const progress = (startOffset - rect.top) / (rect.height - startOffset );
    const step = Math.floor(progress * 5);
    const clampedStep = Math.max(0, Math.min(step, 4));
    console.log(rect.top,progress,step,clampedStep);
    console.log("動畫翻頁",clampedStep);
    

    cards.forEach((card, index) => {
      if (index === clampedStep*2 || index  === (clampedStep*2 + 1) ) {
        card.classList.add('aos-animate');
      }else{
        card.classList.remove('aos-animate');
      }
    });
    // if(rect.top > startOffset ){
    //     cards[0].classList.remove('aos-animate');
    //     cards[1].classList.remove('aos-animate');
    // }
    // if (rect.top < (startOffset) && rect.bottom >= window.innerHeight ) {

    //   let index = clampedStep*2;
    //   if (index < 0) index = 0;
    //   if (index>0){
    //     cards[index-1].classList.remove('aos-animate');
    //     cards[index-2].classList.remove('aos-animate');
    //   }
    //   a = index;
    //   cards[index].classList.add('aos-animate');
    //   cards[index+1].classList.add('aos-animate');
    //   if(index<=6){
    //     cards[index+2].classList.remove('aos-animate');
    //     cards[index+3].classList.remove('aos-animate');
    //   }
  // }

      // cards.forEach((card, index) => {
      //   if (index === clampedStep || (index - 1)  === clampedStep ) {
      //     card.classList.add('active');
      //     card.classList.remove('exit');
      //   } else if (index === (clampedStep+1) || (index - 1) ===(clampedStep+1)  ) {
      //     card.classList.add('exit');
      //     card.classList.remove('active');
      //   } else {
      //     card.classList.remove('active', 'exit');
      //   }
      // });
    
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

      // 控制卡片滾動監聽
      if (entry.target.id === "game-system") {
        if (entry.isIntersecting) {
          document.querySelector('body').addEventListener('scroll', onScroll, { passive: true });
        } else {
          document.querySelector('body').removeEventListener('scroll', onScroll);
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  // 觀察區塊
  observer.observe(track);

  // 觀察 AOS 元素
  document.querySelectorAll('[data-native-aos]')
    .forEach(el => observer.observe(el));

});

const area = document.getElementById("app");
const pages = area.querySelectorAll(".intro-effect");

let lock = 0;
const scrollStep = window.innerHeight; // 固定每次滾動 100vh

function updatePage(scroll) {
  area.scrollTop = area.scrollTop + scroll;
}

function handleWheel(e) {
   const target = document.getElementById("game-system");

    if (target.contains(e.target)) {
         e.preventDefault(); // 阻止原生滾動
        const now = Date.now();
        console.log("lock",lock)
        if (now - lock < 300) return;
        lock = now;

        if (e.deltaY > 0 ) {
          updatePage(window.innerHeight);
        } else {
          updatePage(window.innerHeight*-1);
        }
    }
}

// 監聽指定區塊滾輪
area.addEventListener("wheel", handleWheel, { passive: false });

// 初始化
updatePage();


// // 捲動效果控制
// document.querySelector('body').addEventListener('scroll', () => {
//   const track = document.getElementById('game-system');
//   const cards = document.querySelectorAll('.intro-effect');
//   console.log(cards);
//   // 1. 計算當前區塊的捲動進度 (0 ~ 1)
//   const rect = track.getBoundingClientRect();
//   console.log(rect);
//   const progress = -rect.top / (rect.height - window.innerHeight);
//   console.log(progress);
//   // 2. 根據進度決定現在該顯示哪一張 (假設 4 張卡片)
//   // 進度 0~0.25 第一張, 0.25~0.5 第二張...
//   const step = Math.floor(progress * cards.length);
//   console.log(step);
//   const clampedStep = Math.max(0, Math.min(step, cards.length - 1));
//  console.log(clampedStep);
//   if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
//     console.log(rect.top,'<= 0 ? &&',rect.bottom ,">=", window.innerHeight);
//     cards.forEach((card, index) => {
//       console.log(card,index);
//       if (index === clampedStep) {
//         card.classList.add('active');
//         card.classList.remove('exit');
//       } else if (index < clampedStep) {
//         card.classList.add('exit');
//         card.classList.remove('active');
//       } else {
//         card.classList.remove('active', 'exit');
//       }
//     });
//   }
// }, { passive: true });

// document.addEventListener("DOMContentLoaded", () => {
//   const observerOptions = {
//     root: null, // 以視窗為準
//     threshold: 0.1, // 元素出現 10% 面積時觸發
//     rootMargin: "0px 0px -50px 0px" // 提早或延遲觸發（底部往內縮 50px，增加視覺舒適感）
//   };

//   const observer = new IntersectionObserver((entries, observer) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         // 進入視窗：加上動畫類別
//         entry.target.classList.add("aos-animate");
        
//         // 如果你只想要動畫跑一次（不重複），可以解除監測
//         // observer.unobserve(entry.target); 
//       } else {
//         // 離開視窗：移除類別（如果你想要往回捲動時動畫重跑）
//         entry.target.classList.remove("aos-animate");
//       }
//     });
//   }, observerOptions);

//   // 選取所有帶有自定義標籤的元素並開始監測
//   const targetElements = document.querySelectorAll('[data-native-aos]');
//   targetElements.forEach(el => observer.observe(el));
// });