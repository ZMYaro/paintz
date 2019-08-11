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
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
SettingsDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Only show the system theme override option if the browser supports it.
	if (!window.matchMedia('(prefers-color-scheme)').matches) {
		// input → label → li
		this._element.systemThemeOverride.parentElement.parentElement.style.display = 'none';
	}
	
	this._element.querySelector('#resetButton').addEventListener('click', this._resetSettings.bind(this), false);
};

/**
 * @private
 * Update the setting options to show the current saved settings.
 */
SettingsDialog.prototype._showCurrentSettings = function () {
	this._element.theme.value = settings.get('theme');
	this._element.systemThemeOverride.checked = settings.get('systemThemeOverride');
	this._element.colorPalette.value = settings.get('colorPalette');
	this._element.ghostDraw.checked = settings.get('ghostDraw');
	this._element.antiAlias.checked = settings.get('antiAlias');
	this._element.maxUndoStackDepth.value = settings.get('maxUndoStackDepth');
};

/**
 * @private
 * Save the selected settings.
 */
SettingsDialog.prototype._saveNewSettings = function () {
	settings.set('theme', this._element.theme.value);
	settings.set('systemThemeOverride', this._element.systemThemeOverride.checked);
	
	settings.set('colorPalette', this._element.colorPalette.value);
	toolbar.toolboxes.colorPicker.setColorPalette(this._element.colorPalette.value);
	
	settings.set('ghostDraw', this._element.ghostDraw.checked);
	
	settings.set('antiAlias', this._element.antiAlias.checked);
	
	if (!isNaN(parseInt(this._element.maxUndoStackDepth.value))) {
		settings.set('maxUndoStackDepth', this._element.maxUndoStackDepth.value);
	}
};

/**
 * @private
 * Reset all settings.
 */
SettingsDialog.prototype._resetSettings = function () {
	if (!confirm('Reset all settings to defaults?  This cannot be undone.')) {
		return;
	}
	this._element.theme.value = settings.DEFAULTS.theme;
	this._element.systemThemeOverride.checked = settings.DEFAULTS.theme;
	this._element.colorPalette.value = settings.DEFAULTS.colorPalette;
	this._element.ghostDraw.checked = settings.DEFAULTS.ghostDraw;
	this._element.antiAlias.checked = settings.DEFAULTS.antiAlias;
	this._element.maxUndoStackDepth.value = settings.DEFAULTS.maxUndoStackDepth;
	this._saveNewSettings();
	this.close();
};
