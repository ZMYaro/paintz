var Utils = {
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
	 * A shim for supporting requestAnimationFrame in older browsers.
	 * Inspired by Paul Irish.
	 */
	raf: (requestAnimationFrame ||
		webkitRequestAnimationFrame ||
		mozRequestAnimationFrame ||
		msRequestAnimationFrame ||
		oRequestAnimationFrame ||
		(function (func) {
			setTimeout(func, 1000 / 60);
		})).bind(window)
};
