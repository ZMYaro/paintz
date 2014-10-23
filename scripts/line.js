'use strict';

/**
 * Create a new Line.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [lineCalar] - The CSS color of the shape's outline.
 */
function Line(cxt, startX, startY, lineWidth, lineColor) {
	Shape.call(this, cxt, startX, startY, lineWidth, lineColor, null);
}

Line.prototype = Object.create(Shape.prototype);


/**
 * Update the line's preview as it is being drawn.
 * @override
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Line.prototype.updatePreview = function (newX, newY) {
	Shape.prototype.updatePreview.call(this, newX, newY);
	
	// Erase the previous preview.
	this._cxt.clearRect(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	
	// Draw the new preview.
	this._cxt.beginPath();
	this._cxt.moveTo(currentShape.startX, currentShape.startY);
	this._cxt.lineTo(newX, newY);
	this._cxt.closePath();
	this._cxt.stroke();
};
