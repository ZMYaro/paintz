'use strict';

/**
 * Create a new DoodleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function DoodleTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}

DoodleTool.prototype = Object.create(DrawingTool.prototype);


/**
 * Draw a round end cap for the doodle.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the doodle is being drawn
 * @param {Number} x - The x-coordinate of the cap
 * @param {Number} y - The y-coordinate of the cap
 */
DoodleTool.prototype._drawCap = function (cxt, x, y) {
	cxt.fillStyle = this._lineColor;
	cxt.beginPath();
	cxt.arc(x, y, this._lineWidth / 2, 0, 2 * Math.PI, false);
	cxt.closePath();
	cxt.fill();
};

/**
 * Handle the doodle tool becoming the active tool.
 * @override
 */
DoodleTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	this._preCxt.canvas.style.cursor = DoodleTool.getCursorCSS();
};

/**
 * Handle a doodle being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
DoodleTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this._lastX = pointerState.x;
	this._lastY = pointerState.y;
	
	// Draw a round end cap at the start of the doodle.
	var cxt = localStorage.ghostDraw ? this._preCxt : this._cxt;
	this._drawCap(cxt, pointerState.x, pointerState.y);
};

/**
 * Update the doodle when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
DoodleTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);

	var cxt = localStorage.ghostDraw ? this._preCxt : this._cxt;

	// Connect to the existing preview.
	cxt.lineWidth = this._lineWidth;
	cxt.strokeStyle = this._lineColor;
	cxt.beginPath();
	cxt.moveTo(this._lastX, this._lastY);
	cxt.lineTo(pointerState.x, pointerState.y);
	cxt.closePath();
	cxt.stroke();
	
	// Force round end caps on the path.
	this._drawCap(cxt, pointerState.x, pointerState.y);
	
	// Store the last x and y.
	this._lastX = pointerState.x;
	this._lastY = pointerState.y;
};

/**
 * Return the CSS value for the doodle tool cursor.
 * @returns {String}
 */
DoodleTool.getCursorCSS = function () {
	var size = parseInt(localStorage.lineWidth) * zoomManager.level + 2;
	
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
		localStorage.lineWidth * zoomManager.level / 2,
		0, Math.PI * 2, false
	);
	cursorCxt.closePath();
	cursorCxt.stroke();

	cursorCxt.lineWidth = 1;
	cursorCxt.strokeStyle = 'black';
	cursorCxt.beginPath();
	cursorCxt.arc(
		cursorCanvas.width / 2, cursorCanvas.height / 2,
		localStorage.lineWidth * zoomManager.level / 2,
		0, Math.PI * 2, false
	);
	cursorCxt.closePath();
	cursorCxt.stroke();

	var cursorDataURL = cursorCanvas.toDataURL();

	var cursorCSS = 'url(' + cursorDataURL + ')'; // Data URL
	cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
	cursorCSS += ', crosshair'; // Fallback

	return cursorCSS;
};