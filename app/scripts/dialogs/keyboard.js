'use strict';

/**
 * @class
 * Create a new KeyboardDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function KeyboardDialog(trigger) {
	Dialog.call(this, 'keyboard', trigger);
	this._element.id = 'keyboardDialog';
}
// Extend Dialog.
KeyboardDialog.prototype = Object.create(Dialog.prototype);
KeyboardDialog.prototype.constructor = KeyboardDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
KeyboardDialog.prototype.WIDTH = '460px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
KeyboardDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Hide shortcuts that only work when running as a standalone app
	// if running in a browser window or old enough browser that the
	// check is not supported.
	// (TODO: In v4.0, when support for browsers that do not support
	// the display-mode media query is phased out, move this all to CSS.)
	if (!window.matchMedia || window.matchMedia('(display-mode: browser)').matches) {
		Array.from(this._element.querySelectorAll('.standaloneOnly')).forEach(function (elem) {
			elem.style.display = 'none';
		})
	}
};
