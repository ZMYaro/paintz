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
		if (!(tools.currentTool instanceof SelectionTool)) {
			return;
		}
		
		e.preventDefault();
		tools.currentTool.copy();
	}).bind(this));
	window.addEventListener('cut', (function (e) {
		if (!this.enabled) {
			return;
		}
		if (!(tools.currentTool instanceof SelectionTool)) {
			return;
		}
		
		e.preventDefault();
		tools.currentTool.cut();
	}).bind(this));
}

// Define constants.
ClipboardManager.prototype.CLIPBOARD_UNSUPPORTED_MESSAGE = 'Your browser does not support copying or cutting selections from PaintZ.  ' + Utils.SUGGESTED_BROWSER_MESSAGE;
ClipboardManager.prototype.CLIPBOARD_UNAUTHORIZED_MESSAGE = 'PaintZ needs permission to paste from your clipboard.  You may need to go into your browser\'s site settings to grant that permission.';

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
		// If the browser does not support the clipboard API, fall back
		// to `document.execCommand`; if that fails, it will return false.
		return document.execCommand('paste');
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
				alert(that.CLIPBOARD_UNAUTHORIZED_MESSAGE);
			}
		});
	return true;
};

/**
 * Paste an image to the canvas as a new selection.
 * @param {Image} image - The image to use as the contents of the new selection
 */
ClipboardManager.prototype.paste = function (image) {
	// Set up to paste at the top-left corner of the visible canvas.
	var pasteX = Math.floor(window.scrollX / zoomManager.level),
		pasteY = Math.floor(window.scrollY / zoomManager.level),
		pasteRightX = Math.floor(pasteX + image.width),
		pasteBottomY = Math.floor(pasteY + image.height);
	
	// If the canvas is not big enough to fit the pasted image, resize it.
	resizeCanvas(
		Math.max(pasteRightX, settings.get('width')),
		Math.max(pasteBottomY, settings.get('height')),
		'crop');
	
	// Tell the selection tool it just moved to create a selection of the proper size.
	tools.switchTool('selection');
	tools.selection.start({ x: pasteX, y: pasteY });
	tools.selection.end({ x: pasteRightX, y: pasteBottomY });
	
	// Set the selection content to the pasted image.
	preCxt.reset();
	preCxt.drawImage(image, pasteX, pasteY);
	tools.selection._selection.content.opaqueData = preCxt.getImageData(pasteX, pasteY, image.width, image.height);
	
	// Mark the selection as transformed so it gets saved no matter what.
	tools.selection._selection.transformed = true;
	
	// Set this to false so there is no selection start cover.
	tools.selection._selection.firstMove = false;
	
	// Apply transparency (and create `_selection.content.data`).
	tools.selection.setTransparentBackground();
	
	// Draw the new selection.
	tools.selection.redrawSelection();
	
	// Hide the progress spinner.
	progressSpinner.hide();
};

/**
 * Copy the image or selection to the clipboard.
 * @param {Blob} imageBlob - A blob of the image data to copy
 */
ClipboardManager.prototype.copy = function (imageBlob) {
	if (!navigator.clipboard || !navigator.clipboard.write) {
		alert(this.CLIPBOARD_UNSUPPORTED);
		return false;
	}
	
	var clipboardItem = new ClipboardItem({ 'image/png': imageBlob });
	
	var that = this;
	navigator.clipboard.write([clipboardItem])
		.catch(function (err) {
			if (err.name === 'NotAllowedError') {
				alert(that.CLIPBOARD_UNAUTHORIZED_MESSAGE);
			}
		});
	return true;
};
