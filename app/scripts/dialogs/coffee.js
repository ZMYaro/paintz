'use strict';

/**
 * @class
 * Create a new CoffeeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function CoffeeDialog(trigger) {
	BottomSheetDialog.call(this, 'coffee', trigger);
}
// Extend Dialog.
CoffeeDialog.prototype = Object.create(BottomSheetDialog.prototype);
CoffeeDialog.prototype.constructor = CoffeeDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
CoffeeDialog.prototype.WIDTH = '412px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
CoffeeDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._element.querySelector('#coffeeLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};
