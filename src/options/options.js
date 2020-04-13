/* global browser */
import { getOptions, setOptions, deployOptions, defaultOptions } from '../background.js'

async function showOptions() {
  let options = await getOptions();
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
}

function saveOptions() {
  let newOptions = {};
  for (let key in defaultOptions) {
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
  setOptions(newOptions)
    .then(deployOptions);
}

function resetOptions() {
  setOptions(defaultOptions)
    .then(deployOptions)
    .then(showOptions);
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
    setOptions(newOptions)
      .then(deployOptions)
      .then(showOptions);
  });
  reader.readAsText(e.target.files[0]);
}

async function exportOptions() {
  let options = await getOptions();
  let file = new Blob([JSON.stringify(options, null, 4)], {type: 'application/json'});
  let a = document.createElement('a');
  let url = URL.createObjectURL(file);
  let timestamp = new Date().toISOString().replaceAll(':','-');
  a.href = url;
  a.download = `paxmod-settings-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

document.addEventListener('DOMContentLoaded', showOptions);

document.querySelectorAll('.saveOptionsButton').forEach(x => x.addEventListener('click', saveOptions));
document.querySelectorAll('.resetOptionsButton').forEach(x => x.addEventListener('click', resetOptions));

document.querySelector('#importFile').addEventListener('change', importOptions);
document.querySelector('#exportButton').addEventListener('click', exportOptions);
