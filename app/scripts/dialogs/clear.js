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
ClearDialog.prototype.constructor = ClearDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ClearDialog.prototype.WIDTH = '384px';

/**
 * @private
 * Save the selected settings.
 */
ClearDialog.prototype._clear = function () {
	// Deactivate and reactivate the current tool in case it is being used.
	tools.currentTool.deactivate();
	tools.currentTool.activate();
	
	// Animate clearing the canvas.
	var CENTER_X = 0,
		CENTER_Y = -224,
		MAX_RADIUS = Math.max(canvas.width, canvas.height) * 2,
		STEP = Math.floor(MAX_RADIUS / 16),
		radius = 224;
	
	if (Utils.prefersReducedMotion) {
		// Skip the animation if the user prefers reduced motion.
		radius = MAX_RADIUS;
	}
	
	function expandClearCircle() {
		radius += STEP;
		
		cxt.fillStyle = settings.get('fillColor');
		cxt.beginPath();
		cxt.arc(CENTER_X, CENTER_Y, radius, 0, Math.TAU);
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
	document.title = DEFAULT_TITLE + PAGE_TITLE_SUFFIX;
};
