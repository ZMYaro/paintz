'use strict';

/**
 * @class
 * Create a new SettingsDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SettingsDialog(trigger) {
	Dialog.call(this, 'settings', trigger);
	this._element.addEventListener('submit', this._saveNewSettings.bind(this));
}
// Extend Dialog.
SettingsDialog.prototype = Object.create(Dialog.prototype);

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
SettingsDialog.prototype.WIDTH = '384px';

/**
 * @override
 * Open the dialog.
 */
SettingsDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	this._showCurrentSettings();
};

/**
 * @private
 * Update the setting options to show the current saved settings.
 */
SettingsDialog.prototype._showCurrentSettings = function () {
	this._element.ghostDraw.checked = localStorage.ghostDraw;
	this._element.antiAlias.checked = localStorage.antiAlias;
	this._element.maxUndoStackDepth.value = localStorage.maxUndoStackDepth;
	this._element.theme.value = localStorage.theme;
};

/**
 * @private
 * Save the selected settings.
 */
SettingsDialog.prototype._saveNewSettings = function () {
	if (this._element.ghostDraw.checked) {
		localStorage.ghostDraw = 'true';
		preCanvas.classList.add('ghost');
	} else {
		localStorage.ghostDraw = '';
		preCanvas.classList.remove('ghost');
	}
	
	localStorage.antiAlias = this._element.antiAlias.checked ? 'true' : '';
	
	if (!isNaN(parseInt(this._element.maxUndoStackDepth.value))) {
		localStorage.maxUndoStackDepth = parseInt(this._element.maxUndoStackDepth.value);
	}
	
	localStorage.theme = this._element.theme.value;
	document.getElementById('themeStyleLink').href = 'styles/themes/' + this._element.theme.value + '.css';
};
