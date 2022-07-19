'use strict';

/**
 * @class
 * Create a new ToolsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function ToolsToolbox(toolbar) {
	Toolbox.call(this, 'tools', toolbar);
}
// Extend Toolbox.
ToolsToolbox.prototype = Object.create(Toolbox.prototype);
ToolsToolbox.prototype.constructor = ToolsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ToolsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var toolsForm = this._element.querySelector('#tools');
	toolsForm.tool.value = settings.get('tool');
	toolsForm.addEventListener('change', function (e) {
		// Switch to the newly-selected tool.
		tools.switchTool(e.target.value);
	}, false);
	
	if (CanvasRenderingContext2D.prototype.roundRect) {
		// If `roundRect` is supported, enable the rounded rectangle tool.
		this._element.querySelector('#roundRectTool').disabled = false;
		this._element.querySelector('[for="roundRectTool"]').title = 'Rounded rectangle';
	}
};
