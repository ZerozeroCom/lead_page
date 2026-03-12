window.PAGE_DATA = {
  site: {
    title: '單頁敘述範例 — 你的品牌',
    description: '以語意化標籤與簡潔內容為主的一頁式架構範例。',
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
    if (entry.isIntersecting) {
      // 增加延遲感，讓對話框像是一個個跳出來
      setTimeout(() => {
        entry.target.classList.add('fade-in-visible');
      }, index * 200); 
    }
  });
}, { threshold: 0.2 });

// 選取所有對話框
document.querySelectorAll('.chat-row').forEach(row => {
  row.classList.add('fade-in-hidden'); // 初始隱藏
  observer.observe(row);
});


let last = 0;
document.addEventListener("wheel", function(e) {
  e.preventDefault();
  const now = Date.now();
  if (now - last < 100) return;
  last = now;

  const direction = Math.sign(e.deltaY);

  if (direction > 0) {
    console.log("scroll down 1 step",direction);
  } else if (direction < 0) {
    console.log("scroll up 1 step",direction);
  }
  return direction;
}, { passive: false });