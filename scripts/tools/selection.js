'use strict';

/**
 * Create a new SelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function SelectionTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}

SelectionTool.prototype = Object.create(Tool.prototype);

/**
 * Handle the selection tool becoming the active tool.
 * @override
 */
SelectionTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
};

/**
 * Handle the tool being activated by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
SelectionTool.prototype.start = function (pointerState) {
};

/**
 * Update the tool as the cursor moves.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.move = function (pointerState) {
};

/**
 * Handle the pointer being released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.end = function (pointerState) {
};
