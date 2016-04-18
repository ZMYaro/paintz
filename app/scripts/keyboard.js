var keyManager = {
	_handleKeyDown: function (e) {
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
			case 68: // D
				if (e.ctrlKey) {
					e.preventDefault();
					
					if (localStorage.tool === 'selection') {
						// Ctrl+D => Duplicate selection
						tools.selection.duplicate();
					}
				}
				break;
			case 79: // O
				if (e.ctrlKey) {
					e.preventDefault();
					// Ctrl+O => Open
					document.getElementById('upload').click();
				}
				break;
			case 83: // S
				if (e.ctrlKey) {
					e.preventDefault();
					// Ctrl+S => Save
					downloadImage();
				}
				break;
			case 89: // Y
				if (e.ctrlKey) {
					e.preventDefault();
					// Ctrl+Y => Redo
					undoStack.redo();
				}
				break;
			case 90: // Z
				if (e.ctrlKey) {
					e.preventDefault();
					// Ctrl+Z => Undo
					undoStack.undo();
				}
				break;
			case 187: // =/+
				if (e.ctrlKey && e.altKey) {
					e.preventDefault();
					// Ctrl+Alt+= => Zoom in
					zoomManager.zoomIn();
				}
				break;
			case 189: // -/_
				if (e.ctrlKey && e.altKey) {
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
