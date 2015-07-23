var keyManager = {
	_keyPressListener: function (e) {
		switch (e.keyCode) {
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
		}
	},

	enableAppShortcuts: function () {
		window.addEventListener('keydown', this._keyPressListener, false);
	},

	disableAppShortcuts: function () {
		window.removeEventListener('keydown', this._keyPressListener, false);
	}
}