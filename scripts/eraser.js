'use strict';

/**
 * Create a new Eraser.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape's preview is being drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [outlineOption] - Whether outline, fill, or both should be drawn
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 * @param {String} [fillColor] - The CSS color of the shape's fill.
 */
function Eraser(cxt, preCxt, button, startX, startY, lineWidth, outlineOption, lineColor, fillColor) {
	Shape.apply(this, arguments);
	this.lastX = startX;
	this.lastY = startY;
}

Eraser.prototype = Object.create(Shape.prototype);


/**
 * Update the erased area as it is being drawn.
 * @override
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Eraser.prototype.updatePreview = function (newX, newY) {
	Shape.prototype.updatePreview.call(this, newX, newY);

	var cxt = localStorage.ghostDraw ? this._preCxt : this._cxt;

	// Connect to the existing preview.
	cxt.fillStyle = this.fillColor;
	cxt.beginPath();
	// Connect top-left corners.
	cxt.moveTo(newX - this.lineWidth / 2, newY - this.lineWidth / 2);
	cxt.lineTo(this.lastX - this.lineWidth / 2, this.lastY - this.lineWidth / 2);
	cxt.lineTo(this.lastX, this.lastY);
	cxt.lineTo(newX, newY);
	// Connect top-right corners.
	cxt.moveTo(newX + this.lineWidth / 2, newY - this.lineWidth / 2);
	cxt.lineTo(this.lastX + this.lineWidth / 2, this.lastY - this.lineWidth / 2);
	cxt.lineTo(this.lastX, this.lastY);
	cxt.lineTo(newX, newY);
	// Connect bottom-right corners.
	cxt.moveTo(newX + this.lineWidth / 2, newY + this.lineWidth / 2);
	cxt.lineTo(this.lastX + this.lineWidth / 2, this.lastY + this.lineWidth / 2);
	cxt.lineTo(this.lastX, this.lastY);
	cxt.lineTo(newX, newY);
	// Connect bottom-left corners.
	cxt.moveTo(newX - this.lineWidth / 2, newY + this.lineWidth / 2);
	cxt.lineTo(this.lastX - this.lineWidth / 2, this.lastY + this.lineWidth / 2);
	cxt.lineTo(this.lastX, this.lastY);
	cxt.lineTo(newX, newY);
	cxt.closePath();
	cxt.fill();

	// Draw the current position.
	cxt.fillStyle = this.fillColor;
	cxt.fillRect(newX - this.lineWidth / 2, newY - this.lineWidth / 2, this.lineWidth, this.lineWidth);

	// Store the last x and y.
	this.lastX = newX;
	this.lastY = newY;
};

/**
 * Return the CSS value for the cursor associated with the shape.
 * @override
 * @returns {String}
 */
Object.defineProperty(Eraser, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		cursorCanvas.width = cursorCanvas.height = parseInt(localStorage.lineWidth) + 2;
		
		cursorCxt.lineWidth = 1;
		cursorCxt.strokeStyle = 'black';
		cursorCxt.fillStyle = localStorage.fillColor;
		cursorCxt.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);
		cursorCxt.strokeRect(0, 0, cursorCanvas.width, cursorCanvas.height);
		
		var cursorDataURL = cursorCanvas.toDataURL();
		
		var cursorCSS = 'url(' + cursorDataURL + ')' // Data URL
		cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
		cursorCSS += ', default'; // Fallback
		
		return cursorCSS;
	}
});