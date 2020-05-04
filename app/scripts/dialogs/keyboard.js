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
KeyboardDialog.prototype.WIDTH = '400px';
