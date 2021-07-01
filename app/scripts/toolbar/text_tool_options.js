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
TextToolOptionsToolbox.prototype.REQUEST_FONT_ACCESS_OPTION_VALUE = 'paintz-request-local-font-access';
TextToolOptionsToolbox.prototype.REQUEST_FONT_ACCESS_OPTION_TEXT = 'Show more fonts...';
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
						// If successful, remove the option to request local fonts.
						.then(function () { fontFamilySelect.options[fontFamilySelect.selectedIndex].remove(); })
						// Regardless, switch the selected option back to the last selected font family afterward.
						.finally(function () { fontFamilySelect.value = settings.get('fontFamily'); });
					return;
				}
				settings.set('fontFamily', e.target.value);
			}, false);
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


/**
 * @private
 * Populate the font family menu with all fonts known to be safely accessible.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 * @returns {Promise} Resolves when fonts have been loaded or rejects if loading failed
 */
TextToolOptionsToolbox.prototype._populateFonts = function (fontFamilySelect) {
	var that = this;
	if (navigator.fonts) {
		this._addDividerToMenu(fontFamilySelect);
		return this._populateLocalFonts(fontFamilySelect)
			.catch(function (err) {
				// If fetching local fonts failed, list web safe fonts and
				// add an option for the user to manually request local fonts.
				that._populateWebSafeFonts(fontFamilySelect);
				that._addDividerToMenu(fontFamilySelect);
				var requestAccessOption = document.createElement('option');
				requestAccessOption.value = that.REQUEST_FONT_ACCESS_OPTION_VALUE;
				requestAccessOption.textContent = that.REQUEST_FONT_ACCESS_OPTION_TEXT;
				fontFamilySelect.appendChild(requestAccessOption);
			});
	}
	
	// If the local font access API is not available, just show “web safe” fonts.
	this._addDividerToMenu(fontFamilySelect);
	this._populateWebSafeFonts(fontFamilySelect);
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
	
	return navigator.fonts.query()
		.then(function (fonts) {
			var fontFamilies = fonts.map(function (font) { return font.family; }),
				// Use Set to automatically remove duplicates.
				uniqueFontFamilies = [...new Set(fontFamilies)];
			
			// Add each unique font family to the menu.
			uniqueFontFamilies.forEach(function (family) {
				var newOption = document.createElement('option');
				newOption.value = '\'' + family + '\'';
				newOption.style.fontFamily = '\'' + family + '\'';
				newOption.textContent = family;
				fontFamilySelect.appendChild(newOption);
			})
		})
		.finally(function () {
			if (userRequested) {
				progressSpinner.hide();
			}
		});
};

/**
 * @private
 * Load “web safe” font families into the font family menu.
 * @param {HTMLSelectElement} fontFamilySelect - The font family drop-down menu
 */
TextToolOptionsToolbox.prototype._populateWebSafeFonts = function (fontFamilySelect) {
	// There is no good way to feature detect browsers with extra fonts, so just exclude
	// the mainstream “mobile” OSes :/
	var treatAsMobile = navigator.userAgent.match(/android|ipad|iphone|ipod/i);
	if (treatAsMobile) {
		return;
	}
	
	this.DESKTOP_FONTS.forEach(function (font) {
		var newOption = document.createElement('option');
		newOption.value = font.css;
		newOption.style.fontFamily = font.css;
		newOption.textContent = font.name;
		fontFamilySelect.appendChild(newOption);
	});
};
