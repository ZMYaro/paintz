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
	settings,
	clipboard,
	dialogs = {},
	toolbar = {},
	progressSpinner;

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
}

/**
 * Resize the canvas to new dimensions while preserving the contents.
 * @param {Number} newWidth - The new canvas width
 * @param {Number} newHeight - The new canvas height
 * @param {String} mode - Either 'scale' to stretch the canvas to the new dimensions or 'crop' to leave the existing content as is
 */
function resizeCanvas(newWidth, newHeight, mode) {
	// Tell the current tool to finish.
	tools.currentTool.deactivate();
	
	// Back up the canvas contents to the pre-canvas since resizing clears the canvas.
	preCxt.drawImage(canvas, 0, 0);
	// Resize the canvas.
	canvas.width = newWidth;
	canvas.height = newHeight;
	// Fill any blank space with the fill color.
	resetCanvas();
	// Stretch or place the old canvas contents to the resized canvas.
	if (mode === 'scale') {
		cxt.drawImage(preCanvas, 0, 0, newWidth, newHeight);
	} else {
		cxt.drawImage(preCanvas, 0, 0);
	}
	// Update the pre-canvas's size.
	preCanvas.width = newWidth;
	preCanvas.height = newHeight;
	
	// Save the new dimensions.
	settings.set('width', newWidth);
	settings.set('height', newHeight);
	
	// Reactivate the current tool.
	tools.currentTool.activate();
}

/**
 * Overwrite the canvas with the current fill color.
 */
function resetCanvas() {
	cxt.fillStyle = settings.get('fillColor');
	cxt.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Open an image to replace the current one.
 * @param {File} file - The file containing the new image
 */
function openImage(file) {
	// Show the progress spinner until the image loads.
	progressSpinner.show();
	
	Utils.readImage(file).then(function (image) {
		// There is no need to clear the canvas.  Resizing the canvas will do that.
		canvas.width =
			preCanvas.width = image.width;
		canvas.height =
			preCanvas.height = image.height;
		settings.set('width', image.width);
		settings.set('height', image.height);
		cxt.fillStyle = 'white';
		cxt.fillRect(0, 0, canvas.width, canvas.height);
		cxt.drawImage(image, 0, 0);
		
		// Set the file type and name.
		// TODO: Make this not access SaveDialog private properties.
		var fileName = file.name;
		if (JPEG_REGEX.test(fileName)) {
			dialogs.save._element.fileType.value =
				dialogs.save._downloadLink.type = 'image/jpeg';
		} else {
			dialogs.save._element.fileType.value =
				dialogs.save._downloadLink.type = 'image/png';
			fileName = fileName.replace(FILE_EXT_REGEX, '.png');
		}
		dialogs.save._element.fileName.value =
			dialogs.save._downloadLink.download = fileName;
		document.title = fileName + ' - PaintZ';
		
		// Clear the undo and redo stacks.
		undoStack.clear();
		
		// Hide the progress spinner.
		progressSpinner.hide();
	}).catch(function (errorMessage) {
		if (!!errorMessage) {
			alert(errorMessage);
		}
		// Hide the progress spinner.
		progressSpinner.hide();
	});
}

/**
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

/**
 * Set up events for opening images via drag-and-drop.
 */
function initDragDrop() {
	window.addEventListener('dragenter', function (e) { e.preventDefault(); }, false);
	window.addEventListener('dragleave', function (e) { e.preventDefault(); }, false);
	window.addEventListener('dragover', function (e) { e.preventDefault(); }, false);
	window.addEventListener('drop', function (e) {
		e.preventDefault();
		var file = e.dataTransfer.files[0];
		openImage(file);
	}, false);
}

/**
 * Check whether it is a milestone for a pop-up suggestion.
 */
function checkSaveCountMilestone() {
	var DIALOG_OPEN_DELAY = 2000; // Milliseconds
	var MILESTONES = {
		install: 10,
		coffee: 50
	};
	switch (settings.get('saveCount')) {
		case MILESTONES.install:
			// TODO
		break;
		case MILESTONES.coffee:
			setTimeout(function () {
				dialogs.coffee.open();
			}, DIALOG_OPEN_DELAY);
		break;
	}
}

window.addEventListener('load', function () {
	// Initialize dialogs not bound to specific buttons.
	dialogs.coffee = new CoffeeDialog();
	dialogs.keyboard = new KeyboardDialog();
	
	// Initialize everything.
	initCanvas();
	settings = new SettingsManager();
	clipboard = new ClipboardManager();
	zoomManager = new ZoomManager();
	toolbar = new ToolbarManager();
	tools = new ToolManager();
	progressSpinner = new ProgressSpinner();
	
	initDragDrop();
	
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
	document.title = DEFAULT_TITLE + ' - PaintZ';
	
	// Hide the splash screen.
	document.body.removeChild(document.getElementById('splashScreen'));
	
	// Prevent closing with unsaved changes.
	undoStack.changedSinceSave = false;
	window.onbeforeunload = function () {
		if (undoStack.changedSinceSave) {
			return 'It looks like you have unsaved changes.';
		}
	};
	
	if (settings.get('firstRunDone')) {
		// Only show the welcome dialog if this is the user's first time using PaintZ (in this browser).
		return;
	}
	
	var welcomeDialog = new WelcomeDialog(document.getElementById('helpBtn'));
	welcomeDialog.loadPromise.then(function () {
		welcomeDialog.open();
		settings.set('firstRunDone', true);
	});
}
