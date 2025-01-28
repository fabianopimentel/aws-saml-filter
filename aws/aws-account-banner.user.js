// ==UserScript==
// @name         AWS Account Banner
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Displays a banner with AWS account name making it easier to identify the account you are logged in to.
// @author       Fabiano Pimentel
// @match        https://*.console.aws.amazon.com/*
// @icon         https://www.google.com/s2/favicons?domain=aws.amazon.com
// ==/UserScript==

(function () {
  'use strict';

  let initialized = false;

  function getAccountName() {
    const accountInfoElement = document.querySelector('[data-testid="awsc-account-info-tile"] span');
    if (!accountInfoElement) {
      console.warn('Account info not found.');
      return 'Ops!';
    }

    let accountInfo = accountInfoElement.textContent.trim();

    accountInfo = accountInfo.replace(/\(([^)]+)\)/, (match, p1) => `(${p1.replace(/-/g, '')})`);

    return accountInfo;
  }

  function handleBannerClick(accountName) {
    window.navigator.clipboard.writeText(accountName)
  }

  function createBanner(accountName) {
    const banner = document.createElement('div');
    banner.textContent = `${accountName}`;
        banner.style.backgroundColor = accountName.includes("-sandbox") ? "#52c120" : "#d02727"; // green for sandbox and red for production envs
    banner.style.borderBottom = "1px solid #424650"; // aws default border color
    banner.style.fontWeight = "600";
    banner.style.color = 'white';
    banner.style.textAlign = 'center';
    banner.style.padding = '10px';
    banner.style.fontSize = '12px';
    banner.style.cursor = "pointer";
    banner.style.fontFamily = '"Amazon Ember", "Helvetica Neue", Arial, sans-serif';
    banner.setAttribute("title", "Copy");

    banner.addEventListener("click", (e) => {
      e.preventDefault()
      handleBannerClick(accountName)
    })

    return banner;
  }

  function insertBanner(banner) {
    const targetElement = document.querySelector('#h');
    if (targetElement) {
      targetElement.insertBefore(banner, targetElement.firstChild);
    } else {
      console.warn('Target element #h not found. Banner not inserted.');
    }
  }

  async function init() {
    if (initialized) return;
    initialized = true;

    let accountName;
    let attempts = 0;
    while (attempts < 10) {
      accountName = getAccountName();
      if (accountName !== 'Ops!') break;
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (accountName === 'Ops!') {
      console.warn('Account information could not be fetched in time.');
    } else {
      const banner = createBanner(accountName);
      insertBanner(banner);
    }
  }

  window.addEventListener('load', init);
})();
