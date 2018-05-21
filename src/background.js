/* global browser iconColor */

const NS_XHTML = 'http://www.w3.org/1999/xhtml';
const globalSheet = browser.extension.getURL('browser.css');
var themeColorVars = [ // eslint-disable-line no-var
  'accentcolor',
  'button_background_active',
  'button_background_hover',
  'icons',
  'icons_attention',
  'popup',
  'popup_border',
  'popup_highlight',
  'popup_highlight_text',
  'popup_text',
  'tab_line',
  'tab_selected',
  'tab_text',
  'textcolor',
  'toolbar',
  'toolbar_bottom_separator',
  'toolbar_field',
  'toolbar_field_border',
  'toolbar_field_border_focus',
  'toolbar_field_focus',
  'toolbar_field_text',
  'toolbar_field_text_focus',
  'toolbar_field_separator',
  'toolbar_text',
  'toolbar_top_separator',
  'toolbar_vertical_separator',
];
const themeColorCSSDefaults = {
  accentcolor: '--background',
  button_background_active: '--color1',
  button_background_hover: '--color1',
  icons: '--color4',
  icons_attention: '--foreground',
  popup: '--background',
  popup_border: '--color1',
  popup_highlight: '--color0',
  popup_highlight_text: '--foreground',
  popup_text: '--color3',
  tab_line: '--color2',
  tab_selected: '--color1',
  tab_text: '--foreground',
  textcolor: '--foreground',
  toolbar: '--color0',
  toolbar_bottom_separator: '--color15',
  toolbar_field: '--color1',
  toolbar_field_border: '--background',
  toolbar_field_border_focus: '--background',
  toolbar_field_focus: '--color1',
  toolbar_field_text: '--color3',
  toolbar_field_text_focus: '--foreground',
  toolbar_field_separator: '--color5',
  toolbar_text: '--foreground',
  toolbar_top_separator: '--color15',
  toolbar_vertical_separator: '--color15',
};
const darkPalette = {
  bg: '#111111',
  bg0: '#1a1a1a',
  bg1: '#292929',
  bg2: '#333333',
  bg3: '#555555',
  fg: '#eeeeee',
  fg0: '#dddddd',
  fg1: '#999999',
};
var defaultOptions = { // eslint-disable-line no-var
  enableIconColors: true,
  displayVersion: false,
  displayNewtab: false,
  displayTitlebar: false,
  fontFamily: 'Terminus, Tamsyn, Consolas, monospace',
  fontSize: 12,
  tabSize: 10,
  minTabSize: 150,
  maxTabSize: 300,
  minLightness: 59,
  maxLightness: 100,
  userCSS: '',
  userCSSCode: '',
  enableThemeColors: true,
  accentcolor: darkPalette.bg,
  button_background_active: darkPalette.bg1,
  button_background_hover: darkPalette.bg2,
  icons: darkPalette.fg1,
  icons_attention: darkPalette.fg,
  popup: darkPalette.bg,
  popup_border: darkPalette.bg1,
  popup_highlight: darkPalette.bg0,
  popup_highlight_text: darkPalette.fg,
  popup_text: darkPalette.fg0,
  tab_line: darkPalette.bg3,
  tab_selected: darkPalette.bg1,
  tab_text: darkPalette.fg,
  textcolor: darkPalette.fg,
  toolbar: darkPalette.bg0,
  toolbar_bottom_separator: '#ff0000', // Not in use
  toolbar_field: darkPalette.bg1,
  toolbar_field_border: darkPalette.bg, // Grid color
  toolbar_field_border_focus: darkPalette.bg, // Focused tab outline
  toolbar_field_focus: darkPalette.bg1,
  toolbar_field_text: darkPalette.fg0,
  toolbar_field_text_focus: darkPalette.fg,
  toolbar_field_separator: '#444444',
  toolbar_text: darkPalette.fg,
  toolbar_top_separator: '#ff0000', // Not in use
  toolbar_vertical_separator: '#ff0000', // Not in use
};
for (let color in themeColorCSSDefaults) {
  defaultOptions[`${color}_var`] = themeColorCSSDefaults[color];
}
const lightPalette = {
  bg: '#ffffff',
  bg0: '#f3f3f3',
  bg1: '#efefef',
  bg2: '#e8e8e8',
  bg3: '#e3e3e3',
  fg: '#333333',
  fg0: '#444444',
  fg1: '#777777',
};
var defaultOptionsLight = { // eslint-disable-line no-var
  ...defaultOptions,
  fontFamily: 'Roboto, sans-serif',
  minLightness: 0,
  maxLightness: 52,
  // Mixing casing here because snake case is the convention for theme vars
  accentcolor: lightPalette.bg,
  button_background_active: lightPalette.bg3,
  button_background_hover: lightPalette.bg3,
  icons: lightPalette.fg1,
  icons_attention: lightPalette.fg,
  popup: lightPalette.bg,
  popup_border: lightPalette.bg1,
  popup_highlight: lightPalette.bg0,
  popup_highlight_text: lightPalette.fg,
  popup_text: lightPalette.fg0,
  tab_line: '#4A90D9',
  tab_selected: lightPalette.bg2,
  tab_text: lightPalette.fg,
  textcolor: lightPalette.fg,
  toolbar: lightPalette.bg0,
  toolbar_field: lightPalette.bg2, // Url bar field
  toolbar_field_border: lightPalette.bg, // Grid color
  toolbar_field_border_focus: lightPalette.bg, // Focused tab outline
  toolbar_field_focus: lightPalette.bg1, // Url bar field focus
  toolbar_field_text: lightPalette.fg0,
  toolbar_field_text_focus: lightPalette.fg,
  toolbar_field_separator: '#cccccc',
  toolbar_text: lightPalette.fg,
};
let cachedOptions = {};
// In currentOptionsSheet we keep track of the dynamic stylesheet that applies
// options (such as the user font), so that we can unload() the sheet once the
// options change.
let currentOptionsSheet = '';
let iconSheets = {};

function makeDynamicSheet(options) {
  return browser.runtime.getBrowserInfo().then(info => {
    let manifest = browser.runtime.getManifest();
    let version = `${info.name}/${info.version} + paxmod/${manifest.version}`;
    // User options are applied via a dynamic stylesheet. Doesn't look elegant
    // but keeps the API small.
    let rules = `
    @import url('${options.userCSS}');
    @import url('data:text/css;base64,${btoa(options.userCSSCode)}');
    :root {
      --paxmod-version: '${version}';
      --paxmod-font-size: ${options.fontSize}px;
      --paxmod-tab-size: ${options.tabSize}%;
      --paxmod-min-tab-size: ${options.minTabSize}px;
      --paxmod-max-tab-size: ${options.maxTabSize}px;
      --paxmod-font-family: ${options.fontFamily};
      --paxmod-display-version: ${options.displayVersion ? 'block' : 'none'};
      --paxmod-display-newtab: ${options.displayNewtab ? 'block' : 'none'};
      --paxmod-titlebar-display: ${options.displayTitlebar ? '-moz-box' : 'none'};
      --paxmod-titlebar-visibility: ${options.displayTitlebar ? 'visible' : 'hidden'};
    }`;
    // CSS rules are base64-encoded because the native StyleSheetService API
    // can't handle some special chars.
    return `data:text/css;base64,${btoa(rules)}`;
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

    makeDynamicSheet(options).then(sheet => {
      if (currentOptionsSheet) {
        browser.stylesheet.unload(currentOptionsSheet, 'AUTHOR_SHEET');
      }
      browser.stylesheet.load(sheet, 'AUTHOR_SHEET').then(() => {
        currentOptionsSheet = sheet;
        if (options.enableThemeColors) {
          let themeColors = {};
          for (let color of themeColorVars) {
            themeColors[color] = options[color];
          }
          let style = getComputedStyle(document.children[0]);
          for (let color in themeColorCSSDefaults) {
            let property = style.getPropertyValue(options[`${color}_var`]);
            if (property) {
              themeColors[color] = property;
            }
          }
          browser.theme.reset();
          browser.theme.update({colors: themeColors});
        }

        if (options.enableIconColors) {
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
    });
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
