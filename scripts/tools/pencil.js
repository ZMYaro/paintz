'use strict';

/**
 * Create a new PencilTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function PencilTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	this._imageData = cxt.createImageData(1, 1);
}

PencilTool.prototype = Object.create(DrawingTool.prototype);


/**
 * Handle the pencil tool becoming the active tool.
 * @override
 */
PencilTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'url(images/cursors/pencil.cur), crosshair';
};

/**
 * Color in a point.
 * Draw a round end cap for the doodle.
 * @param {Number} x - The x-coordinate of the point
 * @param {Number} y - The y-coordinate of the point
 */
PencilTool.prototype._drawPoint = function (x, y) {
	var cxt = localStorage.ghostDraw ? this._preCxt : this._cxt;
	this._imageData.data[0] = this._lineColor.r;
	this._imageData.data[1] = this._lineColor.g;
	this._imageData.data[2] = this._lineColor.b;
	this._imageData.data[3] = 255;
	cxt.putImageData(this._imageData, x, y);
};


/**
 * Handle a doodle being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
PencilTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._lineColor = Utils.colorToRGB(this._lineColor);
	
	this._drawPoint(Math.floor(pointerState.x), Math.floor(pointerState.y));
};

/**
 * Update the doodle when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
PencilTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._drawPoint(pointerState.x, pointerState.y);
};
