'use strict';

/**
 * Create a new TextTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function TextTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	
	// Initialize text box element.
	this._textElem = document.createElement('p');
	this._textElem.contentEditable = true;
	this._textElem.className = 'floatingRegion';
	this._textElem.style.lineHeight = '100%';
	this._textElem.style.WebkitTransformOrigin =
		this._textElem.style.MozTransformOrigin =
		this._textElem.style.MsTransformOrigin =
		this._textElem.style.OTransformOrigin =
		this._textElem.style.transformOrigin = '0 0';
	this._textElem.style.padding = TextTool.PADDING + 'px';
	
	this._textElem.onblur = (function () {
		// Save any existing text.
		this._saveText();
		// Remove the text region and element.
		delete this._textRegion;
		if (document.body.contains(this._textElem)) {
			try {
				// Wrapping in a try block because sometimes contains incorrectly returns true.
				document.body.removeChild(this._textElem);
			} catch (ex) {}

		}
		keyManager.enableAppShortcuts();
	}).bind(this);
}

/** {Number} How close one has to click to grab the text box */
TextTool.GRABBABLE_MARGIN = 4;
/** {Number} The minimum viable text box width/height */
TextTool.MIN_SIZE = 7;
/** {Number} The padding on the text box */
TextTool.PADDING = 4;
/** {Number} The border width on the text box */
TextTool.BORDER_WIDTH = 1;
/** {Number} The line height of the text box */
TextTool.LINE_HEIGHT = 1;

TextTool.prototype = Object.create(Tool.prototype);

/**
 * Handle the selection tool becoming the active tool.
 * @override
 */
TextTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	this._textElem.style.color = localStorage.lineColor;
	this._textElem.style.font = localStorage.fontSize + 'px sans-serif';
	this._textElem.style.WebkitTransform =
		this._textElem.style.MozTransform =
		this._textElem.style.MsTransform =
		this._textElem.style.OTransform =
		this._textElem.style.transform = 'scale(' + zoomManager.level + ')';
};

/**
 * Handle the tool being activated by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
TextTool.prototype.start = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	// If a text box exists and the pointer is near it, drag the text box.
	// Otherwise, start a new text box.
	if (this._textRegion &&
			Utils.isPointInRect(pointerState.x,
				pointerState.y,
				this._textRegion.x - TextTool.GRABBABLE_MARGIN,
				this._textRegion.y - TextTool.GRABBABLE_MARGIN,
				this._textRegion.width + (2 * TextTool.GRABBABLE_MARGIN),
				this._textRegion.height + (2 * TextTool.GRABBABLE_MARGIN))) {
		this._textRegion.pointerOffset = {
			x: pointerState.x - this._textRegion.x,
			y: pointerState.y - this._textRegion.y
		};
		this._preCxt.canvas.style.cursor =
			this._textElem.style.cursor = 'move';
	} else {
		// Save any existing text.
		this._saveText();
		// Start a new text box.
		this._textRegion = {
			startX: pointerState.x,
			startY: pointerState.y,
			x: pointerState.x,
			y: pointerState.y,
			width: 0,
			height: 0
		};
		this._textElem.innerHTML = '';
		this._updateTextElem();
		document.body.appendChild(this._textElem);
	}
	this._textElem.style.pointerEvents = null;
	keyManager.disableAppShortcuts();
};

/**
 * Update the tool as the cursor moves.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
TextTool.prototype.move = function (pointerState) {
	if (!this._textRegion) {
		return;
	}
	
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	Utils.clearCanvas(this._preCxt);
	
	// If there is no pointer offset, then this must be a new text region.
	if (this._textRegion.pointerOffset) {
		this._textRegion.x = pointerState.x - this._textRegion.pointerOffset.x;
		this._textRegion.y = pointerState.y - this._textRegion.pointerOffset.y;
		this._updateTextElem();
	} else {
		this._textRegion.width = pointerState.x - this._textRegion.startX;
		this._textRegion.height = pointerState.y - this._textRegion.startY;
		
		// Keep x and y at the top-left corner.
		if (this._textRegion.width < 0) {
			this._textRegion.x = this._textRegion.startX + this._textRegion.width;
			this._textRegion.width = Math.abs(this._textRegion.width);
		}
		if (this._textRegion.height < 0) {
			this._textRegion.y = this._textRegion.startY + this._textRegion.height;
			this._textRegion.height = Math.abs(this._textRegion.height);
		}
		this._updateTextElem();
	}
};

/**
 * Handle the pointer being released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
TextTool.prototype.end = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	this.move(pointerState);
	this._textElem.style.pointerEvents = 'auto';
	this._textElem.style.cursor = null;
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	// If a new text region was created, ensure the dimensions are valid values.
	if (this._textRegion && !this._textRegion.pointerOffset) {
		// If either dimension is zero, the region is invalid.
		if (this._textRegion.width < TextTool.MIN_SIZE || this._textRegion.height < TextTool.MIN_SIZE) {
			delete this._textRegion;
			Utils.clearCanvas(this._preCxt);
			if (document.body.contains(this._textElem)) {
				try {
					// Wrapping in a try block because sometimes contains incorrectly returns true.
					document.body.removeChild(this._textElem);
				} catch (ex) {}
			}
			keyManager.enableAppShortcuts();
			return;
		}
		
		// Update the start coordinates to the top-left corner.
		this._textRegion.startX = this._textRegion.x;
		this._textRegion.startY = this._textRegion.y;
		
		// Focus the text box.
		this._textElem.focus();
	}
};

/**
 * Clean up when the text tool is no longer the active tool.
 * @override
 */
TextTool.prototype.deactivate = function () {
	this._saveText();
	if (document.body.contains(this._textElem)) {
		document.body.removeChild(this._textElem);
	}
	keyManager.enableAppShortcuts();
	delete this._textRegion;
};

/**
 * Update the textarea element.
 */
TextTool.prototype._updateTextElem = function () {
	if (!this._textRegion) {
		return;
	}
	
	var zoomedX = Math.floor(zoomManager.level * this._textRegion.x),
		zoomedY = Math.floor(zoomManager.level * this._textRegion.y),
		zoomedWidth = Math.ceil(zoomManager.level * this._textRegion.width),
		zoomedHeight = Math.ceil(zoomManager.level * this._textRegion.height);
	
	this._textElem.style.WebkitTransform =
		this._textElem.style.MozTransform =
		this._textElem.style.MsTransform =
		this._textElem.style.OTransform =
		this._textElem.style.transform = 'translate(' + zoomedX + 'px, ' + zoomedY + 'px) ' +
			'scale(' + zoomManager.level + ')';
	this._textElem.style.width = this._textRegion.width + 'px';
	this._textElem.style.height = this._textRegion.height + 'px';
};

/**
 * Save the selection to the canvas if it was moved.
 * @returns {Boolean} Whether the selection was saved.
 */
TextTool.prototype._saveText = function () {
	if (!this._textRegion || this._textElem.innerHTML === '') {
		return;
	}
	
	// Locate line breaks.
	var words = (this._textElem.innerText || this.textElem.textContent).split(' '),
		line = '',
		lines = [],
		maxWidth = this._textRegion.width - (2 * TextTool.PADDING) - (2 * TextTool.BORDER_WIDTH);
	
	for (var i = 0; i < words.length; i++) {
		if (Math.ceil(cxt.measureText(line + words[i]).width) > maxWidth) {
			lines.push(line);
			line = '';
		}
		line += words[i] + ' ';
	}
	lines.push(line); // Include any remaining line.
	
	// Draw the text.
	this._cxt.textBaseline = 'top';
	this._cxt.fillStyle = localStorage.lineColor;
	this._cxt.font = localStorage.fontSize + 'px sans-serif';
	for (var i = 0; i < lines.length; i++) {
		var x = this._textRegion.x + TextTool.PADDING + TextTool.BORDER_WIDTH,
			y = this._textRegion.y + TextTool.PADDING + TextTool.BORDER_WIDTH + (localStorage.fontSize * i);
		this._cxt.fillText(lines[i], x, y);
	}
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};
