'use strict';

/**
 * Create a new EraserTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function EraserTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}

EraserTool.prototype = Object.create(DrawingTool.prototype);


/**
 * Handle the doodle tool becoming the active tool.
 * @override
 */
EraserTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = EraserTool.getCursorCSS();
};

/**
 * Handle a doodle being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
EraserTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._lastX = pointerState.x;
	this._lastY = pointerState.y;
	
	var cxt = settings.get('ghostDraw') ? this._preCxt : this._cxt;
	cxt.fillStyle = this._fillColor;
	cxt.fillRect(
		pointerState.x - this._lineWidth / 2,
		pointerState.y - this._lineWidth / 2,
		this._lineWidth,
		this._lineWidth);
};

/**
 * Update the erased area as it is being drawn.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
EraserTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);

	var cxt = settings.get('ghostDraw') ? this._preCxt : this._cxt;

	// Connect to the existing preview.
	cxt.fillStyle = this._fillColor;
	cxt.beginPath();
	// Connect top-left corners.
	cxt.moveTo(pointerState.x - this._lineWidth / 2, pointerState.y - this._lineWidth / 2);
	cxt.lineTo(this._lastX - this._lineWidth / 2, this._lastY - this._lineWidth / 2);
	cxt.lineTo(this._lastX, this._lastY);
	cxt.lineTo(pointerState.x, pointerState.y);
	// Connect top-right corners.
	cxt.moveTo(pointerState.x + this._lineWidth / 2, pointerState.y - this._lineWidth / 2);
	cxt.lineTo(this._lastX + this._lineWidth / 2, this._lastY - this._lineWidth / 2);
	cxt.lineTo(this._lastX, this._lastY);
	cxt.lineTo(pointerState.x, pointerState.y);
	// Connect bottom-right corners.
	cxt.moveTo(pointerState.x + this._lineWidth / 2, pointerState.y + this._lineWidth / 2);
	cxt.lineTo(this._lastX + this._lineWidth / 2, this._lastY + this._lineWidth / 2);
	cxt.lineTo(this._lastX, this._lastY);
	cxt.lineTo(pointerState.x, pointerState.y);
	// Connect bottom-left corners.
	cxt.moveTo(pointerState.x - this._lineWidth / 2, pointerState.y + this._lineWidth / 2);
	cxt.lineTo(this._lastX - this._lineWidth / 2, this._lastY + this._lineWidth / 2);
	cxt.lineTo(this._lastX, this._lastY);
	cxt.lineTo(pointerState.x, pointerState.y);
	cxt.closePath();
	cxt.fill();

	// Draw the current position.
	cxt.fillStyle = this._fillColor;
	cxt.fillRect(
		pointerState.x - this._lineWidth / 2,
		pointerState.y - this._lineWidth / 2,
		this._lineWidth,
		this._lineWidth);

	// Store the last x and y.
	this._lastX = pointerState.x;
	this._lastY = pointerState.y;
};

/**
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