var canvas;
var previewCanvas;
var cxt;
var preCxt;
var currentShape;
var toolbar = {};
var downloadLink;
var lineColor = 'black';
var fillColor = 'white';


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
	
	toolbar.tool = document.getElementById('tool').tool;
	
	toolbar.colorPicker = document.getElementById('colorPicker');
	var colors = colorPicker.getElementsByTagName('button');
	for (var i = 0; i < colors.length; i++) {
		// Handle left click.
		colors[i].addEventListener('click', function (e) {
			if (!e.altKey && !e.ctrlKey && !e.shiftKey) {
				e.preventDefault();
				e.stopPropagation();
				if (e.button === 0) {
					lineColor = e.target.dataset.value;
					document.getElementById('colors').style.borderColor = lineColor;
				}
			}
		}, false);
		// Handle right click.
		colors[i].addEventListener('contextmenu', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.button === 2) {
				fillColor = e.target.dataset.value;
				document.getElementById('colors').style.backgroundColor = fillColor;
			}
		}, false);
	}
	
	// Set up the event listener for the Pac-Man easter egg.
	document.querySelector('#colorPicker button[data-value=\"yellow\"]').addEventListener('click', function (e) {
		// If the button was Ctrl+Shift+clicked for the first time...
		if (e.ctrlKey && e.shiftKey && !window.pacMan) {
			e.preventDefault();
			e.stopPropagation();
			// Create and start a new Pac-Man.
			window.pacMan = new PacMan(canvas);
			window.pacMan.start();
			// Update the button to show the easter egg has been activated.
			e.target.className = 'pacman';
		}
	}, false);
	
	toolbar.lineWidth = document.getElementById('lineWidth');
	
	// Clear button.
	document.getElementById('clearBtn').addEventListener('click', function (e) {
		if (confirm('Are you sure you want to clear your drawing?  This action cannot be undone.')) {
			resetCanvas();
		}
	}, false);
	
	// Resize button and dialog.
	var resizeDialog = document.getElementById('resizeDialog');
	Utils.makeDialog(resizeDialog);
	resizeDialog.onsubmit = function (e) {
		e.preventDefault();
		
		// Fetch the values from the form.
		var width = parseInt(e.target.width.value);
		var height = parseInt(e.target.height.value);
		
		// Validate the user's input.
		if (!width || !height || isNaN(width) || isNaN(height) || width < 1 || height < 1) {
			alert('The dimensions you entered were invalid.');
			return;
		}
		
		preCxt.drawImage(canvas, 0, 0);
		canvas.width = width;
		canvas.height = height;
		cxt.drawImage(preCanvas, 0, 0);
		preCanvas.width = width;
		preCanvas.height = height;
		
		e.target.close();
	};
	document.getElementById('resizeBtn').onclick = function () {
		resizeDialog.width.value = canvas.width;
		resizeDialog.height.value = canvas.height;
		resizeDialog.open();
	};
	
	// Uploader.
	document.getElementById('upload').addEventListener('change', function (e) {
		console.log(e);
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var file = e.target.files[0];
			if (!file || !file.type.match('image.*')) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function (ev) {
				var image = new Image();
				image.src = ev.target.result;
				// There is no need to clear the canvas.  Resizing the canvas will do that.
				canvas.width = image.width;
				canvas.height = image.height;
				cxt.drawImage(image, 0, 0);
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
	// Save as button.
	document.getElementById('saveBtn').addEventListener('click', downloadImage, false);
	
	// About button and dialog.
	var aboutDialog = document.getElementById('aboutDialog');
	Utils.makeDialog(aboutDialog);
	document.getElementById('aboutBtn').onclick = aboutDialog.open;
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
	
	cxt.lineCap = 'round';
	preCxt.lineCap = 'round';
	
	// Set up event listeners for drawing.
	preCanvas.addEventListener('mousedown', startShape, false);
	preCanvas.addEventListener('touchstart', startShape, false);
	document.body.addEventListener('touchmove', updateShape, false);
	
	resetCanvas();
}

/**
 * Start drawing a new shape.
 * @param {MouseEvent|TouchEvent} e
 */
function startShape(e) {
	// Check whether it was a touch event.
	var touch = !!e.touches;
	
	// Quit if the left mouse button was not the button used.
	if (!touch && e.button != 0) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	canvas.focus();
	
	// Remove the event listeners for starting drawing.
	preCanvas.removeEventListener('mousedown', startShape, false);
	preCanvas.removeEventListener('touchstart', startShape, false);
	
	// Retrieve the values for the shape's properties.
	var startX = Utils.getCanvasX(touch ? e.touches[0].pageX : e.pageX);
	var startY = Utils.getCanvasY(touch ? e.touches[0].pageY : e.pageY);
	var lineWidth = toolbar.lineWidth.value;
	
	// Identify the type of shape to draw.
	var shapeClass;
	switch (toolbar.tool.value) {
		case 'doodle':
			shapeClass = Doodle;
			break;
		case 'line':
			shapeClass = Line;
			break;
		case 'rect':
			shapeClass = Rectangle;
			break;
		case 'oval':
			shapeClass = Oval;
			break;
	}
	
	// Initialize the new shape.
	currentShape = new shapeClass(preCxt, startX, startY, lineWidth, lineColor, fillColor);
	
	// Set the event listeners to continue and end drawing.
	if (touch) {
		document.body.addEventListener('touchend', completeShape, false);
		document.body.addEventListener('touchleave', completeShape, false);
	} else {
		document.body.addEventListener('mousemove', updateShape, false);
		document.body.addEventListener('mouseup', completeShape, false);
		document.body.addEventListener('mouseout', completeShape, false);
	}
}
/**
 * Complete the canvas or preview canvas with the shape currently being drawn.
 * @param {MouseEvent|TouchEvent} e
 */
function updateShape(e) {
	e.preventDefault();
	e.stopPropagation();
	
	// Quit if no shape has been started;
	if (!currentShape) {
		return;
	}
	
	var touch = !!e.changedTouches;
	var newX = Utils.getCanvasX(touch ? e.changedTouches[0].pageX : e.pageX);
	var newY = Utils.getCanvasY(touch ? e.changedTouches[0].pageY : e.pageY);
	
	// Update the shape.
	currentShape.updatePreview(newX, newY);
}
/**
 * Complete the current shape and stop drawing.
 * @param {MouseEvent|TouchEvent} e
 */
function completeShape(e) {
	e.preventDefault();
	e.stopPropagation();
	
	// Remove the event listeners for ending drawing.
	document.body.removeEventListener('mousemove', updateShape, false);
	document.body.removeEventListener('mouseup', completeShape, false);
	document.body.removeEventListener('mouseout', completeShape, false);
	document.body.removeEventListener('touchend', completeShape, false);
	document.body.removeEventListener('touchleave', completeShape, false);
	
	var touch = !!e.changedTouches;
	var newX = Utils.getCanvasX(touch ? e.changedTouches[0].pageX : e.pageX);
	var newY = Utils.getCanvasY(touch ? e.changedTouches[0].pageY : e.pageY);
	
	// Complete the shape.
	currentShape.finish(newX, newY);
	
	// Clear the shape data.
	currentShape = null;
	
	// Copy the preview to the “permanent” canvas.
	cxt.drawImage(preCanvas, 0, 0);
	// Clear the preview canvas.
	preCxt.clearRect(0, 0, preCanvas.width, preCanvas.height);
	
	// Set the event listeners to start the next drawing.
	preCanvas.addEventListener('mousedown', startShape, false);
	preCanvas.addEventListener('touchstart', startShape, false);
}
/**
 * Clear everything drawn to the canvas.
 */
function resetCanvas() {
	cxt.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Export the canvas content to a PNG to be saved.
 */
function downloadImage() {
	downloadLink.href = canvas.toDataURL();
	downloadLink.click();
}

window.addEventListener('load', function () {
	initToolbar();
	initCanvas();
	downloadLink = document.getElementById('downloadLink');
}, false);
