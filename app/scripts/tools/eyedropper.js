'use strict';

/**
 * Create a new EyedropperTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function EyedropperTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}
// Extend Tool.
EyedropperTool.prototype = Object.create(Tool.prototype);
EyedropperTool.prototype.constructor = EyedropperTool;

/**
 * @override
 * Handle the eyedropper tool becoming the active tool.
 */
EyedropperTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'url(images/cursors/eyedropper.cur), default';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.noToolOptions);
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
EyedropperTool.prototype.start = function (pointerState) {
	this._button = pointerState.button;
	this.move(pointerState);
};

/**
 * @override
 * Collect the color under the cursor as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
EyedropperTool.prototype.move = function (pointerState) {
	// Get the image's pixel data.
	this._imageData = this._cxt.getImageData(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	// Get the cursor position and add it to the stack.
	this._floorPointerState(pointerState);
	var pixelPos = (pointerState.y * this._imageData.width + pointerState.x) * 4;
	// Get the color of the clicked pixel.
	var color = ColorPicker.rgb2hex({
		r: this._imageData.data[pixelPos],
		g: this._imageData.data[pixelPos + 1],
		b: this._imageData.data[pixelPos + 2]
	});
	
	// Update the line or fill color with the user's selection.
	if (this._button === 0) {
		settings.set('lineColor', color);
		document.getElementById('colors').style.borderColor = color;
	} else if (this._button === 2) {
		settings.set('fillColor', color);
		document.getElementById('colors').style.backgroundColor = color;
	}
};
