'use strict';

/**
 * @class
 * Create a new DrawToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function DrawToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'draw_tool_options', toolbar);
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
	
	this.lineWidthSelect = this._element.querySelector('#lineWidth');
	this.lineWidthSelect.value = settings.get('lineWidth');
	this.lineWidthSelect.addEventListener('change', function (e) {
		settings.set('lineWidth', e.target.value);
	}, false);
	
	this.outlineOptions = this._element.querySelector('#outlineOptions');
	this.outlineOptions.outlineOption.value = settings.get('outlineOption');
	this.outlineOptions.addEventListener('change', function (e) {
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
	this.lineWidthSelect.disabled = !enableLineWidth;
	
	this.outlineOptions.outlineOnly.disabled = true;
	this.outlineOptions.fillOnly.disabled = false;
	this.outlineOptions.outlineFill.disabled = true;
	this.outlineOptions.outlineOption.value = 'fillOnly';
};

/**
 * Disable fill options and set to outline only.
 * @param {Boolean} [enableLineWidth] - Whether to enable the line width selector; defaults to true
 */
DrawToolOptionsToolbox.prototype.enableOutlineOnly = function (enableLineWidth) {
	if (typeof(enableLineWidth) === 'undefined') {
		enableLineWidth = true;
	}
	this.lineWidthSelect.disabled = !enableLineWidth;
	
	this.outlineOptions.outlineOnly.disabled = false;
	this.outlineOptions.fillOnly.disabled = true;
	this.outlineOptions.outlineFill.disabled = true;
	this.outlineOptions.outlineOption.value = 'outlineOnly';
};

/**
 * Enable outline and fill options.
 */
DrawToolOptionsToolbox.prototype.enableOutlineAndFill = function () {
	this.lineWidthSelect.disabled = false;
	
	this.outlineOptions.outlineOnly.disabled = false;
	this.outlineOptions.fillOnly.disabled = false;
	this.outlineOptions.outlineFill.disabled = false;
	this.outlineOptions.outlineOption.value = settings.get('outlineOption');
};
