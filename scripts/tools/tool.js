'use strict';

/**
 * Create a new abstract Tool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function Tool(cxt, preCxt) {
	this._cxt = cxt;
	this._preCxt = preCxt;
}

/**
 * Handle the tool becoming the active tool.
 */
Tool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'default';
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
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
Tool.prototype.end = function (pointerState) {
};
