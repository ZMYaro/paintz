'use strict';

/**
 * @class
 * Create a new SaveDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SaveDialog(trigger) {
	Dialog.call(this, 'save', trigger);
	this._progressSpinner;
	this._downloadLink;
	this._boundSetDownloadURL = this._setDownloadURL.bind(this);
}
// Extend Dialog.
SaveDialog.prototype = Object.create(Dialog.prototype);
SaveDialog.prototype.constructor = SaveDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
SaveDialog.prototype.WIDTH = '384px';

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
	
	this._downloadLink = this._element.querySelector('#downloadLink');
	this._downloadLink.style.display = 'none';
	this._downloadLink.onclick = (function () {
		// Web app cannot confirm the user went through with the download, but assume xe did.
		document.title = this._downloadLink.download + ' - PaintZ';
		undoStack.changedSinceSave = false;
		this.close();
	}).bind(this);
	this._element.onsubmit = (function () {
		this._downloadLink.click();
	}).bind(this);
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
 */
SaveDialog.prototype._createDownloadURL = function () {
	this._downloadLink.style.display = 'none';
	this._progressSpinner.style.removeProperty('display');
	
	canvas.toBlob(this._boundSetDownloadURL, this._downloadLink.type || 'image/png');
};

/**
 * @private
 * Set the download URL using the blob from the canvas.
 * @param {Blob} blob - The image blob from the canvas
 */
SaveDialog.prototype._setDownloadURL = function (blob) {
	URL.revokeObjectURL(this._downloadLink.href);
	var url = URL.createObjectURL(blob);
	this._downloadLink.href = url;
	
	this._downloadLink.style.removeProperty('display');
	this._progressSpinner.style.display = 'none';
};

/**
 * @private
 * Update the file extension in the file name to match the selection in the menu.
 */
SaveDialog.prototype._updateFileExtension = function () {
	// Update file name.
	var newName = fixExtension(this._element.fileName.value, this._element.fileType.value);
	this._element.fileName.value = newName;
	this._downloadLink.download = newName;
	if (this._element.fileType.value !== this._downloadLink.type) {
		this._downloadLink.type = this._element.fileType.value;
		this._createDownloadURL();
	}
};
