'use strict';

function SettingsManager() {
	/** @private {Object} The current settings */
	this._settings = {};
	
	// Load settings from local storage where possible.
	this._loadStoredSettings();
	
	// Reflect the settings in the UI.
	canvas.width =
		preCanvas.width = this.get('width');
	canvas.height =
		preCanvas.height = this.get('height');
	if (this.get('ghostDraw')) {
		preCanvas.classList.add('ghost');
	}
	
	document.getElementById('themeStyleLink').href = 'styles/themes/' + this.get('theme') + '.css';
}

// Define constants.
/** @constant {Object} The default values for all settings */
SettingsManager.prototype.DEFAULTS = {
	// Canvas:
	width: 640,
	height: 480,
	// Toolbar-set options:
	tool: 'doodle',
	lineWidth: 2,
	outlineOption: 'outlineFill',
	lineColor: '#000000',
	fillColor: '#ffffff',
	fontSize: 16,
	// Settings:
	theme: 'default',
	ghostDraw: false,
	antiAlias: true,
	maxUndoStackDepth: 50,
	// Other:
	firstRunDone: false
};
/** @constant {String} The prefix to add to stored setting keys in local storage */
SettingsManager.prototype.LOCAL_STORAGE_PREFIX = 'paintz_';

/**
 * Set settings based on local storage, falling back to defaults where necessary.
 */
SettingsManager.prototype._loadStoredSettings = function () {
	for (var setting in this.DEFAULTS) {
		// Attempt to load settings from local storage.
		// Some browsers will throw an error if this is attempted in a private browsing session.
		try {
			var storedValue = localStorage.getItem(this.LOCAL_STORAGE_PREFIX + setting);
			if (storedValue !== null) {
				// Parse stored values to their intended types.
				var correctedValue = this._toExpectedType(setting, storedValue);
				this.set(setting, correctedValue);
				continue;
			}
		} catch (err) {}
		
		this.set(setting, this.DEFAULTS[setting]);
	}
};

/**
 * Convert a setting value to its expected type.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value for the setting
 * @returns {Object} The value as the expected type for the setting
 */
SettingsManager.prototype._toExpectedType = function (setting, value) {
	switch (typeof(this.DEFAULTS[setting])) {
		case 'boolean':
			return !!value;
		case 'number':
			return parseFloat(value);
		default:
			return value;
	}
}

/**
 * Get a setting.
 * @param {String} setting - The name of the setting
 */
SettingsManager.prototype.get = function (setting) {
	var value = this._settings[setting];
	if (typeof(value) !== 'undefined') {
		return this._toExpectedType(setting, value);
	}
	return this.DEFAULTS[setting];
};

/**
 * Save a setting.
 * @param {String} setting - The name of the setting
 * @param {Object} value - The new value to save for the setting
 */
SettingsManager.prototype.set = function (setting, value) {
	var correctedValue = this._toExpectedType(setting, value);
	this._settings[setting] = correctedValue;
	
	// Attempt to save the setting to local storage.
	// Some browsers will throw an error if this is attempted in a private browsing session.
	try {
		if (typeof(this.DEFAULTS[setting]) === 'boolean') {
			// Convert boolean values to truey/falsey string values for local storage.
			// Other values should coerce to strings fine.
			correctedValue = correctedValue ? 'true' : '';
		}
		localStorage.setItem(this.LOCAL_STORAGE_PREFIX + setting, correctedValue);
	} catch (err) {}
};
