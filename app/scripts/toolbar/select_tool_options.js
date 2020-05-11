'use strict';

/**
 * @class
 * Create a new SelectionToolOptionsToolbox instance.
 * @param {HTMLElement} [parentToolbar] - The toolbar the toolbox is to be added to
 */
function SelectionToolOptionsToolbox(parentToolbar) {
	Toolbox.call(this, 'select_tool_options', parentToolbar);
}
// Extend Toolbox.
SelectionToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
SelectionToolOptionsToolbox.prototype.constructor = SelectionToolOptionsToolbox;

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
		// Switch to the rectangular selection tool.
		if (tools.currentTool !== tools.selection) {
			tools.switchTool('selection');
		}
		// Select the entire canvas.
		tools.currentTool.selectAll(canvas.width, canvas.height);
	}, false);
	
	var rotCCWBtn = this._element.querySelector('#rotCCWBtn');
	rotCCWBtn.addEventListener('click', function () {
		tools.currentTool.rotate(false);
	}, false);
	
	var rotCWBtn = this._element.querySelector('#rotCWBtn');
	rotCWBtn.addEventListener('click', function () {
		tools.currentTool.rotate(true);
	}, false);
	
	var pasteBtn = this._element.querySelector('#pasteBtn');
	pasteBtn.addEventListener('click', function () {
		if (!clipboard.triggerPaste() && !document.execCommand('paste')) {
			alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.');
		}
	}, false);
	
	var flipHorizBtn = this._element.querySelector('#flipHorizBtn');
	flipHorizBtn.addEventListener('click', function () {
		tools.currentTool.flip(false);
	}, false);
	
	var flipVertBtn = this._element.querySelector('#flipVertBtn');
	flipVertBtn.addEventListener('click', function () {
		tools.currentTool.flip(true);
	}, false);
};
