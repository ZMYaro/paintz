'use strict';

// Polyfills.
Math.TAU = Math.TAU || (2 * Math.PI);
Object.values = Object.values || function (obj) {
	var vals = [];
	for (var key in obj) {
		if (obj.hasOwnProperty(obj[key]) && obj.propertyIsEnumerable(obj[key])) {
			vals.push(obj[key]);
		}
	}
	return vals;
};

var Utils = {
	/** Whether the device runs Apple software. */
	isApple: (navigator.userAgent.indexOf('Mac') !== -1),
	
	/**
	 * Check whether any modifier keys are pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the keys
	 * @returns {Boolean} - Whether any modifier key is pressed
	 */
	checkModifierKeys: function (e) {
		return (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey);
	},
	
	/**
	 * Check whether the Ctrl key, or the equivalent for this platform, is pressed for the given event.
	 * @param {MouseEvent} e - The event for which to check the key
	 * @returns {Boalean} - Whether the appropriate key is pressed
	 */
	checkPlatformCtrlKey: function (e) {
		// On MacOS and iOS, check Cmd; on other platforms (Windows, Linux), check Ctrl.
		return ((!Utils.isApple && e.ctrlKey) || (Utils.isApple && e.metaKey));
	},
	
	/**
	 * Clear all graphics in a given canvas.
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to clear
	 */
	clearCanvas: function (cxt) {
		cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
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
	 * Get the x-coordinate of a click within the canvas.
	 * @param {Number} pageX - The x-coordinate relative to the page
	 * @returns {Number}
	 */
	getCanvasX: function (pageX) {
		return pageX - preCanvas.offsetLeft;
	},

	/**
	 * Get the y-coordinate of a click within the canvas.
	 * @param {Number} pageY - The y-coordinate relative to the page
	 * @returns {Number}
	 */
	getCanvasY: function (pageY) {
		return pageY - preCanvas.offsetTop;
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
				alert('Please switch to a browser that supports the file APIs, such as Google Chrome.');
				reject();
				return;
			}
			if (!file) {
				reject();
				return;
			}
			if (!file.type.match('image.*')) {
				alert('PaintZ can only open valid image files.');
				reject();
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
		})).bind(window)
};
