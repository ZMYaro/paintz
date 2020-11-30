'use strict';

/**
 * @class
 * Create a new ZoomToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function ZoomToolbox(toolbar) {
	Toolbox.call(this, 'zoom', toolbar);
	
	// Expose these fields they can be updated by the zoom manager.
	/** {HTMLInputElement} The input field that shows the current zoom percent */
	this.percent;
	/** {HTMLInputElement} The slider that allows the zoom level to be adjusted */
	this.slider;
	
	this._element.id = 'zoomToolbox';
}
// Extend Toolbox.
ZoomToolbox.prototype = Object.create(Toolbox.prototype);
ZoomToolbox.prototype.constructor = ZoomToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ZoomToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up percent field.
	this.percent = this._element.querySelector('#zoomPercent');
	this.percent.value = zoomManager.levelPercent;
	this.percent.oninput = function (e) {
		zoomManager.levelPercent = parseInt(this.value);
	};
	this.percent.onkeydown = function (e) {
		// Prevent text field keyboard shortcuts being overridden by global shortcuts while typing.
		if (e.currentTarget !== document.activeElement) {
			return;
		}
		var keysToIntercept = [8, 27, 37, 38, 39, 40, 46, 65, 67, 88, 89, 90, 191, 219, 221];
		// Backspace, Esc, Left, Up, Right, Down, Delete, A, C, X, Y, Z, /, [, ]
		if (keysToIntercept.indexOf(e.keyCode) !== -1) {
			e.stopPropagation();
		}
	};
	
	// Set up slider.
	this.slider = this._element.querySelector('#zoomSlider');
	this.slider.min = 0;
	this.slider.max = zoomManager.ZOOM_LEVELS.length - 1;
	this.slider.oninput = function () {
		zoomManager.levelPercent = zoomManager.ZOOM_LEVELS[this.value];
	};
	
	// Set up buttons.
	var zoomOutBtn = this._element.querySelector('#zoomOutBtn');
	zoomOutBtn.onclick = zoomManager.zoomOut.bind(zoomManager);
	var zoomInBtn = this._element.querySelector('#zoomInBtn');
	zoomInBtn.onclick = zoomManager.zoomIn.bind(zoomManager);
};
