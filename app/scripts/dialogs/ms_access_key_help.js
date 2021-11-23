'use strict';

/**
 * @class
 * Create a new MSAccessKeyHelpDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function MSAccessKeyHelpDialog(trigger) {
	Dialog.call(this, 'ms_access_key_help', trigger);
}
// Extend Dialog.
MSAccessKeyHelpDialog.prototype = Object.create(Dialog.prototype);
MSAccessKeyHelpDialog.prototype.constructor = MSAccessKeyHelpDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
MSAccessKeyHelpDialog.prototype.WIDTH = '544px';
