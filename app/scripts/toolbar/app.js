'use strict';

/**
 * @class
 * Create a new AppToolbox instance.
 */
function AppToolbox() {
	Toolbox.call(this, 'app');
}
// Extend Toolbox.
AppToolbox.prototype = Object.create(Toolbox.prototype);

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
AppToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Full screen button.
	var fullScreenBtn = this._element.querySelector('#fullScreenBtn');
	fullScreenBtn.addEventListener('click', function () {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen();
		} else if (canvas.mozRequestFullScreen) {
			canvas.mozRequestFullScreen();
		} else if (canvas.msRequestFullscreen) {
			canvas.msRequestFullscreen();
		} else {
			alert('Sorry, your web browser does not support full screen mode.');
		}
	}, false);
	
	// Settings button and dialog.
	var settingsBtn = this._element.querySelector('#settingsBtn'),
		settingsDialog = new SettingsDialog(settingsBtn);
	settingsBtn.addEventListener('click', settingsDialog.open.bind(settingsDialog), false);
	
	// Help button and dialog.
	var helpBtn = this._element.querySelector('#helpBtn'),
		helpDialog = new HelpDialog(helpBtn);
	helpBtn.addEventListener('click', helpDialog.open.bind(helpDialog), false);

	// About button and dialog.
	var aboutBtn = this._element.querySelector('#aboutBtn'),
		aboutDialog = new AboutDialog(aboutBtn);
	aboutBtn.addEventListener('click', aboutDialog.open.bind(aboutDialog), false);
};
