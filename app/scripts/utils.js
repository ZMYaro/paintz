'use strict';

var Utils = {
	DIALOG_TRANSITION_DURATION: 200, // In milliseconds.
	
	/**
	 * Clear all graphics in a given canvas.
	 * @param {CanvasRenderingContext2D} cxt - The rendering context of the canvas to clear
	 */
	clearCanvas: function (cxt) {
		cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
	},
	
	/**
	 * Get the x-coordinate of a click within the canvas.
	 * @param {Number} pageX - The x-coordinate relative to the page
	 */
	getCanvasX: function (pageX) {
		return pageX - preCanvas.offsetLeft;
	},

	/**
	 * Get the y-coordinate of a click within the canvas.
	 * @param {Number} pageY - The y-coordinate relative to the page
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
	 * Add dialog box functions to an element
	 * @param {HTMLElement} element - The dialog's HTML element
	 * @param {HTMLElement} [trigger] - The button that opens the dialog
	 */
	makeDialog: function (element, trigger) {
		var toolbar = document.getElementById('toolbar'),
			dialogsContainer = document.getElementById('dialogs');
		
		function setDialogTransformOrigin() {
			// If there is no trigger element, do nothing.
			if (typeof trigger === 'undefined') {
				return;
			}
			element.style.WebkitTransformOrigin =
				element.style.MozTransformOrigin =
				element.style.MsTransformOrigin =
				element.style.OTransformOrigin =
				element.style.transformOrigin = (trigger.offsetLeft - toolbar.scrollLeft - element.offsetLeft) + 'px ' + (trigger.offsetTop - element.offsetTop) + 'px';
			console.log(element.offsetLeft);
			console.log(trigger.offsetLeft);
			console.log('= ' + (element.offsetLeft - trigger.offsetLeft));
			// Force a reflow.
			element.offsetLeft;
		}
		
		element.open = function () {
			// Disable app keyboard shortcuts.
			keyManager.disableAppShortcuts();
			
			// Show the dialog and dialog container.
			dialogsContainer.style.display = 'block';
			element.classList.add('visible');
			setDialogTransformOrigin();
			
			setTimeout(function () {
				dialogsContainer.classList.add('visible');
				element.classList.add('open');
				// Focus the first form element in the dialog.  If there are no input
				// elements, focus the submit button.
				var firstInput = element.querySelector('input, select, textarea');
				if (firstInput) {
					firstInput.focus();
				} else {
					element.querySelector('button[type=\"submit\"]').focus();
				}
			}, 1);
		};
		element.close = function (e) {
			if (e && e.preventDefault) {
				e.preventDefault();
			}
			
			setDialogTransformOrigin();
			element.classList.remove('open');
			dialogsContainer.classList.remove('visible');
			// After the closing animation has completed, hide the dialog box element completely.
			setTimeout(function () {
				// Hide the dialog and dialog container.
				element.classList.remove('visible');
				dialogsContainer.style.display = 'none';
				// Re-enable app keyboard shortcuts.
				keyManager.enableAppShortcuts();
			}, Utils.DIALOG_TRANSITION_DURATION);
		};
		if (element instanceof HTMLFormElement) {
			element.onsubmit = function (e) {
				e.target.close();
			};
		}
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
