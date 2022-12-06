'use strict';

/**
 * Create a new LineTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function LineTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
}
// Extends DrawingTool.
LineTool.prototype = Object.create(DrawingTool.prototype);
LineTool.prototype.constructor = LineTool;

/**
 * @override
 * Handle the line tool becoming the active tool.
 */
LineTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this);
	
	toolbar.toolboxes.drawToolOptions.loadPromise.then(function () {
		toolbar.toolboxes.drawToolOptions.enableOutlineOnly();
	});
};

/**
 * @override
 * Handle a line being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
LineTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	this.startX = pointerState.x;
	this.startY = pointerState.y;
	this.endX =
		this.endY = undefined;
};

/**
 * @override
 * Update the line when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
LineTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	this.endX = pointerState.x;
	this.endY = pointerState.y;
	
	// Snap to tau/8 angles when shift key held.
	if (pointerState.shiftKey) {
		var deltaY = this.endY - this.startY,
			deltaX = this.endX - this.startX,
			angle = Math.atan2(deltaY, deltaX),
			increment = 0.125 * Math.TAU,
			snappedAngle = Math.round(angle / increment) * increment,
			length = snappedAngle % (2 * increment) === 0 ?
				Math.max(Math.abs(deltaY), Math.abs(deltaX)) :
				Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
		
		this.endX = this.startX + (length * Math.cos(snappedAngle));
		this.endY = this.startY + (length * Math.sin(snappedAngle)) ;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
LineTool.prototype.update = function () {
	if (!this._canvasDirty || typeof(this.startX) === 'undefined') {
		return;
	}
	DrawingTool.prototype.update.call(this);
	
	// Draw the new preview.
	Utils.drawLine(this.startX, this.startY, this.endX, this.endY, this._preCxt);
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	this._canvasDirty = false;
}

/**
 * @override
 * Clear the point when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
LineTool.prototype.end = function (pointerState) {
	DrawingTool.prototype.end.call(this, pointerState);
	
	this.startX =
		this.startY =
		this.endX =
		this.endY = undefined;
};
