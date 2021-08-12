'use strict';

/**
 * Create a new SelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function SelectionTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	this._outline = new FloatingRegion();
	
	this._toolbar = toolbar.toolboxes.floatingSelectionToolbar;
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
	
	// Hide the resize handles and selection toolbar while creating/moving.
	this._outline.showHandles = false;
	this._toolbar.hide();
	
	// If a selection exists and the pointer is inside it, drag the selection.
	// Otherwise, start a new selection.
	if (this._selection &&
			Utils.isPointInRect(
				pointerState.x,
				pointerState.y,
				this._selection.x - FloatingRegion.GRABBABLE_MARGIN,
				this._selection.y - FloatingRegion.GRABBABLE_MARGIN,
				this._selection.width + (2 * FloatingRegion.GRABBABLE_MARGIN),
				this._selection.height + (2 * FloatingRegion.GRABBABLE_MARGIN))) {
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
		// Hide resize handles while creating.
		this._outline.showHandles = false;
		this._outline.addToDOM();
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
	
	if (this._selection.pointerOffset) {
		// If there is a pointer offset, move the selection.
		this._selection.x = pointerState.x - this._selection.pointerOffset.x;
		this._selection.y = pointerState.y - this._selection.pointerOffset.y;
	} else {
		// Otherwise, this is a new selection.
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
	
	this._redrawSelection();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
SelectionTool.prototype.end = function (pointerState) {
	this._roundPointerState(pointerState);
	
	this.move(pointerState);
	
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	if (this._selection.pointerOffset) {
		// If there is a pointer offset, the selection was being moved, so just remove the pointer offset.
		delete this._selection.pointerOffset;
	} else {
		// Otherwise, a new selection was created.
		
		if (this._selection.width === 0 || this._selection.height === 0) {
			// If either dimension is zero, the selection is invalid.
			this.deselectAll();
			return;
		}
		
		// Update the start coordinates to the top-left corner.
		this._selection.startX = this._selection.x;
		this._selection.startY = this._selection.y;
		
		// Save the selected content in case the user moves it.
		this._selection.opaqueContent = this._cxt.getImageData(
			this._selection.startX, this._selection.startY,
			this._selection.width, this._selection.height);
		
		// Make the selection transparent if the setting is enabled.
		// This creates `this._selection.content` whether or not transparency is enabled.
		this.setTransparentBackground();
	}
	
	if (this._selection) {
		// Show resize handles and selection toolbar once done creating/moving if there is an active selection.
		this._outline.showHandles = true;
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
	
	// Draw the selection start cover to the main canvas if this is not a duplicate.
	if (this._selection.firstMove) {
		Utils.clearCanvas(this._preCxt);
		this._drawSelectionStartCover();
		this._cxt.drawImage(this._preCxt.canvas, 0, 0);
	}
	Utils.clearCanvas(this._preCxt);
	
	// Delete the selection.
	this._toolbar.hide();
	this._outline.removeFromDOM();
	undoStack.addState();
	delete this._selection;
};

/**
 * Copy the current selection to the clipboard.
 * @returns {Promise} Resolves when the selection has been copied, rejects if the selection is unable to copy
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
		cursorCxt.putImageData(this._selection.opaqueContent, 0, 0);
		
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
	this._selection.firstMove = false;
	
	// Move the selection to (the top-left corner of the visible canvas).
	this._selection.x = Math.floor(window.scrollX / zoomManager.level);
	this._selection.y = Math.floor(window.scrollY / zoomManager.level);
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
	this._outline.removeFromDOM();
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
	
	// Fill in any empty pixels with the background color.
	this._cxt.save();
	this._cxt.globalCompositeOperation = 'destination-over';
	this._cxt.fillStyle = this._selection.fillColor;
	this._cxt.fillRect(0, 0, this._selection.width, this._selection.height);
	this._cxt.restore();
	
	// Save the new state.
	undoStack.addState();
	
	// Clear the selection.
	this.deselectAll();
};

/**
 * Invert the colors of the selection.  If there is no selection, invert the colors of the entire canvas.
 */
SelectionTool.prototype.invertColors = function () {
	if (this._selection) {
		this._preCxt.save();
		cursorCxt.save();
		
		// Copy the selection content to the cursor canvas because you
		// cannot put image data with composite modes.
		Utils.clearCanvas(cursorCxt);
		cursorCanvas.width = this._selection.width;
		cursorCanvas.height = this._selection.height;
		cursorCxt.putImageData(this._selection.opaqueContent, 0, 0);
		
		// Invert the selection on the pre-canvas.
		this._preCxt.putImageData(this._selection.opaqueContent, this._selection.x, this._selection.y);
		this._preCxt.globalCompositeOperation = 'difference';
		this._preCxt.fillStyle = '#ffffff';
		this._preCxt.fillRect(
			this._selection.x, this._selection.y,
			this._selection.width, this._selection.height);
		
		// Re-mask to the shape of the selection.
		this._preCxt.globalCompositeOperation = 'destination-in';
		this._preCxt.drawImage(cursorCanvas, this._selection.x, this._selection.y);
		
		// Set the re-masked image data as the selection content.
		this._selection.opaqueContent = this._preCxt.getImageData(
			this._selection.x, this._selection.y,
			this._selection.width, this._selection.height);
		
		// Reapply background color transparency on the new colors.
		this.setTransparentBackground();
		
		// Note the selection was altered.
		this._selection.transformed = true;
		
		// Restore canvas states.
		this._preCxt.restore();
		cursorCxt.restore();
	} else {
		// Invert the whole canvas.
		this._cxt.save();
		this._cxt.globalCompositeOperation = 'difference';
		this._cxt.fillStyle = '#ffffff';
		this._cxt.fillRect(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
		this._cxt.restore();
		
		// Save the new state.
		undoStack.addState();
	}
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
		cursorCxt.putImageData(this._selection.opaqueContent, 0, 0);
		
		// Flip the pre-canvas and draw the selection to it.
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
		this._selection.opaqueContent = this._preCxt.getImageData(0, 0, this._selection.width, this._selection.height);
		
		// Reapply transparency.
		this.setTransparentBackground();
		
		// Note the selection was flipped.
		this._selection.transformed = true;
		
		// Put the updated selection back in place.
		this._redrawSelection();
		
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
		cursorCxt.putImageData(this._selection.opaqueContent, 0, 0);
		
		// Rotate the pre-canvas and draw the selection to it.
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
		this._selection.opaqueContent = this._preCxt.getImageData(0, 0, this._selection.height, this._selection.width);
		
		// Reapply transparency.
		this.setTransparentBackground();
		
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
 * Move the selection by the amount.  Ignore the nudge if the selection is being dragged.
 * @param {Number} deltaX - The amount to nudge the selection horizontally
 * @param {Number} deltaY - The amount to nudge the selection vertically
 */
SelectionTool.prototype.nudge = function (deltaX, deltaY) {
	if (!this._selection || this._selection.pointerOffset) {
		// Quit if there is no selection, or if there is a pointer offset
		// (indicating the selection is currently being dragged).
		return;
	}
	
	this._selection.x =
		Math.min(this._cxt.canvas.width,
			Math.max(-this._selection.width,
				Math.round(this._selection.x + deltaX)));
	this._selection.y = 
		Math.min(this._cxt.canvas.height,
			Math.max(-this._selection.height,
				Math.round(this._selection.y + deltaY)));
	
	this._redrawSelection();
};

/**
 * Set whether the background color in the selection should be transparent.
 */
SelectionTool.prototype.setTransparentBackground = function () {
	if (!this._selection) {
		return;
	}
	
	var transparencyOn = settings.get('transparentSelection'),
		selectionImageData = Utils.cloneImageData(this._selection.opaqueContent, this._preCxt),
		selectionData = selectionImageData.data;
	
	if (transparencyOn) {
		var bgColor = Utils.colorToRGB(settings.get('fillColor'));
		
		// Check every pixel in the selection.
		for (var i = 0; i < selectionData.length; i += 4) {
			// Check whether the current pixel matches the current background color.
			var colorMatch = (selectionData[i] === bgColor.r &&
					selectionData[i + 1] === bgColor.g &&
					selectionData[i + 2] === bgColor.b);
			
			if (colorMatch) {
				selectionData[i + 3] = 0;
			}
		}
	}
	
	// Save the modified (or unmodified) content as the current content and redraw it.
	this._selection.content = selectionImageData;
	this._redrawSelection();
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
	
	this._outline.x = zoomedX;
	this._outline.y = zoomedY;
	this._outline.width = zoomedWidth;
	this._outline.height = zoomedHeight;
};

/**
 * @private
 * Draw the selected content in its new location and the background color over its former location.
 */
SelectionTool.prototype._drawSelectionContent = function () {
	if (!this._selection || !this._selection.content) {
		return;
	}
	
	this._preCxt.putImageData(this._selection.content, this._selection.x, this._selection.y);
	if (this._selection.firstMove) {
		// If this is not a duplicate, draw the background color over where the selection was taken from.
		this._preCxt.save();
		this._preCxt.globalCompositeOperation = 'destination-over';
		this._drawSelectionStartCover();
		this._preCxt.restore();
	}
};

/**
 * @private
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
 * Redraw the selection and its outline with its current state.
 */
SelectionTool.prototype._redrawSelection = function () {
	Utils.clearCanvas(this._preCxt);
	this._drawSelectionContent();
	this._updateSelectionOutline();
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
