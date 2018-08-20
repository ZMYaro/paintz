'use strict';

/**
 * @class
 * Create a new SettingsDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SettingsDialog(trigger) {
	Dialog.call(this, 'settings', trigger);
	this._element.id = 'settingsDialog';
	this._element.addEventListener('submit', this._saveNewSettings.bind(this));
}
// Extend Dialog.
SettingsDialog.prototype = Object.create(Dialog.prototype);
SettingsDialog.prototype.constructor = SettingsDialog;

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
	this._element.colorPalette.value = settings.get('colorPalette');
	this._element.ghostDraw.checked = settings.get('ghostDraw');
	this._element.antiAlias.checked = settings.get('antiAlias');
	this._element.maxUndoStackDepth.value = settings.get('maxUndoStackDepth');
	this._element.theme.value = settings.get('theme');
};

/**
 * @private
 * Save the selected settings.
 */
SettingsDialog.prototype._saveNewSettings = function () {
	settings.set('colorPalette', this._element.colorPalette.value);
	toolbar.toolboxes.colorPicker.setColorPalette(this._element.colorPalette.value);
	
	settings.set('theme', this._element.theme.value);
	
	settings.set('ghostDraw', this._element.ghostDraw.checked);
	
	settings.set('antiAlias', this._element.antiAlias.checked);
	
	if (!isNaN(parseInt(this._element.maxUndoStackDepth.value))) {
		settings.set('maxUndoStackDepth', this._element.maxUndoStackDepth.value);
	}
};
