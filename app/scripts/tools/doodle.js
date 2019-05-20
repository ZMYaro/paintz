'use strict';

/**
 * Create a new DoodleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function DoodleTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extend DrawingTool.
DoodleTool.prototype = Object.create(DrawingTool.prototype);
DoodleTool.prototype.constructor = DoodleTool;

/**
 * @private
 * Draw a round end cap for the doodle.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the doodle is being drawn
 * @param {Number} x - The x-coordinate of the cap
 * @param {Number} y - The y-coordinate of the cap
 */
DoodleTool.prototype._drawCap = function (cxt, x, y) {
	cxt.fillStyle = this._lineColor;
	cxt.beginPath();
	cxt.arc(x, y, this._lineWidth / 2, 0, Math.TAU, false);
	cxt.closePath();
	cxt.fill();
};

/**
 * @override
 * Handle the doodle tool becoming the active tool.
 */
DoodleTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = DoodleTool.getCursorCSS();
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly();
	});
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
DoodleTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	this._points = [
		{
			x: pointerState.x,
			y: pointerState.y
		}
	];
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the doodle when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
DoodleTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
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
DoodleTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	// Force round end caps on the path.
	this._drawCap(this._preCxt, this._points[0].x, this._points[0].y);
	this._drawCap(this._preCxt, this._points[this._points.length - 1].x, this._points[this._points.length - 1].y);
	
	// Draw the shape.
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	this._preCxt.strokeStyle = this._lineColor;
	this._preCxt.beginPath();
	this._preCxt.moveTo(this._points[0].x, this._points[0].y);
	this._points.forEach(function (point) {
		this._preCxt.lineTo(point.x, point.y);
	}, this);
	this._preCxt.stroke();
	this._preCxt.closePath();
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
};

/**
 * Return the CSS value for the doodle tool cursor.
 * @returns {String}
 */
DoodleTool.getCursorCSS = function () {
	var size = parseInt(settings.get('lineWidth')) * zoomManager.level + 2;
	
	// Set the cursor size, capped at 128px.
	cursorCanvas.width = cursorCanvas.height = Math.min(128, size);
	
	// Switch to a crosshair when the cursor gets too big.
	if (size > 128 * Math.sqrt(2)) {
		return 'crosshair';
	}
	
	cursorCxt.lineWidth = 1;
	cursorCxt.strokeStyle = 'white';
	cursorCxt.beginPath();
	cursorCxt.arc(
		cursorCanvas.width / 2, cursorCanvas.height / 2,
		settings.get('lineWidth') * zoomManager.level / 2,
		0, Math.TAU, false
	);
	cursorCxt.closePath();
	cursorCxt.stroke();

	cursorCxt.lineWidth = 1;
	cursorCxt.strokeStyle = 'black';
	cursorCxt.beginPath();
	cursorCxt.arc(
		cursorCanvas.width / 2, cursorCanvas.height / 2,
		settings.get('lineWidth') * zoomManager.level / 2,
		0, Math.TAU, false
	);
	cursorCxt.closePath();
	cursorCxt.stroke();

	var cursorDataURL = cursorCanvas.toDataURL();

	var cursorCSS = 'url(' + cursorDataURL + ')'; // Data URL
	cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
	cursorCSS += ', crosshair'; // Fallback

	return cursorCSS;
};
