# PaintZ

PaintZ is a simple drawing program for the web.


## Overview

Its goal is to make creating and editing drawings and other images as easy to do on Chrome OS and the web as similar native applications on other platforms, such as Microsoft Paint and KolourPaint.  PaintZ is designed to to be fast and easy to use, with a touch- and mouse-friendly Material Design interface, full offline support, and no Flash Player required.

## Principles

* Fast and lightweight - New features should not make PaintZ significantly slower to start or use.
* Focused and simple - PaintZ exists to make simple drawings and image edits like MS Paint; advanced features such as layers, filters, and vector paths are beyond its scope (and in the scope of other web apps, such as [Photopea](https://photopea.com).
* Ephemiral - Anything related to file management, file syncing, user accounts, etc. is the responsibility of the system/file manager/other apps; PaintZ is not concerned with what happens to the file after it closes.
* Familiar - PaintZ should keep UI patterns and keyboard shortcuts familiar to users of other drawing apps and Chrome OS wherever possible.
* Privacy-conscious - No user-identifying data should be retained, minimal data should be retained at all, and nothing but basic anonymous analytics should leave the user's device.
* Dependency-conscious - PaintZ will never require plug-in installation; new CSS/JS libraries should only be added if necessary, and after serious consideration.

## Live instance

The official live instance of PaintZ can be found at https://paintz.app.


## Chrome Web Store

PaintZ is available to install on Chrome OS [through the Chrome Web Store](https://chrome.google.com/webstore/detail/gdjcnhanmagpjdpilaehedkchegnkdoj).

There is also [a separate Chrome Web Store page for PaintZ beta](https://chrome.google.com/webstore/detail/nnjcoegaaijffkibjhbgcbejklgcmlmh) so you can have it in your launcher without removing stable PaintZ.

_These are the **only** legitimate Chrome Web Store listings for PaintZ._


## Social media

Updates are posted to the @PaintZApp profiles on [Facebook](https://www.facebook.com/PaintZApp), [Instagram](https://www.instagram.com/PaintZApp), and [Twitter](https://twitter.com/PaintZApp).

## Bug reports and feature requests

You can submit bug reports and feature requests in [the Issues tab](https://github.com/ZMYaro/paintz/issues).  Please search before submitting to avoid submitting duplicates.  If you find it was already submitted, please just add a Ì±ç reaction to the existing one.

For feature requests, please also ensure features are in line with the principles above‚Äîcertain features will always be outside the intended scope of PaintZ.

## Code styling

* Commits will follow [standard Git commit guidelines](http://git-scm.com/book/ch5-2.html#Commit-Guidelines).
  - Commits should fit in the sentence, ‚ÄúIf applied, this commit will \_\_\_\_.‚Äù
* Code will be intended with tabs, not spaces.
* Opening curly braces will be on the same line as control structures (`if`, `switch`, `for`, `function`, etc.), separated with a space, and never on the next line.
* Function and variable names will be in camelCase.
* Function and variable names meant to be treated as private will be prefixed with an underscore (e.g., `_privateVar`).
* Constants will be in ALL\_CAPS\_SNAKE\_CASE.
* Object types will be in UpperCamelCase (a.k.a. PascalCase).
* Operators will have spaces on both sides.
* Functions should have JSDoc-style documentation strings.  For example:

```
/**
  * Add two numbers.
  * @param {Number} a - The first number to be added
  * @param {Number} b - The second number to be added
  * @returns {Number} The sum of a and b
  */
function sum(a, b) { ... }
```

## Credits

PaintZ is developed and maintained by [Zachary Yaro](https://zmyaro.com).

Code libraries used:
* [Canvas toBlob Polyfill](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill) - For image export in browsers that do not support `canvas.toBlob`
* [easy.Filter](http://members.chello.at/easyfilter/canvas.html) - For drawing pixel-perfect lines with the pencil tool
* [ES6 Promise](https://github.com/stefanpenner/es6-promise) - For browsers that do not support `Promise`s
* [Flexi Color Picker](http://www.daviddurman.com/flexi-color-picker) - Color picker
* [MaterialZ](https://materialz.dev) - UI
* [Pointer Events Polyfill](https://github.com/jquery/PEP) - For browsers that do not support `PointerEvent`s

Icon libraries used:
* [Material Design](https://material.io/resources/icons)
* [Material Design Icons](https://materialdesignicons.com)
