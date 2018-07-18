'use strict';

/**
 * @class
 * Create a new DrawToolOptionsToolbox instance.
 */
function DrawToolOptionsToolbox() {
	Toolbox.call(this, 'draw_tool_options');
}
// Extend Toolbox.
DrawToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
DrawToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var lineWidthSelect = this._element.querySelector('#lineWidth');
	lineWidthSelect.value = localStorage.lineWidth;
	lineWidthSelect.addEventListener('change', function (e) {
		localStorage.lineWidth = e.target.value;
		// Some tools' cursors change with the line width, so reactivate the tool.
		tools[localStorage.tool].activate();
	}, false);
	
	var outlineOptions = this._element.querySelector('#outlineOptions');
	outlineOptions.outlineOption.value = localStorage.outlineOption;
	outlineOptions.addEventListener('change', function (e) {
		localStorage.outlineOption = e.target.value;
	}, false);
};
