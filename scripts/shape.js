'use strict';

/**
 * Create a new Shape.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape's preview is being drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [outlineOption] - Whether outline, fill, or both should be drawn
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 * @param {String} [fillColor] - The CSS color of the shape's interior.
 */
function Shape(cxt, preCxt, button, startX, startY, lineWidth, outlineOption, lineColor, fillColor) {
	this._cxt = cxt;
	this._preCxt = preCxt;
	this.button = button;
	this.startX = startX;
	this.startY = startY;
	this.lineWidth = lineWidth;
	if (button !== 2) {
		this.lineColor = lineColor;
		this.fillColor = fillColor;
	} else {
		this.lineColor = fillColor;
		this.fillColor = lineColor;
	}
}

/**
 * Update the shape's preview as it is being drawn.
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Shape.prototype.updatePreview = function (newX, newY) {
	this._prepareCanvas();
};

/**
 * Finish the shape.
 * @param {Number} endX - The x-coordinate at which the cursor left the page.
 * @param {Number} endY - The y-coordinate at which the cursor left the page.
 */
Shape.prototype.finish = function (endX, endY) {
	this.updatePreview(endX, endY);
};

/**
 * Update the canvas's drawing context with the shape's properties.
 */
Shape.prototype._prepareCanvas = function () {
	this._preCxt.lineWidth = this.lineWidth;
	this._preCxt.strokeStyle = this.lineColor;
	this._preCxt.fillStyle = this.fillColor;
};

/**
 * Return the CSS value for the cursor associated with the shape.
 * @returns {String|Image}
 */
Object.defineProperty(Shape, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		return 'default';
	}
});
