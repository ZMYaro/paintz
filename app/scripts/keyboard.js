var keyManager = {
	_handleKeyDown: function (e) {
		// Use Command on Mac and iOS devices and Ctrl everywhere else.
		var ctrlOrCmd = ((!Utils.isApple && e.ctrlKey) || (Utils.isApple && e.metaKey)),
			noModifiers = (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey);
		
		switch (e.keyCode) {
			case 8: // Backspace
				if (localStorage.tool === 'selection') {
					e.preventDefault();
					// Backspace => Delete selection
					tools.selection.clear();
				}
				break;
			
			case 46: // Delete
				if (localStorage.tool === 'selection') {
					e.preventDefault();
					// Delete => Delete selection
					tools.selection.clear();
				}
				break;
			
			case 65: // A
				if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+A => Select all
					
					// Switch to the selection tool.
					switchTool('selection');
					// Select the entire canvas.
					tools.selection.selectAll(canvas.width, canvas.height);
				}
				break;
			
			case 66: // B
				e.preventDefault();
				if (!ctrlOrCmd) {
					// B => Doodle (brush) tool
					switchTool('doodle');
					break;
				}
			
			case 68: // D
				if (ctrlOrCmd) {
					e.preventDefault();
					
					if (localStorage.tool === 'selection') {
						// Ctrl+D => Duplicate selection
						tools.selection.duplicate();
					}
				}
				break;
			
			case 69: // E
				if (noModifiers) {
					e.preventDefault();
					// E => Eraser tool
					switchTool('eraser');
				}
				break;
			
			case 70: // F
				if (noModifiers) {
					e.preventDefault();
					// F => Fill tool
					switchTool('floodFill');
				}
				break;
			
			case 72: // H
				if (noModifiers) {
					e.preventDefault();
					// H => Pan (hand) tool
					switchTool('pan');
				}
				break;
			
			case 73: // I
				if (noModifiers) {
					e.preventDefault();
					// I => Eyedropper (“I-dropper”) tool
					switchTool('eyedropper');
				}
				break;
			
			case 76: // L
				if (noModifiers) {
					e.preventDefault();
					// L => Line tool
					switchTool('line');
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
					switchTool('oval');
				}
				break;
			
			case 80: // P
				if (noModifiers) {
					e.preventDefault();
					// P => Pencil tool
					switchTool('pencil');
				}
				break;
			
			case 82: // R
				if (noModifiers) {
					e.preventDefault();
					// R => Rectangle tool
					switchTool('rect');
				}
				break;
			
			case 83: // S
				if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+S => Save
					downloadImage();
				} else if (noModifiers) {
					e.preventDefault();
					// S => Selection tool
					switchTool('selection');
				}
				break;
			
			case 88: // X
				if (noModifiers) {
					e.preventDefault();
					// X => Switch fill and line colors
					
					// Swap the stored colors.
					var oldLine = localStorage.lineColor;
					localStorage.lineColor = localStorage.fillColor;
					localStorage.fillColor = oldLine;
					
					// Update the toolbar.
					document.getElementById('colors').style.borderColor = localStorage.lineColor;
					document.getElementById('colors').style.backgroundColor = localStorage.fillColor;
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
				if (ctrlOrCmd) {debugger;
					e.preventDefault();
					// Ctrl+Z => Undo
					undoStack.undo();
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
			
			case 219: // [
				if (noModifiers) {
					e.preventDefault();
					
					// [ => Decrease line width
					var lineWidthSelect = document.getElementById('lineWidth');
					if (lineWidthSelect.selectedIndex > 0) {
						localStorage.lineWidth = 
							lineWidthSelect.value = lineWidthSelect.options[lineWidthSelect.selectedIndex - 1].value;
					}
				}
				break;
			
			case 221: // ]
				if (noModifiers) {
					e.preventDefault();
					
					// ] => Increase line width
					var lineWidthSelect = document.getElementById('lineWidth');
					if (lineWidthSelect.selectedIndex < lineWidthSelect.options.length - 1) {
						localStorage.lineWidth = 
							lineWidthSelect.value = lineWidthSelect.options[lineWidthSelect.selectedIndex + 1].value;
					}
				}
				break;
		}
	},

	enableAppShortcuts: function () {
		window.addEventListener('keydown', this._handleKeyDown, false);
	},

	disableAppShortcuts: function () {
		window.removeEventListener('keydown', this._handleKeyDown, false);
	}
}
