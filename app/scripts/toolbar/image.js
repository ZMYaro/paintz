'use strict';

/**
 * @class
 * Create a new ImageToolbox instance.
 */
function ImageToolbox() {
	Toolbox.call(this, 'image');
	
	// Expose the undo and redo buttons so the history manager can enable/disable them.
	/** {HTMLButtonElement} The redo button */
	this.redoBtn;
	/** {HTMLButtonElement} The undo button */
	this.undoBtn;
	
	// Create relevant dialogs.
	dialogs.clear = new ClearDialog();
	dialogs.save = new SaveDialog();
	dialogs.resize = new ResizeDialog();
}
// Extend Toolbox.
ImageToolbox.prototype = Object.create(Toolbox.prototype);
ImageToolbox.prototype.constructor = ImageToolbox;

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ImageToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Clear button and dialog.
	var clearBtn = this._element.querySelector('#clearBtn');
	dialogs.clear.trigger = clearBtn;
	clearBtn.addEventListener('click', dialogs.clear.open.bind(dialogs.clear), false);
	
	// Save as button and dialog.
	var saveBtn = this._element.querySelector('#saveBtn');
	dialogs.save.trigger = saveBtn;
	saveBtn.addEventListener('click', dialogs.save.open.bind(dialogs.save), false);
	
	// Uploader.
	var uploadInput = this._element.querySelector('#upload');
	uploadInput.addEventListener('change', this._handleFileUpload.bind(this), false);
	// Open button.
	var openBtn = this._element.querySelector('#openBtn');
	openBtn.addEventListener('click', function (e) {
		uploadInput.click();
	}, false);
	
	// Undo and redo buttons.
	this.undoBtn = this._element.querySelector('#undoBtn');
	this.redoBtn = this._element.querySelector('#redoBtn');
	this.undoBtn.addEventListener('click', undoStack.undo.bind(undoStack), false);
	this.redoBtn.addEventListener('click', undoStack.redo.bind(undoStack), false);
	
	// Resize button and dialog.
	var resizeBtn = this._element.querySelector('#resizeBtn');
	dialogs.resize.trigger = resizeBtn;
	resizeBtn.addEventListener('click', dialogs.resize.open.bind(dialogs.resize), false);
};

/**
 * @private
 * Load a new image through the file uploader.
 * @param {Event} e
 */
ImageToolbox.prototype._handleFileUpload = function (e) {
	// Show the progress spinner until the image loads.
	progressSpinner.show();
	
	var file = e.target.files[0];
	Utils.readImage(file).then(function (image) {
		// There is no need to clear the canvas.  Resizing the canvas will do that.
		canvas.width =
			preCanvas.width = image.width;
		canvas.height =
			preCanvas.height = image.height;
		settings.set('width', image.width);
		settings.set('height', image.height);
		cxt.fillStyle = 'white';
		cxt.fillRect(0, 0, canvas.width, canvas.height);
		cxt.drawImage(image, 0, 0);
		
		// Set the file type and name.
		// TODO: Make this not access SaveDialog private properties.
		var fileName = file.name;
		if (JPEG_REGEX.test(fileName)) {
			dialogs.save._element.fileType.value =
				dialogs.save._downloadLink.type = 'image/jpeg';
		} else {
			dialogs.save._element.fileType.value =
				dialogs.save._downloadLink.type = 'image/png';
			fileName = fileName.replace(FILE_EXT_REGEX, '.png');
		}
		dialogs.save._element.fileName.value =
			dialogs.save._downloadLink.download = fileName;
		document.title = fileName + ' - PaintZ';
		
		// Clear the undo and redo stacks.
		undoStack.clear();
		
		// Hide the progress spinner.
		progressSpinner.hide();
	});
};
