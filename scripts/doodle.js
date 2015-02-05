'use strict';

/**
 * Create a new Doodle.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape's preview is being drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 * @param {Number} [lineWidth] - The width of the shape's outline.
 * @param {String} [outlineOption] - Whether outline, fill, or both should be drawn
 * @param {String} [lineColor] - The CSS color of the shape's outline.
 */
function Doodle(cxt, preCxt, button, startX, startY, lineWidth, outlineOption, lineColor) {
	Shape.apply(this, arguments);
	this.lastX = startX;
	this.lastY = startY;
}

Doodle.prototype = Object.create(Shape.prototype);


/**
 * Update the doodle as it is being drawn.
 * @override
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Doodle.prototype.updatePreview = function (newX, newY) {
	Shape.prototype.updatePreview.call(this, newX, newY);

	var cxt = localStorage.ghostDraw ? this._preCxt : this._cxt;

	// Connect to the existing preview.
	cxt.lineWidth = this.lineWidth;
	cxt.strokeStyle = this.lineColor;
	cxt.beginPath();
	cxt.moveTo(currentShape.lastX, currentShape.lastY);
	cxt.lineTo(newX, newY);
	cxt.closePath();
	cxt.stroke();

	// Force round end caps on the path.
	cxt.fillStyle = this.lineColor;
	cxt.beginPath();
	cxt.arc(newX, newY, this.lineWidth / 2, 0, 2 * Math.PI, false);
	cxt.closePath();
	cxt.fill();

	// Store the last x and y.
	this.lastX = newX;
	this.lastY = newY;
};

/**
 * Return the CSS value for the cursor associated with the shape.
 * @override
 * @returns {String}
 */
Object.defineProperty(Doodle, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		cursorCanvas.width = cursorCanvas.height = parseInt(localStorage.lineWidth) + 2;

		cursorCxt.lineWidth = 1;
		cursorCxt.strokeStyle = 'white';
		cursorCxt.beginPath();
		cursorCxt.arc(
			cursorCanvas.width / 2, cursorCanvas.height / 2,
			localStorage.lineWidth / 2,
			0, Math.PI * 2, false
		);
		cursorCxt.closePath();
		cursorCxt.stroke();

		cursorCxt.lineWidth = 1;
		cursorCxt.strokeStyle = 'black';
		cursorCxt.beginPath();
		cursorCxt.arc(
			cursorCanvas.width / 2, cursorCanvas.height / 2,
			localStorage.lineWidth / 2,
			0, Math.PI * 2, false
		);
		cursorCxt.closePath();
		cursorCxt.stroke();

		var cursorDataURL = cursorCanvas.toDataURL();

		var cursorCSS = 'url(' + cursorDataURL + ')' // Data URL
		cursorCSS += ' ' + (cursorCanvas.width / 2) + ' ' + (cursorCanvas.height / 2); // Positioning
		cursorCSS += ', default'; // Fallback

		return cursorCSS;
	}
});