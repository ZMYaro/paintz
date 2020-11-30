'use strict';

/**
 * @class
 * Create a new AppToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function AppToolbox(toolbar) {
	Toolbox.call(this, 'app', toolbar);
	
	// Create relevant dialogs.
	dialogs.settings = new SettingsDialog();
	dialogs.help = new HelpDialog();
	dialogs.about = new AboutDialog();
}
// Extend Toolbox.
AppToolbox.prototype = Object.create(Toolbox.prototype);
AppToolbox.prototype.constructor = AppToolbox;

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
	var settingsBtn = this._element.querySelector('#settingsBtn');
	dialogs.settings.trigger = settingsBtn;
	settingsBtn.addEventListener('click', dialogs.settings.open.bind(dialogs.settings), false);
	
	// Help button and dialog.
	var helpBtn = this._element.querySelector('#helpBtn');
	dialogs.help.trigger = helpBtn;
	helpBtn.addEventListener('click', dialogs.help.open.bind(dialogs.help), false);

	// About button and dialog.
	var aboutBtn = this._element.querySelector('#aboutBtn');
	dialogs.about.trigger = aboutBtn;
	aboutBtn.addEventListener('click', dialogs.about.open.bind(dialogs.about), false);
};
