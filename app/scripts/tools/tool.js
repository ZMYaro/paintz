'use strict';

/**
 * Create a new abstract Tool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function Tool(cxt, preCxt) {
	this._cxt = cxt;
	this._preCxt = preCxt;
	
	/** {Boolean} Whether the canvas needs to be redrawn. */
	this._canvasDirty = false;
}

/**
 * Undo anti-aliasing.
 * @param {Object} [color] - The color every pixel on the canvas should be
 */
Tool.prototype._deAntiAlias = function (color) {
	var imageData = this._preCxt.getImageData(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);
	for (var i = 3; i < imageData.data.length; i += 4) {
		if (imageData.data[i] >= 128) {
			// Set > 50% opaque pixels to be fully opaque.
			imageData.data[i] = 255;
			
			// If a color was specified, ensure each pixel matches that color.
			if (color) {
				imageData.data[i - 3] = color.r;
				imageData.data[i - 2] = color.g;
				imageData.data[i - 1] = color.b;
			}
		} else {
			// Reset < 50% opaque pixels to transparent black.
			imageData.data[i] =
			imageData.data[i - 3] =
				imageData.data[i - 2] =
				imageData.data[i - 1] = 0;
		}
	}
	this._preCxt.putImageData(imageData, 0, 0);
};

/**
 * Round/truncate pointer coordinates down to integers.
 * @param {Object} pointerState - The pointer coordinates and button
 */
Tool.prototype._floorPointerState = function (pointerState) {
	pointerState.x = Math.floor(pointerState.x);
	pointerState.y = Math.floor(pointerState.y);
};

/**
 * Round pointer coordinates to nearest integers.
 * @param {Object} pointerState - The pointer coordinates and button
 */
Tool.prototype._roundPointerState = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
};

/**
 * Handle the tool becoming the active tool.
 */
Tool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'default';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.noToolOptions);
};

/**
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
Tool.prototype.start = function (pointerState) {
};

/**
 * Handle movement of the pointer that activated the tool.
 * @param {Object} pointerState - The pointer coordinates
 */
Tool.prototype.move = function (pointerState) {
};

/**
 * Update the canvas if necessary.
 */
Tool.prototype.update = function () {
};

/**
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
Tool.prototype.end = function (pointerState) {
};

/**
 * Handle the tool no longer being the active tool.
 */
Tool.prototype.deactivate = function () {
	this._canvasDirty = false;
};
