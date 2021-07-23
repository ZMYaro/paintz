'use strict';

/**
 * @class
 * Create a new TextToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function TextToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'text_tool_options', toolbar);
	
	this.boldToggle;
	this.italicToggle;
	this.underlineToggle;
	this.strikeToggle;
}
// Extend Toolbox.
TextToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
TextToolOptionsToolbox.prototype.constructor = TextToolOptionsToolbox;

// Define constants.
/** {String} The value of the font family menu option to request access to local fonts (which should not overlap with any font name) */
TextToolOptionsToolbox.prototype.REQUEST_FONT_ACCESS_OPTION_VALUE = 'paintz-request-local-font-access';
/** {String} The text to show on the menu option to request access to local fonts */
TextToolOptionsToolbox.prototype.REQUEST_FONT_ACCESS_OPTION_TEXT = 'Show more fonts...';
/** {String} Message to show when the user denies local font access */
TextToolOptionsToolbox.prototype.FONT_ACCESS_UNAUTHORIZED_MESSAGE = 'PaintZ needs permission to show all your fonts.  You may need to go into your browser\'s site settings to grant that permission.';
/** {Array<Object>} The base font types to always show */
TextToolOptionsToolbox.prototype.BASE_FONTS = [
	{ name: 'Sans-serif', css: 'sans-serif' },
	{ name: 'Serif',      css: 'serif' },
	{ name: 'Monospace',  css: 'monospace' }
];
/** {Array<Object>} The “web safe” fonts to show by default on desktop browsers */
TextToolOptionsToolbox.prototype.DESKTOP_FONTS = [
	{ name: 'Arial',           css: '\'Arial\', sans-serif'                                     },
	{ name: 'Arial Black',     css: '\'Arial Black\', sans-serif'                               },
	{ name: 'Comic Sans MS',   css: '\'Comic Sans MS\', \'Comic Sans\', sans-serif'             },
	{ name: 'Courier New',     css: '\'Courier New\', \'Courier\', monospace'                   },
	{ name: 'Georgia',         css: '\'Georgia\', serif'                                        },
	{ name: 'Impact',          css: '\'Impact\', \'Charcoal\', sans-serif'                      },
	{ name: 'Roboto',          css: '\'Roboto\', \'Helvetica Neue\', \'Helvetica\', sans-serif' },
	{ name: 'Times New Roman', css: '\'Times New Roman\', \'Times\', serif'                     },
	{ name: 'Verdana',         css: '\'Verdana\', \'Geneva\', sans-serif'                       }
];

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
TextToolOptionsToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	this._setUpFontFamilyMenu();
	
	var fontSizeSelect = this._element.querySelector('#fontSizeSelect');
	fontSizeSelect.value = settings.get('fontSize');
	fontSizeSelect.addEventListener('change', function (e) {
		settings.set('fontSize', e.target.value);
	}, false);
	
	this.textFillOn = this._element.querySelector('#textFillOn');
	this.textFillOn.checked = settings.get('textFill');
	this.textFillOn.addEventListener('change', function (e) {
		if (this.checked) {
			settings.set('textFill', true);
		}
	}, false);
	
	this.textFillOff = this._element.querySelector('#textFillOff');
	this.textFillOff.checked = !settings.get('textFill');
	this.textFillOff.addEventListener('change', function (e) {
		if (this.checked) {
			settings.set('textFill', false);
		}
	}, false);
	
	this.boldToggle = this._element.querySelector('#boldToggle');
	this.boldToggle.checked = settings.get('bold');
	this.boldToggle.addEventListener('change', function (e) {
		settings.set('bold', e.target.checked);
	}, false);
	
	this.italicToggle = this._element.querySelector('#italicToggle');
	this.italicToggle.checked = settings.get('italic');
	this.italicToggle.addEventListener('change', function (e) {
		settings.set('italic', e.target.checked);
	}, false);
	
	this.underlineToggle = this._element.querySelector('#underlineToggle');
	this.underlineToggle.checked = settings.get('underline');
	this.underlineToggle.addEventListener('change', function (e) {
		settings.set('underline', e.target.checked);
	}, false);
	
	this.strikeToggle = this._element.querySelector('#strikeToggle');
	this.strikeToggle.checked = settings.get('strike');
	this.strikeToggle.addEventListener('change', function (e) {
		settings.set('strike', e.target.checked);
	}, false);
};

/**
 * @private
 * Set up the font family menu's options and listeners.
 */
TextToolOptionsToolbox.prototype._setUpFontFamilyMenu = function () {
	var fontFamilySelect = this._element.querySelector('#fontFamilySelect'),
		that = this;
	
	this._populateFonts(fontFamilySelect)
		.then(function () {
			// Try to set the menu to the last selected font.
			fontFamilySelect.value = settings.get('fontFamily');
			
			// If the last selected font is no longer available, default to the first on the list.
			if (fontFamilySelect.selectedIndex === -1) {
				fontFamilySelect.selectedIndex = 0;
				settings.set('fontFamily', fontFamilySelect.value);
			}
			
			fontFamilySelect.addEventListener('change', function (e) {
				if (e.target.value === that.REQUEST_FONT_ACCESS_OPTION_VALUE) {
					// If the option to add local fonts was selected, attempt to load them.
					that._populateLocalFonts(fontFamilySelect, true)
						// If granted, switch the selected option to the first
						// local font (after the base fonts and the divider).
						.then(function () {
							fontFamilySelect.selectedIndex = that.BASE_FONTS.length + 1;
						})
						// If denied, show a message and switch the selected
						// option back to the last selected font family.
						.catch(function (err) {
							fontFamilySelect.value = settings.get('fontFamily');
							alert(that.FONT_ACCESS_UNAUTHORIZED_MESSAGE);
						});
					return;
				}
				settings.set('fontFamily', e.target.value);
			}, false);
		});
};

/**
 * @private
 * Populate the font family menu with all fonts known to be safely accessible.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @returns {Promise} Resolves when fonts have been loaded or rejects if loading failed
 */
TextToolOptionsToolbox.prototype._populateFonts = function (fontFamilySelect) {
	var that = this;
	
	if (navigator.fonts) {
		return this._populateLocalFonts(fontFamilySelect)
			.catch(function (err) {
				console.warn('Could not load local fonts:', err);
				// If fetching local fonts failed, list “web safe” fonts and
				// add an option for the user to manually request local fonts.
				that._populateKnownFonts(fontFamilySelect);
				that._addDividerToMenu(fontFamilySelect);
				var requestAccessOption = document.createElement('option');
				requestAccessOption.value = that.REQUEST_FONT_ACCESS_OPTION_VALUE;
				requestAccessOption.textContent = that.REQUEST_FONT_ACCESS_OPTION_TEXT;
				fontFamilySelect.appendChild(requestAccessOption);
			});
	}
	
	
	// If the local font access API is not available, just show “web safe” fonts.
	this._populateKnownFonts(fontFamilySelect);
	return Promise.resolve();
};

/**
 * @private
 * Load available local font families into the font family menu.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @param {Boolean} userRequested - Whether the attempt to load local fonts is in response to a user request
 * @returns {Promise} Resolves when fonts have been loaded or rejects if loading failed
 */
TextToolOptionsToolbox.prototype._populateLocalFonts = function (fontFamilySelect, userRequested) {
	if (userRequested) {
		progressSpinner.show();
	}
	
	var that = this;
	return navigator.fonts.query({ persistentAccess: true })
		.then(function (fonts) {
			var fontFamilies = fonts.map(function (font) { return font.family; }),
				// Use Set to automatically remove duplicates.
				uniqueFontFamilies = Array.from(new Set(fontFamilies))
					.sort(Utils.caseInsensitiveSort);
			
			fontFamilySelect.innerHTML = '';
			that._addFontsToMenu(fontFamilySelect, that.BASE_FONTS);
			that._addDividerToMenu(fontFamilySelect);
			
			// Add each unique font family to the menu.
			uniqueFontFamilies.forEach(function (family) {
				var newOption = document.createElement('option');
				newOption.value = '\'' + family + '\'';
				newOption.style.fontFamily = '\'' + family + '\'';
				newOption.textContent = family;
				fontFamilySelect.appendChild(newOption);
			});
		})
		.finally(function () {
			if (userRequested) {
				progressSpinner.hide();
			}
		});
};

/**
 * @private
 * Load all known lists of font families into the font family menu that are appropriate for the device.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 */
TextToolOptionsToolbox.prototype._populateKnownFonts = function (fontFamilySelect) {
	this._addFontsToMenu(fontFamilySelect, this.BASE_FONTS);
	if (!Utils.isMobileLike) {
		this._addDividerToMenu(fontFamilySelect);
		this._addFontsToMenu(fontFamilySelect, this.DESKTOP_FONTS);
	}
};
/**
 * @private
 * Load known lists of font families into the font family menu.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @param {Array<Object>} fonts - The list of fonts to add
 */
TextToolOptionsToolbox.prototype._addFontsToMenu = function (fontFamilySelect, fonts) {
	fonts.forEach(function (font) {
		var newOption = document.createElement('option');
		newOption.value = font.css;
		newOption.style.fontFamily = font.css;
		newOption.textContent = font.name;
		fontFamilySelect.appendChild(newOption);
	});
};

/**
 * @private
 * Add a divider row to a <select> menu.
 * @param {HTMLSelectElement} selectMenu - The drop-down menu to add the divider to
 */
TextToolOptionsToolbox.prototype._addDividerToMenu = function (selectMenu) {
	var divider = document.createElement('option');
		divider.disabled = true;
	selectMenu.appendChild(divider);
};

