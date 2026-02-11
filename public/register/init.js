var params = {};
const pathParts = window.location.pathname.split("/").filter(Boolean);
const order = pathParts[pathParts.length - 1];
setLoading(true);
getOrder();

const lang = navigator.language || "en";
let langFile = "en.js";
if (lang.startsWith("zh-TW")) langFile = "zh-TW.js";
else if (lang.startsWith("zh-CN")) langFile = "zh-CN.js";
else if (lang.startsWith("th")) langFile = "th-TH.js";

const script = document.createElement("script");
script.src = `/register/lang/${langFile}`;
document.head.appendChild(script);

let retryCount = 0;
const MAX_RETRY = 5;

function getOrder(){
  fetch(`/api/register/${order}`, {
    headers: {
      'Accept': 'application/json'
    }
    })
    .then(res => {
        if (res.status == 403) {
          alert("無法取得資訊，金鑰錯誤或IP錯誤");
          errorPage();
          return Promise.reject("403 forbidden");
        }
        if (res.status == 400) {
          return res.json().then(data => {
              let error = "Bad Request"
              if(data.code == 20013){
                alert(window.LANG.feedback["orderErr"] || error);
              }else{
                alert(data.message || error);
              }
              errorPage();
              return Promise.reject(error);
          });
        }
        if (res.status !== 200) {
            retryCount++;
            if (retryCount >= MAX_RETRY) {
              let err = "Max retry reached"
                alert(window.LANG.feedback["retry"] || err);
                errorPage();
                return Promise.reject(err);
            }
            setTimeout(getOrder, 3000);
            return Promise.reject("error");
        } 
        return res.json();
    })
    .then(data => {
      setLoading(false);
      // 直接綁定頁面
      viewInit(data)
    })
}
function errorPage(){
  let message = window.LANG.feedback["err"] || "";
  document.body.innerHTML = `<h1>${message}</h1>`;
}
function viewInit(data) {
  params = data.receipt_order;

  if(typeof params.upstream_register_url === 'string' && params.upstream_register_url.startsWith('http')){
    window.location.replace(params.upstream_register_url);
    return;
  }

  var orderId = params.merchant_order_id;
  var amount = params.amount;

  document.getElementById("orderId").textContent = orderId;
  document.getElementById("orderAmount").textContent = amount;

  var bankNamePrefill = params.payment_bank_name || "";
  var accountNumberPrefill = params.payment_bank_account_number || "";
 var payerNamePrefill = params.payment_bank_account_name || "";
  if( params.transaction_status == "register_reviewing"){
    document.getElementById("bankName").value = bankNamePrefill;
    document.getElementById("accountNumber").value = accountNumberPrefill;
    document.getElementById("payerName").value = payerNamePrefill;
    document.getElementById("updated_at").value = params.updated_at || -1;
  }else{
    if(params.transaction_status != 'processing'){
      var loadingOverlay = document.getElementById("loadingOverlay");
      loadingOverlay.classList.add("visible");
      loadingOverlay.setAttribute("aria-hidden", "false");
      document.getElementById("loadingSvg").style.display = "none";
      if(['matching_failed','completed','failed'].includes(params.transaction_status)){
        let ptitle = document.getElementById("processingTitle");
        if(params.transaction_status != 'completed'){
          ptitle.textContent = window.LANG.overlay["InfoUnavailable"];
          document.getElementById("processingHint").textContent = window.LANG.overlay["retryOrSupport"];
        }else{
          ptitle.textContent = "";
          document.getElementById("processingHint").textContent = "";
        }
        const existingDiv = document.getElementById('OrderIdNewDiv');
        if (!existingDiv) {
          const div = document.createElement('div');
          div.id = 'OrderIdNewDiv';  // 固定 ID
          div.textContent = params.merchant_order_id;
          ptitle.insertAdjacentElement('afterend', div);
        }
      }else{
        setTimeout(()=>{
          getOrder()
        },1000);
      }
      return;
    }
    document.getElementById("payerSection").style.display = "none";
    document.getElementById("updated_at").value = -2;
    const original = document.getElementById("amount-info");
   
    let arr = ["receipt_branch_name","receipt_bank_name","receipt_bank_account_number","receipt_bank_account_name"]
    for (let i = 0; i < arr.length; i++) {
      const clone = original.cloneNode(true);
      clone.id = 'in-'+arr[i];
      let ele = clone.querySelector('#order-orderAmountLabel')
      ele.id = 'order-'+arr[i];
      ele.textContent = window.LANG.paymentFields[arr[i]];
      let ele2 =  clone.querySelector('#orderAmount')
      let newId = 'new'+arr[i]
      ele2.id = newId;
      ele2.textContent = params[arr[i]];
      clone.querySelector('.copy-button').setAttribute('data-copy-target', '#'+newId);
      original.insertAdjacentElement('afterend', clone);
    }
  }
}

function setLoading(loading) {
  waitForElement("#loadingOverlay", (loadingOverlay) => {
      if (loading) {
          loadingOverlay.classList.add("visible");
          loadingOverlay.setAttribute("aria-hidden", "false");
      } else {
          loadingOverlay.classList.remove("visible");
          loadingOverlay.setAttribute("aria-hidden", "true");
      }
  });
}
function waitForElement(selector, callback) {
    const el = document.querySelector(selector);
    if (el) {
        callback(el);
    } else {
       let tempOverlay = document.createElement("div");
        tempOverlay.className = "overlay temp-overlay";
        document.documentElement.appendChild(tempOverlay);
        // 每 50ms 再試一次
        const interval = setInterval(() => {
            const elRetry = document.querySelector(selector);
            if (elRetry) {
               tempOverlay.remove();
                clearInterval(interval);
                callback(elRetry);
            }
        }, 50);
    }
}