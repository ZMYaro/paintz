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
	this._textElem.style.lineHeight = this.LINE_HEIGHT;
	this._textElem.style.WebkitTransformOrigin =
		this._textElem.style.MozTransformOrigin =
		this._textElem.style.MsTransformOrigin =
		this._textElem.style.OTransformOrigin =
		this._textElem.style.transformOrigin = '0 0';
	this._textElem.style.padding = TextTool.PADDING + 'px';
	
	this._textElem.onblur = this._removeTextElem.bind(this);
	this._textElem.addEventListener('keydown', this._handleKeyDown.bind(this), false);
}
// Extend Tool.
TextTool.prototype = Object.create(Tool.prototype);
TextTool.prototype.constructor = TextTool;

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

/**
 * @override
 * Handle the selection tool becoming the active tool.
 */
TextTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.textToolOptions);
	this._textElem.style.color = settings.get('lineColor');
	this._textElem.style.font = settings.get('fontSize') + 'px sans-serif';
	this._textElem.style.WebkitTransform =
		this._textElem.style.MozTransform =
		this._textElem.style.MsTransform =
		this._textElem.style.OTransform =
		this._textElem.style.transform = 'scale(' + zoomManager.level + ')';
};

/**
 * @override
 * Handle the tool being activated by a pointer.
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
		if (!document.body.contains(this._textElem)) {
			document.body.appendChild(this._textElem);
		}
	}
	this._textElem.style.pointerEvents = null;
	
	// Strip formatting on paste, if possible.
	this._pasting = false;
	var that = this;
	this._textElem.addEventListener('paste', function (e) {
		// Prevent recursion.
		if (!that._pasting) {
			if (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
				that._pasting = true;
				e.preventDefault();
				var pastedText = e.originalEvent.clipboardData.getData('text/plain');
				document.execCommand('insertText', false, pastedText);
			} else if (e.clipboardData && e.clipboardData.getData) {
				that._pasting = true;
				e.preventDefault();
				var pastedText = e.clipboardData.getData('text/plain');
				document.execCommand('insertText', false, pastedText);
			} else if (window.clipboardData && window.clipboardData.getData) {
				that._pasting = true;
				e.preventDefault();
				window.document.execCommand('ms-pasteTextOnly', false);
			}
		}
		that.pasting = false;
	}, false);
	
	keyManager.disableAppShortcuts();
};

/**
 * @override
 * Update the tool as the cursor moves.
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
		// Limit the region to the canvas.
		pointerState.x = Math.max(0, Math.min(this._cxt.canvas.width, pointerState.x));
		pointerState.y = Math.max(0, Math.min(this._cxt.canvas.height, pointerState.y));
		
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
 * @override
 * Handle the pointer being released.
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
			this._removeTextElem();
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
 * @override
 * Clean up when the text tool is no longer the active tool.
 */
TextTool.prototype.deactivate = function () {
	this._removeTextElem();
};

/**
 * @private
 * Generate the CSS font value based on the saved options.
 */
TextTool.prototype._getFontValue = function () {
	return (settings.get('italic') ? 'italic ' : '') +
		(settings.get('bold') ? 'bold ' : '') +
		settings.get('fontSize') + 'pt ' +
		settings.get('fontFamily');
};

/**
 * @private
 * Update the text box element with the correct size and other properties.
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
	
	this._textElem.style.font = this._getFontValue();
};

/**
 * @private
 * Remove the text box element.
 */
TextTool.prototype._removeTextElem = function () {
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
};

/**
 * @private
 * Save the selection to the canvas if it was moved.
 * @returns {Boolean} Whether the selection was saved.
 */
TextTool.prototype._saveText = function () {
	if (!this._textRegion || this._textElem.innerHTML === '') {
		return;
	}
	
	// Set text settings.
	this._cxt.textBaseline = 'top';
	this._cxt.fillStyle = settings.get('lineColor');
	this._cxt.font = this._getFontValue();
	
	// Locate line breaks.
	var chars = (this._textElem.innerText || this._textElem.textContent).split(''),
		line = '',
		lines = [],
		maxWidth = this._textRegion.width - (2 * TextTool.PADDING) - TextTool.BORDER_WIDTH;
	
	for (var i = 0; i < chars.length; i++) {
		// Break on line breaks.
		if (chars[i] === '\n') {
			lines.push(line);
			line = '';
			continue;
		}
		if (Math.ceil(cxt.measureText(line + chars[i]).width) > maxWidth) {
			// If the line has exceeded the text box width...
			var lastSpaceIndex = line.lastIndexOf(' ');
			if (lastSpaceIndex === -1) {
				// If there are no spaces, break at this character.
				lines.push(line);
				line = chars[i];
				continue;
			} else {
				// If there is a space, break at the last space.
				line += chars[i];
				lines.push(line.substring(0, lastSpaceIndex));
				line = line.substring(lastSpaceIndex + 1);
				continue;
			}
		}
		line += chars[i];
	}
	lines.push(line); // Include any remaining line.
	
	// Draw the text.
	for (var i = 0; i < lines.length; i++) {
		var x = this._textRegion.x + TextTool.PADDING + TextTool.BORDER_WIDTH,
			y = this._textRegion.y + TextTool.PADDING + TextTool.BORDER_WIDTH + ((settings.get('fontSize') * 1.525) * i);
		this._cxt.fillText(lines[i], x, y);
	}
	Utils.clearCanvas(this._preCxt);
	undoStack.addState();
};

/**
 * @private
 * Handle keyboard shortcuts within the text box.
 * @param {KeyboardEvent} e
 */
TextTool.prototype._handleKeyDown = function (e) {
	// Use Command on Mac and iOS devices and Ctrl everywhere else.
	var ctrlOrCmd = Utils.checkPlatformCtrlKey(e),
		noModifiers = !Utils.checkModifierKeys(e);
	
	switch (e.keyCode) {
		case 27: // Esc
			if (noModifiers) {
				e.preventDefault();
				// Esc => Cancel text box
				
				// Clear the text box, then remove it.
				this._textElem.innerHTML = '';
				this._removeTextElem();
			}
			break;
		
		case 66: // B
			if (ctrlOrCmd) {
				e.preventDefault();
				// Ctrl+B => Bold
				
				// Update the toolbar toggle.
				toolbar.toolboxes.textToolOptions.boldToggle.checked =
					!toolbar.toolboxes.textToolOptions.boldToggle.checked;
				settings.set('bold', toolbar.toolboxes.textToolOptions.boldToggle.checked);
				
				// Update the text box's CSS.
				this._textElem.style.font = this._getFontValue();
			}
			break;
		
		case 73: // I
			if (ctrlOrCmd) {
				e.preventDefault();
				// Ctrl+I => Italic
				
				// Update the toolbar toggle.
				toolbar.toolboxes.textToolOptions.italicToggle.checked =
					!toolbar.toolboxes.textToolOptions.italicToggle.checked;
				settings.set('italic', toolbar.toolboxes.textToolOptions.italicToggle.checked);
				
				// Update the text box's CSS.
				this._textElem.style.font = this._getFontValue();
			}
			break;
	}
};
