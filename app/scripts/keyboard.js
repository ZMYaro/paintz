'use strict';

/**
 * Create a new KeyManager instance and set up its event listeners.
 */
function KeyManager() {
	/** {Boolean} Whether the key manager currently intercepts app keyboard shortcuts */
	this.enabled = false;
	
	window.addEventListener('keydown', this._handleKeyDown.bind(this), false);
	document.getElementById('dialogsContainer')
		.addEventListener('keydown', this._handleDialogKeyDown.bind(this), false);
}

KeyManager.prototype._handleKeyDown = function (e) {
	if (!this.enabled) {
		return;
	}
	
	// Use Command on Mac and iOS devices and Ctrl everywhere else.
	var ctrlOrCmd = Utils.checkPlatformCtrlOrCmdKey(e),
		metaOrControl = Utils.checkPlatformMetaOrControlKey(e),
		ctrlOrCmdOnly = ctrlOrCmd && !e.altKey && !e.shiftKey && !metaOrControl,
		noModifiers = !Utils.checkModifierKeys(e);
	
	switch (e.keyCode) {
		case 8: // Backspace
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Backspace => Delete selection
					tools.currentTool.clear();
				}
			}
			break;
		
		case 13: // Enter
			if (ctrlOrCmdOnly) {
				if (tools.currentTool === tools.text) {
					e.preventDefault();
					// Ctrl+Enter => Rasterize text
					tools.currentTool._removeTextElem();
				}
			}
			break;
		
		case 27: // Esc
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Esc => Drop/cancel selection
					tools.currentTool.deactivate();
				} else if (tools.currentTool === tools.text) {
					e.preventDefault();
					// Esc => Cancel text box
					tools.currentTool._textArea.innerHTML = '';
					tools.currentTool._removeTextElem();
				}
			}
			break;
		
		case 33: // PgUp
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+PgUp => Zoom in
				zoomManager.zoomIn();
			}
			break;
		
		case 34: // PgDn
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+PgDn => Zoom out
				zoomManager.zoomOut();
			}
			break;
		
		case 37: // Left arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Left arrow => Nudge selection left
					tools.currentTool.nudge(-1, 0);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Left arrow => Nudge selection 10 left
					tools.currentTool.nudge(-10, 0);
				}
			}
			break;
		
		case 38: // Up arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Up arrow => Nudge selection up
					tools.currentTool.nudge(0, -1);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Up arrow => Nudge selection 10 up
					tools.currentTool.nudge(0, -10);
				}
			}
			break;
		
		case 39: // Right arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Right arrow => Nudge selection right
					tools.currentTool.nudge(1, 0);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Right arrow => Nudge selection 10 right
					tools.currentTool.nudge(10, 0);
				}
			}
			break;
		
		case 40: // Down arrow
			if (tools.currentTool instanceof SelectionTool) {
				if (noModifiers) {
					e.preventDefault();
					// Down arrow => Nudge selection down
					tools.currentTool.nudge(0, 1);
				} else if (e.shiftKey && !e.altKey && !ctrlOrCmd && !metaOrControl) {
					e.preventDefault();
					// Shift + Down arrow => Nudge selection 10 down
					tools.currentTool.nudge(0, 10);
				}
			}
			break;
		
		case 46: // Delete
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Delete => Delete selection
					tools.currentTool.clear();
				}
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
				
				if (settings.get('tool') === 'text') {
					settings.set('strike', !settings.get('strike'));
					toolbar.toolboxes.textToolOptions.strikeToggle.checked = settings.get('strike');
				}
			}
			break;
		
		case 65: // A
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+A => Select all
				
				// Switch to the rectangular selection tool.
				if (tools.currentTool !== tools.selection) {
					tools.switchTool('selection');
				}
				// Select the entire canvas.
				tools.currentTool.selectAll(canvas.width, canvas.height);
			}
			break;
		
		case 66: // B
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+B => Bold
				
				if (settings.get('tool') === 'text') {
					settings.set('bold', !settings.get('bold'));
					toolbar.toolboxes.textToolOptions.boldToggle.checked = settings.get('bold');
				}
			} else if (noModifiers) {
				e.preventDefault();
				// B => Doodle (brush) tool
				tools.switchTool('doodle');
			}
			break;
		
		case 67: // C
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+C => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('C')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// C => Curve tool
				tools.switchTool('curve');
			}
			break;
		
		case 68: // D
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				
				if (tools.currentTool instanceof SelectionTool) {
					// Ctrl+D => Duplicate selection
					tools.currentTool.duplicate();
				}
			}
			break;
		
		case 69: // E
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+E => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('E')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+E => Resize dialog
				dialogs.resize.open();
			} else if (noModifiers) {
				e.preventDefault();
				// E => Eraser tool
				tools.switchTool('eraser');
			}
			break;
		
		case 70: // F
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+F => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('F')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// F => Freeform selection tool
				tools.switchTool('freeformSelection');
			}
			break;
		
		case 71: // G
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+G => Toggle grid
				settings.set('grid', !settings.get('grid'));
			}
			break;
		
		case 72: // H
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+H => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('H')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// H => Pan (hand) tool
				tools.switchTool('pan');
			}
			break;
		
		case 73: // I
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+I => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('I')) {
					e.preventDefault();
				}
			} else if (ctrlOrCmdOnly) {
				e.preventDefault();
				
				if (settings.get('tool') === 'text') {
					// Ctrl+I => Italic (text tool)
					settings.set('italic', !settings.get('italic'));
					toolbar.toolboxes.textToolOptions.italicToggle.checked = settings.get('italic');
				} else {
					// Ctrl+I => Invert colors
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.invertColors();
					} else {
						tools.selection.invertColors();
					}
				}
			}
			if (noModifiers) {
				e.preventDefault();
				// I => Eyedropper (“I-dropper”) tool
				tools.switchTool('eyedropper');
			}
			break;
		
		case 75: // K
			if (noModifiers) {
				e.preventDefault();
				// K => Flood fill (paint bucket) tool
				tools.switchTool('floodFill');
			}
			break;
		
		case 76: // L
			if (noModifiers) {
				e.preventDefault();
				// L => Line tool
				tools.switchTool('line');
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
			} else if (noModifiers) {
				e.preventDefault();
				// O => Oval tool
				tools.switchTool('oval');
			}
			break;
		
		case 80: // P
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+P => Print
				window.print();
			} else if (noModifiers) {
				e.preventDefault();
				// P => Pencil tool
				tools.switchTool('pencil');
			}
			break;
		
		case 82: // R
			if (noModifiers) {
				e.preventDefault();
				// R => Rectangle tool
				tools.switchTool('rect');
			}
			break;
		
		case 83: // S
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+S => Save
				dialogs.save.open();
			} else if (noModifiers) {
				e.preventDefault();
				// S => Selection tool
				tools.switchTool('selection');
			}
			break;
		
		case 84: // T
			if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+T => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('T')) {
					e.preventDefault();
				}
			} else if (noModifiers) {
				e.preventDefault();
				// T => Text tool
				tools.switchTool('text');
			}
			break;
		
		case 85: // U
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+U => Underline
				
				if (settings.get('tool') === 'text') {
					settings.set('underline', !settings.get('underline'));
					toolbar.toolboxes.textToolOptions.underlineToggle.checked = settings.get('underline');
				}
			}
			break;
		
		case 86: // V
			if (ctrlOrCmd && e.altKey && !e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+V => Paste from...
				document.getElementById('pasteFrom').click();
			} else if (e.altKey && !ctrlOrCmd && !metaOrControl) {
				// Alt+V => Begin MS Paint access key sequence
				if (dialogs.msAccessKey.open('V')) {
					e.preventDefault();
				}
			}
		
		case 88: // X
			if (noModifiers) {
				e.preventDefault();
				// X => Switch fill and line colors
				toolbar.toolboxes.colorPicker.swapSelectedColors();
			}
			break;
		
		case 89: // Y
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+Y => Redo
				undoStack.redo();
			}
			break;
		
		case 90: // Z
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Shift+Z => Redo
				undoStack.redo();
			} else if (ctrlOrCmdOnly || (ctrlOrCmd && e.altKey)) {
				e.preventDefault();
				// Ctrl+Z OR Ctrl+Alt+Z => Undo
				undoStack.undo();
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
			if (e.shiftKey && !e.altKey && !metaOrControl) {
				e.preventDefault();
				// ? OR Ctrl+? => Keyboard shortcuts dialog
				dialogs.keyboard.open();
			} else if (ctrlOrCmd && e.altKey && e.shiftKey && !metaOrControl) {
				e.preventDefault();
				// Ctrl+Alt+Shift+? => MS Paint access key help dialog
				dialogs.msAccessKeyHelp.open();
			}
			break;
		
		case 219: // [
			if (noModifiers) {
				e.preventDefault();
				
				// [ => Decrease line width
				var lineWidthSelect = document.getElementById('lineWidth');
				if (lineWidthSelect.selectedIndex > 0) {
					settings.set('lineWidth',
						lineWidthSelect.value = lineWidthSelect.options[lineWidthSelect.selectedIndex - 1].value);
				}
			}
			break;
		
		case 221: // ]
			if (noModifiers) {
				e.preventDefault();
				
				// ] => Increase line width
				var lineWidthSelect = document.getElementById('lineWidth');
				if (lineWidthSelect.selectedIndex < lineWidthSelect.options.length - 1) {
					settings.set('lineWidth',
						lineWidthSelect.value = lineWidthSelect.options[lineWidthSelect.selectedIndex + 1].value);
				}
			}
			break;
	}
};

KeyManager.prototype._handleDialogKeyDown = function (e) {
	// Use Command on Mac and iOS devices and Ctrl everywhere else.
	var ctrlOrCmd = Utils.checkPlatformCtrlOrCmdKey(e),
		metaOrControl = Utils.checkPlatformMetaOrControlKey(e),
		ctrlOrCmdOnly = ctrlOrCmd && !e.altKey && !e.shiftKey && !metaOrControl;
	
	switch (e.keyCode) {
		case 78: // N
			if (ctrlOrCmd && e.shiftKey && !e.altKey && !metaOrControl) {
				// Ctrl+Shift+N => Prevent new incognito window (Chrome)
				e.preventDefault();
				e.stopPropagation();
			} else if (ctrlOrCmdOnly) {
				// Ctrl+N => Prevent new window
				e.preventDefault();
				e.stopPropagation();
			}
			break;
		
		case 79: // O
			if (ctrlOrCmdOnly) {
				// Ctrl+O => Prevent open file
				e.preventDefault();
				e.stopPropagation();
			}
			break;
		
		case 83: // S
			if (ctrlOrCmdOnly) {
				// Ctrl+S => Prevent save page as
				e.preventDefault();
				e.stopPropagation();
			}
			break;
	}
};
