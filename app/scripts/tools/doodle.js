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

// Define constants.
/** {Number} The maximum allowed width/height for the cursor, in pixels */
DoodleTool.MAX_CURSOR_SIZE = 128;
/** {Number} The maximum brush size at which crosshairs are needed */
DoodleTool.MAX_CROSSHAIR_SIZE = 16
/** {Number} The length of the crosshair lines, in pixels */
DoodleTool.CROSSHAIR_LENGTH = 12;
/** {Number} The offset of the crosshairs from the outside of the brush, in pixels */
DoodleTool.CROSSHAIR_OFFSET = 4;

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
	
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.lineJoin = 'round';
	this._preCxt.strokeStyle = this._lineColor;
	
	// Force round end caps on the path.
	Utils.drawCap(this._preCxt, this._points[0].x, this._points[0].y);
	Utils.drawCap(this._preCxt, this._points[this._points.length - 1].x, this._points[this._points.length - 1].y);
	
	// Draw the shape.
	Utils.createPath(this._preCxt, this._points);
	this._preCxt.stroke();
	
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
	var size = (parseInt(settings.get('lineWidth')) + 1) * zoomManager.level,
		halfCanvasSize = size / 2;
	
	// Switch to a crosshair when the cursor gets too big.
	if (size > DoodleTool.MAX_CURSOR_SIZE * Math.sqrt(2)) {
		return 'crosshair';
	}
	
	// Set the cursor size.
	cursorCanvas.width =
		cursorCanvas.height = size;
	
	cursorCxt.save();
	cursorCxt.lineWidth = 1;
	
	// Draw crosshairs around the circle if it is small enough.
	if (size < DoodleTool.MAX_CROSSHAIR_SIZE) {
		// Increase the canvas size to make room for the crosshairs.
		cursorCanvas.width =
			cursorCanvas.height = cursorCanvas.width + DoodleTool.CROSSHAIR_OFFSET + DoodleTool.CROSSHAIR_LENGTH;
		halfCanvasSize = cursorCanvas.width / 2;
		
		// Draw the crosshairs.
		cursorCxt.translate(halfCanvasSize, halfCanvasSize);
		cursorCxt.beginPath();
		// Right
		cursorCxt.moveTo( size / 2 + DoodleTool.CROSSHAIR_OFFSET,                               0);
		cursorCxt.lineTo( size / 2 + DoodleTool.CROSSHAIR_OFFSET + DoodleTool.CROSSHAIR_LENGTH, 0);
		// Left
		cursorCxt.moveTo(-size / 2 - DoodleTool.CROSSHAIR_OFFSET,                               0);
		cursorCxt.lineTo(-size / 2 - DoodleTool.CROSSHAIR_OFFSET - DoodleTool.CROSSHAIR_LENGTH, 0);
		// Top
		cursorCxt.moveTo(0,  size / 2 + DoodleTool.CROSSHAIR_OFFSET);
		cursorCxt.lineTo(0,  size / 2 + DoodleTool.CROSSHAIR_OFFSET + DoodleTool.CROSSHAIR_LENGTH);
		// Bottom
		cursorCxt.moveTo(0, -size / 2 - DoodleTool.CROSSHAIR_OFFSET);
		cursorCxt.lineTo(0, -size / 2 - DoodleTool.CROSSHAIR_OFFSET - DoodleTool.CROSSHAIR_LENGTH);
		cursorCxt.translate(-halfCanvasSize, -halfCanvasSize);
		
		cursorCxt.setLineDash([]);
		cursorCxt.strokeStyle = 'white';
		cursorCxt.stroke();
		cursorCxt.setLineDash([1, 1]);
		cursorCxt.strokeStyle = 'black';
		cursorCxt.stroke();
		
		cursorCxt.closePath();
	}
	
	cursorCxt.beginPath();
	cursorCxt.arc(
		halfCanvasSize, halfCanvasSize,
		size / 2,
		0, Math.TAU, false
	);
	cursorCxt.closePath();
	
	cursorCxt.setLineDash([]);
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
