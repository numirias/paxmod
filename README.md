
# Paxmod

Paxmod is a Firefox add-on that provides multiple tab rows and dynamic, site-dependent tab colors. You can customize the font, tab sizes, add your own CSS, and more.

### Dark Demo (Firefox Developer)

![Demo dark](https://i.imgur.com/V5ZC4ma.gif)

### Light Demo (Firefox Nightly)

![Demo light](https://i.imgur.com/1TodZiN.png)


## Installation

- Use an up-to-date version of either [Firefox Developer](https://www.mozilla.org/en-US/firefox/developer/) or [Nightly](https://www.mozilla.org/en-US/firefox/nightly/).

- Go to `about:config` and confirm these settings:

  | Key | Value |
  | --- | --- |
  | `xpinstall.signatures.required` | `false` [(Why?)](#why-cant-i-install-paxmod-as-a-verified-extension-through-mozilla) |
  | `extensions.experiments.enabled` | `true` |
  | `layout.css.shadow-parts.enabled` | `true` (should be default) |

- Install Paxmod. (Download the `.xpi` file from [here](https://github.com/numirias/paxmod/releases/latest) and load it in Firefox.)


## Customization

You can change the font, tab sizes and other settings at `about:addons` > *Extensions* > *Paxmod* > *Preferences*.

### Tips

- If the inline titlebar causes glitches or you think it's wasting too much space, [enable the standard titlebar](#the-inline-titlebar-causes-glitches).

- If you want Paxmod to look exactly the same as in the dark demo, you need the [Terminus font](http://terminus-font.sourceforge.net/). I chose a bitmap font since font rendering in small sizes on dark backgrounds tends to look blurry.


### Custom CSS

To load custom CSS, you can either specify a path or paste a CSS snippet in the settings. For local files, make sure you prefix the path with `file://`, e.g. `file:///tmp/foo.css`.


## FAQ

### Why can't I install Paxmod as a verified extension through Mozilla?

Paxmod needs to be able to freely modify the browser UI, a feature for which there is no existing WebExtension API, and probably never will be. Therefore, Paxmod relies on an "experimental API" that ships bundled with the add-on. Unfortunately, this means Mozilla won't sign the extension anymore and therefore it can't be distributed over the official channels.

### Where did the titlebar go?

The inline titlebar is hidden by default, but you can re-enable it in the settings. If it doesn't integrate into the layout as expected, please [file an issue](https://github.com/numirias/paxmod/issues/new). (Note that some environments don't support an inline titlebar at all.)

### How are tab colors calculated?

Each tab color is generated dynamically from the favicon. A dominant color is extracted from the image and adjusted to an appropriate lightness per the [Lab color space](https://en.wikipedia.org/wiki/Lab_color_space). This ensures that all tab labels are legible. (You can also set lightness thresholds in the settings.)

## Troubleshooting

### I can't install the add-on.

If Firefox complains that the add-on isn't verified, you probably didn't turn extension signature checks off. Also note that turning the checks off has no effect in the standard releases, which is why you need to use Firefox Developer or Nightly. (Also, if you used a previous version of Paxmod, make sure you uninstall the [Stylesheet API](https://github.com/numirias/stylesheet-api-experiment) which is not required anymore.)

### The inline titlebar causes glitches.

Especially on MacOS, the inline titlebar may not work as expected. In that case you need to enable the standard titlebar. (Open the burger menu (☰), click *Customize* and check *Title Bar* at the bottom.) Also, go to the addon settings and uncheck *Display inline titlebar* and *Display titlebar spacers*.

### The layout looks off.

Paxmod is mainly tested on Linux, so there are most likely some quirks on MacOS or Windows that I'm not aware of. If in doubt, please [file an issue](https://github.com/numirias/paxmod/issues/new). Your help is welcome.

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

    web-ext run --firefox /usr/bin/firefox-nightly --firefox-profile dev-paxmod

(Make sure you're in the project's root directory, and you're pointing to an existing Firefox binary.)

To build the addon, run:

    make build

To release a new version, run:

    VERSION=0.0 make release
