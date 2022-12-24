'use strict';

// Polyfills.
Math.TAU = Math.TAU || (2 * Math.PI);
window.URL = window.webkitURL || window.URL;
Array.from = Array.from || Array.prototype.slice.call.bind(Array.prototype.slice);
HTMLElement.prototype.remove = HTMLElement.prototype.remove || function () {
	this.parentElement ? this.parentElement.removeChild(this) : undefined;
};
Object.values = Object.values || function (obj) {
	var vals = [];
	for (var key in obj) {
		if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
			vals.push(obj[key]);
		}
	}
	return vals;
};

// Fake polyfill to prevent older browsers choking on this function.
CanvasRenderingContext2D.prototype.setLineDash = CanvasRenderingContext2D.prototype.setLineDash || function () {};

var Utils = {
	/** @constant {String} Text to append to messages informing a feature is unavailable in the current browser. */
	SUGGESTED_BROWSER_MESSAGE: 'To use this feature, please switch to a supported browser, such as the latest Google Chrome.',
	
	/** {Boolean} Whether the device runs Apple software */
	isApple: (navigator.userAgent.indexOf('Mac') !== -1),
	
	/** {Boolean} Whether the device runs a mobile or similarly limited OS */
	isMobileLike: !!navigator.userAgent.match(/android|ipad|iphone|ipod|mobile/i),
	
	/** {Boolean} Whether the user prefers reduced motion. */
	get prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	},
	
	/**
	 * Alphabetize items without sorting capitalized items before uncapitalized items.
	 * @param {String} a - The first element for comparison
	 * @param {String} b - The second element for comparison
	 * @returns {Number} -1 if a < b, or 1 if a > b
	 */
	caseInsensitiveSort: function (a, b) {
		return (a.toLowerCase() < b.toLowerCase() ? -1 : 1);
	},
	
	/**
	 * Check whether any modifier keys are pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the keys
	 * @returns {Boolean} - Whether any modifier key is pressed
	 */
	checkModifierKeys: function (e) {
		return (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey);
	},
	
	/**
	 * Check whether the Ctrl key, or the Command key on MacOS, is pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the key
	 * @returns {Boalean} - Whether the appropriate key is pressed
	 */
	checkPlatformCtrlOrCmdKey: function (e) {
		// On MacOS and iOS, check Cmd; on other platforms (Windows, Linux), check Ctrl.
		return ((!Utils.isApple && e.ctrlKey) || (Utils.isApple && e.metaKey));
	},
	
	/**
	 * Check whether the Windows key, or the Control key on MacOS, is pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the key
	 * @returns {Boalean} - Whether the appropriate key is pressed
	 */
	checkPlatformMetaOrControlKey: function (e) {
		// On MacOS and iOS, check Control; on other platforms (Windows, Linux), check the Windows/meta key.
		return ((!Utils.isApple && e.metaKey) || (Utils.isApple && e.ctrlKey));
	},
	
	/**
	 * Clear all graphics in a given canvas.
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to clear
	 */
	clearCanvas: function (cxt) {
		cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
	},
	
	/**
	 * Create a copy of an image data object.
	 * @param {ImageData} sourceData - The image data object to copy
	 * @param {CanvasRenderingContext2D} cxt - The rendering context to use to create the copy
	 * @returns {ImageData} The new copy
	 */
	cloneImageData: function (sourceData, cxt) {
		var copyData = cxt.createImageData(sourceData.width, sourceData.height);
		if (copyData.data.set) {
			copyData.data.set(sourceData.data);
		} else {
			// If imageData.data.set is not defined in this browser, manually copy the data.
			for (var i = 0; i < sourceData.data.length; i++) {
				copyData.data[i] = sourceData.data[i];
			}
		}
		return copyData;
	},
	
	/**
	 * @private
	 * Create a path in the canvas using the given points.
	 * @param {CanvasRenderingContext2D} cxt - The canvas context to create the path in
	 * @param {Array<Object>} points - The list of points
	 * @param {Boolean} shouldClose - Whether the path should be closed
	 */
	createPath: function (cxt, points, shouldClose) {
		cxt.beginPath();
		cxt.moveTo(points[0].x, points[0].y);
		points.forEach(function (point) {
			cxt.lineTo(point.x, point.y);
		});
		if (shouldClose) {
			cxt.closePath();
		}
	},
	
	/**
	 * Constrain a value between a minimum and maximum.
	 * @param {Number} value - The value to constrain
	 * @param {Number} min - The minimum value to allow
	 * @param {Number} max - The maximum value to allow
	 * @returns {Number} `value` or the closest number between `min` and `max`
	 */
	constrainValue: function (value, min, max) {
		return Math.max(min, Math.min(max, value));
	},
	
	/**
	 * Get the distance between 2 points.
	 * @param {Number} x1,
	 * @param {Number} y1,
	 * @param {Number} x2,
	 * @param {Number} y2
	 * @returns {Number}
	 */
	distance: function (x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	},
	
	/**
	 * Draw a round end cap for the end of a line (using the current `lineWidth` and `strokeStyle`).
	 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the line is being drawn
	 * @param {Number} x - The x-coordinate of the cap
	 * @param {Number} y - The y-coordinate of the cap
	 */
	drawCap: function (cxt, x, y) {
		cxt.save();
		cxt.fillStyle = cxt.strokeStyle;
		cxt.beginPath();
		cxt.arc(x, y, cxt.lineWidth / 2, 0, Math.TAU, false);
		cxt.fill();
		cxt.restore();
	},
	
	/**
	 * Draw the canvas, color-inverted, to the precanvas.
	 */
	drawCanvasInvertedToPreCanvas: function () {
		cursorCxt.save();
		cursorCxt.canvas.width = cxt.canvas.width;
		cursorCxt.canvas.height = cxt.canvas.height;
		cursorCxt.drawImage(cxt.canvas, 0, 0);
		cursorCxt.globalCompositeOperation = 'difference';
		cursorCxt.fillStyle = 'white'; // Filling with white with “difference” blending mode inverts colors.
		cursorCxt.fillRect(0, 0, cursorCxt.canvas.width, cursorCxt.canvas.height);
		cursorCxt.restore();
		preCxt.drawImage(cursorCanvas, 0, 0);
	},
	
	/**
	 * Load a file.
	 * @param {String} path - The path to the file
	 */
	fetch: function (path) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						reject('Error ' + xhr.status + ' while attempting to load ' + path);
					}
				}
			};
			xhr.open('GET', path, true);
			xhr.send();
		});
	},
	
	/**
	 * Draw a grid on a canvas with the specified spacing.
	 * @param {Number} size - The size of each grid square, in pixels
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to draw to
	 */
	drawGrid: function (size, cxt) {
		var COLOR_DARK = 'rgba(0, 0, 0, 0.5)',
			COLOR_LIGHT = 'rgba(255, 255, 255, 0.2275)';
		
		cxt.save();
		
		cxt.setLineDash([1, 1]);
		
		// Canvas centers the line on the coordinate, so 0.5px centers a 1px line on the pixel.
		for (var x = 0; x < cxt.canvas.width; x += size) {
			var currentX = Math.floor(x) + 0.5;
			cxt.lineDashOffset = 0;
			cxt.strokeStyle = COLOR_DARK;
			Utils.drawLine(currentX, 0, currentX, cxt.canvas.height, cxt);
			cxt.lineDashOffset = 1;
			cxt.strokeStyle = COLOR_LIGHT;
			Utils.drawLine(currentX, 0, currentX, cxt.canvas.height, cxt);
		}
		
		for (var y = 0.5; y < cxt.canvas.height; y += size) {
			var currentY = Math.floor(y) + 0.5;
			cxt.lineDashOffset = 0;
			cxt.strokeStyle = COLOR_DARK;
			Utils.drawLine(0, currentY, cxt.canvas.width, currentY, cxt);
			cxt.lineDashOffset = 1;
			cxt.strokeStyle = COLOR_LIGHT;
			Utils.drawLine(0, currentY, cxt.canvas.width, currentY, cxt);
		}
		
		cxt.restore();
	},
	
	/**
	 * Draw a line on a canvas between two points.
	 * @param {Number} x1 - The x-coordinate of the start point
	 * @param {Number} y1 - The y-coordinate of the start point
	 * @param {Number} x2 - The x-coordinate of the end point
	 * @param {Number} y2 - The y-coordinate of the end point
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to draw to
	 */
	drawLine: function (x1, y1, x2, y2, cxt) {
		cxt.beginPath();
		cxt.moveTo(x1, y1);
		cxt.lineTo(x2, y2);
		cxt.stroke();
		cxt.closePath();
	},
	
	/**
	 * Get the x-coordinate of a click within the canvas.
	 * @param {Number} pageX - The x-coordinate relative to the page
	 * @returns {Number}
	 */
	getCanvasX: function (pageX) {
		return pageX - canvasPositioner.offsetLeft;
	},

	/**
	 * Get the y-coordinate of a click within the canvas.
	 * @param {Number} pageY - The y-coordinate relative to the page
	 * @returns {Number}
	 */
	getCanvasY: function (pageY) {
		return pageY - canvasPositioner.offsetTop;
	},
	
	/**
	 * Convert a CSS color to RGB values.
	 * @param {String} cssColor - The CSS color to parse
	 * @returns {Object} - A map of `r`, `g`, and `b` to their number values
	 */
	colorToRGB: function (cssColor) {
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
	},
	
	/**
	 * Check whether a point is inside a rectangle.
	 * @param {Numebr} px - The x-coordinate of the point
	 * @param {Numebr} py - The y-coordinate of the point
	 * @param {Numebr} rx - The x-coordinate of the rectangle's upper-left corner
	 * @param {Numebr} ry - The y-coordinate of the rectangle's upper-left corner
	 * @param {Number} rw - The width of the rectangle
	 * @param {Number} rh - The height of the rectangle
	 * @returns {Boolean} Whether the point is inside the rectangle
	 */
	isPointInRect: function (px, py, rx, ry, rw, rh) {
		if (px > rx && px < (rx + rw) &&
				py > ry && py < (ry + rh)) {
			return true;
		}
		return false;
	},
	
	/**
	 * Read a file to an image.
	 * @param {File} file - The file to read
	 * @returns {Promise} Resolves with an Image when the image has been loaded and read
	 */
	readImage: function (file) {
		return new Promise(function (resolve, reject) {
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				reject('Please switch to a browser that supports the file APIs, such as the latest Google Chrome.');
				return;
			}
			if (!file) {
				reject();
				return;
			}
			if (!file.type.match('image.*')) {
				reject('PaintZ can only open valid image files.');
				return;
			}
			
			var reader = new FileReader();
			reader.onload = function () {
				var image = new Image();
				image.onload = function () {
					resolve(image);
				};
				image.src = reader.result;
			};
			reader.readAsDataURL(file);
		});
	},
	
	/**
	 * A shim for supporting requestAnimationFrame in older browsers.
	 * Based on the one by Paul Irish.
	 */
	raf: (window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		(function (func) {
			setTimeout(func, 1000 / 60);
		})).bind(window),
	
	/**
	 * Round a number to the indicated number of decimal places.
	 * @param {Number} num - The number to round
	 * @param {Number} places - The number of decimal places to round to
	 * @returns {Number} The rounded number
	 */
	roundToPlaces: function (num, places) {
		var factor = Math.pow(10, places);
		return (Math.round(num * factor) / factor);
	}
};
