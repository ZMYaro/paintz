'use strict';

/**
 * Create a new abstract DrawingTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function DrawingTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}
// Extend Tool.
DrawingTool.prototype = Object.create(Tool.prototype);
DrawingTool.prototype.constructor = DrawingTool;

/**
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
DrawingTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.strokeStyle = this._lineColor;
	this._preCxt.fillStyle = this._fillColor;
};

/**
 * @override
 * Handle the drawing tool becoming the active tool.
 */
DrawingTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.drawToolOptions);
};

/**
 * @override
 * Handle the shape being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
DrawingTool.prototype.start = function (pointerState) {
	if (pointerState.button !== 2) {
		this._lineColor = settings.get('lineColor');
		this._fillColor = settings.get('fillColor');
	} else {
		this._lineColor = settings.get('fillColor');
		this._fillColor = settings.get('lineColor');
	}
	
	this._lineWidth = settings.get('lineWidth');
};

/**
 * @override
 * Update the canvas if necessary.
 */
DrawingTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	
	this._prepareCanvas();
};

/**
 * @override
 * Finish the shape when the pointer is released.
 * @param {Object} pointerState - The pointer coordinates
 */
DrawingTool.prototype.end = function (pointerState) {
	// Draw the drawing to the main canvas.
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	// Erase the preview.
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};
