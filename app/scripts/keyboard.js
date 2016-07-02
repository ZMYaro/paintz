var keyManager = {
	_handleKeyDown: function (e) {
		// Use Command on Mac and iOS devices and Ctrl everywhere else.
		var ctrlOrCmd = (!Utils.isApple && e.ctrlKey) || (Utils.isApple && e.metaKey);
		
		switch (e.keyCode) {
			case 8: // Backspace
				if (localStorage.tool === 'selection') {
					e.preventDefault();
					tools.selection.clear();
				}
				break;
			case 46: // Delete
				if (localStorage.tool === 'selection') {
					e.preventDefault();
					tools.selection.clear();
				}
				break;
			case 65: // A
				if (e.ctrlKey) {
					e.preventDefault();
					// Ctrl+A => Select all
					
					// Deactivate the current tool and prepare the selection tool.
					tools[localStorage.tool].deactivate();
					Utils.clearCanvas(preCxt);
					localStorage.tool = 'selection';
					tools.selection.activate();
					// Update the toolbar.
					document.getElementById('tools').tool.value = 'selection';
					// Select the entire canvas.
					tools.selection.selectAll(canvas.width, canvas.height);
				}
				break;
			case 66: // B
				//
				break;
			case 68: // D
				if (ctrlOrCmd) {
					e.preventDefault();
					
					if (localStorage.tool === 'selection') {
						// Ctrl+D => Duplicate selection
						tools.selection.duplicate();
					}
				}
				break;
			case 79: // O
				if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+O => Open
					document.getElementById('upload').click();
				}
				break;
			case 83: // S
				if (ctrlOrCmd) {
					e.preventDefault();
					// Ctrl+S => Save
					downloadImage();
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
		}
	},

	enableAppShortcuts: function () {
		window.addEventListener('keydown', this._handleKeyDown, false);
	},

	disableAppShortcuts: function () {
		window.removeEventListener('keydown', this._handleKeyDown, false);
	}
}
