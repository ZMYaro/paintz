'use strict';

/**
 * Create a new RectangleTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function RectangleTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
}
// Extend ShapeTool;
RectangleTool.prototype = Object.create(ShapeTool.prototype);
RectangleTool.prototype.constructor = RectangleTool;

/**
 * @override
 * Handle the shape being started by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
RectangleTool.prototype.start = function (pointerState) {
	ShapeTool.prototype.start.apply(this, arguments);
	
	this.x =
		this.y =
		this.width =
		this.height = undefined;
}

/**
 * @override
 * Update the rectangle's preview when the pointer is moved.
 * @param {Object} pointerState - The pointer coordinates
 */
RectangleTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	this.x = Math.min(pointerState.x, this.startX),
	this.y = Math.min(pointerState.y, this.startY),
	this.width = Math.abs(pointerState.x - this.startX),
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
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
RectangleTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	ShapeTool.prototype.update.apply(this, arguments);
	
	// Draw the new preview.
	this._preCxt.strokeRect(this.x, this.y, this.width, this.height);
	
	// Draw the stroke first.
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
	
	// Change the composite operation to ensure the filled region does not affect the de-anti-aliased outline.
	this._preCxt.globalCompositeOperation = 'destination-over';
	this._preCxt.fillRect(this.x, this.y, this.width, this.height);
	this._preCxt.globalCompositeOperation = 'source-over';
	
	if (settings.get('outlineOption') === 'fillOnly' && !settings.get('antiAlias')) {
		this._deAntiAlias();
	}
	
	this._canvasDirty = false;
};
