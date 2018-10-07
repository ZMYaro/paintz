'use strict';

/**
 * Create a new CurveTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function CurveTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._state = CurveTool.STATE_NOT_STARTED;
}
// Extend CurveTool.
CurveTool.prototype = Object.create(DrawingTool.prototype);
CurveTool.prototype.constructor = CurveTool;

// Constants
CurveTool.STATE_NOT_STARTED = 0;
CurveTool.STATE_END_POINT_SET = 1;
CurveTool.STATE_CONTROL_POINT1_SET = 2;

/**
 * @override
 * Handle the curve tool becoming the active tool.
 */
CurveTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this, arguments);
	
	this._state = CurveTool.STATE_NOT_STARTED;
};

/**
 * @override
 * Handle a curve being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
CurveTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	if (this._state === CurveTool.STATE_NOT_STARTED) {
		this.startX = pointerState.x;
		this.startY = pointerState.y;
	}
};

/**
 * @override
 * Update the curve when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	// Erase the previous preview.
	Utils.clearCanvas(this._preCxt);
	
	// Draw the new preview.
	if (this._state === CurveTool.STATE_NOT_STARTED) {
		LineTool.drawLine(this.startX, this.startY, pointerState.x, pointerState.y, this._preCxt);
	} else {
		this._preCxt.beginPath();
		this._preCxt.moveTo(this.startX, this.startY);
		if (this._state === CurveTool.STATE_END_POINT_SET) {
			this._preCxt.bezierCurveTo(pointerState.x, pointerState.y, pointerState.x, pointerState.y, this.endX, this.endY);
		} else {
			this._preCxt.bezierCurveTo(this.point1X, this.point1Y, pointerState.x, pointerState.y, this.endX, this.endY);
		}
		this._preCxt.stroke();
		this._preCxt.closePath();
	}
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
};

/**
 * @override
 * Process when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.end = function (pointerState) {
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	if (this._state === CurveTool.STATE_NOT_STARTED) {
		this.endX = pointerState.x;
		this.endY = pointerState.y;
		this._state = CurveTool.STATE_END_POINT_SET;
		
	} else if (this._state === CurveTool.STATE_END_POINT_SET) {
		this.point1X = pointerState.x;
		this.point1Y = pointerState.y;
		this._state = CurveTool.STATE_CONTROL_POINT1_SET;
		
	} else {
		this._cxt.drawImage(this._preCxt.canvas, 0, 0);
		Utils.clearCanvas(this._preCxt);
		undoStack.addState();
		
		this._state = CurveTool.STATE_NOT_STARTED;
	}
};
