
    "use strict";

    var INITIAL_SECONDS = 5 * 60; // 5 minutes

    var bankNameEl = document.getElementById("bankName");
    var accountNumberEl = document.getElementById("accountNumber");
    var payerNameEl = document.getElementById("payerName");
    // -----------------------------
    // Countdown (minimal business logic)
    // -----------------------------
    var secondsLeft = INITIAL_SECONDS;
    var isExpired = false;

    var timerBadge = document.getElementById("timerBadge");
    var timerValue = document.getElementById("timerValue");
    var expiredOverlay = document.getElementById("expiredOverlay");
    var expiredMessage = document.getElementById("expiredMessage");

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
        clearInterval(countdownTimer);
        timerBadge.classList.add("expired");
        timerValue.classList.add("expired");
        expiredOverlay.classList.add("visible");
        expiredOverlay.setAttribute("aria-hidden", "false");
        setFormDisabled(true);
        setSubmitState("expired");
      }
    }

    function tick() {
      secondsLeft = document.getElementById("updated_at").value;
      if (secondsLeft == -1){
        return;
      }
      if (secondsLeft == -2){
        setSubmitState("expired");
        clearInterval(countdownTimer);
        return;
      }
      if (secondsLeft <= 0) {
        setExpiredUI(true);
        return;
      }
      secondsLeft -= 1;
      document.getElementById("updated_at").value = secondsLeft;
      timerValue.textContent = formatTime(secondsLeft);
      if (secondsLeft <= 0) {
        setExpiredUI(true);
      }
    }

    // Initialize display
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
          window.prompt(window.LANG.order["copyPrompt"], text);
        });
      } else {
        window.prompt(window.LANG.order["copyPrompt"], text);
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

    var errAccountNumber = document.getElementById("errAccountNumber");

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
      accountNumberEl.disabled = disabled;
      submitBtn.disabled = disabled;
    }

    function setLoading(loading) {
      if (loading) {
        loadingOverlay.classList.add("visible");
        loadingOverlay.setAttribute("aria-hidden", "false");
        submitSpinner.style.display = "inline-flex";
        submitText.textContent = window.LANG.overlay["processingButtonText"];
      } else {
        loadingOverlay.classList.remove("visible");
        loadingOverlay.setAttribute("aria-hidden", "true");
        submitSpinner.style.display = "none";
        submitText.textContent = window.LANG.form["submit"];
      }
    }

    function setSubmitState(state) {
      // state: normal | submitting | expired
      if (state === "expired") {
        submitText.textContent = window.LANG.form["submitExpired"];
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


    function validate() {
      var ok = true;
      var an = (accountNumberEl.value || "").trim();

      clearError(accountNumberEl, errAccountNumber);

      if (!an) {
        showError(accountNumberEl, errAccountNumber, window.LANG.validation["accountNumberRequired"]);
        ok = false;
      } else if (!/^\d+$/.test(an)) {
        showError(accountNumberEl, errAccountNumber, window.LANG.validation["accountNumberInvalid"]);
        ok = false;
      }


      return ok;
    }

    document.addEventListener("submit", function (e) {
      e.preventDefault();

      if (isExpired) return;

      if (!validate()) return;

      // Minimalized "business logic": simulate an async request.
      setFormDisabled(true);
      setLoading(true);

      // window.setTimeout(function () {
      //   setLoading(false);
      //   // Re-enable unless expired
      //   if (!isExpired) setFormDisabled(false);

      //   // In a real integration, you would POST to your API here.
      //   // Keep it minimal: just show success.
      //   window.alert("提交成功！");
      // }, 3000);
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const order = pathParts[pathParts.length - 1];
      var bn = (bankNameEl.value || "").trim();
      var an = (accountNumberEl.value || "").trim();
      var pn = (payerNameEl.value || "").trim();
        // 收集表單資料
        let data = {
          register_order_id:order,
          payment_bank_name:bn,
          payment_bank_account_number:an,
          payment_bank_account_name:pn,
          signed_at:Math.floor(Date.now() / 1000)
        }
        // 發送到 Node API
        fetch("/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
        .then(res => res.text())
        .then(text  => {
          setLoading(false);

          // if (!isExpired) setFormDisabled(false);

          window.location.reload();
        })
        .catch(err => {
          setLoading(false);
          // if (!isExpired) setFormDisabled(false);
          alert("提交失敗：" + err.message);
        });
    });

    // // If already expired for any reason, ensure UI sync.
    if (secondsLeft <= 0) {
      window.clearInterval(countdownTimer);
      setExpiredUI(true);
    }

    document.addEventListener("DOMContentLoaded", () => {
      if (!window.LANG) {
        checklangfile()
        return;
      };
      langChange();
    });
    function checklangfile() {
      setTimeout(()=>{
        if (!window.LANG) {
          checklangfile()
        }else{
          langChange()
        }
      },100);
    }
    function langChange() {
      document.getElementById("pageTitle").textContent = window.LANG.app["pageTitle"];
      document.getElementById("headerTitle").textContent = window.LANG.app["headerTitle"];

      document.getElementById("processingTitle").textContent = window.LANG.overlay["processingTitle"];
      document.getElementById("processingHint").textContent = window.LANG.overlay["processingHint"];

      document.getElementById("paymentInfo-title").textContent = window.LANG.paymentInfo["title"];
      document.getElementById("paymentInfo-subtitle").textContent = window.LANG.paymentInfo["subtitle"];
      document.getElementById("paymentInfo-timeRemaining").textContent = window.LANG.paymentInfo["timeRemaining"];

      document.getElementById("order-sectionTitle").textContent = window.LANG.order["sectionTitle"];
      document.getElementById("order-orderIdLabel").textContent = window.LANG.order["orderIdLabel"];
      document.getElementById("order-orderAmountLabel").textContent = window.LANG.order["orderAmountLabel"];
      let elements = document.getElementsByClassName("copy-button");
      // HTMLCollection 不能直接 forEach，需要用 for 或轉成 Array
      for (let i = 0; i < elements.length; i++) {
        const btn = elements[i];
        if (window.LANG.order) {
          btn.title = window.LANG.order["pageTitle"];
        }
      }


    
      document.getElementById("form-accountNumberLabel").textContent = window.LANG.form["accountNumberLabel"];
  
      document.getElementById("form-helper").textContent = window.LANG.form["helper"];
      document.getElementById("submitText").textContent = window.LANG.form["submit"];
      document.getElementById("expiredMessage").textContent = window.LANG.form["submitExpired"];
      document.getElementById("expiredMessage2").textContent = window.LANG.overlay["expiredMessage"];
      


      document.getElementById("accountNumber").placeholder = window.LANG.form["accountNumberPlaceholder"];
      
      
      for (let i = 1; i < 6; i++) {
        document.getElementById("head-notice"+i).textContent = window.LANG.notice["item"+i];
      }

      for (let i = 0; i < 5; i++) {
        document.getElementById("foot-notice"+i).textContent = window.LANG.footer["item"+i];
      }
    }