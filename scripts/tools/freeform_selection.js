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
	this._roundPointerState(pointerState);
	
	// Hide the selection toolbar.
	this._toolbar.hide();
	
	// If a selection exists and the pointer is inside it, drag the selection.
	// Otherwise, start a new selection.
	if (this._selection &&
			Utils.isPointInRect(pointerState.x, pointerState.y,
				this._selection.x, this._selection.y,
				this._selection.width, this._selection.height)) {
		SelectionTool.prototype.start.call(this, pointerState);
	} else {
		// Save any existing selection.
		this._saveSelection();
		// Start a new selection.
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
			// The fill color should remain the same for this selection even if the PaintZ fill color changes.
			fillColor: settings.get('fillColor'),
			firstMove: true,
			transformed: false
		};
	}
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
	
	if (this._selection.pointerOffset) {
		SelectionTool.prototype.update.call(this);
	} else {
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
	}
	
	this._canvasDirty = false;
};

/**
 * @override
 * Handle the pointer being released.
 * @param {Object} pointerState - The pointer coordinates
 */
FreeformSelectionTool.prototype.end = function (pointerState) {
	this._roundPointerState(pointerState);
	
	this.move(pointerState);
	
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	// If there is a pointer offset, remove it.
	// If a new selection was created, ensure it is valid.
	if (this._selection.pointerOffset) {
		delete this._selection.pointerOffset;
	} else {
		// If there are < 3 points, the selection is invalid.
		if (this._selection.points.length < 3) {
			this.deselectAll();
			return;
		}
		
		// Update the coordinates to the top-left corner of the selection region.
		this._selection.startX =
			this._selection.x = this._selection.minX;
		this._selection.startY =
			this._selection.y = this._selection.minY;
		this._selection.width = this._selection.maxX - this._selection.minX;
		this._selection.height = this._selection.maxY - this._selection.minY;
		
		// If either dimension is zero, the selection is invalid.
		if (this._selection.width === 0 || this._selection.height === 0) {
			this.deselectAll();
			return;
		}
		
		// Get the image data within the selections bounding rectangle.
		var unmaskedSelectionContent = this._cxt.getImageData(
			this._selection.startX, this._selection.startY,
			this._selection.width, this._selection.height);
		
		// Save the selected content using the selection start cover function to cut it to the freeform shape.
		this._selection.opaqueContent = this._maskToSelectionPath(unmaskedSelectionContent);
		
		// Make the selection transparent if the setting is enabled.
		// This creates _selection.content whether or not transparency is enabled.
		this.setTransparentBackground();
		
		// Add the outline.
		this._updateSelectionOutline();
		document.body.appendChild(this._outline);
	}
	
	// Show the selection toolbar if there is an active selection.
	if (this._selection) {
		this._toolbar.show();
	}
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
	this._preCxt.putImageData(imageData, this._selection.startX, this._selection.startY);
	// Draw the selection shape with destination-in mode to remove all image data outside it.
	this._preCxt.globalCompositeOperation = 'destination-in';
	this._drawSelectionStartCover();
	this._preCxt.restore();
	
	// Grab the selection region from the canvas now that it has been masked.
	return this._preCxt.getImageData(
		this._selection.startX, this._selection.startY,
		this._selection.width, this._selection.height);
}
