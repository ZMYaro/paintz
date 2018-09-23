'use strict';

/**
 * @class
 * Create a new TextToolOptionsToolbox instance.
 */
function TextToolOptionsToolbox() {
	Toolbox.call(this, 'text_tool_options');
}
// Extend Toolbox.
TextToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
TextToolOptionsToolbox.prototype.constructor = TextToolOptionsToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
TextToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	var fontFamilySelect = this._element.querySelector('#fontFamilySelect');
	fontFamilySelect.value = settings.get('fontFamily');
	fontFamilySelect.addEventListener('change', function (e) {
		settings.set('fontFamily', e.target.value);
	}, false);
	
	var fontSizeSelect = this._element.querySelector('#fontSizeSelect');
	fontSizeSelect.value = settings.get('fontSize');
	fontSizeSelect.addEventListener('change', function (e) {
		settings.set('fontSize', e.target.value);
	}, false);
	
	var boldToggle = this._element.querySelector('#boldToggle');
	boldToggle.checked = settings.get('bold');
	boldToggle.addEventListener('change', function (e) {
		settings.set('bold', e.target.checked);
	}, false);
	
	var italicToggle = this._element.querySelector('#italicToggle');
	italicToggle.checked = settings.get('italic');
	italicToggle.addEventListener('change', function (e) {
		settings.set('italic', e.target.checked);
	}, false);
};
