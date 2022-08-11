'use strict';

/**
 * Create a new OvalTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function OvalTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
	
	this.centerX;
	this.centerY;
	this.radX;
	this.radY;
}
// Extend ShapeTool.
OvalTool.prototype = Object.create(ShapeTool.prototype);
OvalTool.prototype.constructor = OvalTool;

/**
 * @override
 * Update the oval's preview as it is being drawn.
 * @param {Object} pointerState - The pointer coordinates
 */
OvalTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	// Draw from center when ctrl key held.
	if (pointerState.ctrlKey) {
		this.centerX = this.startX;
		this.centerY = this.startY;
		this.radX = pointerState.x - this.startX;
		this.radY = pointerState.y - this.startY;
	} else {
		this.centerX = (this.startX + pointerState.x) / 2;
		this.centerY = (this.startY + pointerState.y) / 2;
		this.radX = (pointerState.x - this.startX) / 2;
		this.radY = (pointerState.y - this.startY) / 2;
	}
	
	// Perfect circle when shift key held.
	if (pointerState.shiftKey) {
		if (Math.abs(this.radX) < Math.abs(this.radY)) {
			this.radY = Math.sign(this.radY) * -Math.abs(this.radX);
			if (!pointerState.ctrlKey) {
				this.centerY = this.startY - this.radY;
			}
		} else {
			this.radX = Math.sign(this.radX) * Math.abs(this.radY);
			if (!pointerState.ctrlKey) {
				this.centerX = this.startX + this.radX;
			}
		}
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
OvalTool.prototype.update = function () {
	if (!this._canvasDirty && typeof this.centerX !== 'undefined') {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Prepare the new preview.
	this._preCxt.lineWidth = this.lineWidth;
	this._preCxt.fillStyle = this.fillColor;
	this._preCxt.save(); // Save the drawing context's state.
	this._preCxt.beginPath();
	this._preCxt.translate(this.centerX - this.radX, this.centerY - this.radY);
	this._preCxt.scale(this.radX, this.radY);
	this._preCxt.arc(1, 1, 1, 0, Math.TAU, false);
	this._preCxt.restore(); // Restore the context to its original state.
	
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
OvalTool.prototype.end = function (pointerState) {
	ShapeTool.prototype.end.apply(this, arguments);
	
	this.centerX =
		this.centerY =
		this.radX =
		this.radY = undefined;
};
