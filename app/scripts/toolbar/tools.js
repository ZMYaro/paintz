'use strict';

/**
 * @class
 * Create a new ToolsToolbox instance.
 */
function ToolsToolbox() {
	Toolbox.call(this, 'tools');
}
// Extend Toolbox.
ToolsToolbox.prototype = Object.create(Toolbox.prototype);

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ToolsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var tools = this._element.querySelector('#tools');
	tools.tool.value = settings.get('tool');
	tools.addEventListener('change', function (e) {
		// Switch to the newly-selected tool.
		switchTool(e.target.value);
	}, false);
};
