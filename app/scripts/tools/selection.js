'use strict';

/**
 * Create a new SelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function SelectionTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	this._outline = document.createElement('div');
	this._outline.className = 'floatingRegion';
	this._outline.style.cursor = 'move';
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
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
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
		// Save any existing selection.
		this._saveSelection();
		// Start a new selection.
		this._selection = {
			startX: pointerState.x,
			startY: pointerState.y,
			x: pointerState.x,
			y: pointerState.y,
			width: 0,
			height: 0
		};
		this._updateSelectionOutline();
		document.body.appendChild(this._outline);
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
	
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	Utils.clearCanvas(this._preCxt);
	
	// If there is no pointer offset, then this must be a new selection.
	if (this._selection.pointerOffset) {
		this._selection.x = pointerState.x - this._selection.pointerOffset.x;
		this._selection.y = pointerState.y - this._selection.pointerOffset.y;
		this._drawSelectionContent();
		this._updateSelectionOutline();
	} else {
		this._selection.width = pointerState.x - this._selection.startX;
		this._selection.height = pointerState.y - this._selection.startY;
		
		// Keep x and y at the top-left corner.
		if (this._selection.width < 0) {
			this._selection.x = this._selection.startX + this._selection.width;
			this._selection.width = Math.abs(this._selection.width);
		}
		if (this._selection.height < 0) {
			this._selection.y = this._selection.startY + this._selection.height;
			this._selection.height = Math.abs(this._selection.height);
		}
		this._updateSelectionOutline();
	}
};

/**
 * Handle the pointer being released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.end = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	this.move(pointerState);
	
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	// If a new selection was created, ensure the dimensions are valid values.
	if (!this._selection.pointerOffset) {
		// If either dimension is zero, the selection is invalid.
		if (this._selection.width === 0 || this._selection.height === 0) {
			delete this._selection;
			Utils.clearCanvas(this._preCxt);
			document.body.removeChild(this._outline);
			return;
		}
		
		// Update the start coordinates to the top-left corner.
		this._selection.startX = this._selection.x;
		this._selection.startY = this._selection.y;
		
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
	this._saveSelection();
	if (document.body.contains(this._outline)) {
		document.body.removeChild(this._outline);
	}
	delete this._selection;
};


/**
 * Delete the currently selected content.
 */
SelectionTool.prototype.clear = function () {
	// Quit if there is no selection to delete.
	if (!this._selection) {
		return;
	}
	
	this._cxt.fillStyle = localStorage.fillColor;
	this._cxt.fillRect(this._selection.startX, this._selection.startY,
		this._selection.width, this._selection.height);
	Utils.clearCanvas(this._preCxt);
	document.body.removeChild(this._outline);
	undoStack.addState();
	delete this._selection;
};

/**
 * Drop the current selection and create a duplicate at (0,0).
 */
SelectionTool.prototype.duplicate = function () {
	// Quit if there is no selection to duplicate.
	if (!this._selection) {
		return;
	}
	
	// Stamp the selection at its current location.
	this._saveSelection();
	
	// There is no starting region to cover.
	this._selection.startX = this._preCxt.canvas.width + 10;
	this._selection.startY = this._preCxt.canvas.height + 10;
	// Move the selection to (0,0).
	this._selection.x = 0;
	this._selection.y = 0;
	this._drawSelectionContent();
	this._drawSelectionOutline();
};

/**
 * Select the entire canvas.
 * {Number} width - The width of the canvas
 * {Number} height - The height of the canvas
 */
SelectionTool.prototype.selectAll = function (width, height) {
	this.start({x: 0, y: 0});
	this.move({x: width, y: height});
	this.end({x: width, y: height});
};

/**
 * Update the outline element.
 */
SelectionTool.prototype._updateSelectionOutline = function () {
	if (!this._selection) {
		return;
	}
	
	var zoomedX = Math.floor(zoomManager.level * this._selection.x),
		zoomedY = Math.floor(zoomManager.level * this._selection.y),
		zoomedWidth = Math.ceil(zoomManager.level * this._selection.width),
		zoomedHeight = Math.ceil(zoomManager.level * this._selection.height);
	
	this._outline.style.WebkitTransform =
		this._outline.style.MozTransform =
		this._outline.style.MsTransform =
		this._outline.style.OTransform =
		this._outline.style.transform = 'translate(' + zoomedX + 'px, ' + zoomedY + 'px)';
	this._outline.style.width = zoomedWidth + 'px';
	this._outline.style.height = zoomedHeight + 'px';
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

/**
 * Save the selection to the canvas if it was moved.
 * @returns {Boolean} Whether the selection was saved.
 */
SelectionTool.prototype._saveSelection = function () {
	Utils.clearCanvas(this._preCxt);
	
	if (!this._selection ||
			(this._selection.x === this._selection.startX && this._selection.y === this._selection.startY)) {
		return;
	}
	
	this._drawSelectionContent();
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};
