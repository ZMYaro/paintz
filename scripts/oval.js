'use strict';

/**
 * Create a new Oval.
 * @param {CanvasRenderingContext2D} cxt - The canvas this._preCxt in which the shape is being drawn.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape's preview is being drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [outlineOption] - Whether outline, fill, or both should be drawn
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 * @param {String} [fillColor] - The CSS color of the shape's interior.
 */
function Oval(cxt, preCxt, button, startX, startY, lineWidth, outlineOption, lineColor, fillColor) {
	Shape.apply(this, arguments);
	if (outlineOption === 'fillOnly') {
		this.lineColor = 'transparent';
	}
	if (outlineOption === 'outlineOnly') {
		this.fillColor = 'transparent';
	}
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
	this._preCxt.clearRect(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);

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
	this._preCxt.fill();
	this._preCxt.stroke();
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
