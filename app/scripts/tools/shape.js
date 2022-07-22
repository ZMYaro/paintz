'use strict';

/**
 * Create a new abstract ShapeTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function ShapeTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extend DrawingTool.
ShapeTool.prototype = Object.create(DrawingTool.prototype);
ShapeTool.prototype.constructor = ShapeTool;


/**
 * @override
 * Handle the tool becoming the active tool.
 */
ShapeTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineAndFill();
	});
};

/**
 * @override
 * Handle the shape being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
ShapeTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (settings.get('outlineOption') === 'fillOnly') {
		this._lineColor = 'transparent';
	}
	if (settings.get('outlineOption') === 'outlineOnly') {
		this._fillColor = 'transparent';
	}
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
};

/**
 * @private
 * Stroke and fill the current path, de-anti-alised depending on the current setting.
 */
ShapeTool.prototype._drawCurrentPath = function () {
	// Draw the stroke first.
	this._preCxt.stroke();
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	// Change the composite operation to ensure the filled region does not affect the de-anti-aliased outline.
	this._preCxt.globalCompositeOperation = 'destination-over';
	this._preCxt.fill();
	this._preCxt.globalCompositeOperation = 'source-over';
	
	if (settings.get('outlineOption') === 'fillOnly' && !settings.get('antiAlias')) {
		// If there was no stroke, de-anti-alias the fill.
		this._deAntiAlias();
	}
};
