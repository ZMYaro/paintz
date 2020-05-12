'use strict';

/**
 * @class
 * Create a new ToolbarManager instance.
 */
function ToolbarManager() {
	/** @private {HTMLDivElement} The element for the main toolbar */
	this._mainToolbar = document.getElementById('toolbar');
	/** @private {HTMLDivElement} The element for the bottom bar */
	this._bottomBar = document.getElementById('bottomBar');
	
	/** {Object<String,Toolbox>} All the toolboxes on the toolbar */
	this.toolboxes = {};
	
	// Create and add the main toolbar toolboxes and dividers.
	this.toolboxes.image = new ImageToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.tools = new ToolsToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.noToolOptions = new NoToolOptionsToolbox(this._mainToolbar);
	this.toolboxes.drawToolOptions = new DrawToolOptionsToolbox(this._mainToolbar);
	this.toolboxes.selectToolOptions = new SelectionToolOptionsToolbox(this._mainToolbar);
	this.toolboxes.textToolOptions = new TextToolOptionsToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.colorPicker = new ColorPickerToolbox(this._mainToolbar);
	this._addDivider(this._mainToolbar);
	this.toolboxes.app = new AppToolbox(this._mainToolbar);
	
	// Create and add the bottom bar toolboxes and dividers.
	this.toolboxes.dimensions = new DimensionsToolbox(this._bottomBar);
	this.toolboxes.zoom = new ZoomToolbox(this._bottomBar);
	
	// Create the floating selection toolbar.
	this.toolboxes.floatingSelectionToolbar = new FloatingSelectionToolbar();
	
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
			return this._mainToolbar.scrollLeft;
		}
	}
});

/**
 * @private
 * Add a divider to the toolbar.
 * @param {HTMLElement} toolbar - The toolbar element to ad the divider to
 */
ToolbarManager.prototype._addDivider = function (toolbar) {
	var divider = document.createElement('span');
	divider.className = 'divider';
	toolbar.appendChild(divider);
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
