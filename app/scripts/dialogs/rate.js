'use strict';

/**
 * @class
 * Create a new RateDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function RateDialog(trigger) {
	BottomSheetDialog.call(this, 'rate', trigger);
}
// Extend Dialog.
RateDialog.prototype = Object.create(BottomSheetDialog.prototype);
RateDialog.prototype.constructor = RateDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
RateDialog.prototype.WIDTH = '412px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
RateDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._element.querySelector('#cwsLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};

/**
 * @override
 * Open the dialog if the user is in Chrome.
 */
RateDialog.prototype.open = function () {
	if (!navigator.userAgent.match(/chrome/i) || navigator.userAgent.match(/mobile/i)) {
		return;
	}
	
	BottomSheetDialog.prototype.open.call(this);
};
