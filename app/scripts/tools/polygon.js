'use strict';

/**
 * Create a new PolygonTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function PolygonTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
}
// Extend ShapeTool.
PolygonTool.prototype = Object.create(ShapeTool.prototype);
PolygonTool.prototype.constructor = PolygonTool;

// Define constants.
/** {Number} How far a point can be from the first point to be treated as intended to close the polygon, in pixels */
PolygonTool.prototype.CLOSE_PATH_THERSHOLD = 5; // Approximated from classic MS Paint at 1px line width.

/**
 * @private
 * Close and draw the final polygon.
 */
PolygonTool.prototype._finalizePolygon = function () {
	if (!this._points || this._points.length < 3) {
		delete this._points;
		return;
	}
	
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	this._preCxt.strokeStyle = this._lineColor;
	
	// Draw the entire polygon and close it.
	this._preCxt.beginPath();
	this._preCxt.moveTo(this._points[0].x, this._points[0].y);
	this._points.forEach(function (point) {
		this._preCxt.lineTo(point.x, point.y);
	}, this);
	this._preCxt.closePath();
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
	
	// Draw it to the canvas and reset the tool.
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
	delete this._points;
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
PolygonTool.prototype.start = function (pointerState) {
	ShapeTool.prototype.start.apply(this, arguments);
	
	if (!this._points) {
		// If starting a new polygon, set the starting point and the current moving point to the pointer position.
		this._points = [
			{
				x: pointerState.x,
				y: pointerState.y
			}, {
				x: pointerState.x,
				y: pointerState.y
			}
		];
	} else {
		this._points.push({
			x: pointerState.x,
			y: pointerState.y
		});
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the polygon when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
PolygonTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	// Update the last point in the polygon to the pointer position.
	this._points[this._points.length - 1] = {
		x: pointerState.x,
		y: pointerState.y
	};
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
PolygonTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	this._preCxt.strokeStyle = this._lineColor;
	if (settings.get('outlineOption') === 'fillOnly') {
		// TODO: Draw in 2px inverted instead.
	}
	
	// Force round end caps on the path.
	Utils.drawCap(this._preCxt, this._points[0].x, this._points[0].y);
	Utils.drawCap(this._preCxt, this._points[this._points.length - 1].x, this._points[this._points.length - 1].y);
	
	// Draw the polygon up to the last point.
	Utils.createPath(this._preCxt, this._points);
	this._preCxt.stroke();
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
PolygonTool.prototype.end = function (pointerState) {
	var distanceFromStart = Utils.distance(this._points[0].x, this._points[0].y, pointerState.x, pointerState.y);
	if (distanceFromStart < this.CLOSE_PATH_THERSHOLD) {
		this._finalizePolygon();
	}
};

/**
 * @override
 * If the polygon tool gets deactivated, close the current polygon and clean up.
 */
PolygonTool.prototype.deactivate = function () {
	this._finalizePolygon();
};
