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
	
	this._toolbar = new FloatingSelectionToolbar();
}

SelectionTool.prototype = Object.create(Tool.prototype);

/**
 * Handle the selection tool becoming the active tool.
 * @override
 */
SelectionTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.selectToolOptions);
};

/**
 * Handle the tool being activated by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
SelectionTool.prototype.start = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	// Hide the selection toolbar.
	this._toolbar.hide();
	
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
		if (pointerState.ctrlKey) {
			// If the Ctrl key is pressed, save a copy of the selection.
			this._saveSelection();
			this._selection.firstMove = false;
		}
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
			height: 0,
			firstMove: true,
			transformed: false
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
		// Limit the region to the canvas.
		pointerState.x = Math.max(0, Math.min(this._cxt.canvas.width, pointerState.x));
		pointerState.y = Math.max(0, Math.min(this._cxt.canvas.height, pointerState.y));
		
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
		this._selection.content = this._cxt.getImageData(
			this._selection.startX, this._selection.startY,
			this._selection.width, this._selection.height);
	}
	
	// Show the selection toolbar if there is an active selection.
	if (this._selection) {
		this._toolbar.show();
	}
};

/**
 * Clean up when the selection tool is no longer the active tool.
 * @override
 */
SelectionTool.prototype.deactivate = function () {
	this._saveSelection();
	this._toolbar.hide();
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
	
	this._cxt.fillStyle = settings.get('fillColor');
	this._cxt.fillRect(this._selection.startX, this._selection.startY,
		this._selection.width, this._selection.height);
	Utils.clearCanvas(this._preCxt);
	this._toolbar.hide();
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
	this._updateSelectionOutline();
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
 * Flip the selection over its center.  If there is no selection, flip the entire canvas.
 * @param {Boolean} vertical - True if vertical, false if horizontal
 */
SelectionTool.prototype.flip = function (vertical) {
	if (this._selection) {
		// Copy the selection to the cursor canvas.
		// The data needs to be put in a canvas because putImageData ignores transformations.
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.width;
		cursorCanvas.height = this._selection.height;
		cursorCxt.putImageData(this._selection.content, 0, 0);
		
		// Flip the precanvas and draw the selection to it.
		Utils.clearCanvas(this._preCxt);
		this._preCxt.save();
		this._preCxt.translate(
			vertical ? 0 : this._selection.width,
			vertical ? this._selection.height : 0);
		this._preCxt.scale(
			vertical ? 1 : -1,
			vertical ? -1 : 1);
		this._preCxt.drawImage(cursorCanvas, 0, 0);
		this._preCxt.restore();
		
		// Save that as the new selection.
		this._selection.content = this._preCxt.getImageData(0, 0, this._selection.width, this._selection.height);
		
		// Put the updated selection back in place.
		Utils.clearCanvas(this._preCxt);
		this._drawSelectionContent();
		this._updateSelectionOutline();
		
		// Note that the selection was flipped.
		this._selection.transformed = true;
		
	} else {
		// If there is no selection, flip the main canvas and draw it to itself.
		this._cxt.save();
		this._cxt.translate(
			vertical ? 0 : this._cxt.canvas.width,
			vertical ? this._cxt.canvas.height : 0);
		this._cxt.scale(
			vertical ? 1 : -1,
			vertical ? -1 : 1);
		this._cxt.drawImage(this._cxt.canvas, 0, 0);
		this._cxt.restore();
		// Save the flipped image as a new undo state.
		undoStack.addState();
	}
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
	
	this._toolbar.x = Math.max(-8, zoomedX + 8);
	this._toolbar.y = Math.max(-56, zoomedY - 52);
	
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
	
	if (this._selection.firstMove) {
		this._drawSelectionStartCover();
	}
	this._preCxt.putImageData(this._selection.content, this._selection.x, this._selection.y);
};

/**
 * Draw the background color over the selection's starting location.
 */
SelectionTool.prototype._drawSelectionStartCover = function () {
	this._preCxt.fillStyle = settings.get('fillColor');
	this._preCxt.fillRect(this._selection.startX, this._selection.startY,
		this._selection.width, this._selection.height);
};

/**
 * Save the selection to the canvas if it was moved.
 * @returns {Boolean} Whether the selection was saved.
 */
SelectionTool.prototype._saveSelection = function () {
	Utils.clearCanvas(this._preCxt);
	
	// If there is no selection or the selection was never transformed, then there is no need to save.
	if (!this._selection ||
			(!this._selection.transformed &&
				(this._selection.x === this._selection.startX && this._selection.y === this._selection.startY))) {
		return;
	}
	
	this._drawSelectionContent();
	this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};
