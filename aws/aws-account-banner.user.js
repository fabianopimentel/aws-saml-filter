// ==UserScript==
// @name         AWS Account Banner
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Displays a banner with AWS account name making it easier to identify the account you are logged in to.
// @author       Fabiano Pimentel
// @match        https://*.console.aws.amazon.com/*
// @icon         https://www.google.com/s2/favicons?domain=aws.amazon.com
// ==/UserScript==

(function () {
  'use strict';

  // Flag to prevent multiple banners
  let bannerInserted = false;

  /**
   * Fetches the AWS account name from the page.
   * @returns {string|null} The account name or null if not found.
   */
  function getAccountName() {
    const accountInfoElement = document.querySelector('[data-testid="awsc-account-info-tile"] span');
    if (!accountInfoElement) return null;

    let accountName = accountInfoElement.textContent.trim();
    return accountName.replace(/\(([^)]+)\)/, (_, p1) => `(${p1.replace(/-/g, '')})`);
  }

  /**
   * Creates a banner element with the account name.
   * @param {string} accountName - The AWS account name.
   * @returns {HTMLElement} The banner element.
   */
  function createBanner(accountName) {
    const banner = document.createElement('div');
    banner.textContent = `${accountName}`;
    banner.style.backgroundColor = accountName.includes('-sandbox') ? '#6ba234' : '#eb5381';
    banner.style.borderBottom = '1px solid #424650';
    banner.style.fontWeight = '600';
    banner.style.color = 'white';
    banner.style.textAlign = 'center';
    banner.style.padding = '10px';
    banner.style.fontSize = '16px';
    banner.style.cursor = 'pointer';
    banner.style.fontFamily = '"Amazon Ember", "Helvetica Neue", Arial, sans-serif';
    banner.setAttribute('title', 'Copy');

    // Copy account name to clipboard on click
    banner.addEventListener('click', () => {
      navigator.clipboard.writeText(accountName);
    });

    return banner;
  }

  /**
   * Inserts the banner into the DOM.
   * @param {HTMLElement} banner - The banner element.
   */
  function insertBanner(banner) {
    const targetElement = document.querySelector('#h');
    if (targetElement) {
      targetElement.insertBefore(banner, targetElement.firstChild);
      bannerInserted = true;
    } else {
      console.warn('Target element #h not found. Banner not inserted.');
    }
  }

  /**
   * Observes changes in the DOM and inserts the banner when the account info is found.
   */
  function observeDOMChanges() {
    const observer = new MutationObserver(() => {
      if (bannerInserted) return; // Avoid duplicate banners

      const accountName = getAccountName();
      if (accountName) {
        const banner = createBanner(accountName);
        insertBanner(banner);
        observer.disconnect(); // Stop observing once the banner is inserted
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    observeDOMChanges();
  }

  init();
})();
