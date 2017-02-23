'use strict';

/**
 * Create a new RectangleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function RectangleTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
}

RectangleTool.prototype = Object.create(ShapeTool.prototype);


/**
 * Update the rectangle's preview when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
RectangleTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	if (localStorage.antiAlias) {
		this._roundPointerState(pointerState);
	}
	
	var x = Math.min(pointerState.x, this.startX),
		y = Math.min(pointerState.y, this.startY),
		width = Math.abs(pointerState.x - this.startX),
		height = Math.abs(pointerState.y - this.startY);
	
	// Draw the new preview.
	this._preCxt.strokeRect(x, y, width, height);
	
	if (localStorage.antiAlias) {
		this._deAntiAlias();
	}
	
	this._preCxt.globalCompositeOperation = 'destination-over';
	this._preCxt.fillRect(x, y, width, height);
	this._preCxt.globalCompositeOperation = 'source-over';
	
	if (localStorage.outlineOption === 'fillOnly' && localStorage.antiAlias) {
		this._deAntiAlias();
	}
};
