'use strict';

/**
 * Create a new ZoomManager instance and set up its event listeners.
 */
function ZoomManager() {
	/** @private {Number} The actual zoom level, with 1 being actual size */
	this._zoomLevel = 1;
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

/** @constant {Object<Number, Number>} The grid sizes for zoom levels */
ZoomManager.prototype.GRID_SIZES = {
//	zoom level : grid size
	25:  50,
	50:  20,
	100: 10,
	200: 5,
	400: 1
};

Object.defineProperties(ZoomManager.prototype, {
	level: {
		get: function () {
			return this._zoomLevel;
		},
		set: function (newLevel) {
			// Round it to the hundredths.
			newLevel = Math.round(newLevel * 100) / 100;
			if (isNaN(newLevel) || newLevel < 0.01 || newLevel > 9.99) {
				return;
			}
			
			// Set the new value.
			this._zoomLevel = newLevel;
			
			// Update the zoom UI.
			toolbar.toolboxes.zoom.percent.value = this.levelPercent;
			toolbar.toolboxes.zoom.slider.value = this._nearestZoomLevel(this.levelPercent);
			
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
				preCanvas.style.transform = 'scale(' + this._zoomLevel + ')';
			canvasPositioner.style.width = (settings.get('width') * this._zoomLevel) + 'px';
			canvasPositioner.style.height = (settings.get('height') * this._zoomLevel) + 'px';
			gridCanvas.width = settings.get('width') * this._zoomLevel;
			gridCanvas.height = settings.get('height') * this._zoomLevel;
			
			// Allow the tool to update its cursor.
			tools.currentTool.activate();
			
			// Update the gridlines if enabled.
			if (settings.get('grid')) {
				this.drawGrid();
			}
		}
	},
	levelPercent: {
		get: function () {
			return Math.round(this._zoomLevel * 100);
		},
		set: function (newPercent) {
			newPercent = Math.round(newPercent);
			if (isNaN(newPercent) || newPercent < 1 || newPercent > 999) {
				return;
			}
			this.level = newPercent / 100;
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
	toolbar.toolboxes.zoom.slider.stepUp();
	toolbar.toolboxes.zoom.slider.oninput();
};

/**
 * Zoom out to the next level on the slider.
 */
ZoomManager.prototype.zoomOut = function () {
	toolbar.toolboxes.zoom.slider.stepDown();
	toolbar.toolboxes.zoom.slider.oninput();
};

/**
 * Draw gridlines for the current zoom level, if enabled.
 */
ZoomManager.prototype.drawGrid = function () {
	// Get the grid size for the current zoom level.
	var baseGridSize = 0;
	for (var level in this.GRID_SIZES) {
		if (baseGridSize && this.levelPercent < level) {
			// Stop one level down.
			break;
		}
		baseGridSize = this.GRID_SIZES[level];
	}
	
	// Adjust the spacing to match the actual canvas.
	var gridSize = baseGridSize * this._zoomLevel;
	
	Utils.clearCanvas(gridCxt);
	Utils.drawGrid(gridSize, gridCxt);
};
