var undoStack = {
	_undoStack: [],
	_redoStack: [],
	_currentState: undefined,
	changedSinceSave: false,
	
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
		
		settings.set('width', state.width);
		settings.set('height', state.height);
		cxt.putImageData(state, 0, 0);
	},
	
	/**
	 * Disable buttons for empty stacks.
	 */
	_updateUI: function () {
		// Update the redo button.
		toolbar.toolboxes.image.redoBtn.disabled = !this.canRedo;
		
		// Update the undo button.
		toolbar.toolboxes.image.undoBtn.disabled = !this.canUndo;
	},
	
	/**
	 * Add the current state to the undo stack.
	 */
	addState: function () {
		// Add the last state to the undo stack.
		if (this._currentState) {
			if (this._undoStack.push(this._currentState) > settings.get('maxUndoStackDepth')) {
				// If the maximum stack depth has been exceeded, start removing the bottom
				// of the stack.
				this._undoStack.splice(0, 1);
			}
		}
		// Save the current state.
		this._currentState = cxt.getImageData(0, 0, canvas.width, canvas.height);
		
		// Clear the redo stack.
		this._redoStack = [];
		
		this.changedSinceSave = true;
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
		this.changedSinceSave = false;
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
		tools.currentTool.deactivate();
		
		// Add the current state to the undo stack and restore the last state from
		// the redo stack.
		var restoreState = this._redoStack.pop();
		this._undoStack.push(this._currentState);
		this._applyState(restoreState);
		
		this.changedSinceSave = true;
		this._updateUI();
		
		// Reactivate the current tool.
		tools.currentTool.activate();
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
		tools.currentTool.deactivate();
		
		// Add the current state to the redo stack and restore the last state from
		// the undo stack.
		var restoreState = this._undoStack.pop();
		this._redoStack.push(this._currentState);
		this._applyState(restoreState);
		
		this.changedSinceSave = true;
		this._updateUI();
		
		// Reactivate the current tool.
		tools.currentTool.activate();
	}
};
