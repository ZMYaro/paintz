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
	
	this.drag;
	
	this.elem = document.createElement('div');
	this.elem.className = 'floatingRegion';
	
	this._addDragHandles();
	
	// Use the pointer handlers for tools when the region gets moved or resized.
	this.elem.addEventListener('pointerdown', this.handleDragStart.bind(this), false);
}

// Define constants.
/** @constant {Number} How far outside the region it can be clicked to drag, in pixels */
FloatingRegion.prototype.GRABBABLE_MARGIN = 24;

Object.defineProperties(FloatingRegion.prototype, {
	x: {
		get: function () {
			return this._x;
		},
		set: function (value) {
			this._x = Math.round(value);
			this._updateTransform();
		}
	},
	y: {
		get: function () {
			return this._y;
		},
		set: function (value) {
			this._y = Math.round(value);
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
			this._width = Math.round(value);
			var zoomedWidth = Math.ceil(zoomManager.level * this._width);
			this.elem.style.width = zoomedWidth + 'px';
		}
	},
	height: {
		get: function () {
			return this._height;
		},
		set: function (value) {
			this._height = Math.round(value);
			var zoomedHeight = Math.ceil(zoomManager.level * this._height);
			this.elem.style.height = zoomedHeight + 'px';
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
 * @private
 * Create and append drag handle elements for the draggable region.
 */
FloatingRegion.prototype._addDragHandles = function () {
	var boundHandleDragStart = this.handleDragStart.bind(this);
	
	['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(function (direction) {
		var dragHandle = document.createElement('div');
		dragHandle.className = 'resizeHandle resize' + direction.toUpperCase();
		dragHandle.dataset.direction = direction;
		dragHandle.addEventListener('pointerdown', boundHandleDragStart, false);
		this.elem.appendChild(dragHandle);
	}, this);
};

/**
 * @private
 * Update the region's CSS translation to the current x- and y-values.
 */
FloatingRegion.prototype._updateTransform = function () {
	var zoomedX = Math.floor(zoomManager.level * this._x),
		zoomedY = Math.floor(zoomManager.level * this._y);
	this.elem.style.WebkitTransform =
		this.elem.style.MozTransform =
		this.elem.style.MsTransform =
		this.elem.style.OTransform =
		this.elem.style.transform = 'translate(' + zoomedX + 'px, ' + zoomedY + 'px)' +
			'scale(' + this._scale + ')';
};

/**
 * @private
 * Handle starting to drag the region or a resize handle.
 * @param {PointerEvent} ev
 */
FloatingRegion.prototype.handleDragStart = function (ev) {
	this.drag = {
		initial: {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height
		},
		pointerStart: {
			x: Utils.getCanvasX(ev.pageX) / zoomManager.level,
			y: Utils.getCanvasY(ev.pageY) / zoomManager.level,
		},
		// If the drag was started on a resize handle, get the direction;
		// otherwise, the entire region is being dragged.
		type: ev.currentTarget.dataset.direction || 'move'
	};
	tools._boundPointerDownHandler(ev);
};

/**
 * @private
 * Handle a dragged resize handle being moved.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FloatingRegion.prototype.handleDragMove = function (pointerState) {
	if (!this.drag) {
		return;
	}
	var pointerDelta = {
		x: pointerState.x - this.drag.pointerStart.x,
		y: pointerState.y - this.drag.pointerStart.y
	};
	switch (this.drag.type) {
		case 'move':
			this.x = this.drag.initial.x + pointerDelta.x,
			this.y = this.drag.initial.y + pointerDelta.y
			break;
		case 'nw':
			// TODO
			break;
		case 'n':
			// TODO
			break;
		case 'ne':
			// TODO
			break;
		case 'e':
			this.width = this.drag.initial.width + pointerDelta.x;
			break;
		case 'se':
			this.width = this.drag.initial.width + pointerDelta.x;
			this.height = this.drag.initial.height + pointerDelta.y;
			break;
		case 's':
			this.height = this.drag.initial.height + pointerDelta.y;
			break;
		case 'sw':
			// TODO
			break;
		case 'w':
			// TODO
			break;
	}
};

/**
 * @private
 * Handle a dragged resize handle being released.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FloatingRegion.prototype.handleDragEnd = function (pointerState) {
	if (!this.drag) {
		return;
	}
	delete this.drag;
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
