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
		cxt.drawImage(state.image, 0, 0);
		
		// Save the state to session storage in case the page gets reloaded.
		try {
			sessionStorage.lastState = state.image.src;
		} catch (err) {
			// If the image is too large to store, there is not much that can be done.
			console.warn('The latest state was too large to store in session storage.');
		}
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
			this._undoStack.push(this._currentState);
			this.pruneToLimit();
		}
		// Save the current state.
		var image = new Image();
		image.src = canvas.toDataURL();
		this._currentState = {
			image: image,
			width: canvas.width,
			height: canvas.height
		};
		
		// Save the state to session storage in case the page gets reloaded.
		try {
			sessionStorage.lastState = image.src;
		} catch (err) {
			// If the image is too large to store, there is not much that can be done.
			console.warn('The latest state was too large to store in session storage.');
		}
		
		// Clear the redo stack.
		this._redoStack = [];
		
		this.changedSinceSave = true;
		this._updateUI();
	},
	
	/**
	 * Prune the undo stack down to the limit.
	 */
	pruneToLimit: function () {
		if (this._undoStack.length === 0 || this._undoStack.length <= settings.get('maxUndoStackDepth')) {
			// Abort if the undo stack is empty or otherwise under the limit.
			// Need to short-circuit the settings check on initial load because `settings` does not exist yet.
			return;
		}
		var amountExceededBy = this._undoStack.length - settings.get('maxUndoStackDepth');
		this._undoStack.splice(0, amountExceededBy);
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
		this.pruneToLimit();
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
