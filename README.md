
# Paxmod

Paxmod is a dark, minimalist Firefox theme wth multiple tab rows and site-dependent tab colors. If you like the terminal-like aesthetics of compact UIs with white-on-black monospace fonts, give Paxmod a try.

![Demo](https://i.imgur.com/bgLIBb4.gif)

## Installation

- Use an up-to-date version (57+) of either [Firefox Developer](https://www.mozilla.org/en-US/firefox/developer/) or Nightly.

- Enable legacy extensions and disable extension signature checks. (Go to `about:config` and set `extensions.legacy.enabled` to `true`, and `xpinstall.signatures.required` to `false`. [Why?](#why-cant-i-install-paxmod-as-a-verified-extension-through-mozilla))

- Install the [Stylesheet API](https://github.com/numirias/stylesheet-api-experiment). (Download the `.xpi` file from  [here](https://github.com/numirias/stylesheet-api-experiment/releases/latest) and load it in Firefox.)

- Install Paxmod. (Download the `.xpi` file from [here](https://github.com/numirias/paxmod/releases/latest) and load it in Firefox.)

### Customization

You can change some settings at `about:addons` > *Extensions* > *Paxmod* > *Preferences*.

If you want Paxmod to look the same as in the examples here, you need the [Terminus font](http://terminus-font.sourceforge.net/). Bitmap fonts work great in small sizes on dark backgrounds.

Also, you may want to remove clutter from the toolbar to get a cleaner UI. Open the burger menu, click *Customize* and drag away unneeded items (in particular, remove the invisible placeholders to get rid of the empty space). I like to keep only the navigation arrows and the download button.

It's also recommended to disable UI animations for less jiggly tab movement. (Go to `about:config` and set `toolkit.cosmeticAnimations.enabled` to `false`.)

## FAQ

### Why can't I install Paxmod as a verified extension through Mozilla?

Mozilla is dropping support for legacy extensions, so all new extensions need to comply with the [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) standard. But Paxmod needs to be able to modify the browser UI, a feature for which there is no existing WebExtension API, and probably never will be. Therefore, Paxmod is relying on an experimental API that you have to install as a separate add-on. Unfortunately, due to this extra dependency, Mozilla won't sign the extension anymore and therefore it can't be distributed over the official channels.

### How are tab colors calculated?

Each tab color is generated dynamically from the favicon. A dominant color is extracted from the image and eventually brightened up to a minimum lightness in the [Lab color space](https://en.wikipedia.org/wiki/Lab_color_space). This works reasonably well and ensures that all tab labels are legible.

## Troubleshooting

### I can't install the add-on.

If Firefox complains that the add-on isn't verified, you probably didn't turn extension signature checks off. Also note that turning the checks off has no effect in the standard releases, which is why you need to use Firefox Developer or Nightly. If Firefox complains that the add-on isn't *compatible*, you probably forgot to turn legacy extensions or didn't install the [Stylesheet API](https://github.com/numirias/stylesheet-api-experiment).

### The design looks off.

Make sure you have all other themes disabled (look under `about:addons` > *Themes*), because some themes might apply aggressive CSS rules that interfere with Paxmod. Also, Paxmod is mainly tested on Linux, so there might be some design quirks on MacOS or Windows that I'm not aware of. If in doubt, please [file a bug](https://github.com/numirias/paxmod/issues/new).

### The font looks bad.

Paxmod defaults to the [Terminus font](http://terminus-font.sourceforge.net/) which you can change in the settings.

On Arch Linux, you can install Terminus via:

    # pacman -S terminus-font

### Firefox still doesn't find Terminus.

Make sure you type in the exact name of the font. Some fonts have non-obvious names. (On my machine, the font was registered as `xos4 Terminus`, not `Terminus`.) You can list your installed fonts with `fc-list`, e.g.:

    $ fc-list | grep -i terminus
    ...
    /usr/share/fonts/misc/ter-x16b.pcf.gz: xos4 Terminus:style=Bold
    /usr/share/fonts/misc/ter-x14n.pcf.gz: xos4 Terminus:style=Regular
    ...
