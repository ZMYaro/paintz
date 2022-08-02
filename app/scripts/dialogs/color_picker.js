'use strict';

/**
 * @class
 * Create a new ColorPickerDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ColorPickerDialog(trigger) {
	Dialog.call(this, 'color_picker', trigger);
	
	this.colorPickers;
	
	this._element.id = 'colorPickerDialog';
	this._element.addEventListener('submit', this._saveNewColors.bind(this));
}
// Extend Dialog.
ColorPickerDialog.prototype = Object.create(Dialog.prototype);
ColorPickerDialog.prototype.constructor = ColorPickerDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ColorPickerDialog.prototype.WIDTH = '640px';
/** @constant {String} The maximum width of the dialog, as a CSS value */
ColorPickerDialog.prototype.MAX_WIDTH = 'none';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
ColorPickerDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this.colorPickers = {
		line: new ColorPicker(
			this._element.querySelector('#lineColorSlider'),
			this._element.querySelector('#lineColorPicker'),
			(function (hex, hsv, rgb, pickerCoords) {
				this._updateColorFields('line', hex, hsv, rgb, pickerCoords);
			}).bind(this)
		),
		fill: new ColorPicker(
			this._element.querySelector('#fillColorSlider'),
			this._element.querySelector('#fillColorPicker'),
			(function (hex, hsv, rgb, pickerCoords) {
				this._updateColorFields('fill', hex, hsv, rgb, pickerCoords);
			}).bind(this)
		)
	};
	
	this._element.lineColorHex.oninput =
		this._element.fillColorHex.oninput = this._updateHex.bind(this);
	this._element.lineColorHue.oninput =
		this._element.lineColorSaturation.oninput =
		this._element.lineColorLightness.oninput =
		this._element.fillColorHue.oninput =
		this._element.fillColorSaturation.oninput =
		this._element.fillColorLightness.oninput = this._updateHSL.bind(this);
	this._element.lineColorRed.oninput =
		this._element.lineColorGreen.oninput =
		this._element.lineColorBlue.oninput =
		this._element.fillColorRed.oninput =
		this._element.fillColorGreen.oninput =
		this._element.fillColorBlue.oninput = this._updateRGB.bind(this);
	
	this._element.querySelector('#colorSwapButton').addEventListener('click', this._swapColors.bind(this), false);
};

/**
 * @override
 * Open the dialog.
 */
ColorPickerDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._showCurrentColors();
};

/**
 * @private
 * Update the setting options to show the current saved settings.
 */
ColorPickerDialog.prototype._showCurrentColors = function () {
	this.colorPickers.line.setHex(settings.get('lineColor'));
	this._element.lineColorHex.value = settings.get('lineColor');
	this.colorPickers.fill.setHex(settings.get('fillColor'));
	this._element.fillColorHex.value = settings.get('fillColor');
};

/**
 * @private
 * Swap the line and fill colors.
 */
ColorPickerDialog.prototype._swapColors = function () {
	var oldLine = this._element['lineColorHex'].value,
		oldFill = this._element['fillColorHex'].value;
	this.colorPickers.line.setHex(oldFill);
	this.colorPickers.fill.setHex(oldLine);
};

ColorPickerDialog.prototype._updateHex = function (e) {
	var type = e.target.name.match(/line|fill/)[0];
	var hex = this._element[type + 'ColorHex'].value;
	// Quit if anything but a valid hex code was entered.
	if (!hex.match(/#[0-9A-Fa-f]{6}/)) {
		return;
	}
	this.colorPickers[type].setHex(hex);
};
ColorPickerDialog.prototype._updateHSL = function (e) {
	var type = e.target.name.match(/line|fill/)[0];
	var h = this._element[type + 'ColorHue'].value || 0;
	h = Utils.constrainValue(h, 0, 360);
	var s = (this._element[type + 'ColorSaturation'].value || 0) / 100;
	s = Utils.constrainValue(s, 0, 100);
	var l = (this._element[type + 'ColorLightness'].value || 0) / 100;
	l = Utils.constrainValue(l, 0, 100);
	this.colorPickers[type].setHsv({h: h, s: s, v: l});
};
ColorPickerDialog.prototype._updateRGB = function (e) {
	var type = e.target.name.match(/line|fill/)[0];
	var r = this._element[type + 'ColorRed'].value || 0;
	r = Utils.constrainValue(r, 0, 255);
	var g = this._element[type + 'ColorGreen'].value || 0;
	g = Utils.constrainValue(g, 0, 255);
	var b = this._element[type + 'ColorBlue'].value || 0;
	b = Utils.constrainValue(b, 0, 255);
	this.colorPickers[type].setRgb({r: r, g: g, b: b});
};
ColorPickerDialog.prototype._updateColorFields = function (type, hex, hsv, rgb, pickerCoords) {
	hsv.h = Utils.constrainValue(hsv.h, 0, 360);
	hsv.s = Utils.constrainValue(hsv.s, 0, 100);
	hsv.v = Utils.constrainValue(hsv.v, 0, 100);
	rgb.r = Utils.constrainValue(rgb.r, 0, 255);
	rgb.g = Utils.constrainValue(rgb.g, 0, 255);
	rgb.b = Utils.constrainValue(rgb.b, 0, 255);
	hex = ColorPicker.rgb2hex(rgb);
	if (pickerCoords) {
		var pickerIndicator = this.colorPickers[type].pickerElement.getElementsByClassName('picker-indicator')[0];
		pickerIndicator.style.left = (hsv.s * 100) + '%';
		pickerIndicator.style.top = (100 - hsv.v * 100) + '%';
	}
	var sliderIndicator = this.colorPickers[type].slideElement.getElementsByClassName('slide-indicator')[0];
	sliderIndicator.style.top = (hsv.h / 360 * 100) + '%';

	this._element.querySelector('#' + type + 'ColorSample').style.backgroundColor = hex;
	this._element[type + 'ColorHex'].value = hex;
	this._element[type + 'ColorHue'].value = Math.floor(hsv.h);
	this._element[type + 'ColorSaturation'].value = Math.floor(hsv.s * 100);
	this._element[type + 'ColorLightness'].value = Math.floor(hsv.v * 100);
	this._element[type + 'ColorRed'].value = rgb.r;
	this._element[type + 'ColorGreen'].value = rgb.g;
	this._element[type + 'ColorBlue'].value = rgb.b;
};

ColorPickerDialog.prototype._saveNewColors = function () {
	var colorIndicator = document.getElementById('colors');
	if (this._element.lineColorHex.value !== '') {
		settings.set('lineColor', this._element.lineColorHex.value);
	}
	if (this._element.fillColorHex.value !== '') {
		settings.set('fillColor', this._element.fillColorHex.value);
	}
};
