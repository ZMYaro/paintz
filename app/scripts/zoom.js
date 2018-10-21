'use strict';

/**
 * Create a new ZoomManager instance and set up its event listeners.
 */
function ZoomManager() {
	/** @private {Number} The actual zoom level, with 1 being actual size */
	this._zoomLevel = 1;
	
	/** @private {HTMLInputElement} The input field that shows the current zoom percent */
	this._zoomPercentField = document.getElementById('zoomPercent');
	/** @private {HTMLInputElement} The slider that allows the zoom level to be adjusted */
	this._zoomSlider = document.getElementById('zoomSlider');
	/** @private {HTMLButtonElement} The button to zoom out */
	this._zoomOutBtn = document.getElementById('zoomOutBtn');
	/** @private {HTMLButtonElement} The button to zoom in */
	this._zoomInBtn = document.getElementById('zoomInBtn');
	
	// Set up the slider.
	this._zoomSlider.min = 0;
	this._zoomSlider.max = this.ZOOM_LEVELS.length - 1;
	
	// Set the default zoom value.
	this._zoomPercentField.value = this._zoomLevel * 100;
	
	// Set up event listeners.
	this._zoomPercentField.oninput = (function (e) {
		this.level = parseInt(this._zoomPercentField.value);
	}).bind(this);
	this._zoomSlider.oninput = (function () {
		this.level = this.ZOOM_LEVELS[this._zoomSlider.value];
	}).bind(this);
	this._zoomOutBtn.onclick = (function () {
		this.zoomOut();
	}).bind(this);
	this._zoomInBtn.onclick = (function () {
		this.zoomIn();
	}).bind(this);
}

/** @constant {Array<Number>} The zoom levels for the slider to snap to */
ZoomManager.prototype.ZOOM_LEVELS = [
	25,
	50,
	75,
	100,
	200,
	400,
	800
];

Object.defineProperties(ZoomManager.prototype, {
	level: {
		get: function () {
			return this._zoomLevel;
		},
		set: function (percent) {
			percent = Math.round(percent);
			if (isNaN(percent) || percent < 1 || percent > 999) {
				return;
			}
			
			// Update the zoom UI.
			this._zoomLevel = percent / 100;
			this._zoomPercentField.value = percent;
			this._zoomSlider.value = this._nearestZoomLevel(percent);
			
			// Resize the canvases accordingly.
			canvas.style.WebkitTransform =
				canvas.style.MozTransform =
				canvas.style.MsTransform =
				canvas.style.OTransform =
				canvas.style.transform =
				preCanvas.style.WebkitTransform =
				preCanvas.style.MozTransform =
				preCanvas.style.MsTransform =
				preCanvas.style.OTransform =
				preCanvas.style.transform = 'scale(' + percent / 100 + ')';
			
			// Allow the tool to update its cursor.
			tools.currentTool.activate();
		}
	}
});

/**
 * @private
 * Find the nearest zoom level to the given percentage.
 * @param {Number} percent - The specified zoom percentage
 * @returns {Number} The nearest zoom level index
 */
ZoomManager.prototype._nearestZoomLevel = function (percent) {
	var i = 0;
	for (i = 0; i < this.ZOOM_LEVELS.length - 1; i++) {
		if (percent < (this.ZOOM_LEVELS[i] + this.ZOOM_LEVELS[i + 1]) / 2) {
			return i;
		}
	}
	return i;
};

/**
 * Zoom in to the next level on the slider.
 */
ZoomManager.prototype.zoomIn = function () {
	this._zoomSlider.stepUp();
	this._zoomSlider.oninput();
};

/**
 * Zoom out to the next level on the slider.
 */
ZoomManager.prototype.zoomOut = function () {
	this._zoomSlider.stepDown();
	this._zoomSlider.oninput();
};
