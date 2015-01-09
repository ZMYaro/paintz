var undoStack = {
	_undoStack: [],
	_redoStack: [],
	_currentState: undefined,

	/**
	 * Apply an image state.
	 * @param {Object} state - The state to apply.
	 */
	_applyState: function (state) {
		this._currentState = state;

		canvas.width = state.width;
		preCanvas.width = state.width;
		localStorage.width = state.width;
		canvas.height = state.height;
		preCanvas.height = state.height;
		localStorage.height = state.height;
		cxt.drawImage(state.image, 0, 0);
	},

	/**
	 * Disable buttons for empty stacks.
	 */
	_updateUI: function () {
		// Update the redo button.
		if (this._redoStack.length === 0) {
			document.getElementById('redoBtn').disabled = true;
		} else {
			document.getElementById('redoBtn').disabled = false;
		}
		// Update the undo button.
		if (this._undoStack.length === 0) {
			document.getElementById('undoBtn').disabled = true;
		} else {
			document.getElementById('undoBtn').disabled = false;
		}
	},

	/**
	 * Add the current state to the undo stack.
	 */
	addState: function () {
		// Add the last state to the undo stack.
		if (this._currentState) {
			if (this._undoStack.push(this._currentState) > localStorage.maxUndoStackDepth) {
				// If the maximum stack depth has been exceeded, start removing the bottom
				// of the stack.
				this._undoStack.splice(0, 1);
			}
		}
		// Save the current state.
		var image = new Image();
		image.src = canvas.toDataURL();
		this._currentState = {
			image: image,
			width: canvas.width,
			height: canvas.height
		};
		// Clear the redo stack.
		this._redoStack = [];

		this._updateUI();
	},

	/**
	 * Clear the undo and redo stacks.
	 */
	clear: function () {
		this._undoStack = [];
		this._redoStack = [];
		this._currentState = undefined;
		this.addState();
		this._updateUI();
	},

	/**
	 * Return to the last state in the redo stack.
	 */
	redo: function () {
		// Quit if the redo stack is empty.
		if (this._redoStack.length === 0) {
			this._updateUI();
			return;
		}
		// Add the current state to the undo stack and restore the last state from
		// the redo stack.
		var restoreState = this._redoStack.pop();
		this._undoStack.push(this._currentState);
		this._applyState(restoreState);

		this._updateUI();
	},

	/**
	 * Revert to the last state in the undo stack.
	 */
	undo: function () {
		// Quit if the undo stack is empty.
		if (this._undoStack.length === 0) {
			this._updateUI();
			return;
		}
		// Add the current state to the redo stack and restore the last state from
		// the undo stack.
		var restoreState = this._undoStack.pop();
		this._redoStack.push(this._currentState);
		this._applyState(restoreState);

		this._updateUI();
	}
};