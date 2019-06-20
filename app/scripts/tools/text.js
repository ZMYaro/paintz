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
	this._textElem.style.lineHeight = TextTool.LINE_HEIGHT;
	this._textElem.style.WebkitTransformOrigin =
		this._textElem.style.MozTransformOrigin =
		this._textElem.style.MsTransformOrigin =
		this._textElem.style.OTransformOrigin =
		this._textElem.style.transformOrigin = '0 0';
	this._textElem.style.padding = TextTool.PADDING + 'px';
	
	// Prevent the element scrolling if it overflows.
	this._textElem.onscroll = function () { this.scrollTop = 0; };
	
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
	this._roundPointerState(pointerState);
	
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
	
	this._roundPointerState(pointerState);
	
	Utils.clearCanvas(this._preCxt);
	
	// If there is no pointer offset, then this must be a new text region.
	if (this._textRegion.pointerOffset) {
		this._textRegion.x = pointerState.x - this._textRegion.pointerOffset.x;
		this._textRegion.y = pointerState.y - this._textRegion.pointerOffset.y;
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
		
		// Perfect square when shift key held.
		if (pointerState.shiftKey) {
			if (this._textRegion.width < this._textRegion.height) {
				this._textRegion.height = this._textRegion.width;
				if (this._textRegion.y === pointerState.y) {
					this._textRegion.y = this._textRegion.startY - this._textRegion.height;
				}
			} else {
				this._textRegion.width = this._textRegion.height;
				if (this._textRegion.x === pointerState.x) {
					this._textRegion.x = this._textRegion.startX - this._textRegion.width;
				}
			}
		}
	}
	
	this._canvasDirty = true;
};

/**
 * @override
 * Update the canvas if necessary.
 */
TextTool.prototype.update = function () {
	if (!this._canvasDirty) {
		return;
	}
	
	this._updateTextElem();
	
	this._canvasDirty = false;
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
 * Generate the CSS background value based on the saved options.
 */
TextTool.prototype._getBackgroundValue = function () {
	return (settings.get('textFill') ? settings.get('fillColor') : 'transparent');
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
 * Generate the CSS text-decoration value based on the saved options.
 */
TextTool.prototype._getTextDecorationValue = function () {
	return (settings.get('underline') ? 'underline ' : '') +
		(settings.get('strike') ? 'line-through ' : '');
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
	
	this._textElem.style.background = this._getBackgroundValue();
	this._textElem.style.font = this._getFontValue();
	this._textElem.style.textDecoration = this._getTextDecorationValue();
};

/**
 * @private
 * Remove the text box element.
 */
TextTool.prototype._removeTextElem = function () {
	// Save any existing text.
	this._saveText().then((function () {
		// Remove the text region and element.
		delete this._textRegion;
		if (document.body.contains(this._textElem)) {
			try {
				// Wrapping in a try block because sometimes contains incorrectly returns true.
				document.body.removeChild(this._textElem);
			} catch (err) {}
		}
		keyManager.enableAppShortcuts();
	}).bind(this));
};

/**
 * @private
 * Save the text to the canvas.
 * @returns {Promise<Boolean>} Resolves with whether the text was saved.
 */
TextTool.prototype._saveText = function () {
	return new Promise((function (resolve, reject) {
		if (!this._textRegion || this._textElem.innerHTML === '') {
			resolve(false);
			return;
		}
		
		var svgData = '<svg xmlns="http://www.w3.org/2000/svg" '+
			'width="' + this._textRegion.width + 'px" height="' + this._textRegion.height + 'px">' +
				'<foreignObject width="100%" height="100%">' +
					'<p xmlns="http://www.w3.org/1999/xhtml" style="' +
							'margin: 0; ' +
							'overflow: visible; ' +
							'word-break: break-all; ' +
							'box-sizing: border-box; ' +
							'line-height: ' + TextTool.LINE_HEIGHT + '; ' +
							'padding: ' + TextTool.PADDING + 'px; ' +
							'width: ' + this._textRegion.width + 'px; ' +
							'height: ' + this._textRegion.height + 'px; ' +
							'background: ' + this._getBackgroundValue() + '; ' +
							'border: ' + TextTool.BORDER_WIDTH + 'px solid transparent; ' +
							'font: ' + this._getFontValue() + '; ' +
							'text-decoration: ' + this._getTextDecorationValue() + '; ' +
							'color: ' + settings.get('lineColor') + ';">' +
						this._textElem.innerHTML +
					'</p>' +
				'</foreignObject>' +
			'</svg>';
		svgData = svgData.replace(/<br>/g, '<br />'); // XML requires self-closing tags be closed, but HTML5 does not.
		svgData = svgData.replace(/#/g, '%23'); // Escape hash for data URL.
		
		var svgImage = new Image(),
			svgURL = 'data:image/svg+xml,' + svgData;
			//svgBlob = new Blob([svgData], {type: 'image/svg+xml'}),
			//svgURL = URL.createObjectURL(svgBlob);
		
		// Prevent the canvas becoming “tainted”.
		svgImage.crossOrigin = 'anonymous';
		
		// Save coordinates since the text region can be deleted by _removeTextElem before the image loads.
		var textX = this._textRegion.x,
			textY = this._textRegion.y;
		
		svgImage.onload = (function () {
			// Draw the text image to the canvas.
			this._cxt.drawImage(svgImage, textX, textY);
			// Revoke the temporary blob URL.
			//URL.revokeObjectURL(svgURL);
			// Clean up.
			Utils.clearCanvas(this._preCxt);
			undoStack.addState();
			
			resolve(true);
		}).bind(this);
		
		svgImage.src = svgURL;
	}).bind(this));
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
		
		case 53: // 5
			if (e.altKey && e.shiftKey) {
				e.preventDefault();
				// Alt+Shift+5 => Strikethrough
				
				// Update the toolbar toggle.
				toolbar.toolboxes.textToolOptions.strikeToggle.checked =
					!toolbar.toolboxes.textToolOptions.strikeToggle.checked;
				settings.set('strike', toolbar.toolboxes.textToolOptions.strikeToggle.checked);
				
				// Update the text box's CSS.
				this._textElem.style.textDecoration = this._getTextDecorationValue();
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
		
		case 85: // U
			if (ctrlOrCmd) {
				e.preventDefault();
				// Ctrl+U => Underline
				
				// Update the toolbar toggle.
				toolbar.toolboxes.textToolOptions.underlineToggle.checked =
					!toolbar.toolboxes.textToolOptions.underlineToggle.checked;
				settings.set('underline', toolbar.toolboxes.textToolOptions.underlineToggle.checked);
				
				// Update the text box's CSS.
				this._textElem.style.textDecoration = this._getTextDecorationValue();
			}
			break;
	}
};
