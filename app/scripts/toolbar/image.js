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
}
// Extend Toolbox.
ImageToolbox.prototype = Object.create(Toolbox.prototype);

/**
 * @override
 * @private
 * Populate the toolbox with its contents, add it to the toolbar, and set up its event listeners.
 * @param {String} contents - The HTML contents of the dialog
 */
ImageToolbox.prototype._setUp = function (contents) {
	Toolbox.prototype._setUp.call(this, contents);
	
	// Clear button and dialog.
	var clearBtn = this._element.querySelector('#clearBtn'),
		clearDialog = new ClearDialog(clearBtn);
	clearBtn.addEventListener('click', clearDialog.open.bind(clearDialog), false);
	
	// Save as button and dialog.
	var saveBtn = this._element.querySelector('#saveBtn');
	saveDialog = new SaveDialog(saveBtn);
	saveBtn.addEventListener('click', saveDialog.open.bind(saveDialog), false);
	
	// Uploader.
	var uploadInput = this._element.querySelector('#upload');
	uploadInput.addEventListener('change', this._handleFileUpload.bind(this), false);
	// Open button.
	var openBtn = this._element.querySelector('#openBtn');
	openBtn.addEventListener('click', function (e) {
		uploadInput.click();
	}, false);
	
	// Undo and redo buttons.
	this.undoBtn = this._element.querySelector('#undoBtn'),
	this.redoBtn = this._element.querySelector('#redoBtn');
	this.undoBtn.addEventListener('click', undoStack.undo.bind(undoStack), false);
	this.redoBtn.addEventListener('click', undoStack.redo.bind(undoStack), false);
	undoStack.addState();
	
	// Resize button and dialog.
	var resizeBtn = this._element.querySelector('#resizeBtn'),
		resizeDialog = new ResizeDialog(resizeBtn);
	resizeBtn.addEventListener('click', resizeDialog.open.bind(resizeDialog), false);
};

/**
 * @private
 * Load a new image through the file uploader.
 * @param {Event} e
 */
ImageToolbox.prototype._handleFileUpload = function (e) {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		progressSpinner.show();
		
		var file = e.target.files[0];
		if (!file) {
			return;
		}
		if (!file.type.match('image.*')) {
			alert('PaintZ can only open valid image files.');
			return;
		}
		var reader = new FileReader();
		reader.onload = function () {
			var image = new Image();
			
			image.onload = function () {
				// There is no need to clear the canvas.  Resizing the canvas will do that.
				canvas.width = this.width;
				canvas.height = this.height;
				preCanvas.width = this.width;
				preCanvas.height = this.height;
				localStorage.width = this.width;
				localStorage.height = this.height;
				document.getElementById('resolution').innerHTML = this.width + ' &times; ' + this.height + 'px';
				cxt.fillStyle = 'white';
				cxt.fillRect(0, 0, canvas.width, canvas.height);
				cxt.drawImage(this, 0, 0);
				
				// Clear the undo and redo stacks.
				undoStack.clear();
				
				// Set the file type and name.
				// TODO: Make this not access SaveDialog private properties.
				var fileName = file.name;
				if (JPEG_REGEX.test(fileName)) {
					saveDialog._element.fileType.value =
						saveDialog._downloadLink.type = 'image/jpeg';
				} else {
					saveDialog._element.fileType.value =
						saveDialog._downloadLink.type = 'image/png';
					fileName = fileName.replace(FILE_EXT_REGEX, '.png');
				}
				saveDialog._element.fileName.value =
					saveDialog._downloadLink.download = fileName;
				document.title = fileName + ' - PaintZ';
				progressSpinner.hide();
			};
			
			image.src = this.result;
		};
		reader.readAsDataURL(file);
	} else {
		alert('Please switch to a browser that supports the file APIs such as Google Chrome or Internet Explorer 11.');
	}
};
