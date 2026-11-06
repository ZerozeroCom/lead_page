// 要記得將要補上utm的連結加上class="target-element"
const currentURL = window.location.href;
const urlObj = new URL(currentURL);
const utmSource = urlObj.searchParams.get("utm_source") || "";
const utmMedium = urlObj.searchParams.get("utm_medium") || "";
const utmCampaign = urlObj.searchParams.get("utm_campaign") || "";
const utmContent = urlObj.searchParams.get("utm_content") || "";

const targetLinks = document.querySelectorAll(".target-element");

targetLinks.forEach((link) => {
  if (link.href) {
    let originalHref = new URL(link.href);

    console.log("Original Href:", originalHref.toString());

    if (originalHref.search) {
      originalHref.search += `&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}`;
    } else {
      originalHref.search = `?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&utm_content=${utmContent}`;
    }

    link.href = originalHref.toString();
  }
});
