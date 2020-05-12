'use strict';

/**
 * @class
 * Create a new DimensionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function DimensionsToolbox(toolbar) {
	Toolbox.call(this, 'dimensions', toolbar);
	
	/** @private {HTMLSpanElement} The resolution display */
	this._resolution;
	/** @private {HTMLSpanElement} The pointer coordinates display */
	this._pointerCoords;
	
	this._element.id = 'dimensionsToolbox';
}
// Extend Toolbox.
DimensionsToolbox.prototype = Object.create(Toolbox.prototype);
DimensionsToolbox.prototype.constructor = DimensionsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
DimensionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Clear button and dialog.
	var resolutionBtn = this._element.querySelector('#resolutionBtn');
	resolutionBtn.addEventListener('click', dialogs.resize.open.bind(dialogs.resize), false);
	
	this._resolution = resolutionBtn.querySelector('span');
	this.updateResolution();
	
	this._pointerCoords = this._element.querySelector('#pointerCoords');
};

/**
 * Update the displayed resolution to reflect the current settings.
 */
DimensionsToolbox.prototype.updateResolution = function () {
	this._resolution.innerHTML = settings.get('width') + ' &times; ' + settings.get('height') + 'px';
};

/**
 * Update the displayed pointer coordinates, or hide them if the pointer is outside the canvas.
 * @param {Number} pointerX - The pointer's current x-coordinate
 * @param {Number} pointerY - The pointer's current y-coordinate
 */
DimensionsToolbox.prototype.updatePointerCoords = function (pointerX, pointerY) {
	// Confirm the pointer coordinates are in the canvas.
	var xInCanvas = (pointerX === Utils.constrainValue(pointerX, 0, canvas.width - 1)),
		yInCanvas = (pointerY === Utils.constrainValue(pointerY, 0, canvas.height - 1));
	
	if (!xInCanvas || !yInCanvas) {
		// If the cursor is outside the canvas, clear the coordinates display.
		this._pointerCoords.innerHTML = '';
		return;
	}
	
	this._pointerCoords.innerHTML = pointerX + ', ' + pointerY + 'px';
};
