'use strict';

/**
 * Create a new FloatingRegion instance.
 */
function FloatingRegion() {
	this._x =
		this._y =
		this._width =
		this._height = 0;
	this._scale = 1;
	this._showHandles = true;
	
	this.elem = document.createElement('div');
	this.elem.className = 'floatingRegion';
	
	this._addDragHandles();
	
	setTimeout((function () {
		// TODO: Rewrite this to not access a private field.
		// And not to need to happen a frame later so `tools` has been defined.
		this.elem.addEventListener('pointerdown', tools._boundPointerDownHandler, false);
	}).bind(this), 1);
}

// Constants.
/** @constant {Number} How far outside the region it can be clicked to drag, in pixels */
FloatingRegion.GRABBABLE_MARGIN = 24;

Object.defineProperties(FloatingRegion.prototype, {
	x: {
		get: function () {
			return this._x;
		},
		set: function (value) {
			this._x = value;
			this._updateTransform();
		}
	},
	y: {
		get: function () {
			return this._y;
		},
		set: function (value) {
			this._y = value;
			this._updateTransform();
		}
	},
	scale: {
		get: function () {
			return this._scale;
		},
		set: function (value) {
			this._scale = value;
			this._updateTransform();
		}
	},
	width: {
		get: function () {
			return this._width;
		},
		set: function (value) {
			this._width = value;
			this.elem.style.width = value + 'px';
		}
	},
	height: {
		get: function () {
			return this._height;
		},
		set: function (value) {
			this._height = value;
			this.elem.style.height = value + 'px';
		}
	},
	showHandles: {
		get: function () {
			return this._showHandles;
		},
		set: function (value) {
			// For browsers that do not support calling `classList.toggle` with a boolean.
			this.elem.classList[value ? 'remove' : 'add']('hideHandles');
			this._showHandles = value;
		}
	}
});

/**
 * Create and append drag handle elements for the draggable region.
 */
FloatingRegion.prototype._addDragHandles = function () {
	['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(function (direction) {
		var dragHandle = document.createElement('div');
		dragHandle.className = 'resizeHandle resize' + direction.toUpperCase();
		// TODO: Add event listener.
		this.elem.appendChild(dragHandle);
	}, this);
};

/**
 * Update the region's CSS translation to the current x- and y-values.
 */
FloatingRegion.prototype._updateTransform = function () {
	this.elem.style.WebkitTransform =
		this.elem.style.MozTransform =
		this.elem.style.MsTransform =
		this.elem.style.OTransform =
		this.elem.style.transform = 'translate(' + this._x + 'px, ' + this._y + 'px)' +
			'scale(' + this._scale + ')';
};

/**
 * Append the floating region element to the body.
 */
FloatingRegion.prototype.addToDOM = function () {
	if (!canvasPositioner.contains(this.elem)) {
		canvasPositioner.appendChild(this.elem);
	}
};

/**
 * Append the floating region element to the body.
 */
FloatingRegion.prototype.removeFromDOM = function () {
	if (canvasPositioner.contains(this.elem)) {
		try {
			// Wrapping in a try block because sometimes contains incorrectly returns true for the text tool.
			canvasPositioner.removeChild(this.elem);
		} catch (err) {}
	}
};
