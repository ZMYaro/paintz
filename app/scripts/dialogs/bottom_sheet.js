'use strict';

/**
 * @class
 * Create a new BottomSheetDialog instance.
 * @param {String} contentFileName - The name of the HTML partial file with the dialog's contents
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function BottomSheetDialog(contentFileName, trigger) {
	Dialog.call(this, contentFileName, trigger);
	
	this._dialogContainer = document.getElementById('bottomSheetsContainer');
}
// Extend Dialog.
BottomSheetDialog.prototype = Object.create(Dialog.prototype);
BottomSheetDialog.prototype.constructor = BottomSheetDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
BottomSheetDialog.prototype.WIDTH = '512px';
