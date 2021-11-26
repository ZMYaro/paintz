'use strict';

/**
 * @class
 * Create a new SelectionToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function SelectionToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'select_tool_options', toolbar);
	
	this._element.id = 'selectOptions';
	
	this.transparentSelectionOff;
	this.transparentSelectionOn;
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
	
	var flipHorizBtn = this._element.querySelector('#flipHorizBtn');
	flipHorizBtn.addEventListener('click', function () {
		tools.currentTool.flip(false);
	}, false);
	
	var flipVertBtn = this._element.querySelector('#flipVertBtn');
	flipVertBtn.addEventListener('click', function () {
		tools.currentTool.flip(true);
	}, false);
	
	var invertColorsBtn = this._element.querySelector('#invertColorsBtn');
	invertColorsBtn.addEventListener('click', function () {
		tools.currentTool.invertColors();
	}, false);
	
	this.transparentSelectionOn = this._element.querySelector('#transparentSelectionOn');
	this.transparentSelectionOn.checked = settings.get('transparentSelection');
	this.transparentSelectionOn.addEventListener('change', function() {
		if (this.checked) {
			settings.set('transparentSelection', true);
		}
	});
	
	this.transparentSelectionOff = this._element.querySelector('#transparentSelectionOff');
	this.transparentSelectionOff.checked = !settings.get('transparentSelection');
	this.transparentSelectionOff.addEventListener('change', function() {
		if (this.checked) {
			settings.set('transparentSelection', false);
		}
	});
};
