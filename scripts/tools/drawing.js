'use strict';

/**
 * Create a new abstract DrawingTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function DrawingTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	
	/** @private {String} The CSS color for the current line/primary color */
	this._lineColor;
	/** @private {String} The CSS color for the current fill/secondary color */
	this._fillColor;
	/** @private {Boolean} Whether the last user input indicated to swap line and fill colors */
	this._swapLineAndFill = false;
}
// Extend Tool.
DrawingTool.prototype = Object.create(Tool.prototype);
DrawingTool.prototype.constructor = DrawingTool;

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
	this._swapLineAndFill = (pointerState.button === 2);
	this._updateFromDrawingSettings();
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
};

/**
 * @override
 * Handle movement of the pointer that activated the tool.
 * @param {Object} pointerState - The pointer coordinates and button
 */
DrawingTool.prototype.move = function (pointerState) {
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
};

/**
 * @override
 * Update the canvas if necessary.
 */
DrawingTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	
	// Erase the previous preview.
	Utils.clearCanvas(this._preCxt);
	
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

/**
 * @private
 * Update the line and fill colors and line width for the tool based on the current settings.
 */
DrawingTool.prototype._updateFromDrawingSettings = function () {
	this._lineColor = (this._swapLineAndFill ? settings.get('fillColor') : settings.get('lineColor'));
	this._fillColor = (this._swapLineAndFill ? settings.get('lineColor') : settings.get('fillColor'));
	this._lineWidth = settings.get('lineWidth');
};

/**
 * @private
 * Update the canvas's drawing context with the shape's properties.
 */
DrawingTool.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this._lineWidth;
	this._preCxt.strokeStyle = this._lineColor;
	this._preCxt.fillStyle = this._fillColor;
};
