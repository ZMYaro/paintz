'use strict';

/**
 * Create a new AirbrushTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function AirbrushTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._lastPoint;
}
// Extend DrawingTool.
AirbrushTool.prototype = Object.create(DrawingTool.prototype);
AirbrushTool.prototype.constructor = AirbrushTool;
	
/**
 * @private
 * Draw a point within a given circle.
 * @param {Number} centerX - The x-coordinate of the center of the region
 * @param {Number} centerY - The y-coordinate of the center of the region
 * @param {Number} radius - The radius of the region
 * @param {CanvasRenderingContext2D} cxt - The context to draw to
 */
AirbrushTool.prototype._drawPointInRegion = function (centerX, centerY, radius, cxt) {
	var angle = Math.random() * Math.TAU,
		pointRad = Math.random() * radius,
		offsetX = pointRad * Math.cos(angle),
		offsetY = pointRad * Math.sin(angle),
		pointX = Math.round(centerX + offsetX),
		pointY = Math.round(centerY + offsetY);
	
	PencilTool.prototype._drawPoint.call(this, pointX, pointY, cxt);
};

/**
 * @override
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
AirbrushTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	// Set the fill style to be the line color because drawPoint uses fillRect.
	this._preCxt.fillStyle = this._lineColor;
};

/**
 * @override
 * Handle the pencil tool becoming the active tool.
 */
AirbrushTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = 'url(images/cursors/airbrush.cur), crosshair';
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly(true);
	});
};

/**
 * @override
 * Handle a spray being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
AirbrushTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	this.move(pointerState);
};

/**
 * @override
 * Update the spray center when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
AirbrushTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._lastPoint = {
		x: pointerState.x,
		y: pointerState.y
	};
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
AirbrushTool.prototype.update = function () {
	if (!this._canvasDirty || !this._lastPoint) {
		return;
	}
	// The airbrush tool does not clear the canvas every frame;
	// it just adds on the new points in the current operation.  This may
	// need to be changed if a future version of PaintZ has something other
	// than the current tool drawing to the pre-canvas every frame.
	this._prepareCanvas();
	
	var pointCount = Math.floor((2/3) * this._lineWidth);
	
	for (var i = 0; i < pointCount; i++) {
		this._drawPointInRegion(this._lastPoint.x, this._lastPoint.y, this._lineWidth, this._preCxt);
	}
};

/**
 * @override
 * Stop spraying when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
AirbrushTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.call(this, pointerState);
	
	this._lastPoint = undefined;
	this._canvasDirty = false;
}
