'use strict';

/**
 * Create a new TextTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function TextTool(cxt, preCxt) {
	Tool.apply(this, arguments);
	
	this._textBoxActive = false;
	
	// Initialize text box element.
	this._outline = new FloatingRegion();
	this._textArea = document.createElement('p');
	this._textArea.contentEditable = true;
	this._textArea.className = 'textArea';
	this._textArea.style.lineHeight = this.LINE_HEIGHT;
	this._textArea.style.padding = this.PADDING + 'px';
	this._outline.element.appendChild(this._textArea);
	
	// Prevent selecting text moving the text box.
	this._textArea.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
	// Prevent the element scrolling if it overflows.
	this._textArea.addEventListener('scroll', function () { this.scrollTop = 0; });
	
	this._textArea.addEventListener('keydown', this._handleKeyDown.bind(this), false);
}
// Extend Tool.
TextTool.prototype = Object.create(Tool.prototype);
TextTool.prototype.constructor = TextTool;

// Define constants.
/** @constant {Number} The minimum viable text box width/height */
TextTool.prototype.MIN_SIZE = 7;
/** @constant {Number} The padding on the text box */
TextTool.prototype.PADDING = 4;
/** @constant {Number} The line height of the text box */
TextTool.prototype.LINE_HEIGHT = 1;

/**
 * @override
 * Handle the selection tool becoming the active tool.
 */
TextTool.prototype.activate = function () {
	this._preCxt.canvas.style.cursor = 'crosshair';
	toolbar.switchToolOptionsToolbox(toolbar.toolboxes.textToolOptions);
	this.updateTextElem();
};

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
TextTool.prototype.start = function (pointerState) {
	this._roundPointerState(pointerState);
	
	if (this._outline.drag) {
		// If the text box is being dragged, handle that.
		if (this._outline.drag.type === 'move') {
			this._preCxt.canvas.style.cursor =
				this._textArea.style.cursor = 'move';
		} else {
			this._preCxt.canvas.style.cursor =
				this._textArea.style.cursor = this._outline.drag.type + '-resize';
		}
	} else {
		// Otherwise, save any existing text...
		this._saveText();
		// ...and start a new text box.
		this._pointerStart = {
			x: pointerState.x,
			y: pointerState.y
		};
		this._textArea.innerHTML = '';
		// Hide resize handles while creating.
		this._outline.interactable =
			this._outline.showHandles = false;
		this._outline.x = pointerState.x;
		this._outline.y = pointerState.y;
		this._outline.width = 0;
		this._outline.height = 0;
		this.updateTextElem();
		this._outline.addToDOM();
		this._textBoxActive = true;
	}
	
	// Strip formatting on paste, if possible.
	this._pasting = false;
	var that = this;
	this._textArea.addEventListener('paste', function (e) {
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
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
TextTool.prototype.move = function (pointerState) {
	if (!this._textBoxActive) {
		return;
	}
	
	this._roundPointerState(pointerState);
	
	this._preCxt.reset();
	
	if (this._outline.drag) {
		this._outline.handleDragMove(pointerState);
	} else {
		// If nothing is being dragged, this is a new text box.
		// Limit the box to the canvas.
		pointerState.x = Math.max(0, Math.min(this._cxt.canvas.width, pointerState.x));
		pointerState.y = Math.max(0, Math.min(this._cxt.canvas.height, pointerState.y));
		
		this._outline.width = pointerState.x - this._pointerStart.x;
		this._outline.height = pointerState.y - this._pointerStart.y;
		
		// Keep x and y at the top-left corner.
		if (this._outline.width < 0) {
			this._outline.x = this._pointerStart.x + this._outline.width;
			this._outline.width = Math.abs(this._outline.width);
		}
		if (this._outline.height < 0) {
			this._outline.y = this._pointerStart.y + this._outline.height;
			this._outline.height = Math.abs(this._outline.height);
		}
		
		if (pointerState.shiftKey) {
			// Perfect square when Shift is held.
			if (this._outline.width < this._outline.height) {
				this._outline.height = this._outline.width;
				if (this._outline.y === pointerState.y) {
					this._outline.y = this._pointerStart.y - this._outline.height;
				}
			} else {
				this._outline.width = this._outline.height;
				if (this._outline.x === pointerState.x) {
					this._outline.x = this._pointerStart.x - this._outline.width;
				}
			}
		}
		
		if (pointerState.ctrlKey) {
			// Draw from center when Ctrl is held.
			this._outline.x = this._pointerStart.x - this._outline.width;
			this._outline.y = this._pointerStart.y - this._outline.height;
			this._outline.width *= 2;
			this._outline.height *= 2;
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
	
	this.updateTextElem();
	
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
	
	this._textArea.style.removeProperty('cursor');
	this._preCxt.canvas.style.cursor = 'crosshair';
	
	if (this._outline.drag) {
		// If there is outline drag data, tell the floating region to finish.
		this._outline.handleDragEnd(pointerState);
	} else {
		// Otherwise, a new text box was created.
		
		if (this._outline.width < this.MIN_SIZE || this._outline.height < this.MIN_SIZE) {
			// If either dimension is zero, the region is invalid.
			this._removeTextElem();
			return;
		}
		
		delete this._pointerStart;
		
		// Show resize handles once done creating.
		this._outline.interactable =
			this._outline.showHandles = true;
		
		// Focus the text box.
		this._textArea.focus();
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
 * Update the text box element with the correct size and other properties.
 */
TextTool.prototype.updateTextElem = function () {
	if (!this._textBoxActive) {
		return;
	}
	
	// Tell the outline to recompute its dimensions.
	this._outline.x = this._outline.x;
	this._outline.y = this._outline.y;
	this._outline.width = this._outline.width;
	this._outline.height = this._outline.height;
	
	this._outline.element.style.background = this._getBackgroundValue();
	this._textArea.style.width = this._outline.width + 'px';
	this._textArea.style.height = this._outline.height + 'px';
	this._textArea.style.WebkitTransform = 'scale(' + zoomManager.level + ')';
	this._textArea.style.MozTransform =    'scale(' + zoomManager.level + ')';
	this._textArea.style.MsTransform =    'scale(' + zoomManager.level + ')';
	this._textArea.style.OTransform =    'scale(' + zoomManager.level + ')';
	this._textArea.style.transform =       'scale(' + zoomManager.level + ')';
	this._textArea.style.color = settings.get('lineColor');
	this._textArea.style.font = this._getFontValue();
	this._textArea.style.textDecoration = this._getTextDecorationValue();
};

/**
 * @private
 * Remove the text box element.
 */
TextTool.prototype._removeTextElem = function () {
	// Save any existing text.
	this._saveText().then((function () {
		// Remove the text region and element.
		this._textBoxActive = false;
		this._outline.removeFromDOM();
	}).bind(this));
};

/**
 * @private
 * Save the text to the canvas.
 * @returns {Promise<Boolean>} Resolves with whether the text was saved.
 */
TextTool.prototype._saveText = function () {
	return new Promise((function (resolve, reject) {
		if (!this._textBoxActive || this._textArea.innerHTML === '') {
			resolve(false);
			return;
		}
		
		var svgData = '<svg xmlns="http://www.w3.org/2000/svg" '+
			'width="' + this._outline.width + 'px" height="' + this._outline.height + 'px">' +
				'<foreignObject width="100%" height="100%">' +
					'<p xmlns="http://www.w3.org/1999/xhtml" style="' +
							'margin: 0; ' +
							'overflow: visible; ' +
							'word-break: break-word; ' +
							'box-sizing: border-box; ' +
							'line-height: ' + this.LINE_HEIGHT + '; ' +
							'padding: ' + this.PADDING + 'px; ' +
							'width: ' + this._outline.width + 'px; ' +
							'height: ' + this._outline.height + 'px; ' +
							'background: ' + this._getBackgroundValue() + '; ' +
							'font: ' + this._getFontValue() + '; ' +
							'text-decoration: ' + this._getTextDecorationValue() + '; ' +
							'color: ' + settings.get('lineColor') + ';">' +
						this._textArea.innerHTML +
					'</p>' +
				'</foreignObject>' +
			'</svg>';
		svgData = svgData.replace(/<br>/g, '<br />'); // XML requires self-closing tags be closed, but HTML5 does not.
		svgData = svgData.replace(/&nbsp;/g, '&#xa0;'); // HTML non-breaking space entity is not defined in XML, so reference the char code directly.
		svgData = svgData.replace(/#/g, '%23'); // Escape hash for data URL.
		
		var svgImage = new Image(),
			svgURL = 'data:image/svg+xml,' + svgData;
			//svgBlob = new Blob([svgData], {type: 'image/svg+xml'}),
			//svgURL = URL.createObjectURL(svgBlob);
		
		// Prevent the canvas becoming “tainted”.
		svgImage.crossOrigin = 'anonymous';
		
		// Save coordinates since the text region can be deleted by _removeTextElem before the image loads.
		var textX = this._outline.x,
			textY = this._outline.y;
		
		svgImage.onload = (function () {
			// Draw the text image to the canvas.
			this._cxt.drawImage(svgImage, textX, textY);
			// Revoke the temporary blob URL.
			//URL.revokeObjectURL(svgURL);
			// Clean up.
			this._preCxt.reset();
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
	var ctrlOrCmd = Utils.checkPlatformCtrlOrCmdKey(e),
		metaOrControl = Utils.checkPlatformMetaOrControlKey(e),
		ctrlOrCmdOnly = ctrlOrCmd && !e.altKey && !e.shiftKey && !metaOrControl,
		noModifiers = !Utils.checkModifierKeys(e);
	
	e.stopPropagation();
	
	switch (e.keyCode) {
		case 13: // Enter
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+Enter => Rasterize text
				
				this._removeTextElem();
			}
			break;
		
		case 27: // Esc
			if (noModifiers) {
				e.preventDefault();
				// Esc => Cancel text box
				
				// Clear the text box, then remove it.
				this._textArea.innerHTML = '';
				this._removeTextElem();
			}
			break;
		
		case 48: // 0
		case 96: // Numpad 0
			if (ctrlOrCmd && e.altKey && !metaOrControl && !e.shiftKey) {
				e.preventDefault();
				// Ctrl+Alt+0 => Zoom 100%
				zoomManager.level = 1;
			}
			break;
		
		case 53: // 5
			if (e.altKey && e.shiftKey && !ctrlOrCmd && !metaOrControl) {
				e.preventDefault();
				// Alt+Shift+5 => Strikethrough
				
				settings.set('strike', !settings.get('strike'));
				toolbar.toolboxes.textToolOptions.strikeToggle.checked = settings.get('strike');
			}
			break;
		
		case 66: // B
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+B => Bold
				
				settings.set('bold', !settings.get('bold'));
				toolbar.toolboxes.textToolOptions.boldToggle.checked = settings.get('bold');
			}
			break;
		
		case 67: // C
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+C => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('C')) {
					e.preventDefault();
				}
			}
			break;
		
		case 69: // E
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+E => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('E')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+E => Resize dialog
				dialogs.resize.open();
			}
			break;
		
		case 70: // F
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+F => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('F')) {
					e.preventDefault();
				}
			}
			break;
		
		case 72: // H
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+H => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('H')) {
					e.preventDefault();
				}
			}
			break;
		
		case 73: // I
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+I => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('I')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+I => Italic
				
				settings.set('italic', !settings.get('italic'));
				toolbar.toolboxes.textToolOptions.italicToggle.checked = settings.get('italic');
			}
			break;
		
		case 78: // N
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Shift+N => Clear canvas (no confirmation)
				// TODO: Make this not access ClearDialog private method.
				dialogs.clear._clear();
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+N => Clear (new image)
				dialogs.clear.open();
			}
			break;
		
		case 79: // O
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+O => Open
				document.getElementById('upload').click();
			}
			break;
		
		case 83: // S
			if (ctrlOrCmdOnly) {
				// Ctrl+S => Prevent saving while editing text
				e.preventDefault();
			}
			break;
		
		case 84: // T
			if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+T => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('T')) {
					e.preventDefault();
				}
			}
			break;
		
		case 85: // U
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+U => Underline
				
				settings.set('underline', !settings.get('underline'));
				toolbar.toolboxes.textToolOptions.underlineToggle.checked = settings.get('underline');
			}
			break;
		
		case 86: // V
			if (ctrlOrCmd && e.altKey && !e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+V => Paste from...
				document.getElementById('pasteFrom').click();
			} else if (e.altKey && !e.ctrlKey && !e.metaKey) {
				// Alt+V => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('V')) {
					e.preventDefault();
				}
			}
			break;
		
		case 89: // Y
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+Y => Win7 Paint Help button
				if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
					dialogs.help.open();
				}
			}
			break;
		
		case 112: // F1
			if (noModifiers) {
				e.preventDefault();
				// F1 => Open help dialog
				dialogs.help.open();
			}
			break;
		
		case 122: // F11
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+F11 => Full screen
				toolbar.toolboxes.app.attemptFullScreen();
			}
			break;
		
		case 187: // =/+
		case 107: // Numpad +
			if (ctrlOrCmd && e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+= => Zoom in
				zoomManager.zoomIn();
			}
			break;
		
		case 189: // -/_
		case 109: // Numpad -
			if (ctrlOrCmd && e.altKey && !metaOrControl && !e.shiftKey) {
				e.preventDefault();
				// Ctrl+Alt+- => Zoom out
				zoomManager.zoomOut();
			}
			break;
		
		case 191: // //?
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+? => Keyboard shortcuts dialog
				dialogs.keyboard.open();
			} else if (ctrlOrCmd && e.altKey && e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+Shift+? => MS Paint access key help dialog
				dialogs.msAccessKeyHelp.open();
			}
			break;
	}
};
