'use strict';

/**
 * Create a new Eyedropper.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the shape is being drawn.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape's preview is being drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation.
 * @param {Number} startX - The x-coordinate of the shape's starting point.
 * @param {Number} startY - The y-coordinate of the shape's starting point.
 */
function Eyedropper(cxt, preCxt, button, startX, startY) {
	Shape.apply(this, arguments);
}

Eyedropper.prototype = Object.create(Shape.prototype);

/**
 * Collect the color under the cursor as the cursor moves.
 * @param {Number} newX - The current x-coordinate of the cursor.
 * @param {Number} newY - The current y-coordinate of the cursor.
 */
Eyedropper.prototype.updatePreview = function (newX, newY) {
	// Get the image's pixel data.
	this._imageData = this._cxt.getImageData(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	// Get the cursor position and add it to the stack.
	var pixelPos = (newY * this._imageData.width + newX) * 4;
	// Get the color of the clicked pixel.
	var color = 'rgb(' +
		this._imageData.data[pixelPos] + ',' +
		this._imageData.data[pixelPos + 1] + ',' +
		this._imageData.data[pixelPos + 2] + ')';
	
	// Update the line or fill color with the user's selection.
	if (this.button === 0) {
		localStorage.lineColor = color;
		document.getElementById('colors').style.borderColor = color;
	} else if (this.button === 2) {
		localStorage.fillColor = color;
		document.getElementById('colors').style.backgroundColor = color;
	}
};

/**
 * The CSS value for the cursor associated with the tool.
 * @override
 * @returns {String}
 */
Eyedropper.cursor = 'url(images/cursors/eyedropper.png) 3 15, default';
