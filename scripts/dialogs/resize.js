'use strict';

/**
 * @class
 * Create a new ResizeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ResizeDialog(trigger) {
	Dialog.call(this, 'resize', trigger);
}
// Extend Dialog.
ResizeDialog.prototype = Object.create(Dialog.prototype);
ResizeDialog.prototype.constructor = ResizeDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ResizeDialog.prototype.WIDTH = '320px';
/** @constant {Number} The minimum canvas width/height */
ResizeDialog.prototype.MIN_SIZE = 1,
/** @constant {Number} The maximum canvas width/height */
ResizeDialog.prototype.MAX_SIZE = 99999;
/** @constant {Number} The minimum resize percentage */
ResizeDialog.prototype.MIN_PERCENTAGE = 1;
/** @constant {Number} The maximum resize percentage */
ResizeDialog.prototype.MAX_PERCENTAGE = 500;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
ResizeDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.units.addEventListener('change', this._handleUnitChange.bind(this), false);
	this._element.addEventListener('submit', this._saveNewSize.bind(this), false);
};

/**
 * @override
 * Open the dialog.
 */
ResizeDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._handleUnitChange();
};

/**
 * @private
 * Update the setting options to show the current saved size.
 */
ResizeDialog.prototype._showCurrentSize = function () {
	this._element.width.value = settings.get('width');
	this._element.height.value = settings.get('height');
};

/**
 * @private
 * Update the input fields when the units are changed.
 */
ResizeDialog.prototype._handleUnitChange = function () {
	switch (this._element.units.value) {
		case 'percentage':
			this._element.width.min =
				this._element.height.min = this.MIN_PERCENTAGE;
			this._element.width.max =
				this._element.height.max = this.MAX_PERCENTAGE;
			this._element.width.value = 100;
			this._element.height.value = 100;
			break;
		case 'pixels':
			this._element.width.min =
				this._element.height.min = this.MIN_SIZE;
			this._element.width.max =
				this._element.height.max = this.MAX_SIZE;
			this._showCurrentSize();
			break;
	}
};

/**
 * @private
 * Update the canvases and save the selected size.
 */
ResizeDialog.prototype._saveNewSize = function () {
	// Fetch the values from the form.
	var newWidth = parseInt(this._element.width.value),
		newHeight = parseInt(this._element.height.value),
		units = this._element.units.value,
		mode = this._element.resizeMode.value;
	
	switch (units) {
		case 'percentage':
			newWidth = settings.get('width') * 0.01 * Utils.constrainValue(newWidth, this.MIN_PERCENTAGE, this.MAX_PERCENTAGE);
			newHeight = settings.get('height') * 0.01 * Utils.constrainValue(newHeight, this.MIN_PERCENTAGE, this.MAX_PERCENTAGE);
			break;
		case 'pixels':
			newWidth = Utils.constrainValue(newWidth, this.MIN_SIZE, this.MAX_SIZE);
			newHeight = Utils.constrainValue(newHeight, this.MIN_SIZE, this.MAX_SIZE);
			break;
	}
	
	newWidth = Math.max(1, Math.round(newWidth));
	newHeight = Math.max(1, Math.round(newHeight));
	
	// Validate the user's input.
	if (!newWidth || !newHeight || isNaN(newWidth) || isNaN(newHeight)) {
		alert('Please enter valid dimensions.');
		return;
	}
	
	// Resize the canvas.
	resizeCanvas(newWidth, newHeight, mode);

	// Add the change to the undo stack.
	undoStack.addState();
};
