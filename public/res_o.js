(function () {
    "use strict";

    // -----------------------------
    // Minimal configuration
    // -----------------------------
    var INITIAL_SECONDS = 10 * 60; // 10 minutes

    // Optional: allow overriding order info via query string.
    // Example: payment_confirmation_vanilla.html?orderId=PA123&amount=100
    var params = new URLSearchParams(window.location.search);
    var orderId = params.get("orderId") || "PA202601151335601905";
    var amount = params.get("amount") || "100";

    document.getElementById("orderId").textContent = orderId;
    document.getElementById("orderAmount").textContent = amount;

    // Optional: prefill form via query string.
    // Example: ?bankName=XX銀行&accountNumber=1234&payerName=王小明
    var bankNamePrefill = params.get("bankName") || "";
    var accountNumberPrefill = params.get("accountNumber") || "";
    var payerNamePrefill = params.get("payerName") || "";

    var bankNameEl = document.getElementById("bankName");
    var accountNumberEl = document.getElementById("accountNumber");
    var payerNameEl = document.getElementById("payerName");

    bankNameEl.value = bankNamePrefill;
    accountNumberEl.value = accountNumberPrefill;
    payerNameEl.value = payerNamePrefill;

    // -----------------------------
    // Countdown (minimal business logic)
    // -----------------------------
    var secondsLeft = INITIAL_SECONDS;
    var isExpired = false;

    var timerBadge = document.getElementById("timerBadge");
    var timerValue = document.getElementById("timerValue");
    var expiredOverlay = document.getElementById("expiredOverlay");

    function pad2(n) {
      return String(n).padStart(2, "0");
    }

    function formatTime(sec) {
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      return pad2(m) + ":" + pad2(s);
    }

    function setExpiredUI(expired) {
      isExpired = expired;
      if (expired) {
        timerBadge.classList.add("expired");
        timerValue.classList.add("expired");
        expiredOverlay.classList.add("visible");
        expiredOverlay.setAttribute("aria-hidden", "false");
        setFormDisabled(true);
        setSubmitState("expired");
      }
    }

    function tick() {
      if (secondsLeft <= 0) {
        setExpiredUI(true);
        return;
      }
      secondsLeft -= 1;
      timerValue.textContent = formatTime(secondsLeft);
      if (secondsLeft <= 0) {
        setExpiredUI(true);
      }
    }

    // Initialize display
    timerValue.textContent = formatTime(secondsLeft);
    var countdownTimer = window.setInterval(tick, 1000);

    // -----------------------------
    // Copy buttons
    // -----------------------------
    function flashCopied(btn) {
      // Replace icon with check for 2 seconds
      var iconWrap = btn.querySelector(".copy-icon");
      if (!iconWrap) return;

      var original = iconWrap.innerHTML;
      iconWrap.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      window.setTimeout(function () {
        iconWrap.innerHTML = original;
      }, 2000);
    }

    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button[data-copy-target]");
      if (!btn) return;
      var selector = btn.getAttribute("data-copy-target");
      var el = selector ? document.querySelector(selector) : null;
      var text = el ? (el.textContent || "") : "";

      if (!text) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          flashCopied(btn);
        }).catch(function () {
          // Fallback
          window.prompt("複製以下內容：", text);
        });
      } else {
        window.prompt("複製以下內容：", text);
      }
    });

    // -----------------------------
    // Form submit (minimal validation)
    // -----------------------------
    var payerForm = document.getElementById("payerForm");
    var loadingOverlay = document.getElementById("loadingOverlay");
    var submitBtn = document.getElementById("submitBtn");
    var submitSpinner = document.getElementById("submitSpinner");
    var submitText = document.getElementById("submitText");

    var errBankName = document.getElementById("errBankName");
    var errAccountNumber = document.getElementById("errAccountNumber");
    var errPayerName = document.getElementById("errPayerName");

    function showError(inputEl, errEl, message) {
      inputEl.classList.add("error-input");
      errEl.textContent = message;
      errEl.style.display = "block";
    }

    function clearError(inputEl, errEl) {
      inputEl.classList.remove("error-input");
      errEl.textContent = "";
      errEl.style.display = "none";
    }

    function setFormDisabled(disabled) {
      bankNameEl.disabled = disabled;
      accountNumberEl.disabled = disabled;
      payerNameEl.disabled = disabled;
      submitBtn.disabled = disabled;
    }

    function setLoading(loading) {
      if (loading) {
        loadingOverlay.classList.add("visible");
        loadingOverlay.setAttribute("aria-hidden", "false");
        submitSpinner.style.display = "inline-flex";
        submitText.textContent = "系統處理中，請勿關閉或離開此頁面";
      } else {
        loadingOverlay.classList.remove("visible");
        loadingOverlay.setAttribute("aria-hidden", "true");
        submitSpinner.style.display = "none";
        submitText.textContent = "確認送出";
      }
    }

    function setSubmitState(state) {
      // state: normal | submitting | expired
      if (state === "expired") {
        submitText.textContent = "操作已逾時";
        submitSpinner.style.display = "none";
      }
    }

    // Input behavior: remove spaces for account number
    accountNumberEl.addEventListener("input", function () {
      var v = accountNumberEl.value || "";
      var cleaned = v.replace(/\s+/g, "");
      if (cleaned !== v) accountNumberEl.value = cleaned;
      clearError(accountNumberEl, errAccountNumber);
    });

    bankNameEl.addEventListener("input", function () { clearError(bankNameEl, errBankName); });
    payerNameEl.addEventListener("input", function () { clearError(payerNameEl, errPayerName); });

    function validate() {
      var ok = true;
      var bn = (bankNameEl.value || "").trim();
      var an = (accountNumberEl.value || "").trim();
      var pn = (payerNameEl.value || "").trim();

      clearError(bankNameEl, errBankName);
      clearError(accountNumberEl, errAccountNumber);
      clearError(payerNameEl, errPayerName);

      if (!bn) {
        showError(bankNameEl, errBankName, "請輸入付款銀行名稱");
        ok = false;
      }

      if (!an) {
        showError(accountNumberEl, errAccountNumber, "請輸入付款帳戶號碼");
        ok = false;
      } else if (!/^\d+$/.test(an)) {
        showError(accountNumberEl, errAccountNumber, "付款帳戶號碼格式不正確，請重新確認");
        ok = false;
      }

      if (!pn) {
        showError(payerNameEl, errPayerName, "請輸入付款人姓名");
        ok = false;
      }

      return ok;
    }

    payerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (isExpired) return;

      if (!validate()) return;

      // Minimalized "business logic": simulate an async request.
      setFormDisabled(true);
      setLoading(true);

      window.setTimeout(function () {
        setLoading(false);
        // Re-enable unless expired
        if (!isExpired) setFormDisabled(false);

        // In a real integration, you would POST to your API here.
        // Keep it minimal: just show success.
        window.alert("提交成功！");
      }, 3000);
    });

    // If already expired for any reason, ensure UI sync.
    if (secondsLeft <= 0) {
      window.clearInterval(countdownTimer);
      setExpiredUI(true);
    }
  })();