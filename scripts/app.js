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
			e.preventDefault();
			e.stopPropagation();
			if (e.button === 0) {
				lineColor = e.target.dataset.value;
				document.getElementById('colors').style.borderColor = lineColor;
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
	
	toolbar.lineWidth = document.getElementById('lineWidth');
	
	toolbar.clearBtn = document.getElementById('clearBtn');
	toolbar.clearBtn.addEventListener('click', function (e) {
		if (confirm('Are you sure you want to clear your drawing?  This action cannot be undone.')) {
			resetCanvas();
		}
	}, false);
	
	toolbar.saveBtn = document.getElementById('saveBtn');
	toolbar.saveBtn.addEventListener('click', downloadImage, false);
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
