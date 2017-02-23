'use strict';

/**
 * Create a new LineTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function LineTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}

LineTool.prototype = Object.create(DrawingTool.prototype);


/**
 * Handle a line being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
LineTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (localStorage.antiAlias) {
		this._roundPointerState(pointerState);
	}
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
};

/**
 * Update the line when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
LineTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	if (localStorage.antiAlias) {
		this._roundPointerState(pointerState);
	}
	
	// Erase the previous preview.
	Utils.clearCanvas(this._preCxt);
	
	// Draw the new preview.
	this._preCxt.lineWidth = this.lineWidth;
	this._preCxt.strokeStyle = this.lineColor;
	this._preCxt.beginPath();
	this._preCxt.moveTo(this.startX, this.startY);
	this._preCxt.lineTo(pointerState.x, pointerState.y);
	this._preCxt.closePath();
	this._preCxt.stroke();
	
	if (localStorage.antiAlias) {
		this._deAntiAlias();
	}
};
