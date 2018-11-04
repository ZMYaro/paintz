'use strict';

/**
 * Create a new abstract ShapeTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function ShapeTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extend DrawingTool.
ShapeTool.prototype = Object.create(DrawingTool.prototype);
ShapeTool.prototype.constructor = ShapeTool;


/**
 * @override
 * Handle the tool becoming the active tool.
 */
ShapeTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineAndFill();
	});
};

/**
 * @override
 * Handle the shape being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
ShapeTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (settings.get('outlineOption') === 'fillOnly') {
		this._lineColor = 'transparent';
	}
	if (settings.get('outlineOption') === 'outlineOnly') {
		this._fillColor = 'transparent';
	}
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
};

/**
 * @override
 * Update the shape when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
ShapeTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	// Erase the previous preview.
	Utils.clearCanvas(this._preCxt);
};
