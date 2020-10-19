/* global browser */
import iconColor from './iconcolor.js';
import w3color from './w3color.js';

const NS_XHTML = 'http://www.w3.org/1999/xhtml';
const globalSheet = browser.extension.getURL('browser.css');
export let defaultOptions = {
  enableIconColors: true,
  displayNewtab: false,
  displayTitlebar: true,
  displayPlaceholders: false,
  displayCloseButton: false,
  font: '',
  tabSize: 10,
  minTabSize: 150,
  maxTabSize: 300,
  minTabHeight: 28,
  maxTabRows: 99,
  minLightness: 59,
  maxLightness: 100,
  fitLightness: true,
  userCSS: '',
  userCSSCode: '',
};

let cachedOptions = {};
// In currentOptionsSheet we keep track of the dynamic stylesheet that applies
// options (such as the user font), so that we can unload() the sheet once the
// options change.
let currentOptionsSheet = '';
let iconSheets = {};

function makeDynamicSheet(options) {
  // User options are applied via a dynamic stylesheet. Doesn't look elegant
  // but keeps the API small.
  let rules = `
  @import url('${options.userCSS}');
  @import url('data:text/css;base64,${btoa(options.userCSSCode)}');
  @namespace url('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul');
  :root, ::part(scrollbox) {
    --paxmod-font: ${options.font};
    --paxmod-tab-size: ${options.tabSize}%;
    --paxmod-min-tab-size: ${options.minTabSize}px;
    --paxmod-max-tab-size: ${options.maxTabSize}px;
    --tab-min-height: ${options.minTabHeight}px !important;
    --paxmod-max-tab-rows: ${options.maxTabRows} !important;
    --paxmod-display-newtab: ${options.displayNewtab ? '-webkit-box' : 'none'};
    --paxmod-titlebar-display: ${options.displayTitlebar ? '-webkit-box' : 'none'};
    --paxmod-titlebar-placeholders: ${options.displayPlaceholders ? '1000px' : '0px'};
    --paxmod-display-close-button: ${options.displayCloseButton ? '-webkit-box' : 'none'};
  }`;
  // -webkit-box is used as a replacement for -moz-box which doesn't seem to
  // work in FF >= 63. That's possibly an internal bug.

  // CSS rules are base64-encoded because the native StyleSheetService API
  // can't handle some special chars.
  return `data:text/css;base64,${btoa(rules)}`;
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
    // We can't access the Chrome DOM, so we apply each favicon color as a
    // stylesheet.
    let sheetText = `data:text/css,.tabbrowser-tab .tab-icon-image[src='${url}']
      ~ .tab-label-container .tab-label { color: ${color} !important; }`;
    browser.stylesheet.load(sheetText, 'AUTHOR_SHEET');
    iconSheets[url] = sheetText;
    img.remove();
  });
  img.src = url;
}

async function addAllIconColors() {
  let tabs = await browser.tabs.query({});
  for (let tab of tabs) {
    if (tab.favIconUrl) {
      addIconColor(tab.favIconUrl);
    }
  }
}

function removeAllIconColors() {
  for (let sheet of Object.values(iconSheets)) {
    browser.stylesheet.unload(sheet, 'AUTHOR_SHEET');
  }
  iconSheets = {};
}

export async function getOptions() {
  return await browser.storage.local.get();
}

export async function setOptions(options) {
  await browser.storage.local.set(options);
}

export async function deployOptions() {
  let options = await getOptions();
  removeAllIconColors();
  cachedOptions.minLightness = options.minLightness;
  cachedOptions.maxLightness = options.maxLightness;

  let newOptionsSheet = makeDynamicSheet(options);
  if (currentOptionsSheet) {
    await browser.stylesheet.unload(currentOptionsSheet, 'AUTHOR_SHEET');
  }
  await browser.stylesheet.load(newOptionsSheet, 'AUTHOR_SHEET');
  currentOptionsSheet = newOptionsSheet;
  if (options.enableIconColors) {
    if (!browser.tabs.onUpdated.hasListener(onTabUpdated)) {
      browser.tabs.onUpdated.addListener(onTabUpdated);
    }
    await addAllIconColors();
  } else {
    if (browser.tabs.onUpdated.hasListener(onTabUpdated)) {
      browser.tabs.onUpdated.removeListener(onTabUpdated);
    }
  }
}

function onTabUpdated(tabId, changeInfo) {
  if (changeInfo.favIconUrl) {
    addIconColor(changeInfo.favIconUrl);
  }
}

// Return the best tab lightness settings for a given theme
function getBestLightnessOptions(theme) {
  // Maps theme color properties to whether their lightness corresponds to the
  // inverted theme lightness, ordered by significance
  let invertColorMap = {
    tab_text: true,
    textcolor: true,
    tab_selected: false,
    frame: false,
    accentcolor: false,
    bookmark_text: true,
    toolbar_text: true,
  };
  let light = {
    minLightness: 0,
    maxLightness: 52,
  };
  let dark = {
      minLightness: 59,
      maxLightness: 100,
  };
  let colors = theme.colors;
  if (!colors) {
    return light;
  }
  for (let prop in invertColorMap) {
    if (!colors[prop]) {
      continue;
    }
    return (w3color(colors[prop]).isDark() !== invertColorMap[prop]) ? dark : light;
  }
  return light;
}

async function startup() {
  browser.stylesheet.load(globalSheet, 'AUTHOR_SHEET');
  browser.paxmod.load();
  let options = await getOptions();
  let theme = await browser.theme.getCurrent();
  let newOptions = {};
  for (let key in defaultOptions) {
    if (!(key in options)) {
      newOptions[key] = defaultOptions[key];
    }
  }
  if (options.fitLightness !== false) {
    Object.assign(newOptions, getBestLightnessOptions(theme));
  }
  if (Object.keys(newOptions).length > 0) {
    setOptions(newOptions).then(deployOptions);
  }
}

browser.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    browser.tabs.create({url: browser.runtime.getManifest().homepage_url});
  }
});

browser.theme.onUpdated.addListener(async details => {
  if ((await browser.storage.local.get('fitLightness')).fitLightness !== false) {
    setOptions(getBestLightnessOptions(details.theme)).then(deployOptions);
  }
});

startup();
