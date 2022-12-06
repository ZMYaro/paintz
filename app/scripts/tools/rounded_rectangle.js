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
RoundedRectangleTool.prototype.MIN_CORNER_RADIUS = 8;
// Like MS Paint, there is no UI to change this.
//  6 ≈ Classic Paint top-left corner (≈ 8 in Photoshop)
//  8 ≈ Classic Paint bottom-right corner (≈ 12 in Photoshop)
// 16 ≈ Win7 Paint all corners (≈ 18 in Photoshop)
// Unlike MS Paint, the maximum line width is much higher, so the
// radius will increase when the line width exceeds this.

/**
 * @override
 * Update the canvas if necessary.
 */
RoundedRectangleTool.prototype.update = function () {
	if (!this._canvasDirty || typeof(this.x) === 'undefined') {
		return;
	}
	ShapeTool.prototype.update.call(this);
	
	// Draw the new preview.
	this._preCxt.beginPath();
	this._preCxt.roundRect(this.x, this.y, this.width, this.height, Math.max(this.MIN_CORNER_RADIUS, this._lineWidth));
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};
