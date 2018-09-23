'use strict';

/**
 * @class
 * Create a new ToolbarManager instance.
 */
function ToolbarManager() {
	/** @private {HTMLDivElement} The element for the toolbar itself */
	this._element = document.getElementById('toolbar');
	
	/** {Object<String,Toolbox>} All the toolboxes on the toolbar */
	this.toolboxes = {};
	
	// Create and add the toolboxes and dividers.
	this.toolboxes.image = new ImageToolbox();
	this._addDivider();
	this.toolboxes.tools = new ToolsToolbox();
	this._addDivider();
	this.toolboxes.noToolOptions = new NoToolOptionsToolbox();
	this.toolboxes.drawToolOptions = new DrawToolOptionsToolbox();
	this.toolboxes.selectToolOptions = new SelectionToolOptionsToolbox();
	this.toolboxes.textToolOptions = new TextToolOptionsToolbox();
	this._addDivider();
	this.toolboxes.colorPicker = new ColorPickerToolbox();
	this._addDivider();
	this.toolboxes.app = new AppToolbox();
	
	// Hide the extra tool options toolboxes.
	this.toolboxes.noToolOptions.hide();
	this.toolboxes.drawToolOptions.hide();
	this.toolboxes.selectToolOptions.hide();
	this.toolboxes.textToolOptions.hide();
	
	/** @private {Toolbox} The currently shown tool options toolbox */
	this._currentToolOptionsToolbox = this.toolboxes.drawToolOptions;
	
	var toolboxLoadPromises =
		Object.values(this.toolboxes)
		.map(function (toolbox) { return toolbox.loadPromise; });
	/** {Promise} Resolves when all toolboxes have loaded */
	this.loadPromise = Promise.all(toolboxLoadPromises);
}

Object.defineProperties(ToolbarManager.prototype, {
	scrollLeft: {
		get: function () {
			return this._element.scrollLeft;
		}
	}
});

/**
 * @private
 * Add a divider to the toolbar.
 */
ToolbarManager.prototype._addDivider = function () {
	var divider = document.createElement('span');
	divider.className = 'divider';
	this._element.appendChild(divider);
};

/**
 * Switch which tool options toolbox is shown.
 * @param {Toolbox} toolbox - Which toolbox to show (if none, defaults to the no tool options toolbox)
 */
ToolbarManager.prototype.switchToolOptionsToolbox = function (toolbox) {
	if (this._currentToolOptionsToolbox) {
		this._currentToolOptionsToolbox.hide();
	}
	toolbox = (toolbox || this.toolboxes.noToolOptions);
	toolbox.show();
	this._currentToolOptionsToolbox = toolbox;
};
