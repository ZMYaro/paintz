'use strict';

/**
 * @class
 * Create a new ColorPickerToolbox instance.
 */
function ColorPickerToolbox() {
	Toolbox.call(this, 'color_picker');
	this._element.id = 'colorPicker';
	
	/** {HTMLButtonElement} The color indicator that opens the color picker dialog when clicked. */
	this.colorIndicator;
	
	// Create the color indicator and add it before the toolbox itself.
	this._createColorIndicator();
	document.getElementById('toolbar').insertBefore(this.colorIndicator, this._element);
	
	// Create color picker dialog.
	dialogs.colorPicker = new ColorPickerDialog();
}
// Extend Toolbox.
ColorPickerToolbox.prototype = Object.create(Toolbox.prototype);
ColorPickerToolbox.prototype.constructor = ColorPickerToolbox;

// Define constants.
/** @constant {Object<String,Array<String>>} The colors for each palette */
ColorPickerToolbox.prototype.COLOR_PALETTES = {
	material: [
		'#000000', // Black
		'#f44336', // Red
		'#ff9800', // Orange
		'#ffeb3b', // Yellow
		'#76ff03', // Light green
		
		'#ffffff', // White
		'#4caf50', // Dark green
		'#80d8ff', // Light blue
		'#2962ff', // Dark blue
		'#9c27b0'  // Purple
	],
	classic: [
		'#000000', // Black
		'#ff0000', // Red
		'#ff00ff', // Pink
		'#ffff00', // Yellow
		'#00ff00', // Light green
		
		'#ffffff', // White
		'#008100', // Dark green
		'#00ffff', // Light blue
		'#0000ff', // Dark blue
		'#810081'  // Purple
	],
	win7: [
		'#000000', // Black
		'#ed1c24', // Red
		'#ff7f27', // Orange
		'#fff200', // Yellow
		'#b5e61d', // Light green
		
		'#ffffff', // White
		'#21b14c', // Dark green
		'#00a1e8', // Light blue
		'#3f48cc', // Dark blue
		'#a349a4'  // Purple
	]
};

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ColorPickerToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up the color picker dialog.
	dialogs.colorPicker.trigger = this.colorIndicator;
	this.colorIndicator.addEventListener('click', dialogs.colorPicker.open.bind(dialogs.colorPicker), false);
	
	// Set up the event listener for the Pac-Man easter egg.
	this._element.querySelector('#colorPicker button[data-value=\"#ffeb3b\"]')
		.addEventListener('click', this._handlePacManButtonClick.bind(this), false);
	
	// Set up the toolbar color picker.
	var colorButtons = Array.prototype.slice.call(this._element.getElementsByTagName('button')),
		boundColorButtonClickHandler = this._handleColorButtonClick.bind(this);
	colorButtons.forEach(function (colorButton) {
		colorButton.addEventListener('click', boundColorButtonClickHandler, false);
		colorButton.addEventListener('contextmenu', boundColorButtonClickHandler, false);
	});
	this.setColorPalette(settings.get('colorPalette'));
};

/**
 * @private
 * Create the color indicator.
 */
ColorPickerToolbox.prototype._createColorIndicator = function () {
	this.colorIndicator = document.createElement('button');
	this.colorIndicator.title = 'Selected colors (click for advanced picker)';
	this.colorIndicator.id = 'colors';
	this.colorIndicator.className = 'z1';
	this.colorIndicator.style.borderColor = settings.get('lineColor');
	this.colorIndicator.style.backgroundColor = settings.get('fillColor');
};

/**
 * @private
 * Change the displayed colors to a different set.
 * @param {String} paletteName - The identifier for the color set
 */
ColorPickerToolbox.prototype.setColorPalette = function (paletteName) {
	var colorButtons = this._element.getElementsByTagName('button');
	this.COLOR_PALETTES[paletteName].forEach(function (color, i) {
		colorButtons[i].dataset.value = color;
	}, this);
};

/**
 * @private
 * Change the color when a button is clicked.
 * @param {MouseEvent} e
 */
ColorPickerToolbox.prototype._handleColorButtonClick = function (e) {
	// Ignore it if any modifier keys were pressed.
	if (Utils.checkModifierKeys(e)) {
		return;
	}
	
	if (e.button === 0) {
		e.preventDefault();
		e.stopPropagation();
		
		// If the left mouse button was used, set the line color.
		settings.set('lineColor', e.target.dataset.value);
		this.colorIndicator.style.borderColor = e.target.dataset.value;
		
		// Some tools' cursors change with the line color, so reactivate the cursor.
		tools.currentTool.activate();
	} else if (e.button === 2) {
		e.preventDefault();
		e.stopPropagation();
		
		// If the left mouse button was used, set the fill color.
		settings.set('fillColor', e.target.dataset.value);
		this.colorIndicator.style.backgroundColor = e.target.dataset.value;
		
		// Some tools' cursors change with the fill color, so reactivate the cursor.
		tools.currentTool.activate();
	}
};

/**
 * @private
 * Start or stop the Pac-Man easter egg when the button is Ctrl+Shift+clicked.
 * @param {MouseEvent} e
 */
ColorPickerToolbox.prototype._handlePacManButtonClick = function (e) {
	// Ignore if the button was not Ctrl+Shift+clicked.
	if (!Utils.checkPlatformCtrlKey(e) || !e.shiftKey) {
		return;
	}
	
	e.preventDefault();
	e.stopPropagation();
	
	if (!window.pacMan) {
		// If Pac-Man has not been started, create and start a new Pac-Man.
		window.pacMan = new PacMan(canvas, e.target.dataset.value);
		window.pacMan.start();
		// Update the button to show the easter egg has been activated.
		e.target.className = 'pacman';
	} else {
		// If Pac-Man is running, delete Pac-Man.
		window.pacMan.stop();
		delete window.pacMan;
		e.target.classList.remove('pacman');
	}
};
