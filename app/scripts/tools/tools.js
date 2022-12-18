'use strict';

/**
 * Create a new ToolManager instance and set up its event listeners.
 */
function ToolManager() {
	this.pencil = new PencilTool(cxt, preCxt);
	this.doodle = new DoodleTool(cxt, preCxt);
	this.airbrush = new AirbrushTool(cxt, preCxt);
	this.line = new LineTool(cxt, preCxt);
	this.curve = new CurveTool(cxt, preCxt);
	this.rect = new RectangleTool(cxt, preCxt);
	this.roundRect = new RoundedRectangleTool(cxt, preCxt);
	this.oval = new OvalTool(cxt, preCxt);
	this.polygon = new PolygonTool(cxt, preCxt);
	this.eraser = new EraserTool(cxt, preCxt);
	this.floodFill = new FloodFillTool(cxt, preCxt);
	this.eyedropper = new EyedropperTool(cxt, preCxt);
	this.selection = new SelectionTool(cxt, preCxt);
	this.freeformSelection = new FreeformSelectionTool(cxt, preCxt);
	this.text = new TextTool(cxt,preCxt);
	this.pan = new PanTool(cxt, preCxt);
	
	// Prevent normal mouse click behaviors on the canvas.
	preCanvas.addEventListener('click',       function (e) { e.preventDefault(); }, false);
	preCanvas.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
	
	// Set up the event listeners.
	this._boundPointerDownHandler = this._handlePointerDown.bind(this);
	this._boundPointerMoveHandler = this._handlePointerMove.bind(this);
	this._boundPointerUpHandler = this._handlePointerUp.bind(this);
	this._boundUpdate = this._update.bind(this);
	preCanvas.addEventListener('pointerdown', this._boundPointerDownHandler, false);
	document.addEventListener('pointermove', this._boundPointerMoveHandler, false);
	document.addEventListener('pointerup', this._boundPointerUpHandler, false);
	document.addEventListener('pointerleave', this._boundPointerUpHandler, false);
	preCanvas.addEventListener('dblclick', this._handleDoubleClick.bind(this), false);
	Utils.raf(this._boundUpdate);
	
	this._state = this.STATE_INACTIVE;
	
	this.currentTool = this[settings.get('tool')];
	this.currentTool.activate();
}

// Define constants.
ToolManager.prototype.STATE_INACTIVE = 0;
ToolManager.prototype.STATE_ACTIVE = 1;


/**
 * Switch to the specified tool.
 * @param {String} toolName - The name of the tool to switch to
 */
ToolManager.prototype.switchTool = function (toolName) {
	// Deactivate the current tool.
	this.currentTool.deactivate();
	// Clear the preview canvas.
	preCxt.reset();
	// Set and activate the newly-selected tool.
	settings.set('tool', toolName);
	this.currentTool = this[toolName];
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
	// Do not start if already drawing.
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
	
	// If something other than the canvas is focused, unfocus it to make
	// it seem as though focus has moved to the canvas.  (Do not actually
	// focus the canvas because that can scroll the window.)
	if (document.activeElement !== preCanvas) {
		document.activeElement.blur();
	}
	
	var adjustedX = Utils.getCanvasX(e.pageX) / zoomManager.level,
		adjustedY = Utils.getCanvasY(e.pageY) / zoomManager.level;
	
	// Initialize the new shape.
	this.currentTool.start({
		button: e.button,
		ctrlKey: Utils.checkPlatformCtrlOrCmdKey(e),
		shiftKey: e.shiftKey,
		x: adjustedX,
		y: adjustedY,
		windowX: e.clientX,
		windowY: e.clientY
	});
	
	// Set the state to continue drawing.
	this._state = this.STATE_ACTIVE;
};

/**
 * @private
 * Have the tool update in response to the pointer moving.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerMove = function (e) {
	// Update the pointer coordinates in the bottom bar.
	var adjustedX = Utils.getCanvasX(e.pageX) / zoomManager.level,
		adjustedY = Utils.getCanvasY(e.pageY) / zoomManager.level,
		intX = Math.floor(adjustedX),
		intY = Math.floor(adjustedY);
	
	toolbar.toolboxes.dimensions.updatePointerCoords(intX, intY);
	
	// Do not continue drawing if not started.
	if (this._state !== this.STATE_ACTIVE) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	// Update the tool.
	this.currentTool.move({
		ctrlKey: Utils.checkPlatformCtrlOrCmdKey(e),
		shiftKey: e.shiftKey,
		x: adjustedX,
		y: adjustedY,
		windowX: e.clientX,
		windowY: e.clientY
	});
};

/**
 * @private
 * Complete the current task and stop drawing.
 * @param {PointerEvent} e
 */
ToolManager.prototype._handlePointerUp = function (e) {
	// Do not end if not started.
	if (this._state !== this.STATE_ACTIVE) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	var adjustedX = Utils.getCanvasX(e.pageX) / zoomManager.level,
		adjustedY = Utils.getCanvasY(e.pageY) / zoomManager.level;
	
	// Complete the task.
	this.currentTool.end({
		ctrlKey: Utils.checkPlatformCtrlOrCmdKey(e),
		shiftKey: e.shiftKey,
		x: adjustedX,
		y: adjustedY,
		windowX: e.clientX,
		windowY: e.clientY
	});
	
	// Set the state to ready to start the next drawing.
	this._state = this.STATE_INACTIVE;
};

/**
 * @private
 * Handle double-clicking the canvas for tools that respond to it.
 * @param {MouseEvent} e
 */
ToolManager.prototype._handleDoubleClick = function (e) {
	if (this.currentTool === this.polygon) {
		e.preventDefault();
		this.currentTool.finalizePolygon();
	}
};

/**
 * @private
 * Have the current tool update the canvas if necessary.
 */
ToolManager.prototype._update = function () {
	if (this._state === this.STATE_ACTIVE) {
		this.currentTool.update();
	}
	
	Utils.raf(this._boundUpdate);
};
