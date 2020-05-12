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
