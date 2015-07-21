'use strict';

/**
 * Create a new abstract ShapeTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function ShapeTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}

ShapeTool.prototype = Object.create(DrawingTool.prototype);


/**
 * Handle the shape being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
ShapeTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (localStorage.outlineOption === 'fillOnly') {
		this._lineColor = 'transparent';
	}
	if (localStorage.outlineOption === 'outlineOnly') {
		this._fillColor = 'transparent';
	}
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
};

/**
 * Update the shape when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
ShapeTool.prototype.move = function (pointerState) {
	this._prepareCanvas();
};

/**
 * Finish the shape when the pointer is released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
ShapeTool.prototype.finish = function (pointerState) {
	this.updatePreview(pointerState);
};
