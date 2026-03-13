window.PAGE_DATA = {
  site: {
    title: '幸福家裡蹲的養成方法',
    description: '幸福家裡蹲的養成方法 把人生的喜悅交給無知的尼特醬吧',
    url: 'https://example.com/',
    logo: '/logo.png'
  },
  nav: [
    { text: '首頁', href: '#home' },
    { text: '重點', href: '#features' },
    { text: '關於', href: '#about' },
    { text: '聯絡', href: '#contact' }
  ],
  hero: {
    title: '歡迎來到我們的單頁範例',
    lead: '這是以語意化標籤與簡潔內容為主的一頁式架構範例。',
    ctaText: '了解更多',
    ctaHref: '#features'
  },
  features: [
    { title: '重點一', text: '用簡短敘述說明功能或價值主張。' },
    { title: '重點二', text: '突出特色或優勢，讓使用者快速理解。' },
    { title: '重點三', text: '提供範例、結果或數據來建立信任感。' }
  ],
  aboutText: '這裡放一段敘述性文字，說明品牌、願景、或專案背景。',
  contact: { email: 'info@example.com', phone: '+886 2 1234 5678' },
  footer: '本網站與遊戲包含成人與限制級內容。所有角色皆為十八歲以上成年人。請注意遊玩時間，保持理性與節制。'
};



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

function applyPageData(data){
  // 基本 meta
  document.title = data.site.title || document.title;
  const desc = document.getElementById('meta-description');
  if(desc) desc.setAttribute('content', data.site.description || '');
  const canonical = document.getElementById('meta-canonical');
  if(canonical) canonical.setAttribute('href', data.site.url || '');

  // Open Graph / Twitter
  const ogTitle = document.getElementById('og-title'); if(ogTitle) ogTitle.setAttribute('content', data.site.title);
  const ogDesc = document.getElementById('og-description'); if(ogDesc) ogDesc.setAttribute('content', data.site.description);
  const ogUrl = document.getElementById('og-url'); if(ogUrl) ogUrl.setAttribute('content', data.site.url);
  const ogImage = document.getElementById('og-image'); if(ogImage) ogImage.setAttribute('content', data.site.logo);
  const twTitle = document.getElementById('twitter-title'); if(twTitle) twTitle.setAttribute('content', data.site.title);
  const twDesc = document.getElementById('twitter-description'); if(twDesc) twDesc.setAttribute('content', data.site.description);
  const twImg = document.getElementById('twitter-image'); if(twImg) twImg.setAttribute('content', data.site.logo);

  // JSON-LD: Organization + WebSite + BreadcrumbList
  const ld = document.getElementById('ld-json');
  if(ld){
    const org = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.site.title || data.site.name,
      url: data.site.url,
      logo: (location.origin + data.site.logo).replace(/([^:]\/\/)/,'$1')
    };

    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.site.title || data.site.name,
      url: data.site.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: data.site.url + '?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };

    const crumbs = [];
    (data.nav||[]).forEach((n,idx)=>{
      const href = n.href || '';
      const url = href.startsWith('#') ? (data.site.url.replace(/\/$/, '') + href) : (href.startsWith('http') ? href : new URL(href, data.site.url).href);
      crumbs.push({ '@type': 'ListItem', position: idx+1, name: n.text, item: url });
    });

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs
    };

    const out = [org, website, breadcrumb];
    ld.textContent = JSON.stringify(out, null, 2);
  }

  // 導覽
  const nav = document.getElementById('site-nav');
  if(nav){
    nav.innerHTML = '';
    (data.nav||[]).forEach(i=>{
      const a = document.createElement('a');
      a.href = i.href; a.textContent = i.text; nav.appendChild(a);
    });
  }

  // Hero
  const heroTitle = document.getElementById('hero-title'); if(heroTitle) heroTitle.textContent = data.hero.title;
  const heroLead = document.getElementById('hero-lead'); if(heroLead) heroLead.textContent = data.hero.lead;
  const heroCta = document.getElementById('hero-cta'); if(heroCta){ heroCta.textContent = data.hero.ctaText; heroCta.href = data.hero.ctaHref; }

  // Features
  const grid = document.getElementById('features-grid');
  if(grid){
    grid.innerHTML = '';
    (data.features||[]).forEach(f=>{
      const article = document.createElement('article');
      const h3 = document.createElement('h3'); h3.textContent = f.title; article.appendChild(h3);
      const p = document.createElement('p'); p.textContent = f.text; article.appendChild(p);
      grid.appendChild(article);
    });
  }

  // About / Contact / Footer
  const about = document.getElementById('about-text'); if(about) about.textContent = data.aboutText;
  const email = document.getElementById('contact-email'); if(email){ email.textContent = data.contact.email; email.href = 'mailto:'+data.contact.email; }
  const phone = document.getElementById('contact-phone'); if(phone) phone.textContent = data.contact.phone;
  const footer = document.getElementById('footer-text'); if(footer) footer.textContent = data.footer;
}

// 初始化（如需從外部載入 JSON，改成 fetch('/page-config.json').then(...)）
applyPageData(window.PAGE_DATA);

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
document.addEventListener("DOMContentLoaded", () => {

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
    if(rect.top > startOffset ){
        cards[0].classList.remove('aos-animate');
        cards[1].classList.remove('aos-animate');
    }
    if (rect.top < (startOffset) && rect.bottom >= window.innerHeight ) {

      let index = clampedStep*2;
      if (index < 0) index = 0;
      if (index>0){
        cards[index-1].classList.remove('aos-animate');
        cards[index-2].classList.remove('aos-animate');
      }
      a = index;
      cards[index].classList.add('aos-animate');
      cards[index+1].classList.add('aos-animate');
      if(index<=6){
        cards[index+2].classList.remove('aos-animate');
        cards[index+3].classList.remove('aos-animate');
      }
  
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
  console.log(area.scrollTop,scroll)
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