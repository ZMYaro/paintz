'use strict';

/**
 * @class
 * Create a new WelcomeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function WelcomeDialog(trigger) {
	Dialog.call(this, 'welcome', trigger);
}
// Extend Dialog.
WelcomeDialog.prototype = Object.create(Dialog.prototype);
WelcomeDialog.prototype.constructor = WelcomeDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
WelcomeDialog.prototype.WIDTH = '512px';
