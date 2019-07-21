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
	
	this._toolbar = new FloatingSelectionToolbar(this);
}
// Extend Tool.
SelectionTool.prototype = Object.create(Tool.prototype);
SelectionTool.prototype.constructor = SelectionTool;

/**
 * @override
 * Handle the selection tool becoming the active tool.
 */
SelectionTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	this._updateSelectionOutline(); // Update the outline in case the existing tool is being reactivated.
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.selectToolOptions);
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
SelectionTool.prototype.start = function (pointerState) {
	this._roundPointerState(pointerState);
	
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
			startWidth: 0,
			startHeight: 0,
			width: 0,
			height: 0,
			// The fill color should remain the same for this selection even if the PaintZ fill color changes.
			fillColor: settings.get('fillColor'),
			firstMove: true,
			transformed: false
		};
		this._updateSelectionOutline();
		document.body.appendChild(this._outline);
	}
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.move = function (pointerState) {
	if (!this._selection) {
		return;
	}
	
	this._roundPointerState(pointerState);
	
	// If there is a pointer offset, move the selection.
	// If there is no pointer offset, then this must be a new selection.
	if (this._selection.pointerOffset) {
		this._selection.x = pointerState.x - this._selection.pointerOffset.x;
		this._selection.y = pointerState.y - this._selection.pointerOffset.y;
	} else {
		// Limit the region to the canvas.
		pointerState.x = Utils.constrainValue(pointerState.x, 0, this._cxt.canvas.width);
		pointerState.y = Utils.constrainValue(pointerState.y, 0, this._cxt.canvas.height);
		
		this._selection.startWidth = pointerState.x - this._selection.startX;
		this._selection.startHeight = pointerState.y - this._selection.startY;
		
		// Keep x and y at the top-left corner of the selection.
		if (this._selection.startWidth < 0) {
			this._selection.x = this._selection.startX + this._selection.startWidth;
			this._selection.startWidth = Math.abs(this._selection.startWidth);
		}
		if (this._selection.startHeight < 0) {
			this._selection.y = this._selection.startY + this._selection.startHeight;
			this._selection.startHeight = Math.abs(this._selection.startHeight);
		}
		
		// Perfect square when shift key held.
		if (pointerState.shiftKey) {
			if (this._selection.startWidth < this._selection.startHeight) {
				this._selection.startHeight = this._selection.startWidth;
				if (this._selection.y === pointerState.y) {
					this._selection.y = this._selection.startY - this._selection.startHeight;
				}
			} else {
				this._selection.startWidth = this._selection.startHeight;
				if (this._selection.x === pointerState.x) {
					this._selection.x = this._selection.startX - this._selection.startWidth;
				}
			}
		}
		this._selection.width = this._selection.startWidth;
		this._selection.height = this._selection.startHeight;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
SelectionTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	
	Utils.clearCanvas(this._preCxt);
	
	this._drawSelectionContent();
	this._updateSelectionOutline();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
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
			this.deselectAll();
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
 * @override
 * Clean up when the selection tool is no longer the active tool.
 */
SelectionTool.prototype.deactivate = function () {
	this._saveSelection();
	this.deselectAll();
};


/**
 * Delete the currently selected content.
 */
SelectionTool.prototype.clear = function () {
	// Quit if there is no selection to erase.
	if (!this._selection) {
		return;
	}
	
	this._cxt.fillStyle = this._selection.fillColor;
	this._cxt.fillRect(this._selection.startX, this._selection.startY,
		this._selection.width, this._selection.height);
	Utils.clearCanvas(this._preCxt);
	this._toolbar.hide();
	document.body.removeChild(this._outline);
	undoStack.addState();
	delete this._selection;
};

/**
 * Copy the current selection to the clipboard.
 */
SelectionTool.prototype.copy = function () {
	// Quit if there is no selection to copy.
	if (!this._selection) {
		return;
	}
	
	return new Promise((function (resolve, reject) {
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.width;
		cursorCanvas.height = this._selection.height;
		cursorCxt.putImageData(this._selection.content, 0, 0);
		
		cursorCanvas.toBlob(function (blob) {
			var copySuccess = clipboard.copy(blob);
			if (copySuccess) {
				resolve();
			} else {
				reject();
			}
		}, 'image/png');
	}).bind(this));
};

/**
 * Copy and erase the current selection.
 */
SelectionTool.prototype.cut = function () {
	// Quit if there is no selection to cut.
	if (!this._selection) {
		return;
	}
	
	this.copy()
		.then((function () {
			this.clear();
		}).bind(this));
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
 * @param {Number} width - The width of the canvas
 * @param {Number} height - The height of the canvas
 */
SelectionTool.prototype.selectAll = function (width, height) {
	this.start({x: 0, y: 0});
	this.move({x: width, y: height});
	this.end({x: width, y: height});
	this._updateSelectionOutline();
};

/**
 * Deselect whatever is currently selected.
 */
SelectionTool.prototype.deselectAll = function () {
	if (this._selection) {
		delete this._selection;
	}
	Utils.clearCanvas(this._preCxt);
	this._toolbar.hide();
	if (document.body.contains(this._outline)) {
		document.body.removeChild(this._outline);
	}
};

/**
 * Crop the image to only contain the current selection.
 */
SelectionTool.prototype.cropToSelection = function () {
	if (!this._selection) {
		// If there is no selection to crop to, then just quit.
		return;
	}
	
	// Resize the main canvas to the selection size and draw the selection to it.
	settings.set('width', this._selection.width);
	settings.set('height', this._selection.height);
	this._cxt.putImageData(this._selection.content, 0, 0);
	
	// Save the new state.
	undoStack.addState();
	
	// Clear the selection.
	this.deselectAll();
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
		
		// Note that the selection was flipped.
		this._selection.transformed = true;
		
		// Put the updated selection back in place.
		Utils.clearCanvas(this._preCxt);
		this._drawSelectionContent();
		this._updateSelectionOutline();
		
	} else {
		// If there is no selection, flip the main canvas, and draw it to itself.
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
 * Rotate the selection about its center.  If there is no selection, rotate the entire canvas.
 * @param {Boolean} clockwise - True if clockwise, false if counterclockwise
 */
SelectionTool.prototype.rotate = function (clockwise) {
	if (this._selection) {
		// Copy the selection to the cursor canvas.
		// The data needs to be put in a canvas because putImageData ignores transformations.
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.width;
		cursorCanvas.height = this._selection.height;
		cursorCxt.putImageData(this._selection.content, 0, 0);
		
		// Rotate the precanvas and draw the selection to it.
		this._preCxt.canvas.width =
			this._preCxt.canvas.height = Math.max(this._selection.width, this._selection.height);
		this._preCxt.save();
		this._preCxt.translate(
			this._selection.height / 2,
			this._selection.width / 2);
		this._preCxt.rotate(
			(clockwise ? 0.25 : -0.25) * Math.TAU);
		this._preCxt.drawImage(
			cursorCanvas,
			-this._selection.width / 2,
			-this._selection.height / 2);
		this._preCxt.restore();
		
		// Save that as the new selection.
		this._selection.content = this._preCxt.getImageData(0, 0, this._selection.height, this._selection.width);
		
		// Update the selection's width and height, and note that the selection was flipped.
		var oldSelectionWidth = this._selection.width;
		this._selection.width = this._selection.height;
		this._selection.height = oldSelectionWidth;
		this._selection.transformed = true;
		
		// Put the updated selection back in place.
		this._preCxt.canvas.width = this._cxt.canvas.width;
		this._preCxt.canvas.height = this._cxt.canvas.height;
		this._drawSelectionContent();
		this._updateSelectionOutline();
		
	} else {
		// If there is no selection, rotate the entire canvas.
		this._preCxt.canvas.width =
			this._preCxt.canvas.height = Math.max(this._cxt.canvas.width, this._cxt.canvas.height);
		this._preCxt.save();
		this._preCxt.translate(
			this._cxt.canvas.height / 2,
			this._cxt.canvas.width / 2);
		this._preCxt.rotate(
			(clockwise ? 0.25 : -0.25) * Math.TAU);
		this._preCxt.drawImage(
			this._cxt.canvas,
			-this._cxt.canvas.width / 2,
			-this._cxt.canvas.height / 2);
		this._preCxt.restore();
		
		// Update the canvas's width and height.
		var oldCanvasWidth = this._cxt.canvas.width,
			oldCanvasHeight = this._cxt.canvas.height;
		this._cxt.canvas.width = oldCanvasHeight;
		this._cxt.canvas.height = oldCanvasWidth;
		
		// Draw the rotated image and save it as a new undo state.
		this._cxt.drawImage(this._preCxt.canvas, 0, 0);
		undoStack.addState();
		
		// Save the new width and height.
		settings.set('width', oldCanvasHeight);
		settings.set('height', oldCanvasWidth);
	}
};

/**
 * @private
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
 * @private
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
	this._preCxt.fillStyle = this._selection.fillColor;
	this._preCxt.fillRect(
		this._selection.startX, this._selection.startY,
		this._selection.startWidth, this._selection.startHeight);
};

/**
 * @private
 * Save the selection to the canvas if it was moved.
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
