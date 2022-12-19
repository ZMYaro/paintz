'use strict';

/**
 * @class
 * Create a new AboutDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function AboutDialog(trigger) {
	Dialog.call(this, 'about', trigger);
	
	window.addEventListener('beforeinstallprompt', (function (e) {
		e.preventDefault();
		this.deferredInstall = e;
	}).bind(this));
}
// Extend Dialog.
AboutDialog.prototype = Object.create(Dialog.prototype);
AboutDialog.prototype.constructor = AboutDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
AboutDialog.prototype.WIDTH = '520px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
AboutDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	// Show CWS link if supported.
	this._initCWSLinks();
	
	// Hide CWS feedback link on mobile since the CWS mobile UI does not show the feedback tab.
	if (Utils.isMobileLike) {
		var feedbackLink = this._element.querySelector('#cwsFeedbackLink');
		feedbackLink.parentElement.style.display = 'none';
	}
	
	// Show the PWA install button if there was a deferred install prompt.
	if (this.deferredInstall) {
		this._showPWAInstallButton();
	}
};

/**
 * @override
 * Open the dialog.
 */
AboutDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	
	// Show the PWA install button if there has been a deferred install since the dialog was created.
	if (this.deferredInstall) {
		this._showPWAInstallButton();
	}
};

/**
 * @private
 * Set the correct Chrome Web Store link to appear depending on the user's browser and whether the app is installed.
 */
AboutDialog.prototype._initCWSLinks = function () {
	if ((!window.chrome || !chrome.webstore) || (window.chrome && chrome.app && chrome.app.isInstalled)) {
		// If this is not Chrome or the CWS app is already installed, do not ask the user to install.
		return;
	}
	
	var installLink = this._element.querySelector('#cwsInstallLink'),
		feedbackLink = this._element.querySelector('#cwsFeedbackLink');
	
	// Switch which link's row is visible.
	feedbackLink.parentElement.style.display = 'none';
	installLink.parentElement.style.removeProperty('display');
	
	// Enable inline installation if the user's browser supports it.
	if (chrome.webstore.install) {
		installLink.onclick = function (e) {
			e.preventDefault();
			var cwsURL = document.querySelector('link[rel=\"chrome-webstore-item\"]').href;
			chrome.webstore.install(cwsURL, function () {
				// Change links on successful installation.
				installLink.parentElement.style.display = 'none';
				feedbackLink.parentElement.style.removeProperty('display');
			}, function (err) {
				// If triggering installation fails, just open the CWS page if Chrome did not already do so.
				if (err.indexOf('The user will be redirected to the Chrome Web Store') === -1) {
					window.open(e.target.href, '_blank');
				}
			});
		};
	}
};

/**
 * @private
 * Show the PWA installation option.
 */
AboutDialog.prototype._showPWAInstallButton = function () {
	var cwsInstallLink = this._element.querySelector('#cwsInstallLink'),
		pwaInstallButton = this._element.querySelector('#pwaInstallButton');
	
	cwsInstallLink.parentElement.style.display = 'none';
	pwaInstallButton.parentElement.style.removeProperty('display');
	
	pwaInstallButton.addEventListener('click', (function (e) {
		e.preventDefault();
		this.deferredInstall.prompt();
	}).bind(this));
	
	var icon = pwaInstallButton.querySelector('svg use'),
		iconURL = 'images/icons/install_' + (Utils.isMobileLike ? 'mobile' : 'desktop') + '.svg#icon';
	icon.setAttribute('href',       iconURL);
	icon.setAttribute('xlink:href', iconURL);
};
