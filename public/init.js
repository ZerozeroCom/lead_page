var params = {};
const pathParts = window.location.pathname.split("/").filter(Boolean);
const order = pathParts[pathParts.length - 1];

fetch(`/api/register/${order}`, {
headers: {
  'Accept': 'application/json'
}
})
.then(res => res.json())
.then(data => {
  // 直接綁定頁面
  params = data.receipt_order

  var orderId = params.merchant_order_id;
  var amount = params.amount;

  document.getElementById("orderId").textContent = orderId;
  document.getElementById("orderAmount").textContent = amount;

  var bankNamePrefill = params.payment_bank_name || "";
  var accountNumberPrefill = params.payment_bank_account_number || "";
  var payerNamePrefill = params.payment_bank_account_name || "";


  document.getElementById("bankName").value = bankNamePrefill;
  document.getElementById("accountNumber").value = accountNumberPrefill;
  document.getElementById("payerName").value = payerNamePrefill;
})

const lang = navigator.language || "en";
let langFile = "en.js";
if (lang.startsWith("zh-TW")) langFile = "zh-TW.js";
else if (lang.startsWith("zh-CN")) langFile = "zh-CN.js";
else if (lang.startsWith("th")) langFile = "th-TH.js";

const script = document.createElement("script");
script.src = `/lang/${langFile}`;
document.head.appendChild(script);