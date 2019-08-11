'use strict';

/**
 * @class
 * Create a new DrawToolOptionsToolbox instance.
 */
function DrawToolOptionsToolbox() {
	Toolbox.call(this, 'draw_tool_options');
}
// Extend Toolbox.
DrawToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
DrawToolOptionsToolbox.prototype.constructor = DrawToolOptionsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
DrawToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	this._lineWidthSelect = this._element.querySelector('#lineWidth');
	this._lineWidthSelect.value = settings.get('lineWidth');
	this._lineWidthSelect.addEventListener('change', function (e) {
		settings.set('lineWidth', e.target.value);
	}, false);
	
	this._outlineOptions = this._element.querySelector('#outlineOptions');
	this._outlineOptions.outlineOption.value = settings.get('outlineOption');
	this._outlineOptions.addEventListener('change', function (e) {
		settings.set('outlineOption', e.target.value);
	}, false);
};

/**
 * Disable outline options and set to fill only.
 * @param {Boolean} [enableLineWidth] - Whether to enable the line width selector; defaults to false
 */
DrawToolOptionsToolbox.prototype.enableFillOnly = function (enableLineWidth) {
	if (typeof(enableLineWidth) === 'undefined') {
		enableLineWidth = false;
	}
	this._lineWidthSelect.disabled = !enableLineWidth;
	
	this._outlineOptions.outlineOnly.disabled = true;
	this._outlineOptions.fillOnly.disabled = false;
	this._outlineOptions.outlineFill.disabled = true;
	this._outlineOptions.outlineOption.value = 'fillOnly';
};

/**
 * Disable fill options and set to outline only.
 * @param {Boolean} [enableLineWidth] - Whether to enable the line width selector; defaults to true
 */
DrawToolOptionsToolbox.prototype.enableOutlineOnly = function (enableLineWidth) {
	if (typeof(enableLineWidth) === 'undefined') {
		enableLineWidth = true;
	}
	this._lineWidthSelect.disabled = !enableLineWidth;
	
	this._outlineOptions.outlineOnly.disabled = false;
	this._outlineOptions.fillOnly.disabled = true;
	this._outlineOptions.outlineFill.disabled = true;
	this._outlineOptions.outlineOption.value = 'outlineOnly';
};

/**
 * Enable outline and fill options.
 */
DrawToolOptionsToolbox.prototype.enableOutlineAndFill = function () {
	this._lineWidthSelect.disabled = false;
	
	this._outlineOptions.outlineOnly.disabled = false;
	this._outlineOptions.fillOnly.disabled = false;
	this._outlineOptions.outlineFill.disabled = false;
	this._outlineOptions.outlineOption.value = settings.get('outlineOption');
};
