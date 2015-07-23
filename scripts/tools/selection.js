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

SelectionTool.OUTLINE_DASH_LENGTH = 6;

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
	// If a selection exists and the pointer is inside it, drag the selection.
	// Otherwise, start a new selection.
	if (this._selection &&
			Utils.isPointInRect(pointerState.x, pointerState.y,
				this._selection.x, this._selection.y,
				this._selection.width, this._selection.height)) {
		this._selection.pointerOffset = {
			x: pointerState.x - this._selection.x,
			y: pointerState.y - this._selection.y
		};
		this._preCxt.canvas.style.cursor = 'move';
	} else {
		this._selection = {
			startX: pointerState.x,
			startY: pointerState.y,
			x: pointerState.x,
			y: pointerState.y,
			width: 0,
			height: 0
		};
	}
};

/**
 * Update the tool as the cursor moves.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.move = function (pointerState) {
	if (!this._selection) {
		return;
	}
	
	this._preCxt.clearRect(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);
	
	// If there is no pointer offset, then this must be a new selection.
	if (this._selection.pointerOffset) {
		this._selection.x = pointerState.x - this._selection.pointerOffset.x;
		this._selection.y = pointerState.y - this._selection.pointerOffset.y;
		this._drawSelectionOutline();
		this._drawSelectionContent();
	} else {
		this._selection.width = pointerState.x - this._selection.x;
		this._selection.height = pointerState.y - this._selection.y;
		this._drawSelectionOutline();
	}
};

/**
 * Handle the pointer being released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.end = function (pointerState) {
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	// If the seleciton was being moved, just reset the pointer offset.
	// If a new selection was created, ensure the dimensions are valid values.
	if (this._selection.pointerOffset) {
		delete this._selection.pointerOffset;
	} else {
		// If either dimension is zero, the selection is invalid.
		if (this._selection.width === 0 || this._selection.height === 0) {
			delete this._selection;
			this._preCxt.clearRect(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);
			return;
		}
		if (this._selection.width < 0) {
			this._selection.startX += this._selection.width;
			this._selection.x = this._selection.startX;
			this._selection.width = Math.abs(this._selection.width);
		}
		if (this._selection.height < 0) {
			this._selection.startY += this._selection.height;
			this._selection.y = this._selection.startY;
			this._selection.height = Math.abs(this._selection.height);
		}
		// Save the selected content in case the user moves it.
		this._selection.content = this._cxt.getImageData(this._selection.startX, this._selection.startY,
			this._selection.width, this._selection.height);
	}
};

/**
 * Clean up when the selection tool is no longer the active tool.
 * @override
 */
SelectionTool.prototype.deactivate = function () {
	this._preCxt.clearRect(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);
	this._drawSelectionContent();
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	this._preCxt.clearRect(0, 0, this._preCxt.canvas.width, this._preCxt.canvas.height);
	delete this._selection;
};

/**
 * Draw the dotted outline around the selection.
 */
SelectionTool.prototype._drawSelectionOutline = function () {
	if (!this._selection) {
		return;
	}
	
	this._preCxt.strokeStyle = 'white';
	this._preCxt.lineWidth = 1;
	this._preCxt.strokeRect(this._selection.x, this._selection.y,
		this._selection.width, this._selection.height);
	this._preCxt.strokeStyle = 'black';
	this._preCxt.setLineDash([SelectionTool.OUTLINE_DASH_LENGTH, SelectionTool.OUTLINE_DASH_LENGTH]);
	this._preCxt.strokeRect(this._selection.x, this._selection.y,
		this._selection.width, this._selection.height);
};

/**
 * Draw the selected content in its new location and the background color over its former location.
 */
SelectionTool.prototype._drawSelectionContent = function () {
	if (!this._selection || !this._selection.content) {
		return;
	}
	
	this._preCxt.fillStyle = localStorage.fillColor;
	this._preCxt.fillRect(this._selection.startX, this._selection.startY,
		this._selection.width, this._selection.height);
	this._preCxt.putImageData(this._selection.content, this._selection.x, this._selection.y);
};
