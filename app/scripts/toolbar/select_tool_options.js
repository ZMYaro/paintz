'use strict';

/**
 * @class
 * Create a new SelectionToolOptionsToolbox instance.
 */
function SelectionToolOptionsToolbox() {
	Toolbox.call(this, 'select_tool_options');
}
// Extend Toolbox.
SelectionToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
SelectionToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var selectAllBtn = this._element.querySelector('#selectAllBtn');
	selectAllBtn.addEventListener('click', function () {
		// Switch to the selection tool if it is not already active.
		switchTool('selection');
		// Select the entire canvas.
		tools.selection.selectAll(canvas.width, canvas.height);
	}, false);
};
