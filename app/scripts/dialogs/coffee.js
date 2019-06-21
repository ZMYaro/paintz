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
	
	this._element.querySelector('#coffeeLaterButton').addEventListener('click', this._handleCoffeeLater.bind(this), false);
	this._element.querySelector('#coffeeLink').addEventListener('click', this._handleCoffeeLink.bind(this), false);
};

/**
 * Handle the “Later” button being clicked.
 */
CoffeeDialog.prototype._handleCoffeeLater = function () {
	var SAVE_COUNT_REWIND_AMOUNT = 10,
		saveCount = settings.get('saveCount');
	
	settings.set('saveCount', saveCount - SAVE_COUNT_REWIND_AMOUNT);
	
	this.close();
};

/**
 * Close the dialog after the coffee link is clicked.
 */
CoffeeDialog.prototype._handleCoffeeLink = function () {
	var CLOSE_DELAY = 1000; // Milliseconds
	setTimeout(this.close.bind(this), CLOSE_DELAY);
};