/* global browser iconColor */

const NS_XHTML = 'http://www.w3.org/1999/xhtml';
const globalSheet = browser.extension.getURL('browser.css');
var defaultOptions = { // eslint-disable-line no-var
  enableColors: true,
  displayVersion: false,
  displayNewtab: false,
  displayTitlebar: false,
  fontFamily: 'Terminus, Tamsyn, monospace',
  fontSize: 12,
  minLightness: 62,
  maxLightness: 100,
  bgColor: '#111111',
  fgColor: '#eeeeee',
  iconColor: '#aaaaaa',
  gridColor: '#333333',
  urlbarColor: '#222222',
  hoverColor: '#333333',
  outlineColorFocus: '#999999',
  tabBgColor: '#111111',
  bgColorFocus: '#222222',
  bgColorVar: '--background',
  fgColorVar: '--foreground',
  iconColorVar: '--color1',
  gridColorVar: '--color2',
  urlbarColorVar: '--color3',
  hoverColorVar: '--color4',
  outlineColorFocusVar: '--color5',
  tabBgColorVar: '--color6',
  bgColorFocusVar: '--color7',
  userCSS: '',
};
let cachedOptions = {};
// In currentOptionsSheet we keep track of the dynamic stylesheet that applies
// options (such as the user font), so that we can unload() the sheet once the
// options change.
let currentOptionsSheet = '';
let iconSheets = {};

function setOptionsSheet(options) {
  browser.runtime.getBrowserInfo().then(info => {
    let manifest = browser.runtime.getManifest();
    let version = `${info.name}/${info.version} + paxmod/${manifest.version}`;
    // User options are applied via a dynamic stylesheet. Doesn't look elegant
    // but keeps the API small.
    let rules = `
    @import url('${options.userCSS}');
    :root {
      --paxmod-version: '${version}';
      --paxmod-font-size: ${options.fontSize}px;
      --paxmod-font-family: ${options.fontFamily};
      --paxmod-display-version: ${options.displayVersion ? 'block' : 'none'};
      --paxmod-display-newtab: ${options.displayNewtab ? 'block' : 'none'};
      --paxmod-titlebar-display: ${options.displayTitlebar ? '-moz-box' : 'none'};
      --paxmod-titlebar-visibility: ${options.displayTitlebar ? 'visible' : 'hidden'};
      --paxmod-background-color: var(${options.bgColorVar}, ${options.bgColor});
      --paxmod-foreground-color: var(${options.fgColorVar}, ${options.fgColor});
      --paxmod-icon-color: var(${options.iconColorVar}, ${options.iconColor});
      --paxmod-grid-color: var(${options.gridColorVar}, ${options.gridColor});
      --paxmod-urlbar-color: var(${options.urlbarColorVar}, ${options.urlbarColor});
      --paxmod-hover-color: var(${options.hoverColorVar}, ${options.hoverColor});
      --paxmod-outline-color-focus: var(${options.outlineColorFocusVar}, ${options.outlineColorFocus});
      --paxmod-tab-background-color: var(${options.tabBgColorVar}, ${options.tabBgColor});
      --paxmod-background-color-focus: var(${options.bgColorFocusVar}, ${options.bgColorFocus});

    }`;
    // CSS rules are base64-encoded because the native StyleSheetService API
    // can't handle some special chars.
    let cssDocument = `data:text/css;base64,${btoa(rules)}`;
    if (currentOptionsSheet) {
      browser.stylesheet.unload(currentOptionsSheet, 'AUTHOR_SHEET');
    }
    browser.stylesheet.load(cssDocument, 'AUTHOR_SHEET');
    currentOptionsSheet = cssDocument;
  });
}

function addIconColor(url) {
  if ((!url) || url.startsWith('chrome://') || url.includes('\'') || (url in iconSheets)) {
    return;
  }
  let img = document.createElementNS(NS_XHTML, 'img');
  img.addEventListener('load', () => {
    let color = iconColor(
      img,
      Number(cachedOptions.minLightness),
      Number(cachedOptions.maxLightness),
    );
    // We can't access the Chrome DOM, so we apply each icon color as a
    // stylesheet.
    let sheetText = `data:text/css,.tabbrowser-tab .tab-icon-image[src='${url}']
      ~ .tab-label-container .tab-label { color: ${color} !important; }`;
    browser.stylesheet.load(sheetText, 'AUTHOR_SHEET');
    iconSheets[url] = sheetText;
    img.remove();
  });
  img.src = url;
}

function addAllIconColors() {
  browser.tabs.query({}).then(tabs => {
    for (let tab of tabs) {
      if (tab.favIconUrl) {
        addIconColor(tab.favIconUrl);
      }
    }
  });
}

function removeAllIconColors() {
  for (let sheet of Object.values(iconSheets)) {
    browser.stylesheet.unload(sheet, 'AUTHOR_SHEET');
  }
  iconSheets = {};
}

function onTabUpdated(tabId, changeInfo) {
  if (changeInfo.favIconUrl) {
    addIconColor(changeInfo.favIconUrl);
  }
}

function applyOptions() {
  browser.storage.local.get().then(options => {
    removeAllIconColors();
    cachedOptions.minLightness = options.minLightness;
    cachedOptions.maxLightness = options.maxLightness;
    setOptionsSheet(options);
    if (options.enableColors) {
      if (!browser.tabs.onUpdated.hasListener(onTabUpdated)) {
        browser.tabs.onUpdated.addListener(onTabUpdated);
      }
      addAllIconColors();
    } else {
      if (browser.tabs.onUpdated.hasListener(onTabUpdated)) {
        browser.tabs.onUpdated.removeListener(onTabUpdated);
      }
    }
  });
}

function startup() {
  browser.stylesheet.load(globalSheet, 'AUTHOR_SHEET');
  browser.storage.local.get().then(options => {
    let promises = [];
    for (let key in defaultOptions) {
      if (!(key in options)) {
        promises.push(browser.storage.local.set({[key]: defaultOptions[key]}));
      }
    }
    Promise.all(promises).then(applyOptions);
  });
}

browser.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    browser.tabs.create({url: browser.runtime.getManifest().homepage_url});
  }
});

startup();
