// This is the closest thing JS has to constants.  It should probably
// never be done in production code.
Object.defineProperty(window, 'MAX_LINE_WIDTH', {
	value: 20,
	configurable: false,
	enumerable: true,
	writable: false
});

var canvas;
var previewCanvas;
var cxt;
var preCxt;
var currentShape;
var toolbar = {};
var downloadLink;

/**
 * Get the x-coordinate of a click within the canvas.
 * @param {Number} pageX - The x-coordinate relative to the page
 */
function getCanvasX(pageX) {
	return pageX - preCanvas.offsetLeft;
}
/**
 * Get the y-coordinate of a click within the canvas.
 * @param {Number} pageY - The y-coordinate relative to the page
 */
function getCanvasY(pageY) {
	return pageY - preCanvas.offsetTop;
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
	
	toolbar.tool = document.getElementById('tool').tool;
	
	toolbar.lineColor = document.getElementById('lineColor');
	toolbar.fillColor = document.getElementById('fillColor');
	
	toolbar.lineWidth = document.getElementById('lineWidth');
	toolbar.lineWidth.addEventListener('input', function(e) {
		if (e.target.value > MAX_LINE_WIDTH) {
			e.target.value = MAX_LINE_WIDTH;
		} else if (e.target.value < 0) {
			e.target.value = 0;
		}
	}, false);
	
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
	var startX = getCanvasX(touch ? e.touches[0].pageX : e.pageX);
	var startY = getCanvasY(touch ? e.touches[0].pageY : e.pageY);
	var lineWidth = toolbar.lineWidth.value;
	var lineColor = toolbar.lineColor.value;
	var fillColor = toolbar.fillColor.value;
	
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
	var newX = getCanvasX(touch ? e.changedTouches[0].pageX : e.pageX);
	var newY = getCanvasY(touch ? e.changedTouches[0].pageY : e.pageY);
	
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
	var newX = getCanvasX(touch ? e.changedTouches[0].pageX : e.pageX);
	var newY = getCanvasY(touch ? e.changedTouches[0].pageY : e.pageY);
	
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
	drawGrid();
}

/**
 * Fill the entire canvas with a grid.
 * @param {Number} [cellWidth=10] - The width of grid cells.
 * @param {Number} [cellHeight=10] - The height of grid cells.
 */
function drawGrid(cellWidth, cellHeight) {
	// Set the cell width and height if it is not defined.
	cellWidth = cellWidth || 10;
	cellHeight = cellHeight || 10;
	
	// Use a separate grid canvas so the grid does not end up in the exported image.
	var gridCxt = document.getElementById('gridCanvas').getContext('2d');
	
	gridCxt.strokeStyle = 'lightGray';
	gridCxt.lineWidth = 0.5;
	
	gridCxt.beginPath();
	// Draw vertical lines.
	for (var x = cellWidth + 0.5; x < canvas.width; x += cellWidth) {
		gridCxt.moveTo(x, 0);
		gridCxt.lineTo(x, canvas.height);
	}
	// Draw horizontal lines.
	for (var y = cellHeight + 0.5; y < canvas.width; y += cellWidth) {
		gridCxt.moveTo(0, y);
		gridCxt.lineTo(canvas.width, y);
	}
	gridCxt.closePath();
	gridCxt.stroke();
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
