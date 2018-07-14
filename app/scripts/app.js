'use strict';

// RegExes.
var PNG_REGEX = (/.+\.png$/i),
	JPEG_REGEX = (/.+\.(jpg|jpeg|jpe|jif|jfif|jfi)$/i),
	FILE_EXT_REGEX = (/\.[a-z0-9]{1,4}$/i);

// Other global constants.
var MIN_SIZE = 1,
	MAX_SIZE = 99999;

// Default settings
var DEFAULTS = {
	title: 'untitled.png',
	width: 640,
	height: 480,
	lineWidth: 2,
	outlineOption: 'outlineFill',
	lineColor: '#000000',
	fillColor: '#ffffff',
	fontSize: 16,
	tool: 'doodle',
	ghostDraw: '',
	antiAlias: true,
	maxUndoStackDepth: 50
};

var canvas,
	preCanvas,
	cursorCanvas,
	cxt,
	preCxt,
	cursorCxt,
	tools,
	dialogsContainer,
	keyboardDialog,
	saveDialog,
	progressSpinner;

/**
 * Switch to the specified tool.
 * @param {String} tool - The name of the tool to switch to
 */
function switchTool(tool) {
	// Deactivate the current tool.
	tools[localStorage.tool].deactivate();
	// Clear the preview canvas.
	Utils.clearCanvas(preCxt);
	// Set and activate the newly-selected tool.
	localStorage.tool = tool;
	tools[tool].activate();
	// Update the toolbar.
	document.getElementById('tools').tool.value = tool;
}

/**
 * Get the toolbar form elements.
 */
function initToolbar() {
	var forms = document.getElementsByTagName('form');
	for (var i = 0; i < forms.length; i++) {
		forms[i].addEventListener('submit', function (e) {
			e.preventDefault();
		}, false);
	}

	document.getElementById('tools').onchange = function (e) {
		// Switch to the newly-selected tool.
		switchTool(e.target.value);
	};

	document.getElementById('lineWidth').onchange = function (e) {
		localStorage.lineWidth = e.target.value;
		// Some tools' cursors change with the line width, so reactivate the tool.
		tools[localStorage.tool].activate();
	};
	
	document.getElementById('outlineOptions').onchange = function (e) {
		localStorage.outlineOption = e.target.value;
	}

	// Set up the toolbar color picker.
	var colorPicker = document.getElementById('colorPicker'),
		colorIndicator = document.getElementById('colors'),
		colors = colorPicker.getElementsByTagName('button');
	for (var i = 0; i < colors.length; i++) {
		// Handle left click.
		colors[i].addEventListener('click', function (e) {
			if (!Utils.checkModifierKeys(e)) {
				e.preventDefault();
				e.stopPropagation();
				if (e.button === 0) {
					localStorage.lineColor = e.target.dataset.value;
					colorIndicator.style.borderColor = e.target.dataset.value;
					// Some tools' cursors change with the line color, so reactivate the cursor.
					tools[localStorage.tool].activate();
				}
			}
		}, false);
		// Handle right click.
		colors[i].addEventListener('contextmenu', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.button === 2) {
				localStorage.fillColor = e.target.dataset.value;
				colorIndicator.style.backgroundColor = e.target.dataset.value;
				// Some tools' cursors change with the fill color, so reactivate the cursor.
				tools[localStorage.tool].activate();
			}
		}, false);
	}
	// Set up the color picker dialog.
	var colorPickerDialog = new ColorPickerDialog(colorIndicator);
	colorIndicator.onclick = colorPickerDialog.open.bind(colorPickerDialog);

	// Set up the event listener for the Pac-Man easter egg.
	document.querySelector('#colorPicker button[data-value=\"#FFEB3B\"]').addEventListener('click', function (e) {
		// If the button was Ctrl+Shift+clicked...
		if (Utils.checkPlatformCtrlKey(e) && e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();
			if (!window.pacMan) {
				// If Pac-Man has not been started, create and start a new Pac-Man.
				window.pacMan = new PacMan(canvas);
				window.pacMan.start();
				// Update the button to show the easter egg has been activated.
				e.target.className = 'pacman';
			} else {
				// If Pac-Man is running, delete Pac-Man.
				window.pacMan.stop();
				delete window.pacMan;
				e.target.classList.remove('pacman');
			}
		}
	}, false);

	// Clear button and dialog.
	var clearBtn = document.getElementById('clearBtn'),
		clearDialog = new ClearDialog(clearBtn);
	clearBtn.onclick = clearDialog.open.bind(clearDialog);
	
	// Save as button and dialog.
	var saveBtn = document.getElementById('saveBtn');
	saveDialog = new SaveDialog(saveBtn);
	saveBtn.onclick = saveDialog.open.bind(saveDialog);
	
	// Undo and redo buttons.
	document.getElementById('undoBtn').onclick = undoStack.undo.bind(undoStack);
	document.getElementById('redoBtn').onclick = undoStack.redo.bind(undoStack);

	// Resize button and dialog.
	var resizeBtn = document.getElementById('resizeBtn'),
		resizeDialog = new ResizeDialog(resizeBtn);
	resizeBtn.onclick = resizeDialog.open.bind(resizeDialog);

	// Uploader.
	document.getElementById('upload').addEventListener('change', function (e) {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			progressSpinner.show();
			
			var file = e.target.files[0];
			if (!file) {
				return;
			}
			if (!file.type.match('image.*')) {
				alert('PaintZ can only open valid image files.');
				return;
			}
			var reader = new FileReader();
			reader.onload = function () {
				var image = new Image();
				
				image.onload = function () {
					// There is no need to clear the canvas.  Resizing the canvas will do that.
					canvas.width = this.width;
					canvas.height = this.height;
					preCanvas.width = this.width;
					preCanvas.height = this.height;
					localStorage.width = this.width;
					localStorage.height = this.height;
					document.getElementById('resolution').innerHTML = this.width + ' &times; ' + this.height + 'px';
					cxt.fillStyle = 'white';
					cxt.fillRect(0, 0, canvas.width, canvas.height);
					cxt.drawImage(this, 0, 0);
					
					// Clear the undo and redo stacks.
					undoStack.clear();
					
					// Set the file type and name.
					// TODO: Make this not access SaveDialog private properties.
					var fileName = file.name;
					if (JPEG_REGEX.test(fileName)) {
						saveDialog._element.fileType.value =
							saveDialog._downloadLink.type = 'image/jpeg';
					} else {
						saveDialog._element.fileType.value =
							saveDialog._downloadLink.type = 'image/png';
						fileName = fileName.replace(FILE_EXT_REGEX, '.png');
					}
					saveDialog._element.fileName.value =
						saveDialog._downloadLink.download = fileName;
					document.title = fileName + ' - PaintZ';
					progressSpinner.hide();
				};
				image.src = this.result;
			};
			reader.readAsDataURL(file);
		} else {
			alert('Please switch to a browser that supports the file APIs such as Google Chrome or Internet Explorer 11.');
		}
	}, false);
	// Open button.
	document.getElementById('openBtn').addEventListener('click', function (e) {
		document.getElementById('upload').click();
	}, false);
	
	// Full screen button.
	document.getElementById('fullScreenBtn').onclick = function () {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen();
		} else if (canvas.mozRequestFullScreen) {
			canvas.mozRequestFullScreen();
		} else if (canvas.msRequestFullscreen) {
			canvas.msRequestFullscreen();
		} else {
			alert('Sorry, your web browser does not support full screen mode.');
		}
	};
	
	// Settings button and dialog.
	var settingsBtn = document.getElementById('settingsBtn'),
		settingsDialog = new SettingsDialog(settingsBtn);
	settingsBtn.onclick = settingsDialog.open.bind(settingsDialog);
	
	// Help button and dialog.
	var helpBtn = document.getElementById('helpBtn'),
		helpDialog = new HelpDialog(helpBtn);
	helpBtn.onclick = helpDialog.open.bind(helpDialog);

	// About button and dialog.
	var aboutBtn = document.getElementById('aboutBtn'),
		aboutDialog = new AboutDialog(aboutBtn);
	aboutBtn.onclick = aboutDialog.open.bind(aboutDialog);
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
 * Fetch the settings from localStorage.
 */
function initSettings() {
	for (var setting in DEFAULTS) {
		if (!(setting in localStorage)) {
			localStorage[setting] = DEFAULTS[setting];
		}
	}
	canvas.width = localStorage.width;
	canvas.height = localStorage.height;
	preCanvas.width = localStorage.width;
	preCanvas.height = localStorage.height;
	if (localStorage.ghostDraw) {
		preCanvas.classList.add('ghost');
	}
	document.getElementById('lineWidth').value = localStorage.lineWidth;
	document.getElementById('outlineOptions').outlineOption.value = localStorage.outlineOption;
	document.getElementById('colors').style.borderColor = localStorage.lineColor;
	document.getElementById('colors').style.backgroundColor = localStorage.fillColor;
	document.getElementById('tools').tool.value = localStorage.tool;
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
	tools[localStorage.tool].activate();
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
	tools[localStorage.tool].start({
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
	tools[localStorage.tool].move({
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
	tools[localStorage.tool].end({
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
	cxt.fillStyle = localStorage.fillColor;
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
	// Update keyboard shortcut listings for Apple users.
	if (Utils.isApple) {
		document.body.innerHTML = document.body.innerHTML.replace(/Ctrl\+/g, '&#x2318;').replace(/Alt\+/g, '&#x2325;').replace(/Shift\+/g, '&#x21e7;');
	}
	// Initialize keyboard shortcut dialog.
	keyboardDialog = new KeyboardDialog();
	
	
	// Initialize everything.
	initToolbar();
	initCanvas();
	initSettings();
	initTools();
	zoomManager.init();
	// Update the resolution in the bottom bar.
	document.getElementById('resolution').innerHTML = localStorage.width + ' &times; ' + localStorage.height + 'px';
	// Get the canvas ready.
	resetCanvas();
	// Save the initial state.
	undoStack.addState();
	// Enable keyboard shortcuts.
	keyManager.enableAppShortcuts();
	
	dialogsContainer = document.getElementById('dialogs');
	progressSpinner = new ProgressSpinner();
	
	document.title = DEFAULTS.title + ' - PaintZ'
	
	// Hide the loading indicator.
	dialogsContainer.removeChild(document.getElementById('loadingIndicator'));
	
	if (!localStorage.firstRunDone) {
		// Show the welcome dialog if this is the user's first time using PaintZ (in this browser).
		var welcomeDialog = new WelcomeDialog(document.getElementById('helpBtn'));
		welcomeDialog.open();
		localStorage.firstRunDone = 'true';
	} else {
		// Otherwise, just hide the dialog container.
		dialogsContainer.classList.remove('visible');
		dialogsContainer.style.display = 'none';
	}
}, false);
