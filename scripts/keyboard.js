var keyManager = {
	_keyPressListener: function (e) {
		switch (e.keyCode) {
			case 89: // Y
				if (e.ctrlKey) {
					undoStack.redo();
				}
				break;
			case 90: // Z
				if (e.ctrlKey) {
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