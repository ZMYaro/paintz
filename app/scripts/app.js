'use strict';

// Constants.
var PNG_REGEX = (/.+\.png$/i),
	JPEG_REGEX = (/.+\.(jpg|jpeg|jpe|jif|jfif|jfi)$/i),
	FILE_EXT_REGEX = (/\.[a-z0-9]{1,4}$/i),
	DEFAULT_TITLE = 'untitled.png';

var canvas,
	preCanvas,
	cursorCanvas,
	cxt,
	preCxt,
	cursorCxt,
	tools,
	zoomManager,
	dialogsContainer,
	settings,
	dialogs = {},
	toolbar = {},
	keyboardDialog,
	saveDialog,
	progressSpinner;

/**
 * Switch to the specified tool.
 * @param {String} tool - The name of the tool to switch to
 */
function switchTool(tool) {
	// Deactivate the current tool.
	tools[settings.get('tool')].deactivate();
	// Clear the preview canvas.
	Utils.clearCanvas(preCxt);
	// Set and activate the newly-selected tool.
	settings.set('tool', tool);
	tools[tool].activate();
	// Update the toolbar.
	document.getElementById('tools').tool.value = tool;
}

/**
 * Get the canvases and their drawing contexts, and set up event listeners.
 */
function initCanvas() {
	// Get the real canvas.
	canvas = document.getElementById('canvas');
	cxt = canvas.getContext('2d');
	// Get the preview canvas.
	preCanvas = document.getElementById('preCanvas');
	preCxt = preCanvas.getContext('2d');
	// Get the cursor canvas.
	cursorCanvas = document.getElementById('cursorCanvas');
	cursorCxt = cursorCanvas.getContext('2d');
	
	cxt.lineCap = 'round';
	preCxt.lineCap = 'round';
	
	// Set up event listeners for drawing.
	preCanvas.addEventListener('pointerdown', startTool, false);
	preCanvas.oncontextmenu = function (e) {
		e.preventDefault();
	};
}

/**
 * Initialize the tools.
 */
function initTools() {
	tools = {
		pencil: new PencilTool(cxt, preCxt),
		doodle: new DoodleTool(cxt, preCxt),
		line: new LineTool(cxt, preCxt),
		curve: new CurveTool(cxt, preCxt),
		rect: new RectangleTool(cxt, preCxt),
		oval: new OvalTool(cxt, preCxt),
		eraser: new EraserTool(cxt, preCxt),
		floodFill: new FloodFillTool(cxt, preCxt),
		eyedropper: new EyedropperTool(cxt, preCxt),
		selection: new SelectionTool(cxt, preCxt),
		text: new TextTool(cxt,preCxt),
		pan: new PanTool(cxt, preCxt)
	};
	tools[settings.get('tool')].activate();
}

/**
 * Start drawing with the current tool.
 * @param {MouseEvent|TouchEvent} e
 */
function startTool(e) {
	// Quit if the left or right mouse button was not the button used.
	// (A touch is treated as a left mouse button.)
	if (e.button !== 0 && e.button !== 2) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	// Remove the event listener for starting drawing.
	preCanvas.removeEventListener('pointerdown', startTool, false);
	
	canvas.focus();
	
	// Initialize the new shape.
	tools[settings.get('tool')].start({
		button: e.button,
		ctrlKey: Utils.checkPlatformCtrlKey(e),
		shiftKey: e.shiftKey,
		x: Utils.getCanvasX(e.pageX) / zoomManager.level,
		y: Utils.getCanvasY(e.pageY) / zoomManager.level
	});
	
	// Set the event listeners to continue and end drawing.
	document.addEventListener('pointermove', moveTool, false);
	document.addEventListener('pointerup', endTool, false);
	document.addEventListener('pointerleave', endTool, false);
}

/**
 * Complete the canvas or preview canvas with the shape currently being drawn.
 * @param {MouseEvent|TouchEvent} e
 */
function moveTool(e) {
	e.preventDefault();
	e.stopPropagation();
	
	// Update the shape.
	tools[settings.get('tool')].move({
		x: Utils.getCanvasX(e.pageX) / zoomManager.level,
		y: Utils.getCanvasY(e.pageY) / zoomManager.level
	});
}
/**
 * Complete the current shape and stop drawing.
 * @param {MouseEvent|TouchEvent} e
 */
function endTool(e) {
	e.preventDefault();
	e.stopPropagation();
	
	// Remove the event listeners for ending drawing.
	document.removeEventListener('pointermove', moveTool, false);
	document.removeEventListener('pointerup', endTool, false);
	document.removeEventListener('pointerleave', endTool, false);
	
	// Complete the task.
	tools[settings.get('tool')].end({
		x: Utils.getCanvasX(e.pageX) / zoomManager.level,
		y: Utils.getCanvasY(e.pageY) / zoomManager.level
	});
	
	// Set the event listeners to start the next drawing.
	preCanvas.addEventListener('pointerdown', startTool, false);
}
/**
 * Overwrite the canvas with the current fill color.
 */
function resetCanvas() {
	cxt.fillStyle = settings.get('fillColor');
	cxt.fillRect(0, 0, canvas.width, canvas.height);
}

/*
 * Fix the extension on a file name to match a MIME type.
 * @param {String} name - The file name to fix
 * @param {String} type - The MIME type to match (JPEG or PNG)
 * @returns {String} - The modified file name
 */
function fixExtension(name, type) {
	name = name.trim();
	
	if (type === 'image/png' && !PNG_REGEX.test(name)) {
		if (FILE_EXT_REGEX.test(name)) {
			return name.replace(FILE_EXT_REGEX, '.png');
		} else {
			return name + '.png';
		}
	} else if (type === 'image/jpeg' && !JPEG_REGEX.test(name)) {
		if (FILE_EXT_REGEX.test(name)) {
			return name.replace(FILE_EXT_REGEX, '.jpg');
		} else {
			return name + '.jpg';
		}
	}
	return name;
}

window.addEventListener('load', function () {
	// Initialize keyboard shortcut dialog.
	dialogs.keyboard = new KeyboardDialog();
	
	// Initialize everything.
	initCanvas();
	settings = new SettingsManager();
	zoomManager = new ZoomManager();
	toolbar = new ToolbarManager();
	initTools();
	progressSpinner = new ProgressSpinner();
	
	// Get saved reference to the dialogs container.
	dialogsContainer = document.getElementById('dialogs');
	
	// Update the resolution in the bottom bar.
	document.getElementById('resolution').innerHTML = settings.get('width') + ' &times; ' + settings.get('height') + 'px';
	
	
	// Wait for all the toolbar and dialog content to load.
	var dialogLoadPromises = Object.values(dialogs).map(function (dialog) { return dialog.loadPromise; }),
		masterLoadPromise = Promise.all([toolbar.loadPromise, dialogLoadPromises]);
	
	masterLoadPromise.then(postLoadInit);
	masterLoadPromise.catch(function (err) {
		var errorDisplay = document.createElement('p'),
			errorMessage = document.createElement('span');
		errorDisplay.innerHTML = 'Oops, something went wrong!  Maybe try again later?<br /><br />If this keeps happening, you can tell the developer: ';
		errorMessage.style.display = 'inline-block';
		errorMessage.innerText += '\u201c' + err + '\u201d';
		errorDisplay.appendChild(errorMessage);
		
		var splashScreen = document.getElementById('splashScreen');
		splashScreen.removeChild(splashScreen.querySelector('progress'));
		splashScreen.appendChild(errorDisplay);
	});
}, false);

function postLoadInit() {
	// Get the canvas ready.
	resetCanvas();
	
	// Save the initial state.
	undoStack.addState();
	
	// Enable keyboard shortcuts.
	keyManager.enableAppShortcuts();
	
	// Set the title once everything else is ready.
	document.title = DEFAULT_TITLE + ' - PaintZ'
	
	// Hide the splash screen.
	document.body.removeChild(document.getElementById('splashScreen'));
	
	if (!settings.get('firstRunDone')) {
		// Show the welcome dialog if this is the user's first time using PaintZ (in this browser).
		var welcomeDialog = new WelcomeDialog(document.getElementById('helpBtn'));
		welcomeDialog.loadPromise.then(function () {
			welcomeDialog.open();
			settings.set('firstRunDone', true);
		});
	}
}
