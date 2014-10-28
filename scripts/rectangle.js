'use strict';

/**
 * Create a new Rectangle.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 * @param {String} [fillColor] - The CSS color of the shape's interior.
 */
function Rectangle(cxt, startX, startY, lineWidth, lineColor, fillColor) {
	Shape.call(this, cxt, startX, startY, lineWidth, lineColor, fillColor);
}

Rectangle.prototype = Object.create(Shape.prototype);


/**
 * Update the rectangle's preview as it is being drawn.
 * @override
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Rectangle.prototype.updatePreview = function (newX, newY) {
	Shape.prototype.updatePreview.call(this, newX, newY);
	
	var x = Math.min(newX, this.startX);
	var y = Math.min(newY, this.startY);
	var width = Math.abs(newX - this.startX);
	var height = Math.abs(newY - this.startY);
	
	// Erase the previous preview.
	this._cxt.clearRect(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	
	// Draw the new preview.
	this._cxt.fillRect(x, y, width, height);
	this._cxt.strokeRect(x, y, width, height);
};

/**
 * Return the CSS value for the cursor associated with the shape.
 * @override
 * @returns {String}
 */
Object.defineProperty(Rectangle, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		return 'crosshair';
	}
});
