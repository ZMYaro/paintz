'use strict';

/**
 * Create a new OvalTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function OvalTool(cxt, preCxt) {
	ShapeTool.apply(this, arguments);
}

OvalTool.prototype = Object.create(ShapeTool.prototype);


/**
 * Update the oval's preview as it is being drawn.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
OvalTool.prototype.move = function (pointerState) {
	ShapeTool.prototype.move.apply(this, arguments);
	
	if (localStorage.antiAlias) {
		this._roundPointerState(pointerState);
	}
	
	var centerX = (pointerState.x + this.startX) / 2,
		centerY = (pointerState.y + this.startY) / 2,
		radX = (pointerState.x - this.startX) / 2,
		radY = (pointerState.y - this.startY) / 2;
	
	
	// Draw the new preview.
	this._preCxt.lineWidth = this.lineWidth;
	this._preCxt.strokeStyle = this.lineColor;
	this._preCxt.fillStyle = this.fillColor;
	this._preCxt.save(); // Save the drawing context's state.
	this._preCxt.beginPath();
	this._preCxt.translate(centerX - radX, centerY - radY);
	this._preCxt.scale(radX, radY);
	this._preCxt.arc(1, 1, 1, 0, 2 * Math.PI, false);
	this._preCxt.restore(); // Restore the context to its original state.
	this._preCxt.stroke();
	
	if (localStorage.antiAlias) {
		this._deAntiAlias();
	}
	
	this._preCxt.globalCompositeOperation = 'destination-over';
	this._preCxt.fill();
	this._preCxt.globalCompositeOperation = 'source-over';
	
	if (localStorage.outlineOption === 'fillOnly' && localStorage.antiAlias) {
		this._deAntiAlias();
	}
};
