'use strict';

/**
 * @class
 * Create a new InstallDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function InstallDialog(trigger) {
	BottomSheetDialog.call(this, 'install', trigger);
	
	window.addEventListener('beforeinstallprompt', (function (e) {
		e.preventDefault();
		this.deferredInstall = e;
	}).bind(this));
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
	
	if (this.deferredInstall) {
		cta.innerHTML = 'install PaintZ as an app';
		submitLink.href = '#';
		submitLink.addEventListener('click', (function (e) {
			e.preventDefault();
			this.deferredInstall.prompt();
		}).bind(this));
	} else if (navigator.userAgent.match(/mobile/i)) {
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
	
	this._element.querySelector('.submitLink').addEventListener('click', this._closeAfterDelay.bind(this), false);
};	

/**
 * @override
 * Open the dialog if the app is not already installed.
 */
InstallDialog.prototype.open = function () {
	// Do not open if already running as an “app”.
	if (window.matchMedia('(display-mode: standalone)').matches || (window.chrome && chrome.app && chrome.app.isInstalled)) {
		return;
	}
	
	BottomSheetDialog.prototype.open.call(this);
};
