/* global browser */

const background = browser.extension.getBackgroundPage();

function displayOptions() {
  browser.storage.local.get().then(options => {
    for (let key in options) {
      let element = document.getElementById(key);
      if (!element) {
        continue;
      }
      if (element.type === 'checkbox') {
        element.checked = options[key];
      } else {
        element.value = options[key];
      }
    }
  });
}

function saveOptions() {
  let newOptions = {};
  for (let field of document.querySelectorAll('input')) {
    let value = field.type === 'checkbox' ? field.checked : field.value;
    newOptions[field.id] = value;
  }
  if (!/^([a-zA-Z0-9.,-_+=\s]+)$/.test(newOptions.fontFamily)) {
    window.alert('Font family must match: /^([a-zA-Z0-9.,-_+=\\s]+)$/');
    return;
  }
  if (!/^\d+$/.test(newOptions.fontSize)) {
    window.alert('Font size must be a number!');
    return;
  }
  browser.storage.local.set(newOptions).then(background.applyOptions);
}

function resetOptions() {
  browser.storage.local.set(background.defaultOptions).then(() => {
    background.applyOptions();
    displayOptions();
  });
}

document.addEventListener('DOMContentLoaded', displayOptions);
document.querySelector('#saveOptionsButton').addEventListener('click', saveOptions);
document.querySelector('#resetOptionsButton').addEventListener('click', resetOptions);
