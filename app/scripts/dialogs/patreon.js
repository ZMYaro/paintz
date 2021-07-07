'use strict';

/**
 * @class
 * Create a new PatreonDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function PatreonDialog(trigger) {
	BottomSheetDialog.call(this, 'patreon', trigger);
}
// Extend Dialog.
PatreonDialog.prototype = Object.create(BottomSheetDialog.prototype);
PatreonDialog.prototype.constructor = PatreonDialog;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
PatreonDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._element.querySelector('#patreonLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};
