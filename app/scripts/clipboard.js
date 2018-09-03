'use strict';

function ClipboardManager() {
	window.addEventListener('paste', this._handlePaste.bind(this), false);
}

/**
 * Handle something being pasted to the page.
 * @param {ClipboardEvent} e
 */
ClipboardManager.prototype._handlePaste = function (e) {
	// If no image data was pasted, ignore it.
	if (e.clipboardData.files.length === 0) {
		return;
	}
	
	// Show the progress spinner until the image loads.
	progressSpinner.show();
	
	Utils.readImage(e.clipboardData.files[0]).then(function (image) {
		// If the canvas is not big enough to fit the pasted image, resize it.
		resizeCanvas(
			Math.max(image.width, settings.get('width')),
			Math.max(image.height, settings.get('height')),
			'crop');
		
		// Tell the selection tool it just moved to create a selection of the proper size.
		tools.switchTool('selection');
		tools.selection.start({ x: 0, y: 0 });
		tools.selection.end({ x: image.width, y: image.height });
		
		// Set the selection content to the pasted image.
		Utils.clearCanvas(preCxt);
		preCxt.drawImage(image, 0, 0);
		tools.selection._selection.content = preCxt.getImageData(0, 0, image.width, image.height);
		
		// Set this to false so there is no selection start cover.
		tools.selection._selection.firstMove = false;
		
		// Hide the progress spinner.
		progressSpinner.hide();
	}).catch(function () {
		// Hide the progress spinner.
		progressSpinner.hide();
	});
};
