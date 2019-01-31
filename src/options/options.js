/* global browser */

const background = browser.extension.getBackgroundPage();

function displayOptions() {
  let allCode = '';
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
  for (let key in background.defaultOptions) {
    let element = document.getElementById(key);
    let value = element.type === 'checkbox' ? element.checked : element.value;
    newOptions[key] = value;
  }
  if (!/^([a-zA-Z0-9.,-_+=()\s]+)$/.test(newOptions.fontFamily)) {
    window.alert('Font family must match: /^([a-zA-Z0-9.,-_+=()\\s]+)$/');
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

function importOptions(e) {
  let reader = new FileReader();
  let newOptions = {};
  reader.onload = (e => {
    try {
      newOptions = JSON.parse(e.target.result);
    } catch (error) {
      window.alert(error);
      return;
    }
    browser.storage.local.set(newOptions).then(() => {
      background.applyOptions();
      displayOptions();
    });
  });
  reader.readAsText(e.target.files[0]);
}

function exportOptions() {
  browser.storage.local.get().then(options => {
    let file = new Blob([JSON.stringify(options, null, 4)], {type: 'application/json'});
    let a = document.createElement('a');
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'paxmod-settings.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);

  });
}

document.addEventListener('DOMContentLoaded', displayOptions);

document.querySelectorAll('.saveOptionsButton').forEach(x => x.addEventListener('click', saveOptions));
document.querySelectorAll('.resetOptionsButton').forEach(x => x.addEventListener('click', () => resetOptions()));

document.querySelector('#importFile').addEventListener('change', importOptions);
document.querySelector('#exportButton').addEventListener('click', exportOptions);
