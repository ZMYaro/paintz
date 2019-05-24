'use strict';

/**
 * @class
 * Create a new SaveDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function SaveDialog(trigger) {
	Dialog.call(this, 'save', trigger);
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
	
	this._downloadLink = this._element.querySelector('#downloadLink');
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
	canvas.toBlob(this._boundSetDownloadURL, this._downloadLink.type || 'image/png');
};

/**
 * Close the dialog and revoke the canvas blob URL.
 * @param {Event} [e] - The event that triggered the close, if any.
 */
SaveDialog.prototype.close = function (e) {
	Dialog.prototype.close.call(this, e);
	
	URL.revokeObjectURL(this._downloadLink.href);
};

/**
 * @private
 * Set the download URL using the blob from the canvas.
 * @param {Blob} blob - The image blob from the canvas
 */
SaveDialog.prototype._setDownloadURL = function (blob) {
	var url = URL.createObjectURL(blob);
	this._downloadLink.href = url;
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
	this._downloadLink.href = canvas.toDataURL(this._element.fileType.value);
	
	// Update file type.
	this._downloadLink.type = this._element.fileType.value;
};
