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
/** @constant {Number} How long to wait when closing on a delay, in milliseconds */
BottomSheetDialog.prototype.CLOSE_DELAY = 1000;
/** @constant {Number} The amount to rewind the save count if the user decides to delay the prompt */
BottomSheetDialog.prototype.SAVE_COUNT_REWIND_AMOUNT = 10;
/** @override @constant {String} The width of the dialog, as a CSS value */
BottomSheetDialog.prototype.WIDTH = '512px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
BottomSheetDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Set up later buttons.
	Array.prototype.slice.call(this._element.querySelectorAll('.postponeButton')).forEach(function (postponeButton) {
		postponeButton.onclick = this._postpone.bind(this);
	}, this);
};

/**
 * Handle the “Later” button being clicked.
 */
BottomSheetDialog.prototype._postpone = function () {
	var	saveCount = settings.get('saveCount');
	
	settings.set('saveCount', saveCount - this.SAVE_COUNT_REWIND_AMOUNT);
	
	this.close();
};

/**
 * Close the dialog after the link is clicked.
 */
BottomSheetDialog.prototype._closeAfterDelay = function () {
	setTimeout(this.close.bind(this), this.CLOSE_DELAY);
};
