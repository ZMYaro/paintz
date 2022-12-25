'use strict';

/**
 * @class
 * Create a new SaveDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SaveDialog(trigger) {
	Dialog.call(this, 'save', trigger);
	this._element.id = 'saveDialog';
	this._progressSpinner;
	this._downloadLink;
	this._shareButton;
	this._blob;
	this._boundHandleShare = this._handleShare.bind(this);
}
// Extend Dialog.
SaveDialog.prototype = Object.create(Dialog.prototype);
SaveDialog.prototype.constructor = SaveDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
SaveDialog.prototype.WIDTH = '384px';
/** @constant {String} The message for browsers that do not support sharing files */
SaveDialog.prototype.SHARE_UNSUPPORTED_MESSAGE = 'Your browser or system does not support sharing from PaintZ.  ' + Utils.SUGGESTED_BROWSER_MESSAGE;

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
SaveDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.fileName.onchange =
		this._element.fileType.onchange =
		this._element.fileType.oninput = this._updateFileExtension.bind(this);
	
	this._progressSpinner = this._element.querySelector('progress');
	
	this._shareButton = this._element.querySelector('#shareButton');
	this._shareButton.onclick = this._boundHandleShare;
	this._shareButton.disabled = true;
	this._shareButton.title = this.SHARE_UNSUPPORTED_MESSAGE;
	
	this._downloadLink = this._element.querySelector('#downloadLink');
	this._downloadLink.onclick = this._handleSave.bind(this);
	this._element.onsubmit = (function () {
		this._downloadLink.click();
	}).bind(this);
	
	this._element.classList.add('loading');
};

/**
 * @override
 * Open the dialog.
 */
SaveDialog.prototype.open = function () {
	Dialog.prototype.open.call(this);
	
	// Export the canvas content to an image to be saved.
	this._createDownloadURL();
};

/**
 * @private
 * Create a new blob URL, and set it as the download URL when done.
 * @returns {Promise} Resolves when the blob has been created and the download URL set
 */
SaveDialog.prototype._createDownloadURL = function () {
	var that = this;
	return new Promise(function (resolve, reject) {
		that._element.classList.add('loading');
		
		var blob = canvas.toBlob(function (blob) {
			that._setDownloadURL(blob);
			resolve();
		}, that._downloadLink.type || 'image/png');
		if (blob instanceof Blob) {
			// Fallback for browsers in which toBlob is synchronous and returns a Blob.
			that._setDownloadURL(blob);
			resolve();
		}
	});
};

/**
 * @private
 * Set the download URL using the blob from the canvas.
 * @param {Blob} blob - The image blob from the canvas
 */
SaveDialog.prototype._setDownloadURL = function (blob) {
	// Remove any old blob URL.
	URL.revokeObjectURL(this._downloadLink.href);
	
	// Save the new blob in case it needs to be shared or saved with `msSaveBlob`.
	this._blob = blob;
	
	// Create a new URL to save.
	var url = URL.createObjectURL(blob);
	this._downloadLink.href = url;
	
	// If the web share API is supported, create a file to test whether it can be shared.
	if (navigator.canShare) {
		var file = new File([blob], this._element.fileName.value, { type: blob.type });
		if (!navigator.canShare({ files: [file] })) {
			this._shareButton.disabled = true;
			this._shareButton.title = this.SHARE_UNSUPPORTED_MESSAGE;
		} else {
			this._shareButton.disabled = false;
			this._shareButton.title = '';
		}
	}
	
	this._element.classList.remove('loading');
};

/**
 * @private
 * Update the file extension in the file name to match the selection in the menu.
 */
SaveDialog.prototype._updateFileExtension = function () {
	// Update file name.
	var newName = this._matchExtensionToMIMEType(this._element.fileName.value, this._element.fileType.value);
	this._element.fileName.value = newName;
	this._downloadLink.download = newName;
	if (this._element.fileType.value !== this._downloadLink.type) {
		this._downloadLink.type = this._element.fileType.value;
		this._createDownloadURL();
	}
};

/**
 * @private
 * Fix the extension on a file name to match a MIME type.
 * @param {String} name - The file name to fix
 * @param {String} type - The MIME type to match (image/jpeg or image/png)
 * @returns {String} - The modified file name
 */
SaveDialog.prototype._matchExtensionToMIMEType = function (name, type) {
	name = name.trim();
	
	if (type === 'image/png' && !PNG_REGEX.test(name)) {
		if (FILE_EXT_REGEX.test(name)) {
			return name.replace(FILE_EXT_REGEX, '.png');
		} else {
			return name + '.png';
		}
	} else if (type === 'image/jpeg' && !JPEG_REGEX.test(name)) {
		if (FILE_EXT_REGEX.test(name)) {
			return name.replace(FILE_EXT_REGEX, '.jpg');
		} else {
			return name + '.jpg';
		}
	}
	return name;
};

/**
 * @private
 * Handle the save button being clicked.
 * @param {MouseEvent} e
 */
SaveDialog.prototype._handleSave = function (e) {
	if (navigator.msSaveBlob) {
		e.preventDefault();
		navigator.msSaveBlob(this._blob,
			this._downloadLink.download || this._downloadLink.getAttribute('download'));
	}
	document.title = this._downloadLink.download + PAGE_TITLE_SUFFIX;
	// Web app cannot confirm the user went through with the download, but assume xe did.
	undoStack.changedSinceSave = false;
	// Increment save count.
	var saveCount = settings.get('saveCount');
	settings.set('saveCount', Math.min(saveCount + 1, settings.MAX_SAVE_COUNT));
	checkSaveCountMilestone();
	// Close the dialog.
	this.close();
};

/**
 * @private
 * Handle the share button being clicked.
 * @param {MouseEvent} e
 */
SaveDialog.prototype._handleShare = function (e) {
	if (!navigator.canShare) {
		alert(this.SHARE_UNSUPPORTED_MESSAGE);
		return;
	}
	
	var file = new File([this._blob], this._element.fileName.value, { type: this._blob.type });
	
	if (!navigator.canShare({ files: [file] })) {
		alert(this.SHARE_UNSUPPORTED_MESSAGE);
		return;
	}
	
	navigator.share({
		files: [file],
		title: this._element.fileName.value
	}).then((function () {
		this.close();
	}).bind(this));
};
