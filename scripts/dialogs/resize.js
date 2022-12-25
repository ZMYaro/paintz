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
/** @constant {Array<String>} The units that need to care about DPI */
ResizeDialog.prototype.PHYSICAL_UNITS = ['centimeters', 'inches'];
/** @constant {Number} The default number of pixels per inch */
ResizeDialog.prototype.DEFAULT_PIXELS_PER_INCH = 300;
/** @constant {Number} The number of centimeters in an inch */
ResizeDialog.prototype.CENTIMETERS_PER_INCH = 2.54;
/** @constant {Number} The maximum number of decimal places for each unit */
ResizeDialog.prototype.MAX_DECIMAL_PLACES = {
	percentage: 0,
	pixels: 0,
	inches: 2,
	centimeters: 2
};
/** @constant {Number} The minimum canvas width/height for each unit */
ResizeDialog.prototype.MIN_SIZE = {
	percentage: 1,
	pixels: 1,
	inches: 0.01,
	centimeters: 0.01
};
/** @constant {Number} The maximum canvas width/height for each unit */
ResizeDialog.prototype.MAX_SIZE = {
	percentage: 500,
	pixels: 99999,
	inches: 99999 / ResizeDialog.prototype.DEFAULT_PIXELS_PER_INCH,
	centimeters: Utils.roundToPlaces(99999 / ResizeDialog.prototype.DEFAULT_PIXELS_PER_INCH * ResizeDialog.prototype.CENTIMETERS_PER_INCH, 2)
};

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
ResizeDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.width.addEventListener('input', this._handleDimensionChange.bind(this), false);
	this._element.height.addEventListener('input', this._handleDimensionChange.bind(this), false);
	this._element.units.addEventListener('change', this._handleUnitChange.bind(this), false);
	this._element.maintainAspectRatio.addEventListener(
		'change', this._handleMaintainAspectRatioChange.bind(this), false);
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
	// Get the current pixel dimensions.
	var width = settings.get('width'),
		height = settings.get('height'),
		units = this._element.units.value;
	
	// Convert to selected units if not using pixels.
	switch (units) {
		case 'percentage':
			width = 100;
			height = 100;
			break;
		case 'centimeters':
			width *= this.CENTIMETERS_PER_INCH;
			height *= this.CENTIMETERS_PER_INCH;
		case 'inches':
			width /= this.DEFAULT_PIXELS_PER_INCH;
			height /= this.DEFAULT_PIXELS_PER_INCH;
			width = Utils.roundToPlaces(width, this.MAX_DECIMAL_PLACES[units]);
			height = Utils.roundToPlaces(height, this.MAX_DECIMAL_PLACES[units]);
			break;
	}
	
	// Update the text fields.
	this._element.width.value = width;
	this._element.height.value = height;
};

/**
 * @private
 * Update the input fields when the units are changed.
 */
ResizeDialog.prototype._handleUnitChange = function () {
	var units = this._element.units.value;
	
	this._element.width.min =
		this._element.height.min = this.MIN_SIZE[units];
	this._element.width.max =
		this._element.height.max = this.MAX_SIZE[units];
	this._element.width.step =
		this._element.height.step =
			(1 / Math.pow(10, this.MAX_DECIMAL_PLACES[units]));
	
	this._showCurrentSize();
	
	// Show DPI warning for physical units.
	var isPhysicalUnit = (this.PHYSICAL_UNITS.indexOf(units) !== -1);
	this._element.querySelector('#dpi-warning').style.display =
		isPhysicalUnit ? 'block' : 'none';
};

/**
 * @private
 * Handle the width field being changed.
 * @param {Event} e
 */
ResizeDialog.prototype._handleDimensionChange = function (e) {
	var units = this._element.units.value,
		changedDimension = (e.target === this._element.width ? 'width' : 'height'),
		changedValue = Utils.roundToPlaces(parseFloat(e.target.value), this.MAX_DECIMAL_PLACES[units]);
	
	if (isNaN(changedValue)) {
		return;
	}
	changedValue = Math.max(this.MIN_SIZE[units], changedValue);
	if (e.target.value != changedValue) {
		// ^ Note loose equality
		e.target.value = changedValue;
	}
	
	if (!this._element.maintainAspectRatio.checked) {
		// If not maintaining aspect ratio, no need to mess with the other input.
		return;
	}
	
	var otherDimension = (changedDimension === 'width' ? 'height' : 'width'),
		otherInput = this._element[otherDimension],
		otherValue;
	
	if (units === 'percentage') {
		otherValue = changedValue;
	} else {
		otherValue = changedValue / settings.get(changedDimension) * settings.get(otherDimension);
		otherValue = Math.max(this.MIN_SIZE[units], otherValue);
		otherValue = Utils.roundToPlaces(otherValue, this.MAX_DECIMAL_PLACES[units]);
	}
	
	if (otherValue > this.MAX_SIZE[units]) {
		// If the other dimension was made larger than the maximum size, set it
		// to the maximum size and scale the initially changed value back down.
		otherInput.value = this.MAX_SIZE[units];
		this._handleDimensionChange({ target: otherInput });
	} else {
		// Otherwise, just update the other input.
		otherInput.value = otherValue;
	}
};

/**
 * @private
 * Handle the option to maintain aspect ratio being toggled.
 */
ResizeDialog.prototype._handleMaintainAspectRatioChange = function () {
	if (!this._element.maintainAspectRatio.checked) {
		return;
	}
	
	var units = this._element.units.value,
		inputWidth = Utils.roundToPlaces(parseFloat(this._element.width.value), this.MAX_DECIMAL_PLACES[units]),
		inputHeight = Utils.roundToPlaces(parseFloat(this._element.height.value), this.MAX_DECIMAL_PLACES[units]),
		currentWidth = (units === 'percentage' ? 100 : settings.get('width')),
		currentHeight = (units === 'percentage' ? 100 : settings.get('height'));
	
	switch (units) {
		case 'centimeters':
			currentWidth *= this.CENTIMETERS_PER_INCH;
			currentHeight *= this.CENTIMETERS_PER_INCH;
		case 'inches':
			currentWidth /= this.DEFAULT_PIXELS_PER_INCH;
			currentHeight /= this.DEFAULT_PIXELS_PER_INCH;
			currentWidth = Utils.roundToPlaces(currentWidth, this.MAX_DECIMAL_PLACES[units]);
			currentHeight = Utils.roundToPlaces(currentHeight, this.MAX_DECIMAL_PLACES[units]);
			break;
	}
	
	if (inputWidth !== currentWidth) {
		this._handleDimensionChange({ target: this._element.width });
	} else if (inputHeight !== currentHeight) {
		this._handleDimensionChange({ target: this._element.height });
	}
};

/**
 * @private
 * Update the canvases and save the selected size.
 */
ResizeDialog.prototype._saveNewSize = function () {
	// Fetch the values from the form.
	var newWidth = parseFloat(this._element.width.value),
		newHeight = parseFloat(this._element.height.value),
		units = this._element.units.value,
		mode = this._element.resizeMode.value;
	
	switch (units) {
		case 'percentage':
			newWidth = settings.get('width') * 0.01 * Utils.constrainValue(newWidth, this.MIN_SIZE.percentage, this.MAX_SIZE.percentage);
			newHeight = settings.get('height') * 0.01 * Utils.constrainValue(newHeight, this.MIN_SIZE.percentage, this.MAX_SIZE.percentage);
			break;
		case 'centimeters':
			newWidth /= this.CENTIMETERS_PER_INCH;
			newHeight /= this.CENTIMETERS_PER_INCH;
		case 'inches':
			newWidth *= this.DEFAULT_PIXELS_PER_INCH;
			newHeight *= this.DEFAULT_PIXELS_PER_INCH;
		case 'pixels':
			newWidth = Utils.constrainValue(newWidth, this.MIN_SIZE.pixels, this.MAX_SIZE.pixels);
			newHeight = Utils.constrainValue(newHeight, this.MIN_SIZE.pixels, this.MAX_SIZE.pixels);
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
