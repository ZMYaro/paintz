'use strict';

/**
 * @class
 * Create a new TextToolOptionsToolbox instance.
 * @param {HTMLElement} [parentToolbar] - The toolbar the toolbox is to be added to
 */
function TextToolOptionsToolbox(parentToolbar) {
	Toolbox.call(this, 'text_tool_options', parentToolbar);
	
	this.boldToggle;
	this.italicToggle;
	this.underlineToggle;
	this.strikeToggle;
}
// Extend Toolbox.
TextToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
TextToolOptionsToolbox.prototype.constructor = TextToolOptionsToolbox;

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
	
	this.textFillToggle = this._element.querySelector('#textFillToggle');
	this.textFillToggle.checked = settings.get('textFill');
	this.textFillToggle.addEventListener('change', function (e) {
		settings.set('textFill', e.target.checked);
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

TextToolOptionsToolbox.prototype._setUpFontFamilyMenu = function () {
	var fontFamilySelect = this._element.querySelector('#fontFamilySelect');
	
	// There is no good way to feature detect browsers with extra fonts, so just exclude
	// the mainstream “mobile” OSes :/\
	
	var treatAsMobile = navigator.userAgent.match(/android|ipad|iphone|ipod/i);
	if (!treatAsMobile) {
		var divider = document.createElement('option');
		divider.disabled = true;
		fontFamilySelect.appendChild(divider);
		
		this.DESKTOP_FONTS.forEach(function (font) {
			var newOption = document.createElement('option');
			newOption.value = font.css;
			newOption.style.fontFamily = font.css;
			newOption.innerHTML = font.name;
			fontFamilySelect.appendChild(newOption);
		});
	}
	
	fontFamilySelect.value = settings.get('fontFamily');
	fontFamilySelect.addEventListener('change', function (e) {
		settings.set('fontFamily', e.target.value);
	}, false);
};
