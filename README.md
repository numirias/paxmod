
# Paxmod

Paxmod is a Firefox add-on that provides multiple tab rows and dynamic, site-dependent tab colors. You can customize the font, tab sizes, add your own CSS, and more.

### Light default

![Demo light](https://i.imgur.com/p0lOtuV.png)

### Dark default

![Demo dark](https://i.imgur.com/t3JdTp1.gif)

(These demos are from an older Paxmod release, but the idea is the same.)


## Installation

- Use an up-to-date version (70+) of either [Firefox Developer](https://www.mozilla.org/en-US/firefox/developer/) or [Nightly](https://www.mozilla.org/en-US/firefox/nightly/).

- Allow unsigned extensions. (Go to `about:config` and set `xpinstall.signatures.required` to `false`. [Why?](#why-cant-i-install-paxmod-as-a-verified-extension-through-mozilla))

- Allow legacy extensions. (Go to `about:config` and set `extensions.legacy.enabled` to `true`. This is required to load the bundled stylesheet API.)

- Install Paxmod. (Download the `.xpi` file from [here](https://github.com/numirias/paxmod/releases/latest) and load it in Firefox.)


## Customization

You can change the font, tab sizes and other settings at `about:addons` > *Extensions* > *Paxmod* > *Preferences*.

### Tips

- Disable UI animations for less jiggly tab movement. (Go to `about:config` and set `toolkit.cosmeticAnimations.enabled` to `false`.)

- If the inline titlebar causes glitches or you think it's wasting too much space, [enable the standard titlebar](#the-inline-titlebar-causes-glitches).

- Clean up and condense the UI. Open the burger menu (☰), click *Customize* and set *Density* to *Compact*. Also drag away unneeded toolbar items (in particular, remove the invisible placeholders around the urlbar).

- If you want Paxmod to look exactly the same as in the dark demo, you need the [Terminus font](http://terminus-font.sourceforge.net/). I chose a bitmap font since font rendering in small sizes on dark backgrounds tends to look blurry. But you can set any font you like.

### Color settings

Paxmod no longer provides custom color settings (because these are hard to maintain across Firefox releases). But you can choose from many [themes on MDN](https://addons.mozilla.org/en-US/firefox/themes/) or simply [build your own theme](https://color.firefox.com/).


### Custom CSS

To load custom CSS, you can either specify a path or paste a CSS snippet in the settings. For local files, make sure you prefix the path with `file://`, e.g. `file:///tmp/foo.css`.


## FAQ

### Why can't I install Paxmod as a verified extension through Mozilla?

Paxmod needs to be able to modify the browser UI, a feature for which there is no existing WebExtension API, and probably never will be. Therefore, Paxmod relies on an "experimental API" that ships included in the add-on. Unfortunately, this means Mozilla won't sign the extension anymore and therefore it can't be distributed over the official channels.

### Where did the titlebar go?

The inline titlebar is hidden by default, but you can re-enable it in the settings. If it doesn't integrate into the layout as expected, please [file an issue](https://github.com/numirias/paxmod/issues/new). (Note that some environments don't support an inline titlebar at all.)

### How are tab colors calculated?

Each tab color is generated dynamically from the favicon. A dominant color is extracted from the image and eventually adjusted to an appropriate lightness in the [Lab color space](https://en.wikipedia.org/wiki/Lab_color_space). This works reasonably well and ensures that all tab labels are legible.

## Troubleshooting

### I can't install the add-on.

If Firefox complains that the add-on isn't verified, you probably didn't turn extension signature checks off. Also note that turning the checks off has no effect in the standard releases, which is why you need to use Firefox Developer or Nightly. (Also, if you used a previous version of Paxmod, make sure you uninstall the [Stylesheet API](https://github.com/numirias/stylesheet-api-experiment) which is not required anymore.)

### The inline titlebar causes glitches.

Especially on MacOS, the inline titlebar may not work as expected. In that case you need to enable the standard titlebar. (Open the burger menu (☰), click *Customize* and check *Title Bar* at the bottom.) Also, go to the addon settings and uncheck *Display inline titlebar* and *Display titlebar spacers*.

### The layout looks off.

Paxmod is mainly tested on Linux, so there are most likely some quirks on MacOS or Windows that I'm not aware of. If in doubt, please [file an issue](https://github.com/numirias/paxmod/issues/new). Any help with making Paxmod compatible with other OSes is more than welcome.

### Dragging tabs around isn't smooth.

Tab dragging doesn't work to well with multi-row tabs and I couldn't find a CSS-only fix. Instead, you may want to use the shortcuts <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>PgUp</kbd> and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>PgDn</kbd> to re-arrange the tabs.

### How can I get that bitmap font?

On Arch Linux, you can install the [Terminus font](http://terminus-font.sourceforge.net/) via:

    # pacman -S terminus-font

If Firefox still doesn't find the font, check whether it's installed under a different name. (On my machine, Terminus is registered as `xos4 Terminus`.) You can list your installed fonts with `fc-list`, e.g.:

    $ fc-list | grep -i terminus
    ...
    /usr/share/fonts/misc/ter-x16b.pcf.gz: xos4 Terminus:style=Bold
    /usr/share/fonts/misc/ter-x14n.pcf.gz: xos4 Terminus:style=Regular
    ...

## Contributing

Use [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) to develop locally. After cloning the repository, you can run Paxmod similar to this:

    web-ext run --firefox /usr/bin/firefox-nightly --firefox-profile dev-paxmod --source-dir src

(Make sure the chosen profile has the stylesheet API installed, you're in the project's root directory, and you're pointing to an existing Firefox binary.)

And to build the addon, run:

    web-ext build --overwrite-dest --source-dir src

This will produce a `.zip` file in `web-ext-artifacts/`. Rename the file to `.xpi` to have it recognized as a Firefox extension.
