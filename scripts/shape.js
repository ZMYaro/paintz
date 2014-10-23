'use strict';

/**
 * Create a new Shape.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 * @param {String} [fillColor] - The CSS color of the shape's interior.
 */
function Shape(cxt, startX, startY, lineWidth, lineColor, fillColor) {
	this._cxt = cxt;
	this.startX = startX;
	this.startY = startY;
	this.lineWidth = lineWidth;
	this.lineColor = lineColor;
	this.fillColor = fillColor;
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
	this._cxt.lineWidth = this.lineWidth;
	this._cxt.strokeStyle = this.lineColor;
	this._cxt.fillStyle = this.fillColor;
};
