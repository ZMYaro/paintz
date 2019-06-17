'use strict';

function ClipboardManager() {
	window.addEventListener('paste', this._handlePaste.bind(this), false);
	window.addEventListener('copy', function (e) {
		if (tools.currentTool === tools.selection) {
			e.preventDefault();
			tools.currentTool.copy();
		}
	});
	window.addEventListener('cut', function (e) {
		if (tools.currentTool === tools.selection) {
			e.preventDefault();
			tools.currentTool.cut();
		}
	});
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
		.then(this.paste)
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
			if (clipboardData.length === 0 || !clipboardData[0].types.indexOf('image/png') === -1) {
				return;
			}
			
			clipboardData[0].getType('image/png').then(function (imageBlob) {
				var image = new Image();
				image.onload = function () {
					that.paste(image);
					URL.revokeObjectURL(imageBlob);
				};
				image.src = URL.createObjectURL(imageBlob);
			});
		})
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert('PaintZ needs permission to paste from your clipboard.  You may need to go into your browser\'s site settings to grant that permission.');
			}
		});
	return true;
};

/**
 * Paste an image to the canvas as a new selection.
 * @param {Image} image - The image to use as the contents of the new selection
 */
ClipboardManager.prototype.paste = function (image) {
	// If the canvas is not big enough to fit the pasted image, resize it.
	resizeCanvas(
		Math.max(image.width, settings.get('width')),
		Math.max(image.height, settings.get('height')),
		'crop');
	
	// Tell the selection tool it just moved to create a selection of the proper size.
	tools.switchTool('selection');
	tools.selection.start({ x: 0, y: 0 });
	tools.selection.end({ x: image.width, y: image.height });
	tools.selection.update();
	
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

/**
 * Copy the image or selection to the clipboard.
 * @param {Blob} imageBlob - A blob of the image data to copy
 */
ClipboardManager.prototype.copy = function (imageBlob) {
	if (!navigator.clipboard || !navigator.clipboard.write) {
		alert('Your browser does not support copying or cutting selections from PaintZ.  To use this feature, please switch to a supported browser, such as the latest Google Chrome.');
		return false;
	}
	
	navigator.clipboard.write(imageBlob)
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert('PaintZ needs permission to copy or cut to your clipboard.  You may need to go into your browser\'s site settings to grant that permission.');
			}
		});
	return true;
};
