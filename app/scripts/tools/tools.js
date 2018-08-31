'use strict';

/**
 * Create a new ToolManager instance and set up its event listeners.
 */
function ToolManager() {
	this.pencil = new PencilTool(cxt, preCxt);
	this.doodle = new DoodleTool(cxt, preCxt);
	this.line = new LineTool(cxt, preCxt);
	this.curve = new CurveTool(cxt, preCxt);
	this.rect = new RectangleTool(cxt, preCxt);
	this.oval = new OvalTool(cxt, preCxt);
	this.eraser = new EraserTool(cxt, preCxt);
	this.floodFill = new FloodFillTool(cxt, preCxt);
	this.eyedropper = new EyedropperTool(cxt, preCxt);
	this.selection = new SelectionTool(cxt, preCxt);
	this.text = new TextTool(cxt,preCxt);
	this.pan = new PanTool(cxt, preCxt);
	
	// Prevent normal mouse click behaviors on the canvas.
	preCanvas.addEventListener('click',       function (e) { e.preventDefault(); }, false);
	preCanvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
	
	// Set up the event listeners.
	this._boundPointerDownHandler = this._handlePointerDown.bind(this);
	this._boundPointerMoveHandler = this._handlePointerMove.bind(this);
	this._boundPointerUpHandler = this._handlePointerUp.bind(this);
	preCanvas.addEventListener('pointerdown', this._boundPointerDownHandler, false);
	document.addEventListener('pointermove', this._boundPointerMoveHandler, false);
	document.addEventListener('pointerup', this._boundPointerUpHandler, false);
	document.addEventListener('pointerleave', this._boundPointerUpHandler, false);
	
	this._state = this.STATE_INACTIVE;
	
	this.currentTool.activate();
}

// Define constants.
ToolManager.prototype.STATE_INACTIVE = 0;
ToolManager.prototype.STATE_ACTIVE = 1;

Object.defineProperties(ToolManager.prototype, {
	currentTool: {
		get: function () {
			return this[settings.get('tool')];
		}
	}
});

/**
 * Switch to the specified tool.
 * @param {String} toolName - The name of the tool to switch to
 */
ToolManager.prototype.switchTool = function (toolName) {
	// Deactivate the current tool.
	this.currentTool.deactivate();
	// Clear the preview canvas.
	Utils.clearCanvas(preCxt);
	// Set and activate the newly-selected tool.
	settings.set('tool', toolName);
	this.currentTool.activate();
	// Update the toolbar.
	document.getElementById('tools').tool.value = toolName;
};

/**
 * @private
 * Start drawing with the current tool.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerDown = function (e) {
	if (this._state !== this.STATE_INACTIVE) {
		return;
	}
	
	// Quit if the left or right mouse button was not the button used.
	// (A touch is treated as a left mouse button.)
	if (e.button !== 0 && e.button !== 2) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	preCanvas.focus();
	
	// Initialize the new shape.
	this.currentTool.start({
		button: e.button,
		ctrlKey: Utils.checkPlatformCtrlKey(e),
		shiftKey: e.shiftKey,
		x: Utils.getCanvasX(e.pageX) / zoomManager.level,
		y: Utils.getCanvasY(e.pageY) / zoomManager.level
	});
	
	// Set the state to continue drawing.
	this._state = this.STATE_ACTIVE;
};

/**
 * @private
 * Complete the canvas or preview canvas with the shape currently being drawn.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerMove = function (e) {
	if (this._state !== this.STATE_ACTIVE) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	// Update the shape.
	this.currentTool.move({
		x: Utils.getCanvasX(e.pageX) / zoomManager.level,
		y: Utils.getCanvasY(e.pageY) / zoomManager.level
	});
};

/**
 * @private
 * Complete the current shape and stop drawing.
 * @param {MouseEvent|TouchEvent} e
 */
ToolManager.prototype._handlePointerUp = function (e) {
	if (this._state !== this.STATE_ACTIVE) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	// Complete the task.
	this.currentTool.end({
		x: Utils.getCanvasX(e.pageX) / zoomManager.level,
		y: Utils.getCanvasY(e.pageY) / zoomManager.level
	});
	
	// Set the state to ready to start the next drawing.
	this._state = this.STATE_INACTIVE;
};
