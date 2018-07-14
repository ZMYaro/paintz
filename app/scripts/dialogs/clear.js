'use strict';

/**
 * @class
 * Create a new ClearDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ClearDialog(trigger) {
	Dialog.call(this, 'clear', trigger);
	this._element.addEventListener('submit', this._clear.bind(this));
}
// Extend Dialog.
ClearDialog.prototype = Object.create(Dialog.prototype);

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ClearDialog.prototype.WIDTH = '384px';

/**
 * @private
 * Save the selected settings.
 */
ClearDialog.prototype._clear = function () {
	// Animate clearing the canvas.
	var CENTER_X = 0,
		CENTER_Y = -224,
		MAX_RADIUS = Math.max(canvas.width, canvas.height) * 2,
		STEP = Math.floor(MAX_RADIUS / 16),
		radius = 224;
	
	function expandClearCircle() {
		radius += STEP;
		
		cxt.fillStyle = localStorage.fillColor;
		cxt.beginPath();
		cxt.arc(CENTER_X, CENTER_Y, radius, 0, 2 * Math.PI);
		cxt.closePath();
		cxt.fill();
		
		if (radius < MAX_RADIUS) {
			Utils.raf(expandClearCircle);
		} else {
			// Finish clearing and add the change to the undo stack.
			resetCanvas();
			undoStack.addState();
		}
	}
	Utils.raf(expandClearCircle);
	document.title = DEFAULTS.title + ' - PaintZ';
};
