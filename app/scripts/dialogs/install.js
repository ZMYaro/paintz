'use strict';

/**
 * @class
 * Create a new InstallDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function InstallDialog(trigger) {
	BottomSheetDialog.call(this, 'install', trigger);
}
// Extend Dialog.
InstallDialog.prototype = Object.create(BottomSheetDialog.prototype);
InstallDialog.prototype.constructor = InstallDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
InstallDialog.prototype.WIDTH = '412px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
InstallDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	var cta = this._element.querySelector('.callToAction'),
		submitLink = this._element.querySelector('.submitLink');
	
	if (navigator.userAgent.match(/mobile/i)) {
		cta.innerHTML = 'add PaintZ to your home screen';
		submitLink.href = 'https://www.howtogeek.com/196087/how-to-add-websites-to-the-home-screen-on-any-smartphone-or-tablet/';
	} else if (navigator.userAgent.match(/chrome/i)) {
		cta.innerHTML = 'install PaintZ from the Chrome Web Store';
		submitLink.innerHTML = 'Install';
		submitLink.href = 'https://chrome.google.com/webstore/detail/gdjcnhanmagpjdpilaehedkchegnkdoj';
		var icon = this._element.querySelector('svg use');
		icon.setAttribute('href',       'images/icons/cws.svg#icon');
		icon.setAttribute('xlink:href', 'images/icons/cws.svg#icon');
	}
	
	this._element.querySelector('.submitLink').addEventListener('click', this._handleLinkClick.bind(this), false);
};	

/**
 * Close the dialog after the link is clicked.
 */
InstallDialog.prototype._handleLinkClick = function () {
	var CLOSE_DELAY = 1000; // Milliseconds
	setTimeout(this.close.bind(this), CLOSE_DELAY);
};