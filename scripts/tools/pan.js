'use strict';

/**
 * Create a new PanTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function PanTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}
// Extend Tool.
PanTool.prototype = Object.create(Tool.prototype);
PanTool.prototype.constructor = PanTool;

/**
 * @override
 * Handle the pan tool becoming the active tool.
 */
PanTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'move';
	this._preCxt.canvas.style.cursor = '-webkit-grab';
	this._preCxt.canvas.style.cursor =    '-moz-grab';
	this._preCxt.canvas.style.cursor =         'grab';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.noToolOptions);
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
PanTool.prototype.start = function (pointerState) {
	this._startX = pointerState.windowX;
	this._startY = pointerState.windowY;
	this._startScrollX = window.scrollX;
	this._startScrollY = window.scrollY;
	
	// Switch to the grabbing cursor.
	this._preCxt.canvas.style.cursor = '-webkit-grabbing';
	this._preCxt.canvas.style.cursor = '-moz-grabbing';
	this._preCxt.canvas.style.cursor = 'grabbing';
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
PanTool.prototype.move = function (pointerState) {
	var scrollX = this._startScrollX + (this._startX - pointerState.windowX),
		scrollY = this._startScrollY + (this._startY - pointerState.windowY);
	window.scrollTo(scrollX, scrollY);
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
PanTool.prototype.end = function (pointerState) {
	// Move to the final pointer position before stopping.
	this.move(pointerState);
	
	// Reset to the non-grabbing cursor.
	this._preCxt.canvas.style.cursor = '-webkit-grab';
	this._preCxt.canvas.style.cursor = '-moz-grab';
	this._preCxt.canvas.style.cursor = 'grab';
};
