'use strict';

/**
 * Create a new ClipboardManager instance and set up its event listeners.
 */
function ClipboardManager() {
	/** {Boolean} Whether the clipboard manager currently intercepts cilpboard events */
	this.enabled = false;
	
	window.addEventListener('paste', this._handlePaste.bind(this), false);
	window.addEventListener('copy', (function (e) {
		if (!this.enabled) {
			return;
		}
		if (tools.currentTool !== tools.selection && tools.currentTool !== tools.freeformSelection) {
			return;
		}
		
		e.preventDefault();
		tools.currentTool.copy();
	}).bind(this));
	window.addEventListener('cut', (function (e) {
		if (!this.enabled) {
			return;
		}
		if (tools.currentTool !== tools.selection && tools.currentTool !== tools.freeformSelection) {
			return;
		}
		
		e.preventDefault();
		tools.currentTool.cut();
	}).bind(this));
}

/**
 * Handle something being pasted to the page.
 * @param {ClipboardEvent} e
 */
ClipboardManager.prototype._handlePaste = function (e) {
	if (!this.enabled) {
		return;
	}
	
	// If no image data was pasted, ignore it.
	if (e.clipboardData.files.length === 0) {
		return;
	}
	
	// Show the progress spinner until the image loads.
	progressSpinner.show();
	
	Utils.readImage(e.clipboardData.files[0])
		.then(this.paste)
		.catch(function () {
			// Hide the progress spinner if pasting failed.
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
	
	// Set up to paste at the top-left corner of the visible canvas.
	var pasteX = Math.floor(window.scrollX / zoomManager.level),
		pasteY = Math.floor(window.scrollY / zoomManager.level),
		pasteRightX = Math.floor(pasteX + image.width),
		pasteBottomY = Math.floor(pasteY + image.height);
	
	// Tell the selection tool it just moved to create a selection of the proper size.
	tools.switchTool('selection');
	tools.selection.start({ x: pasteX, y: pasteY });
	tools.selection.end({ x: pasteRightX, y: pasteBottomY });
	tools.selection.update();
	
	// Set the selection content to the pasted image.
	Utils.clearCanvas(preCxt);
	preCxt.drawImage(image, pasteX, pasteY);
	tools.selection._selection.opaqueContent = preCxt.getImageData(pasteX, pasteY, image.width, image.height);
	
	// Mark the selection as transformed so it gets saved no matter what.
	tools.selection._selection.transformed = true;
	
	// Set this to false so there is no selection start cover.
	tools.selection._selection.firstMove = false;
	
	// Apply transparency (and create selection.content).
	tools.selection.setTransparentBackground();
	
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
	
	var clipboardItem = new ClipboardItem({ 'image/png': imageBlob });
	
	navigator.clipboard.write([clipboardItem])
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert('PaintZ needs permission to copy or cut to your clipboard.  You may need to go into your browser\'s site settings to grant that permission.');
			}
		});
	return true;
};
