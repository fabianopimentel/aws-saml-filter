// ==UserScript==
// @name         AWS Account Banner
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Displays a banner with AWS account name making it easier to identify the account you are logged in to.
// @author       Fabiano Pimentel
// @match        https://*.console.aws.amazon.com/*
// @icon         https://www.google.com/s2/favicons?domain=aws.amazon.com
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG_MODE = false; // Set to false to disable debug logs
  let scriptInitialized = false;
  let bannerInserted = false;

  function debugLog(message) {
    if (DEBUG_MODE) console.log(`[AWS Account Banner]: ${message}`);
  }

  function getAccountName() {
    const accountInfoElement = document.querySelector('[data-testid="awsc-account-info-tile"] span');
    if (!accountInfoElement) {
      debugLog('Account info not found.');
      return null;
    }

    let accountText = accountInfoElement.textContent.trim();
    debugLog(`Raw account text: "${accountText}"`);

    const accountMatch = accountText.match(/(.*?)\s*\(([\d-]+)\)/); // Extract alias & ID
    if (!accountMatch) return null;

    return {
      alias: accountMatch[1].trim(),
      id: accountMatch[2].replace(/-/g, ''), // Remove dashes from ID
    };
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      debugLog(`Copied ${label} to clipboard: ${text}`);
    }).catch(err => {
      debugLog(`Clipboard copy failed: ${err}`);
    });
  }

  function createBanner(account) {
    const banner = document.createElement('div');
    banner.style.backgroundColor = account.alias.includes('-sandbox') ? 'rgb(42, 94, 219)' : 'rgb(166, 45, 38)';
    banner.style.borderBottom = '1px solid #424650';
    banner.style.fontWeight = '600';
    banner.style.color = 'white';
    banner.style.textAlign = 'center';
    banner.style.padding = '10px';
    banner.style.fontSize = '16px';
    banner.style.fontFamily = '"Amazon Ember", "Helvetica Neue", Arial, sans-serif';

    // Alias Span
    const aliasSpan = document.createElement('span');
    aliasSpan.textContent = account.alias;
    aliasSpan.style.cursor = 'pointer';
    aliasSpan.style.marginRight = '8px';
    aliasSpan.title = 'Click to copy alias';
    aliasSpan.addEventListener('click', () => copyToClipboard(account.alias, 'Alias'));

    // ID Span
    const idSpan = document.createElement('span');
    idSpan.textContent = `(${account.id})`;
    idSpan.style.cursor = 'pointer';
    idSpan.style.fontWeight = 'bold';
    idSpan.title = 'Click to copy account ID';
    idSpan.addEventListener('click', () => copyToClipboard(account.id, 'Account ID'));

    // Append elements
    banner.appendChild(aliasSpan);
    banner.appendChild(idSpan);

    return banner;
  }

  function insertBanner(banner) {
    const targetElement = document.querySelector('#h');
    if (targetElement) {
      targetElement.insertBefore(banner, targetElement.firstChild);
      bannerInserted = true;
      debugLog('Banner inserted successfully.');
    } else {
      debugLog('Target element #h not found. Banner not inserted.');
    }
  }

  function observeDOMChanges() {
    const observer = new MutationObserver(() => {
      if (bannerInserted) return;

      const account = getAccountName();
      if (account) {
        const banner = createBanner(account);
        insertBanner(banner);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (scriptInitialized) return;
    scriptInitialized = true;

    debugLog('Initializing script...');
    observeDOMChanges();
  }

  init();
})();
