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
}
// Extend Toolbox.
ColorPickerToolbox.prototype = Object.create(Toolbox.prototype);

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ColorPickerToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Set up the color picker dialog.
	var colorPickerDialog = new ColorPickerDialog(this.colorIndicator);
	this.colorIndicator.addEventListener('click', colorPickerDialog.open.bind(colorPickerDialog), false);
	
	// Set up the toolbar color picker.
	var colorButtons = Array.prototype.slice.call(this._element.getElementsByTagName('button')),
		boundColorButtonClickHandler = this._handleColorButtonClick.bind(this);
	colorButtons.forEach(function (colorButton) {
		colorButton.addEventListener('click', boundColorButtonClickHandler, false);
		colorButton.addEventListener('contextmenu', boundColorButtonClickHandler, false);
	});
	
	// Set up the event listener for the Pac-Man easter egg.
	this._element.querySelector('#colorPicker button[data-value=\"#FFEB3B\"]')
		.addEventListener('click', this._handlePacManButtonClick.bind(this), false);
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
	this.colorIndicator.style.borderColor = localStorage.lineColor;
	this.colorIndicator.style.backgroundColor = localStorage.fillColor;
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
		localStorage.lineColor = e.target.dataset.value;
		this.colorIndicator.style.borderColor = e.target.dataset.value;
		
		// Some tools' cursors change with the line color, so reactivate the cursor.
		tools[localStorage.tool].activate();
	} else if (e.button === 2) {
		e.preventDefault();
		e.stopPropagation();
		
		// If the left mouse button was used, set the fill color.
		localStorage.fillColor = e.target.dataset.value;
		this.colorIndicator.style.backgroundColor = e.target.dataset.value;
		
		// Some tools' cursors change with the fill color, so reactivate the cursor.
		tools[localStorage.tool].activate();
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
};
