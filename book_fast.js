const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Use the existing browser endpoint if possible, but let's just launch a fast headless one with the cookies
  // Wait, we have cookies from the current page!
  const cookies = [{
    name: "islive", value: "0", domain: ".eazydiner.com", path: "/"
  }]; // I can just dump all document.cookies into playwright

  // But we need the authorization token! Let's check localStorage for tokens again!
})();
