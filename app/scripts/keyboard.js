var keyManager = {
	_enabled: false,
	
	_handleKeyDown: function (e) {
		// Use Command on Mac and iOS devices and Ctrl everywhere else.
		var ctrlOrCmd = Utils.checkPlatformCtrlKey(e),
			noModifiers = !Utils.checkModifierKeys(e);
		
		switch (e.keyCode) {
			case 8: // Backspace
				if (noModifiers) {
					if (settings.get('tool') === 'selection') {
						e.preventDefault();
						// Backspace => Delete selection
						tools.selection.clear();
					}
				}
				break;
			
			case 27: // Esc
				if (noModifiers) {
					if (settings.get('tool') === 'selection') {
						e.preventDefault();
						// Esc => Drop/cancel selection
						tools.selection.deactivate();
					}
				}
				break;
			
			case 46: // Delete
				if (noModifiers) {
					if (settings.get('tool') === 'selection') {
						e.preventDefault();
						// Delete => Delete selection
						tools.selection.clear();
					}
				}
				break;
			
			case 53: // 5
				if (e.altKey && e.shiftKey) {
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
				if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+A => Select all
					
					// Switch to the selection tool.
					tools.switchTool('selection');
					// Select the entire canvas.
					tools.selection.selectAll(canvas.width, canvas.height);
				}
				break;
			
			case 66: // B
				if (ctrlOrCmd) {
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
				if (ctrlOrCmd) {
					e.preventDefault();
					
					if (settings.get('tool') === 'selection') {
						// Ctrl+D => Duplicate selection
						tools.selection.duplicate();
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
					// F => Fill tool
					tools.switchTool('floodFill');
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
				if (ctrlOrCmd) {
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
			
			case 76: // L
				if (noModifiers) {
					e.preventDefault();
					// L => Line tool
					tools.switchTool('line');
				}
				break;
			
			case 79: // O
				if (ctrlOrCmd) {
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
				if (ctrlOrCmd) {
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
				if (ctrlOrCmd) {
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
					var oldLine = settings.get('lineColor');
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
				if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+Y => Redo
					undoStack.redo();
				}
				break;
			
			case 90: // Z
				if (ctrlOrCmd && e.shiftKey) {
					e.preventDefault();
					// Ctrl+Shift+Z => Redo
					undoStack.redo();
				} else if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+Z => Undo
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
				if (ctrlOrCmd && e.altKey) {
					e.preventDefault();
					// Ctrl+Alt+= => Zoom in
					zoomManager.zoomIn();
				}
				break;
			
			case 189: // -/_
				if (ctrlOrCmd && e.altKey) {
					e.preventDefault();
					// Ctrl+Alt+- => Zoom out
					zoomManager.zoomOut();
				}
				break;
			
			case 191: // //?
				if (e.shiftKey) {
					e.preventDefault();
					// ? => Keyboard shortcuts dialog
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
	},

	enableAppShortcuts: function () {
		if (!this._enabled) {
			window.addEventListener('keydown', this._handleKeyDown, false);
			this._enabled = true;
		}
	},

	disableAppShortcuts: function () {
		if (this._enabled) {
			window.removeEventListener('keydown', this._handleKeyDown, false);
			this._enabled = false;
		}
	}
}
