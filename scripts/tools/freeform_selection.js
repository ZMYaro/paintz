'use strict';

/**
 * Create a new FreeformSelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function FreeformSelectionTool(cxt, preCxt) {
	SelectionTool.call(this, cxt, preCxt);
}
// Extend SelectionTool.
FreeformSelectionTool.prototype = Object.create(SelectionTool.prototype);
FreeformSelectionTool.prototype.constructor = FreeformSelectionTool;

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FreeformSelectionTool.prototype.start = function (pointerState) {
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.start.call(this, pointerState);
		return;
	}
	
	// If nothing is being dragged, start a new selection.
	
	this._roundPointerState(pointerState);
	
	// Hide the selection toolbar while creating.
	this._toolbar.hide();
	
	// Save any existing selection...
	this._saveSelection();
	// ...and start the new selection.
	this._selection = {
		minX: pointerState.x,
		minY: pointerState.y,
		maxX: pointerState.x,
		maxY: pointerState.y,
		points: [
			{
				x: pointerState.x,
				y: pointerState.y
			}
		],
		initial: {},
		content: {},
		// The fill color should remain the same for this selection even if the PaintZ fill color changes.
		fillColor: settings.get('fillColor'),
		firstMove: true,
		transformed: false
	};
};

/**
 * @override
 * Update the selection region the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
FreeformSelectionTool.prototype.move = function (pointerState) {
	if (!this._selection) {
		return;
	}
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.move.call(this, pointerState);
		return;
	}
	
	// If nothing is being dragged, this is a new selection.
	
	this._roundPointerState(pointerState);
	
	// Limit the region to the canvas.
	pointerState.x = Utils.constrainValue(pointerState.x, 0, this._cxt.canvas.width);
	pointerState.y = Utils.constrainValue(pointerState.y, 0, this._cxt.canvas.height);
	
	this._selection.points.push({
		x: pointerState.x,
		y: pointerState.y
	});
	
	if (pointerState.x < this._selection.minX) {
		this._selection.minX = pointerState.x;
	}
	if (pointerState.y < this._selection.minY) {
		this._selection.minY = pointerState.y;
	}
	if (pointerState.x > this._selection.maxX) {
		this._selection.maxX = pointerState.x;
	}
	if (pointerState.y > this._selection.maxY) {
		this._selection.maxY = pointerState.y;
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
FreeformSelectionTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	if (!this._selection) {
		return;
	}
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.update.call(this);
		return;
	}
	
	// If nothing is being dragged, this is a new selection.
	
	this._preCxt.save();
	// Draw the outline.
	this._preCxt.lineWidth = 1;
	this._preCxt.lineJoin = 'round';
	this._createSelectionPath(this._preCxt, this._selection.points);
	this._preCxt.stroke();
	this._preCxt.closePath();
	
	// Create a color-inverted copy of the existing drawing.
	cursorCxt.save();
	cursorCanvas.width = this._cxt.canvas.width;
	cursorCanvas.height = this._cxt.canvas.height;
	cursorCxt.drawImage(this._cxt.canvas, 0, 0);
	cursorCxt.globalCompositeOperation = 'difference';
	cursorCxt.fillStyle = 'white'; // Filling with white with “difference” blending mode inverts colors.
	cursorCxt.fillRect(0, 0, cursorCanvas.width, cursorCanvas.height);
	cursorCxt.restore();
	
	// Fill in the line with the inverted drawing.
	this._preCxt.globalCompositeOperation = 'source-in';
	this._preCxt.drawImage(cursorCanvas, 0, 0);
	
	this._preCxt.restore();
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
FreeformSelectionTool.prototype.end = function (pointerState) {
	if (!this._selection) {
		return;
	}
	if (this._outline.drag) {
		// If dragging, behavior is the same as a rectangular selection.
		SelectionTool.prototype.end.call(this, pointerState);
		return;
	}
	
	// If nothing was being dragged, a new selection was created.
	
	this._roundPointerState(pointerState);
	
	this.move(pointerState);
	
	if (this._selection.points.length < 3) {
		// If there are < 3 points, the selection is invalid.
		this.deselectAll();
		return;
	}
	
	// Update the coordinates to the top-left corner of the selection region.
	this._selection.initial.x =
		this._selection.content.x = this._selection.minX;
	this._selection.initial.y =
		this._selection.content.y = this._selection.minY;
	this._selection.initial.width =
		this._selection.content.width = this._selection.maxX - this._selection.minX;
	this._selection.initial.height = 
		this._selection.content.height = this._selection.maxY - this._selection.minY;
	
	if (this._selection.content.width === 0 || this._selection.content.height === 0) {
		// If either dimension of the bounding box is zero, the selection is invalid.
		this.deselectAll();
		return;
	}
	
	// Get the image data within the selections bounding rectangle.
	var unmaskedSelectionContent = this._cxt.getImageData(
		this._selection.content.x, this._selection.content.y,
		this._selection.content.width, this._selection.content.height);
	
	// Save the selected content using the selection start cover function to cut it to the freeform shape.
	this._selection.content.opaqueData = this._maskToSelectionPath(unmaskedSelectionContent);
	
	// Make the selection transparent if the setting is enabled.
	// This creates `this._selection.content.data` whether or not transparency is enabled.
	this.setTransparentBackground();
	
	// Redraw the selection one last time.
	this.redrawSelection();
	
	// Add the outline.
	this._updateSelectionUI();
	this._outline.addToDOM();
	
	// Show resize handles and selection toolbar once done creating.
	this._toolbar.show();
};

/**
 * @override
 * @private
 * Draw the background color over the selection's starting location.
 */
FreeformSelectionTool.prototype._drawSelectionStartCover = function () {
	this._preCxt.fillStyle = this._selection.fillColor;
	this._createSelectionPath(this._preCxt, this._selection.points);
	this._preCxt.closePath();
	this._preCxt.fill();
};

/**
 * @private
 * Create a path in the canvas using the given points.
 * @param {CanvasRenderingContext2D} cxt - The canvas context to create the path in
 * @param {Array<Object>} points - The list of points
 */
FreeformSelectionTool.prototype._createSelectionPath = function (cxt, points) {
	cxt.beginPath();
	cxt.moveTo(points[0].x, points[0].y);
	points.forEach(function (point) {
		cxt.lineTo(point.x, point.y);
	});	
};

/**
 * @private
 * Create the masked version of the selection content using the saved selection path.
 * @param {ImageData} imageData - The image data to mask
 * @returns {ImageData} The image data masked to the selection region
 */
FreeformSelectionTool.prototype._maskToSelectionPath = function (imageData) {
	Utils.clearCanvas(this._preCxt);
	this._preCxt.save();
	// Put the unmasked image data in the canvas.
	this._preCxt.putImageData(imageData, this._selection.initial.x, this._selection.initial.y);
	// Draw the selection shape with destination-in mode to remove all image data outside it.
	this._preCxt.globalCompositeOperation = 'destination-in';
	this._drawSelectionStartCover();
	this._preCxt.restore();
	
	// Grab the selection region from the canvas now that it has been masked.
	return this._preCxt.getImageData(
		this._selection.initial.x, this._selection.initial.y,
		this._selection.content.width, this._selection.content.height);
}
