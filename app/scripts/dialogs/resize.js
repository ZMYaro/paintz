'use strict';

/**
 * @class
 * Create a new ResizeDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ResizeDialog(trigger) {
	Dialog.call(this, 'resize', trigger);
	this._element.addEventListener('submit', this._saveNewSize.bind(this));
}
// Extend Dialog.
ResizeDialog.prototype = Object.create(Dialog.prototype);

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ResizeDialog.prototype.WIDTH = '320px';
/** @constant {Number} The minimum canvas width/height */
ResizeDialog.prototype.MIN_SIZE = 1,
/** @constant {Number} The maximum canvas width/height */
ResizeDialog.prototype.MAX_SIZE = 99999;

/**
 * @override
 * Open the dialog.
 */
ResizeDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._showCurrentSize();
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
 * Update the canvases and save the selected size.
 */
ResizeDialog.prototype._saveNewSize = function () {
	// Fetch the values from the form.
	var newWidth = Utils.constrainValue(parseInt(this._element.width.value), this.MIN_SIZE, this.MAX_SIZE),
		newHeight = Utils.constrainValue(parseInt(this._element.height.value), this.MIN_SIZE, this.MAX_SIZE),
		mode = this._element.resizeMode.value;

	// Validate the user's input.
	if (!newWidth || !newHeight || isNaN(newWidth) || isNaN(newHeight) || newWidth < 1 || newHeight < 1) {
		alert('Please enter valid dimensions.');
		return;
	}
	
	// Back up the canvas contents to the pre-canvas since resizing clears the canvas.
	preCxt.drawImage(canvas, 0, 0);
	// Resize the canvas.
	canvas.width = newWidth;
	canvas.height = newHeight;
	// Fill any blank space with the fill color.
	resetCanvas();
	// Stretch or place the old canvas contents to the resized canvas.
	if (mode === 'scale') {
		cxt.drawImage(preCanvas, 0, 0, newWidth, newHeight);
	} else {
		cxt.drawImage(preCanvas, 0, 0);
	}
	// Update the pre-canvas's size.
	preCanvas.width = newWidth;
	preCanvas.height = newHeight;
	
	// Save the new dimensions.
	settings.set('width', newWidth);
	settings.set('height', newHeight);
	
	// Update the resolution display.
	document.getElementById('resolution').innerHTML = newWidth + ' &times; ' + newHeight + 'px';

	// Add the change to the undo stack.
	undoStack.addState();
};
