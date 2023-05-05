
//localize (Separate localization files for future use)

let i18n = browser.i18n;
let localizeTarget = document.querySelectorAll(".i18n-content");
for (let i = 0; i < localizeTarget.length; i++) {
  let elem = localizeTarget[i];
  let key = elem.id;
  let message = i18n.getMessage(key);

  if (message) {
    elem.textContent = message;
  }
}

let innerHTMLTarget = document.querySelectorAll(".i18n-innerHTML");
for (let i = 0; i < innerHTMLTarget.length; i++) {
  let elem = innerHTMLTarget[i];
  let key = elem.id;
  let message = i18n.getMessage(key);

  if (message) {
    elem.innerHTML = message;
  }
}