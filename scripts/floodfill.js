'use strict';

/**
 * Create a new FloodFill.
 * @param {CanvasRenderingContext2D} cxt - The canvas context that is being filled.
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which shape preview are drawn.
 * @param {Number} button - Which mouse button was used to initiate the shape's creation.
 * @param {Number} startX - The x-coordinate of the fill's starting point.
 * @param {Number} startY - The y-coordinate of the fill's starting point.
 * @param {Number} [lineWidth] - The width of the shapes' outlines.
 * @param {String} [outlineOption] - Whether outline, fill, or both should be drawn
 * @param {String} [lineColor] - The current line color.
 * @param {String} [fillColor] - The current fill color.
 */
function FloodFill(cxt, preCxt, button, startX, startY, lineWidth, outlineOption, lineColor, fillColor) {
	Shape.apply(this, arguments);

	this._filling = false;
	this._imageData = [];
	this._startColor = {};

	this.lineColor = this._colorToRGB(this.lineColor);

	this._fill();
}

FloodFill.prototype = Object.create(Shape.prototype);

/**
 * Fill the canvas, starting at (startX,startY).
 */
FloodFill.prototype._fill = function () {
	if (this._filling) {
		return;
	}

	this._filling = true;

	// Get the pixel data.
	this._imageData = this._cxt.getImageData(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	// Get the starting position and add it to the stack.
	var pixelPos = (this.startY * this._imageData.width + this.startX) * 4;
	var pixelStack = [[this.startX, this.startY]];
	// Get the color of the clicked pixel.
	this._startColor = {
		r: this._imageData.data[pixelPos],
		g: this._imageData.data[pixelPos + 1],
		b: this._imageData.data[pixelPos + 2]
	};

	// Quit if the clicked pixel is already the correct color.
	if (this.lineColor.r === this._startColor.r &&
			this.lineColor.g === this._startColor.g &&
			this.lineColor.b === this._startColor.b) {
		this._filling = false;
		return;
	}

	while (pixelStack.length > 0) {
		var pos = pixelStack.pop();
		var x = pos[0];
		var y = pos[1];

		pixelPos = (y * this._imageData.width + x) * 4;
		while (y-- >= 0 && this._checkColorMatch(pixelPos)) {
			pixelPos -= this._imageData.width * 4;
		}
		pixelPos += this._imageData.width * 4;
		y++;
		var rightPixel = false;
		var leftPixel = false;
		while (y++ < this._imageData.height - 1 && this._checkColorMatch(pixelPos)) {
			this._colorPixel(pixelPos);
			if (x > 0) {
				if (this._checkColorMatch(pixelPos - 4)) {
					if (!leftPixel) {
						pixelStack.push([x - 1, y]);
						leftPixel = true;
					}
				} else {
					leftPixel = false;
				}
			}
			if (x < this._imageData.width - 1) {
				if (this._checkColorMatch(pixelPos + 4)) {
					if (!rightPixel) {
						pixelStack.push([x + 1, y]);
						rightPixel = true;
					}
				} else {
					rightPixel = false;
				}
			}
			pixelPos += canvas.width * 4;
		}
	}

	this._cxt.putImageData(this._imageData, 0, 0);

	this._filling = false;
};

/**
 * Check whether the pixel at a given position as the same color as the first pixel clicked.
 * @param {Number} pixelPos - The index of the pixel to be checked in the image data array
 * @returns {Boolean}
 */
FloodFill.prototype._checkColorMatch = function (pixelPos) {
	var r = this._imageData.data[pixelPos];
	var g = this._imageData.data[pixelPos + 1];
	var b = this._imageData.data[pixelPos + 2];

	if (r === this._startColor.r &&
			g === this._startColor.g &&
			b === this._startColor.b) {
		return true;
	}
	return false;
};

/**
 * Change the color of a given pixel to the filling color.
 * @param {Number} pixelPos - The index of the pixel to be colored in the image data array
 */
FloodFill.prototype._colorPixel = function (pixelPos) {
	this._imageData.data[pixelPos] = this.lineColor.r;
	this._imageData.data[pixelPos + 1] = this.lineColor.g;
	this._imageData.data[pixelPos + 2] = this.lineColor.b;
};

/**
 * Convert a CSS color to RGB values.
 * @param {String} cssColor - The CSS color to parse
 * @returns {Object} - A map of `r`, `g`, and `b` to their number values
 */
FloodFill.prototype._colorToRGB = function (cssColor) {
	if (cssColor.charAt(0) === '#') {
		var result = (/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i).exec(cssColor);
		if (result) {
			return {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			};
		}
	}
	return {
		black: {r: 0, g: 0, b: 0},
		blue: {r: 0, g: 0, b: 255},
		brown: {r: 165, g: 42, b: 42},
		cyan: {r: 0, g: 255, b: 255},
		gray: {r: 128, g: 128, b: 128},
		green: {r: 0, g: 128, b: 0},
		indigo : {r: 75, g: 0, b: 130},
		lightblue: {r: 173, g: 216, b: 230},
		lime: {r: 0, g: 255, b: 0},
		magenta: {r: 255, g: 0, b: 255},
		navy: {r: 0, g: 0, b: 128},
		olive: {r: 128, g: 128, b: 0},
		orange: {r: 255, g: 165, b: 0},
		purple: {r: 128, g: 0, b: 128},
		red: {r: 255, g: 0, b: 0},
		teal: {r: 0, g: 128, b: 128},
		violet: {r: 238, g: 130, b: 238},
		white: {r: 255, g: 255, b: 255},
		yellow: {r: 255, g: 255, b: 0}
	}[cssColor];
};

/**
 * Do nothing when updatePreview is called.
 * @override;
 */
FloodFill.prototype.updatePreview = function () {};

/**
 * Return the CSS value for the cursor associated with the tool.
 * @override
 * @returns {String}
 */
Object.defineProperty(FloodFill, 'cursor', {
	configurable: true,
	enumerable: true,
	get: function () {
		return 'url(images/cursors/paint_bucket.png) 3 15, default';
	}
});
