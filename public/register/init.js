var params = {};
const pathParts = window.location.pathname.split("/").filter(Boolean);
const order = pathParts[pathParts.length - 1];

getOrder();
setTimeout(()=>{
  getOrder()
},300000);
const lang = navigator.language || "en";
let langFile = "en.js";
if (lang.startsWith("zh-TW")) langFile = "zh-TW.js";
else if (lang.startsWith("zh-CN")) langFile = "zh-CN.js";
else if (lang.startsWith("th")) langFile = "th-TH.js";

const script = document.createElement("script");
script.src = `/register/lang/${langFile}`;
document.head.appendChild(script);

function getOrder(){
  fetch(`/api/register/${order}`, {
    headers: {
      'Accept': 'application/json'
    }
    })
    .then(res => res.json())
    .then(data => {
      // 直接綁定頁面
      viewInit(data)
    })
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
  if( params.transaction_status == "register_reviewing" ){
    document.getElementById("bankName").value = bankNamePrefill;
    document.getElementById("accountNumber").value = accountNumberPrefill;
    document.getElementById("payerName").value = payerNamePrefill;
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
