'use strict';

/**
 * @class
 * Create a new Toolbox instance.  A toolbox is a section on the toolbar with buttons or other controls.
 * @param {String} contentFileName - The name of the HTML partial file with the toolbox's contents
 */
function Toolbox(contentFileName) {
	/** @private {HTMLDivElement} The container for toolbox's content */
	this._element = document.createElement('div');
	this._element.className = this.CSS_CLASS;
	
	var toolbarElement = document.getElementById('toolbar');
	
	// Add a divider to the toolbar, if necessary.
	if (toolbarElement.childElementCount !== 0) {
		var divider = document.createElement('span');
		divider.className = 'divider';
		toolbarElement.appendChild(divider);
	}
	
	// Add the toolbox to the toolbar.
	toolbarElement.appendChild(this._element);
	
	// Fetch the toolbox content, then set up the toolbox.
	this.loadPromise = Utils.fetch(this.PARTIALS_DIR + contentFileName + '.html');
	this.loadPromise.then(this._setUp.bind(this));
}

// Define constants.
/** @constant {String} The path and prefix for toolbox partials */
Toolbox.prototype.PARTIALS_DIR = 'partials/toolbar/';
/** @constant {String} The CSS class for the toolbox container element */
Toolbox.prototype.CSS_CLASS = 'toolbox';

/**
 * @private
 * Populate the toolbox with its contents and add it to the toolbar.
 * @param {String} contents - The HTML contents of the dialog
 */
Toolbox.prototype._setUp = function (contents) {
	this._element.innerHTML = contents;
	
	// Update keyboard shortcut listings for Apple users.
	if (Utils.isApple) {
		this._element.innerHTML = this._element.innerHTML.replace(/Ctrl\+/g, '&#x2318;').replace(/Alt\+/g, '&#x2325;').replace(/Shift\+/g, '&#x21e7;');
	}
};
