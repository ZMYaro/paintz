'use strict';

/**
 * Create a new RoundedRectangleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function RoundedRectangleTool(cxt, preCxt) {
	RectangleTool.apply(this, arguments);
}
// Extend RectangleTool;
RoundedRectangleTool.prototype = Object.create(RectangleTool.prototype);
RoundedRectangleTool.prototype.constructor = RoundedRectangleTool;

// Define constants.
/** @constant {Number} The corner radius for rounded rectangles, in pixels */
RoundedRectangleTool.prototype.CORNER_RADIUS = 8;
// Like MS Paint, there is no UI to change this.
//  6 ≈ Classic Paint top-left corner (≈ 8 in Photoshop)
//  8 ≈ Classic Paint bottom-right corner (≈ 12 in Photoshop)
// 16 ≈ Win7 Paint all corners (≈ 18 in Photoshop)

/**
 * @override
 * Update the canvas if necessary.
 */
RoundedRectangleTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	this._preCxt.beginPath();
	this._preCxt.roundRect(this.x, this.y, this.width, this.height, this.CORNER_RADIUS);
	this._preCxt.stroke();
	
	// Draw the stroke first.
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	// Change the composite operation to ensure the filled region does not affect the de-anti-aliased outline.
	this._preCxt.globalCompositeOperation = 'destination-over';
	this._preCxt.fill();
	this._preCxt.globalCompositeOperation = 'source-over';
	
	if (settings.get('outlineOption') === 'fillOnly' && !settings.get('antiAlias')) {
		this._deAntiAlias();
	}
	
	this._canvasDirty = false;
};
