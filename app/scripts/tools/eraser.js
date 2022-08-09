'use strict';

/**
 * Create a new EraserTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function EraserTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extend DrawingTool.
EraserTool.prototype = Object.create(DrawingTool.prototype);
EraserTool.prototype.constructor = EraserTool;

/**
 * @override
 * Handle the doodle tool becoming the active tool.
 */
EraserTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = EraserTool.getCursorCSS();
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableFillOnly(true);
	});
};

/**
 * @override
 * Handle a doodle being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
EraserTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._points = [
		{
			x: pointerState.x,
			y: pointerState.y,
			lineWidth: this._lineWidth
		}
	];
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the erased area as it is being drawn.
 * @param {Object} pointerState - The pointer coordinates
 */
EraserTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this._points.push({
		x: pointerState.x,
		y: pointerState.y,
		lineWidth: this._lineWidth
	});
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
EraserTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	this._preCxt.fillStyle = this._fillColor;
	
	for (var i = 0; i < this._points.length; i++) {
		// Draw the current position.
		this._preCxt.fillRect(
			this._points[i].x - this._points[i].lineWidth / 2,
			this._points[i].y - this._points[i].lineWidth / 2,
			this._points[i].lineWidth,
			this._points[i].lineWidth);
		
		if (i === 0) {
			continue;
		}
		
		// Connect to previous position.
		this._preCxt.beginPath();
		// Connect top-left corners.
		this._preCxt.moveTo(this._points[i].x - this._points[i].lineWidth / 2, this._points[i].y - this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x - this._points[i - 1].lineWidth / 2, this._points[i - 1].y - this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		// Connect top-right corners.
		this._preCxt.moveTo(this._points[i].x + this._points[i].lineWidth / 2, this._points[i].y - this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x + this._points[i - 1].lineWidth / 2, this._points[i - 1].y - this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		// Connect bottom-right corners.
		this._preCxt.moveTo(this._points[i].x + this._points[i].lineWidth / 2, this._points[i].y + this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x + this._points[i - 1].lineWidth / 2, this._points[i - 1].y + this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		// Connect bottom-left corners.
		this._preCxt.moveTo(this._points[i].x - this._points[i].lineWidth / 2, this._points[i].y + this._points[i].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x - this._points[i - 1].lineWidth / 2, this._points[i - 1].y + this._points[i - 1].lineWidth / 2);
		this._preCxt.lineTo(this._points[i - 1].x, this._points[i - 1].y);
		this._preCxt.lineTo(this._points[i].x, this._points[i].y);
		this._preCxt.closePath();
		this._preCxt.fill();
	}
	
	// The eraser is always pixel-perfect regardless of the anti-alias setting.
	this._deAntiAlias(Utils.colorToRGB(this._fillColor));
	
	this._canvasDirty = false;
};

/**
 * @static
 * Return the CSS value for the eraser tool cursor.
 * @returns {String}
 */
EraserTool.getCursorCSS = function () {
	var size = parseInt(settings.get('lineWidth')) * zoomManager.level + 2;
	
	// Set the cursor size, capped at 128px.
	cursorCanvas.width = cursorCanvas.height = Math.min(128, size);
	
	// Switch to a crosshair when the cursor gets too big.
	if (size > 128) {
		return 'crosshair';
	}
	
	cursorCxt.lineWidth = 1;
	cursorCxt.strokeStyle = 'black';
	cursorCxt.fillStyle = settings.get('fillColor');
	cursorCxt.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);
	cursorCxt.strokeRect(0, 0, cursorCanvas.width, cursorCanvas.height);
	
	var cursorDataURL = cursorCanvas.toDataURL();
	
	var cursorCSS = 'url(' + cursorDataURL + ')'; // Data URL
	cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
	cursorCSS += ', default'; // Fallback
	
	return cursorCSS;
};
