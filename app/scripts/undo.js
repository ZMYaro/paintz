var undoStack = {
	_undoStack: [],
	_redoStack: [],
	_currentState: undefined,
	
	/** @returns {Boolean} Whether there is an available redo state */
	get canRedo() {
		return this._redoStack.length > 0;
	},
	
	/** @returns {Boolean} Whether there is an available undo state */
	get canUndo() {
		return this._undoStack.length > 0;
	},
	
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
		toolbar.image.redoBtn.disabled = !this.canRedo;
		
		// Update the undo button.
		toolbar.image.undoBtn.disabled = !this.canUndo;
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
		if (!this.canRedo) {
			this._updateUI();
			return;
		}
		
		// Warn the current tool of impending changes.
		tools[localStorage.tool].deactivate();
		
		// Add the current state to the undo stack and restore the last state from
		// the redo stack.
		var restoreState = this._redoStack.pop();
		this._undoStack.push(this._currentState);
		this._applyState(restoreState);

		this._updateUI();
		
		// Reactivate the current tool.
		tools[localStorage.tool].activate();
	},

	/**
	 * Revert to the last state in the undo stack.
	 */
	undo: function () {
		// Quit if the undo stack is empty.
		if (!this.canUndo) {
			this._updateUI();
			return;
		}
		
		// Warn the current tool of impending changes.
		tools[localStorage.tool].deactivate();
		
		// Add the current state to the redo stack and restore the last state from
		// the undo stack.
		var restoreState = this._undoStack.pop();
		this._redoStack.push(this._currentState);
		this._applyState(restoreState);

		this._updateUI();
		
		// Reactivate the current tool.
		tools[localStorage.tool].activate();
	}
};
