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

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
InstallDialog.prototype._setUp = function (contents) {
	BottomSheetDialog.prototype._setUp.call(this, contents);
	
	this._cta = this._element.querySelector('.callToAction');
	this._submitLink = this._element.querySelector('.submitLink');
	
	if (this.deferredInstall) {
		this._changeToPWAInstallPrompt();
	} else if (Utils.isMobileLike) {
		this._cta.innerHTML = 'add PaintZ to your home screen';
		this._submitLink.href = 'https://www.howtogeek.com/196087/how-to-add-websites-to-the-home-screen-on-any-smartphone-or-tablet/';
	} else if (navigator.userAgent.match(/chrome/i)) {
		this._cta.innerHTML = 'install PaintZ from the Chrome Web Store';
		this._submitLink.innerHTML = 'Install';
		this._submitLink.href = 'https://chrome.google.com/webstore/detail/gdjcnhanmagpjdpilaehedkchegnkdoj';
		var icon = this._element.querySelector('svg use');
		icon.setAttribute('href',       'images/icons/cws.svg#icon');
		icon.setAttribute('xlink:href', 'images/icons/cws.svg#icon');
	}
	
	this._submitLink.addEventListener('click', this._closeAfterDelay.bind(this), false);
};	

/**
 * @override
 * Open the dialog if the app is not already installed.
 */
InstallDialog.prototype.open = function () {
	// Do not open if already running as an “app”.
	var runningStandalone = window.matchMedia('(display-mode: standalone)').matches,
		installedAsChromeApp = (window.chrome && chrome.app && chrome.app.isInstalled);
	if (runningStandalone || installedAsChromeApp) {
		return;
	}
	
	// Update the CTA if there has been a deferred install since the dialog was created.
	if (this.deferredInstall) {
		this._changeToPWAInstallPrompt();
	}
	
	BottomSheetDialog.prototype.open.call(this);
};

/**
 * @private
 * Replace the prompt with a PWA installation trigger.
 */
InstallDialog.prototype._changeToPWAInstallPrompt = function () {
	this._cta.innerHTML = 'install PaintZ as an app';
	this._submitLink.innerHTML = 'Install';
	this._submitLink.href = '#';
	this._submitLink.addEventListener('click', (function (e) {
		e.preventDefault();
		this.deferredInstall.prompt();
	}).bind(this));
};
