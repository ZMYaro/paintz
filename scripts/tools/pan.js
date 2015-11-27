'use strict';

/**
 * Create a new PanTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function PanTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}

PanTool.prototype = Object.create(Tool.prototype);

/**
 * Handle the pan tool becoming the active tool.
 * @override
 */
PanTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'move';
};

/**
 * Handle the tool being activated by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
PanTool.prototype.start = function (pointerState) {
	if (pointerState.button !== 0) {
		return;
	}
	
	this._startX = pointerState.x;
	this._startY = pointerState.y;
};

/**
 * Update the tool as the cursor moves.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
PanTool.prototype.move = function (pointerState) {
	var scrollX = document.body.scrollLeft + (this._startX - pointerState.x),
		scrollY = document.body.scrollTop + (this._startY - pointerState.y);
	window.scrollTo(scrollX, scrollY);
};

/**
 * Handle the pointer being released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
PanTool.prototype.end = function (pointerState) {
	// Move to the final pointer position before stopping.
	this.move(pointerState);
};

