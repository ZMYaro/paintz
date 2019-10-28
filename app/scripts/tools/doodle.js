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

/** {Number} The maximum allowed width/height for the cursor, in pixels */
DoodleTool.MAX_CURSOR_SIZE = 128;

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
	var size = (parseInt(settings.get('lineWidth')) + 1) * zoomManager.level;
	
	// Set the cursor size, capped at 128px.
	cursorCanvas.width = cursorCanvas.height = Math.min(DoodleTool.MAX_CURSOR_SIZE, size);
	
	// Switch to a crosshair when the cursor gets too big.
	if (size > DoodleTool.MAX_CURSOR_SIZE * Math.sqrt(2)) {
		return 'crosshair';
	}
	
	cursorCxt.save();
	
	cursorCxt.lineWidth = 1;
	cursorCxt.beginPath();
	cursorCxt.arc(
		cursorCanvas.width / 2, cursorCanvas.height / 2,
		size / 2,
		0, Math.TAU, false
	);
	cursorCxt.closePath();
	
	cursorCxt.strokeStyle = 'white';
	cursorCxt.stroke();
	cursorCxt.setLineDash([2, 2]);
	cursorCxt.strokeStyle = 'black';
	cursorCxt.stroke();
	
	cursorCxt.restore();
	
	var cursorDataURL = cursorCanvas.toDataURL();

	var cursorCSS = 'url(' + cursorDataURL + ')'; // Data URL
	cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
	cursorCSS += ', crosshair'; // Fallback

	return cursorCSS;
};
