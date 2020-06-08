'use strict'

var wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator)
var tabsProto = null

var listener = {
  onOpenWindow(xulWin) {
    let win = xulWin.docShell.domWindow
    win.addEventListener('load', () => {
      if (win.document.documentElement.getAttribute('windowtype') != 'navigator:browser') {
        return
      }
      patch(win)
    }, { once: true })
  }
}

function load() {
  for (let win of wm.getEnumerator('navigator:browser')) {
    patch(win)
  }
  wm.addListener(listener)
}

function unload() {
  for (let win of wm.getEnumerator('navigator:browser')) {
    unpatch(win)
  }
  wm.removeListener(listener)
}

function patch(win) {
  try {
    tabsProto = win.customElements.get('tabbrowser-tabs').prototype
  } catch(e) {
    console.warn('Paxmod: didn\'t find tab box in this win')
    return
  }
  if (tabsProto._positionPinnedTabs_orig) {
    console.warn('Paxmod: tab box already patched in this win')
    return
  }
  tabsProto._positionPinnedTabs_orig = tabsProto._positionPinnedTabs
  tabsProto._positionPinnedTabs = function() {
    this._positionPinnedTabs_orig()
    this.style.paddingInlineStart = ''
    for (let tab of this.allTabs) {
      tab.style.marginInlineStart = ''
    }
  }
  win.document.querySelector('#tabbrowser-tabs')._positionPinnedTabs()
}

function unpatch(win) {
  if (!tabsProto._positionPinnedTabs_orig) {
    console.warn('Paxmod: tab box not patched')
    return
  }
  tabsProto._positionPinnedTabs = tabsProto._positionPinnedTabs_orig
  delete tabsProto._positionPinnedTabs_orig
}

this.paxmod = class extends ExtensionAPI {
  onShutdown(reason) {
    unload()
  }

  getAPI(context) {
    return {
      paxmod: {
        async load() {
          load()
        }
      }
    }
  }
}
