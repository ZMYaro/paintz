'use strict';

/**
 * @class
 * Create a new AutoRestoreDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function AutoRestoreDialog(trigger) {
	BottomSheetDialog.call(this, 'auto_restore', trigger);
	this._element.id = 'autoRestoreDialog';
	this._autoHideTimeout;
}
// Extend BottomSheetDialog.
AutoRestoreDialog.prototype = Object.create(BottomSheetDialog.prototype);
AutoRestoreDialog.prototype.constructor = AutoRestoreDialog;

// Define constants.
/** @constant {Number} The time after which to automatically close the message, in milliseconds */
AutoRestoreDialog.prototype.AUTO_HIDE_DELAY = 5000;

/**
 * @override
 * Open the dialog and prepare it to auto-close.
 */
AutoRestoreDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._autoHideTimeout = setTimeout(this.close.bind(this), this.AUTO_HIDE_DELAY);
};

/**
 * @override
 * Close the dialog and clear the auto-close timeout.
 * @param {Event} [ev] - The event that triggered the close, if any.
 * @returns {Promise} Resolves when the dialog has closed
 */
AutoRestoreDialog.prototype.close = function (ev) {
	clearTimeout(this._autoHideTimeout);
	return Dialog.prototype.close.call(this, ev);
};
