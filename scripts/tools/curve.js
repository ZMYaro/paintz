'use strict';

/**
 * Create a new CurveTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function CurveTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this.startX;
	this.startY;
	this.endX;
	this.endY;
	this.point1X;
	this.point1Y;
	this.point2X;
	this.point2Y;
	this._state = this.STATE_NOT_STARTED;
}
// Extend CurveTool.
CurveTool.prototype = Object.create(DrawingTool.prototype);
CurveTool.prototype.constructor = CurveTool;

// Define constants.
CurveTool.prototype.STATE_NOT_STARTED = 0;
CurveTool.prototype.STATE_PLACING_END_POINT = 1;
CurveTool.prototype.STATE_PLACING_CONTROL_POINT1 = 2;
CurveTool.prototype.STATE_PLACING_CONTROL_POINT2 = 3;

/**
 * @override
 * Handle the curve tool becoming the active tool.
 */
CurveTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this, arguments);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly();
	});
};

/**
 * @override
 * Handle a curve being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
CurveTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (this._state === this.STATE_NOT_STARTED) {
		this.startX = pointerState.x;
		this.startY = pointerState.y;
		this.endX =
			this.endY =
			this.point1X =
			this.point1Y =
			this.point2X =
			this.point2Y = undefined;
	}
	this._state++;
	this.move(pointerState);
};

/**
 * @override
 * Update the curve when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	switch (this._state) {
		case this.STATE_PLACING_END_POINT:
			LineTool.prototype.move.apply(this, arguments);
			break;
		case this.STATE_PLACING_CONTROL_POINT1:
			this.point1X = pointerState.x;
			this.point1Y = pointerState.y;
			break;
		case this.STATE_PLACING_CONTROL_POINT2:
			this.point2X = pointerState.x;
			this.point2Y = pointerState.y;
			break;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
CurveTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	DrawingTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	if (this._state === this.STATE_PLACING_END_POINT) {
		Utils.drawLine(this.startX, this.startY, this.endX, this.endY, this._preCxt);
		
	} else if (this._state > this.STATE_PLACING_END_POINT) {
		this._preCxt.beginPath();
		this._preCxt.moveTo(this.startX, this.startY);
		this._preCxt.bezierCurveTo(
			this.point1X,
			this.point1Y,
			(typeof this.point2X !== 'undefined' ? this.point2X : this.point1X),
			(typeof this.point2Y !== 'undefined' ? this.point2Y : this.point1Y),
			this.endX,
			this.endY);
		this._preCxt.stroke();
	}
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
};

/**
 * @override
 * Process when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.end = function (pointerState) {
	if (this._state === this.STATE_PLACING_END_POINT) {
		if (Math.round(this.endX) === Math.round(this.startX) &&
				Math.round(this.endY) === Math.round(this.startY)) {
			// Abort if the starting line has a length less than 1.
			Utils.clearCanvas(this._preCxt);
			this._state = this.STATE_NOT_STARTED;
			return;
		}
		
	} else if (this._state === this.STATE_PLACING_CONTROL_POINT2) {
		this._finalizeCurve();
	}
};

/**
 * @override
 * Save the curve if the tool is deactivated before both control points have been set.
 */
CurveTool.prototype.deactivate = function () {
	if (this._state !== this.STATE_NOT_STARTED) {
		this._finalizeCurve();
	}
};

/**
 * @private
 * Draw the final curve and reset the tool's state.
 */
CurveTool.prototype._finalizeCurve = function () {
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
	this._state = this.STATE_NOT_STARTED;
};
