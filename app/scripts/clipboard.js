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
	
	Utils.readImage(e.clipboardData.files[0])
		.then(this.pasteImage)
		.catch(function () {
			// Hide the progress spinner.
			progressSpinner.hide();
		});
};

/**
 * Paste whatever image is on the clipboard to the page.
 */
ClipboardManager.prototype.triggerPaste = function () {
	if (!navigator.clipboard || !navigator.clipboard.read) {
		return false;
	}
	
	var that = this;
	navigator.clipboard.read()
		.then(function (clipboardData) {
			if (!clipboardData.type.match(/image\/.*/)) {
				return;
			}
			
			var image = new Image();
			image.onload = function () {
				that.pasteImage(image);
				URL.revokeObjectURL(clipboardData);
			};
			image.src = URL.createObjectURL(clipboardData);
		})
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert('PaintZ needs permission to paste from your clipboard.  You may need to go into your browser\'s site settings to grant that permission.');
			}
		});
	return true;
};

/**
 *
 */
ClipboardManager.prototype.pasteImage = function (image) {
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
	
	// Mark the selection as transformed so it gets saved no matter what.
	tools.selection._selection.transformed = true;
	
	// Set this to false so there is no selection start cover.
	tools.selection._selection.firstMove = false;
	
	// Hide the progress spinner.
	progressSpinner.hide();
};
};
