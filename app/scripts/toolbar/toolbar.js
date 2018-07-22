'use strict';

/**
 * @class
 * Create a new ToolbarManager instance.
 */
function ToolbarManager() {
	this._element = document.getElementById('toolbar');
	
	this.toolboxes = {
		image: new ImageToolbox(),
		tools: new ToolsToolbox(),
		drawToolOptions: new DrawToolOptionsToolbox(),
		colorPicker: new ColorPickerToolbox(),
		app: new AppToolbox()
	};
	
	var toolboxLoadPromises =
		Object.values(this.toolboxes)
		.map(function (toolbox) { return toolbox.loadPromise; });
	this.loadPromise = Promise.all(toolboxLoadPromises);
}

Object.defineProperties(ToolbarManager.prototype, {
	scrollLeft: {
		get: function () {
			return this._element.scrollLeft;
		}
	}
});
