'use strict';

/**
 * Create a new PencilTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function PencilTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._points;
	/** {Number} The index of the point drawn to the canvas */
	this._lastPointIndex;
}
// Extend DrawingTool.
PencilTool.prototype = Object.create(DrawingTool.prototype);
PencilTool.prototype.constructor = PencilTool;

/**
 * @private
 * Draw a point to the canvas.
 * @param {Number} x - The x-coordinate of the point
 * @param {Number} y - The y-coordinate of the point
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
PencilTool.prototype._drawPoint = function (x, y, cxt) {
	cxt.fillRect(x, y, 1, 1);
};
	
/**
 * @private
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
 * @override
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
PencilTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	// Set the fill style to be the line color because drawPoint uses fillRect.
	this._preCxt.fillStyle = this._lineColor;
};

/**
 * @override
 * Handle the pencil tool becoming the active tool.
 */
PencilTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = 'url(images/cursors/pencil.cur), crosshair';
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly(false);
	});
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
PencilTool.prototype.start = function (pointerState) {
	this._floorPointerState(pointerState);
	
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._points = [
		{
			x: pointerState.x,
			y: pointerState.y
		}
	];
	
	this._lastPointIndex = 0;
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the doodle when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
PencilTool.prototype.move = function (pointerState) {
	this._floorPointerState(pointerState);
	
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._points.push({
		x: pointerState.x,
		y: pointerState.y
	});
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
PencilTool.prototype.update = function () {
	if (!this._canvasDirty|| !this._points) {
		return;
	}
	// For performance, the pencil tool does not clear the canvas every frame;
	// it just adds on the new segments in the current operation.  This may
	// need to be changed if a future version of PaintZ has something other
	// than the current tool drawing to the pre-canvas every frame.
	this._prepareCanvas();
	
	// Draw a dot at the start of the doodle.
	this._drawPoint(this._points[0].x, this._points[0].y, this._preCxt);
	
	// Draw the whole shape.
	for (var i = this._lastPointIndex || 1; i < this._points.length; i++) {
		this._drawLine(
			this._points[i - 1].x,
			this._points[i - 1].y,
			this._points[i].x,
			this._points[i].y,
			this._preCxt);
	}
	
	this._lastPointIndex = this._points.length - 1;
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the list of points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
PencilTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.apply(this, arguments);
	delete this._points;
};
