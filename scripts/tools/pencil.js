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
 * Draw a point to the canvas.
 * @param {Number} x - The x-coordinate of the point
 * @param {Number} y - The y-coordinate of the point
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
PencilTool.prototype._drawPoint = function (x, y, cxt) {
	//var halfLineWidth = Math.floor(0.5 * this._cxt.lineWidth);
	//cxt.fillRect(x - halfLineWidth, y - halfLineWidth, this._cxt.lineWidth, this._cxt.lineWidth);
	cxt.fillRect(x, y, 1, 1);
};
	
/**
 * Draw a straight line.
 * @param {Number} x1 - The x-coordinate of the start point
 * @param {Number} y1 - The y-coordinate of the start point
 * @param {Number} x2 - The x-coordinate of the end point
 * @param {Number} y2 - The y-coordinate of the end point
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
PencilTool.prototype._drawLine = function (x1, y1, x2, y2, cxt) {
	var dx = Math.abs(x2 - x1), /** Line's change in x */
		dy = -Math.abs(y2 - y1), /** Line's change in y */
		sx = x1 < x2 ? 1 : -1, /** Sign of the change in x */
		sy = y1 < y2 ? 1 : -1, /** Sign of the change in y */
		err = dx + dy, /** Error increment */
		e2; /** 2 * error increment */
	
	while (x1 !== x2 || y1 !== y2) {
		e2 = 2 * err;
		
		// x-step
		if (e2 >= dy) {
			err += dy;
			x1 += sx;
		}
		// y-step
		if (e2 <= dx) {
			err += dx;
			y1 += sy;
		}
		
		this._drawPoint(x1, y1, cxt);
	}
};


/**
 * Update the canvas's drawing context with the shape's properties.
 * @override
 */
PencilTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	// Set the fill style to be the line color because drawPoint uses fillRect.
	this._preCxt.fillStyle = this._lineColor;
};

/**
 * Handle the pencil tool becoming the active tool.
 * @override
 */
PencilTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'url(images/cursors/pencil.cur), crosshair';
};

/**
 * Handle a doodle being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
PencilTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._roundPointerState(pointerState);
	
	this._lastX = pointerState.x;
	this._lastY = pointerState.y;
	
	// Draw a dot at the start of the doodle.
	this._prepareCanvas();
	this._drawPoint(pointerState.x, pointerState.y, this._preCxt);
};

/**
 * Update the doodle when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
PencilTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._roundPointerState(pointerState);

	// Connect to the existing preview.
	this._drawLine(this._lastX, this._lastY, pointerState.x, pointerState.y, this._preCxt);
	
	// Store the last x and y.
	this._lastX = pointerState.x;
	this._lastY = pointerState.y;
};
