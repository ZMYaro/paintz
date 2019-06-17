'use strict';

/**
 * Create a new FloatingSelectionToolbar instance.
 * @param {SelectionTool} selectionTool - The selection tool this toolbar is connected to
 */
function FloatingSelectionToolbar(selectionTool) {
	/** @private {HTMLDivElement} The container for toolbox's content */
	this._element = document.createElement('div');
	this._element.className = this.CSS_CLASSES;
	this._element.setAttribute('role', 'toolbar');
	
	this._selectionTool = selectionTool;
	
	this._x = 0;
	this._y = 0;
	
	// Fetch the toolbox content, then set up the toolbox.
	this.loadPromise =
		Utils.fetch(this.PARTIALS_DIR + 'floating_selection_toolbar.html')
			.then(this._setUp.bind(this));
	
	// Hide by default.
	this.hide();
}

// Define constants.
/** @constant {String} The path and prefix for the partial */
FloatingSelectionToolbar.prototype.PARTIALS_DIR = 'partials/';
/** @constant {String} The CSS class for the container element */
FloatingSelectionToolbar.prototype.CSS_CLASSES = 'floatingToolbar card z1';

Object.defineProperties(FloatingSelectionToolbar.prototype, {
	x: {
		get: function () {
			return this._x;
		},
		set: function (value) {
			this._x = value;
			this._updatePosition();
		}
	},
	y: {
		get: function () {
			return this._y;
		},
		set: function (value) {
			this._y = value;
			this._updatePosition();
		}
	}
});

/**
 * @private
 * Populate the toolbox with its contents and add it to the toolbar.
 * @param {String} contents - The HTML contents of the dialog
 */
FloatingSelectionToolbar.prototype._setUp = function (contents) {
	this._element.innerHTML = contents;
	
	// Update keyboard shortcut listings for Apple users.
	if (Utils.isApple) {
		this._element.innerHTML = this._element.innerHTML.replace(/Ctrl\+/g, '&#x2318;').replace(/Alt\+/g, '&#x2325;').replace(/Shift\+/g, '&#x21e7;');
	}
	
	// Set up buttons.
	var deleteBtn = this._element.querySelector('#deleteBtn');
	deleteBtn.addEventListener('click', this._selectionTool.clear.bind(this._selectionTool), false);
	
	var cutBtn = this._element.querySelector('#cutBtn');
	cutBtn.addEventListener('click', this._selectionTool.cut.bind(this._selectionTool), false);
	
	var copyBtn = this._element.querySelector('#copyBtn');
	copyBtn.addEventListener('click', this._selectionTool.copy.bind(this._selectionTool), false);
	
	var duplicateBtn = this._element.querySelector('#duplicateBtn');
	duplicateBtn.addEventListener('click', this._selectionTool.duplicate.bind(this._selectionTool), false);
	
	var cropBtn = this._element.querySelector('#cropBtn');
	cropBtn.addEventListener('click', this._selectionTool.cropToSelection.bind(this._selectionTool), false);
	
	if (!navigator.clipboard || !navigator.clipboard.write) {
		cutBtn.disabled = true;
		copyBtn.disabled = true;
	}
};

/**
 * @private
 * Update the toolbar's position to match the set x- and y-values.
 */
FloatingSelectionToolbar.prototype._updatePosition = function () {
	this._element.style.WebkitTransform =
		this._element.style.MozTransform =
		this._element.style.MsTransform =
		this._element.style.OTransform =
		this._element.style.transform = 'translate(' + this._x + 'px, ' + this._y + 'px)';
};

/**
 * Add and show the toolbar on the page.
 */
FloatingSelectionToolbar.prototype.show = function () {
	document.body.appendChild(this._element);
};

/**
 * Remove the toolbar from the page.
 */
FloatingSelectionToolbar.prototype.hide = function () {
	if (document.body.contains(this._element)) {
		document.body.removeChild(this._element);
	}
};
