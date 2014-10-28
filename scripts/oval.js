'use strict';

/**
 * Create a new Oval.
 * @param {CanvasRenderingContext2D} cxt - The canvas this._cxt in which the shape is being drawn.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 * @param {String} [fillColor] - The CSS color of the shape's interior.
 */
function Oval(cxt, startX, startY, lineWidth, lineColor, fillColor) {
	Shape.call(this, cxt, startX, startY, lineWidth, lineColor, fillColor);
}

Oval.prototype = Object.create(Shape.prototype);


/**
 * Update the oval's preview as it is being drawn.
 * @override
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Oval.prototype.updatePreview = function (newX, newY) {
	Shape.prototype.updatePreview.call(this, newX, newY);
	
	var centerX = (newX + this.startX) / 2;
	var centerY = (newY + this.startY) / 2;
	var radX = (newX - this.startX) / 2;
	var radY = (newY - this.startY) / 2;
	
	// Erase the previous preview.
	this._cxt.clearRect(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	
	// Draw the new preview.
	this._cxt.save(); // Save the drawing context's state.
	this._cxt.beginPath();
	this._cxt.translate(centerX - radX, centerY - radY);
	this._cxt.scale(radX, radY);
	this._cxt.arc(1, 1, 1, 0, 2 * Math.PI, false);
	this._cxt.restore(); // Restore the context to its original state.
	this._cxt.fill();
	this._cxt.stroke();
};

/**
 * Return the CSS value for the cursor associated with the shape.
 * @override
 * @returns {String}
 */
Object.defineProperty(Oval, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		return 'crosshair';
	}
});
