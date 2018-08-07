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
	
	var rotCCWBtn = this._element.querySelector('#rotCCWBtn');
	rotCCWBtn.addEventListener('click', function () {
		tools.selection.rotate(false);
	}, false);
	
	var rotCWBtn = this._element.querySelector('#rotCWBtn');
	rotCWBtn.addEventListener('click', function () {
		tools.selection.rotate(true);
	}, false);
	
	var pasteBtn = this._element.querySelector('#pasteBtn');
	pasteBtn.addEventListener('click', function () {
		if (!document.execCommand('paste')) {
			alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.');
		}
	}, false);
	
	var flipHorizBtn = this._element.querySelector('#flipHorizBtn');
	flipHorizBtn.addEventListener('click', function () {
		tools.selection.flip(false);
	}, false);
	
	var flipVertBtn = this._element.querySelector('#flipVertBtn');
	flipVertBtn.addEventListener('click', function () {
		tools.selection.flip(true);
	}, false);
};
