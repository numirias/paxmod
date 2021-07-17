
# Paxmod

Paxmod is a Firefox add-on for **multiple tab rows** and **dynamic, site-dependent tab colors**.

It works in the new Proton UI and alongside any themes. You can configure the font, tab sizes, add your own CSS, and more.

### Firefox Developer

![Demo dark](https://user-images.githubusercontent.com/29267777/125923136-98214e46-ba3b-49d9-806a-31595f461059.gif)

### Firefox Nightly

![Demo light](https://user-images.githubusercontent.com/29267777/125923505-e51a4b6b-7c48-4c04-a06d-9fc3657ea2ef.png)

## Installation

- Use an up-to-date version of either [Firefox Developer](https://www.mozilla.org/en-US/firefox/developer/) or [Nightly](https://www.mozilla.org/en-US/firefox/nightly/).

- Go to `about:config` and confirm these settings:

  | Key | Value |
  | --- | --- |
  | `xpinstall.signatures.required` | `false` [(Why?)](#why-cant-i-install-paxmod-as-a-verified-extension-through-mozilla) |
  | `extensions.experiments.enabled` | `true` |

- Install Paxmod. (Download the `.xpi` file from [here](https://github.com/numirias/paxmod/releases/latest) and load it in Firefox.)


## Customization

You can change the font, tab sizes and other settings at `about:addons` > *Extensions* > *Paxmod* > *Preferences*.

### Tips

- If the inline titlebar causes glitches or you think it's wasting too much space, [enable the standard titlebar](#the-inline-titlebar-causes-glitches).

- On dark backgrounds I prefer bitmap fonts as they don't look as blurry. (The dark demo uses the [Terminus font](http://terminus-font.sourceforge.net/).)


### Custom CSS

In the settings you can paste custom CSS snippets or link to a stylesheet. If you link to a local file, make sure to prefix the path with `file://`, e.g. `file:///tmp/foo.css`.

## FAQ

### Why can't I install Paxmod as a verified extension through Mozilla?

Regular themes and WebExtensions are only allowed to use a limited set of APIs. There is no support for advanced modifications of the browser UI, like changing the behavior of the tab bar. Hence, Paxmod comes bundled with two small additional APIs (officially called "API experiments") that add the necessary features. However, Mozilla won't sign extensions which use unofficial APIs and doesn't allow them to be distributed over the official channels. So, distributing transparently via Github seemed like the next best option.

### Is Paxmod secure?

These are security aspects to consider:

- Disabling `xpinstall.signatures.required` allows unsigned extensions to run in the browser. However, you'll still be boldly warned and asked for confirmation whenever a site tries to install an unsigned add-on.
- The bundled privileged APIs are encapsulated and can't be accessed by other extensions or websites. You're not extending the permissions you grant to Paxmod to anything else.
- With auto-updates enabled, I could add malicious code in the future without you noticing. So if you don't trust me, consider disabling auto-updates for Paxmod and review new versions manually before installation.

TL;DR: Paxmod is suitable for daily use, but you may want to disable auto-updates if you don't trust my future updates. See [here](https://github.com/numirias/paxmod/issues/73) for a longer answer.

### Where did the titlebar go?

The inline titlebar is hidden by default, but you can re-enable it in the settings. If it doesn't integrate into the layout as expected, please [file an issue](https://github.com/numirias/paxmod/issues/new). (Note that some environments don't support an inline titlebar at all.)

### How are tab colors calculated?

Each tab color is generated dynamically from the favicon. A dominant color is extracted from the image and adjusted to an appropriate lightness per the [Lab color space](https://en.wikipedia.org/wiki/Lab_color_space) to ensure that all tab labels are legible. (You can tweak the lightness thresholds in the settings.)

## Troubleshooting

### I can't install the add-on.

If Firefox complains that the add-on isn't verified, you probably didn't turn extension signature checks off. Also note that this has no effect in the standard releases, which is why you need to use Firefox Developer or Nightly.

### The inline titlebar causes glitches.

Especially on MacOS, the inline titlebar may not work as expected. In that case you need to enable the standard titlebar. (Open the burger menu (☰), click *Customize* and check *Title Bar* at the bottom.) Also, go to the addon settings and uncheck *Display inline titlebar* and *Display titlebar spacers*.

### The layout looks off.

Paxmod is mainly tested on Linux, so there are most likely some quirks on MacOS or Windows that I'm not aware of. If in doubt, please [file an issue](https://github.com/numirias/paxmod/issues/new). Your help is welcome.

## Contributing

Use [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) to develop locally. After cloning the repository, you can run Paxmod similar to this:

    web-ext run --firefox /usr/bin/firefox-nightly --firefox-profile dev-paxmod

(Make sure you're in the project's root directory, and you're pointing to an existing Firefox binary.)

To build the addon, run:

    make build

To release a new version, run:

    version=0.0 make release
