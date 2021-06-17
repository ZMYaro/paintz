'use strict';

/**
 * Create a new FloatingSelectionToolbar instance.
 */
function FloatingSelectionToolbar() {
	Toolbox.call(this, 'floating_selection_toolbar');
	
	this._element.setAttribute('role', 'toolbar');
	
	this._x = 0;
	this._y = 0;
	
	// Hide by default.
	this.hide();
}
// Extend Toolbox.
FloatingSelectionToolbar.prototype = Object.create(Toolbox.prototype);
FloatingSelectionToolbar.prototype.constructor = FloatingSelectionToolbar;

// Define constants.
/** @constant {String} The CSS classes for the container element */
FloatingSelectionToolbar.prototype.CSS_CLASS = 'floatingToolbar card z1';

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
 * @override
 * @private
 * Populate the toolbox with its contents and add it to the toolbar.
 * @param {String} contents - The HTML contents of the dialog
 */
FloatingSelectionToolbar.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up buttons.
	var deselectBtn = this._element.querySelector('#deselectBtn');
	deselectBtn.addEventListener('click', function () {
		tools.currentTool.deactivate();
	}, false);
	
	var deleteBtn = this._element.querySelector('#deleteBtn');
	deleteBtn.addEventListener('click', function () {
		tools.currentTool.clear();
	}, false);
	
	var cutBtn = this._element.querySelector('#cutBtn');
	cutBtn.addEventListener('click', function () {
		tools.currentTool.cut();
	}, false);
	
	var copyBtn = this._element.querySelector('#copyBtn');
	copyBtn.addEventListener('click', function () {
		tools.currentTool.copy();
	}, false);
	
	var duplicateBtn = this._element.querySelector('#duplicateBtn');
	duplicateBtn.addEventListener('click', function () {
		tools.currentTool.duplicate();
	}, false);
	
	var cropBtn = this._element.querySelector('#cropBtn');
	cropBtn.addEventListener('click', function () {
		tools.currentTool.cropToSelection();
	}, false);
	
	if (!navigator.clipboard || !navigator.clipboard.write) {
		cutBtn.disabled =
			copyBtn.disabled = true;
		cutBtn.title =
			copyBtn.title = ClipboardManager.prototype.CLIPBOARD_UNSUPPORTED_MESSAGE;
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
 * @override
 * Add and show the toolbar on the page.
 */
FloatingSelectionToolbar.prototype.show = function () {
	document.body.appendChild(this._element);
};

/**
 * @override
 * Remove the toolbar from the page.
 */
FloatingSelectionToolbar.prototype.hide = function () {
	if (this._element.parentElement) {
		this._element.parentElement.removeChild(this._element);
	}
};
