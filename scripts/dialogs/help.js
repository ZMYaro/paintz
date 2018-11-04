'use strict';

/**
 * @class
 * Create a new HelpDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function HelpDialog(trigger) {
	Dialog.call(this, 'help', trigger);
	this._element.id = 'helpDialog';
}
// Extend Dialog.
HelpDialog.prototype = Object.create(Dialog.prototype);
HelpDialog.prototype.constructor = HelpDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
HelpDialog.prototype.WIDTH = '640px';
