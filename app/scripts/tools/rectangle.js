'use strict';

/**
 * Create a new RectangleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function RectangleTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
	
	this.x;
	this.y;
	this.width;
	this.height;
}
// Extend ShapeTool;
RectangleTool.prototype = Object.create(ShapeTool.prototype);
RectangleTool.prototype.constructor = RectangleTool;

/**
 * @override
 * Update the rectangle's preview when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
RectangleTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	this.x = Math.min(pointerState.x, this.startX);
	this.y = Math.min(pointerState.y, this.startY);
	this.width = Math.abs(pointerState.x - this.startX);
	this.height = Math.abs(pointerState.y - this.startY);
	
	// Perfect square when shift key held.
	if (pointerState.shiftKey) {
		if (this.width < this.height) {
			this.height = this.width;
			if (this.y === pointerState.y) {
				this.y = this.startY - this.height;
			}
		} else {
			this.width = this.height;
			if (this.x === pointerState.x) {
				this.x = this.startX - this.width;
			}
		}
	}
	
	// Draw from center when ctrl key held.
	if (pointerState.ctrlKey) {
		this.x = this.startX - this.width;
		this.y = this.startY - this.height;
		this.width *= 2;
		this.height *= 2;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
RectangleTool.prototype.update = function () {
	if (!this._canvasDirty && typeof this.x !== 'undefined') {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	this._preCxt.beginPath();
	this._preCxt.rect(this.x, this.y, this.width, this.height);
	this._drawCurrentPath();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Clear the points when the pointer finishes.
 * @param {Object} pointerState - The pointer coordinates
 */
RectangleTool.prototype.end = function (pointerState) {
	ShapeTool.prototype.end.apply(this, arguments);
	
	this.x =
		this.y =
		this.width =
		this.height = undefined;
};
