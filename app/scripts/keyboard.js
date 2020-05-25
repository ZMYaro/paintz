'use strict';

/**
 * Create a new KeyManager instance and set up its event listeners.
 */
function KeyManager() {
	/** {Boolean} Whether the key manager currently intercepts app keyboard shortcuts */
	this.enabled = false;
	
	window.addEventListener('keydown', this._handleKeyDown.bind(this), false);
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
		
		case 27: // Esc
			if (noModifiers) {
				if (tools.currentTool instanceof SelectionTool) {
					e.preventDefault();
					// Esc => Drop/cancel selection
					tools.currentTool.deactivate();
				}
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
			if (e.altKey && e.shiftKey && !e.ctrlKey && !metaOrControl) {
				e.preventDefault();
				// Alt+Shift+5 => Strikethrough
				
				if (settings.get('tool') === 'text') {
					toolbar.toolboxes.textToolOptions.strikeToggle.checked =
						!toolbar.toolboxes.textToolOptions.strikeToggle.checked;
					settings.set('strike', toolbar.toolboxes.textToolOptions.strikeToggle.checked);
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
					toolbar.toolboxes.textToolOptions.boldToggle.checked =
						!toolbar.toolboxes.textToolOptions.boldToggle.checked;
					settings.set('bold', toolbar.toolboxes.textToolOptions.boldToggle.checked);
				}
			} else if (noModifiers) {
				e.preventDefault();
				// B => Doodle (brush) tool
				tools.switchTool('doodle');
			}
			break;
		
		case 67: // C
			if (noModifiers) {
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
			if (noModifiers) {
				e.preventDefault();
				// E => Eraser tool
				tools.switchTool('eraser');
			}
			break;
		
		case 70: // F
			if (noModifiers) {
				e.preventDefault();
				// F => Freeform selection tool
				tools.switchTool('freeformSelection');
			}
			break;
		
		case 72: // H
			if (noModifiers) {
				e.preventDefault();
				// H => Pan (hand) tool
				tools.switchTool('pan');
			}
			break;
		
		case 73: // I
			if (ctrlOrCmdOnly) {
				e.preventDefault();
				// Ctrl+I => Italic
				
				if (settings.get('tool') === 'text') {
					toolbar.toolboxes.textToolOptions.italicToggle.checked =
						!toolbar.toolboxes.textToolOptions.italicToggle.checked;
					settings.set('italic', toolbar.toolboxes.textToolOptions.italicToggle.checked);
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
			if (noModifiers) {
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
			if (noModifiers) {
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
					toolbar.toolboxes.textToolOptions.underlineToggle.checked =
						!toolbar.toolboxes.textToolOptions.underlineToggle.checked;
					settings.set('underline', toolbar.toolboxes.textToolOptions.underlineToggle.checked);
				}
			}
			break;
		
		case 88: // X
			if (noModifiers) {
				e.preventDefault();
				// X => Switch fill and line colors
				
				// Swap the stored colors.
				var oldLine = settings.get('lineColor'),
					oldFill = settings.get('fillColor');
				settings.set('lineColor', oldFill);
				settings.set('fillColor', oldLine);
				
				// Update the toolbar.
				toolbar.toolboxes.colorPicker.colorIndicator.style.borderColor = oldFill;
				toolbar.toolboxes.colorPicker.colorIndicator.style.backgroundColor = oldLine;
				
				// Some tools' cursors change with colors, so reactivate the cursor.
				tools.currentTool.activate();
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
