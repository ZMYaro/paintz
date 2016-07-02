'use strict';

var zoomManager = {
	// Levels for the zoom slider.
	ZOOM_LEVELS: [
		25,
		50,
		75,
		100,
		200,
		400,
		800
	],
	
	// UI elements.
	_zoomPercentField: undefined,
	_zoomSlider: undefined,
	_zoomOutBtn: undefined,
	_zoomInBtn: undefined,
	
	_zoomLevel: 1,
	
	get level() {
		return this._zoomLevel;
	},
	
	set level(percent) {
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
		tools[localStorage.tool].activate();
	},
	
	/**
	 * Find the nearest zoom level to the given percentage.
	 * @param {Number} percent - The specified zoom percentage
	 * @returns {Number} The nearest zoom level index
	 */
	_nearestZoomLevel: function (percent) {
		var i = 0;
		for (i = 0; i < this.ZOOM_LEVELS.length - 1; i++) {
			if (percent < (this.ZOOM_LEVELS[i] + this.ZOOM_LEVELS[i + 1]) / 2) {
				return i;
			}
		}
		return i;
	},
	
	/**
	 * Initialize zoom controls and event listeners.
	 */
	init: function () {
		this._zoomPercentField = document.getElementById('zoomPercent');
		this._zoomSlider = document.getElementById('zoomSlider');
		this._zoomOutBtn = document.getElementById('zoomOutBtn');
		this._zoomInBtn = document.getElementById('zoomInBtn');
		
		this._zoomPercentField.value = this._zoomLevel * 100;
		this._zoomSlider.min = 0;
		this._zoomSlider.max = this.ZOOM_LEVELS.length - 1;
		
		var that = this;
		this._zoomPercentField.oninput = function () {
			that.level = parseInt(this.value);
		};
		this._zoomSlider.oninput = function () {
			that.level = that.ZOOM_LEVELS[this.value];
		};
		this._zoomOutBtn.onclick = function () {
			that.zoomOut();
		};
		this._zoomInBtn.onclick = function () {
			that.zoomIn();
		};
	},
	
	zoomIn: function () {
		this._zoomSlider.stepUp();
		this._zoomSlider.oninput();
	},
	
	zoomOut: function () {
		this._zoomSlider.stepDown();
		this._zoomSlider.oninput();
	}
};
