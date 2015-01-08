'use strict';

/**
 * Create a new Line.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape's preview is being drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [outlineOption] - Whether outline, fill, or both should be drawn
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 */
function Line(cxt, preCxt, button, startX, startY, lineWidth, outlineOption, lineColor) {
	Shape.apply(this, arguments);
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
	this._preCxt.clearRect(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);

	// Draw the new preview.
	this._preCxt.lineWidth = this.lineWidth;
	this._preCxt.strokeStyle = this.lineColor;
	this._preCxt.beginPath();
	this._preCxt.moveTo(currentShape.startX, currentShape.startY);
	this._preCxt.lineTo(newX, newY);
	this._preCxt.closePath();
	this._preCxt.stroke();
};

/**
 * Return the CSS value for the cursor associated with the shape.
 * @override
 * @returns {String}
 */
Object.defineProperty(Line, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		return 'crosshair';
	}
});
