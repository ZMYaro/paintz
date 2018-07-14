'use strict';

/**
 * @class
 * Create a new AboutDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function AboutDialog(trigger) {
	Dialog.call(this, 'about', trigger);
}
// Extend Dialog.
AboutDialog.prototype = Object.create(Dialog.prototype);

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
AboutDialog.prototype.WIDTH = '640px';

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
AboutDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	this._initCWSLinks();
};

/**
 * @private
 * Set the correct Chrome Web Store link to appear depending on the user's browser and whether the app is installed.
 */
AboutDialog.prototype._initCWSLinks = function () {
	var cwsInstallLink = this._element.querySelector('#cwsInstallLink'),
		cwsFeedbackLink = this._element.querySelector('#cwsFeedbackLink');
	
	if ((!window.chrome || !chrome.webstore) || (window.chrome && chrome.app && chrome.app.isInstalled)) {
		// If this is not Chrome or the CWS app is already installed, do not ask the user to install.
		cwsInstallLink.style.display = 'none';
		cwsFeedbackLink.style.display = 'block';
	} else {
		// If the app is not installed, enable inline installation if the user's browser supports it.
		cwsInstallLink.onclick = function (e) {
			if (chrome && chrome.webstore && chrome.webstore.install) {
				e.preventDefault();
				var cwsLink = document.querySelector('link[rel=\"chrome-webstore-item\"]').href;
				chrome.webstore.install(cwsLink, function () {
					// Change links on successful installation.
					cwsInstallLink.style.display = 'none';
					cwsFeedbackLink.style.display = 'block';
				}, function () {
					// If triggering installation fails, just open the CWS page.
					window.open(e.target.href, '_blank');
				});
			}
		};
	}
};
