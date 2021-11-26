'use strict';

/**
 * @class
 * Create a new ImageToolbox instance.
 * @param {HTMLElement} [parentToolbar] - The toolbar the toolbox is to be added to
 */
function ImageToolbox(parentToolbar) {
	Toolbox.call(this, 'image', parentToolbar);
	
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
	
	// Print button.
	var printBtn = this._element.querySelector('#printBtn');
	printBtn.addEventListener('click', function (e) {
		window.print();
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
	
	
	var pasteBtn = this._element.querySelector('#pasteBtn'),
		pasteFromInput = this._element.querySelector('#pasteFrom');
	pasteFromInput.addEventListener('change', function (e) {
		var file = e.target.files[0];
		Utils.readImage(file).then(function (image) {
			clipboard.paste(image);
			// Clear the input so it registers as changed if the next
			// selected has the same file name as the last.
			e.target.value = null;
		});
	}, false);
	pasteBtn.addEventListener('click', function (e) {
		e.preventDefault();
		if (e.altKey || Utils.checkPlatformMetaOrControlKey(e)) {
			// “Paste from” if alt-clicked or Control-clicked on Mac.
			pasteFromInput.click();
			return;
		}
		if (!clipboard.triggerPaste()) {
			alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.');
		}
	}, false);
	pasteBtn.addEventListener('contextmenu', function (e) {
		e.preventDefault();
		pasteFromInput.click();
	}, false);
};

/**
 * @private
 * Load a new image through the file uploader.
 * @param {Event} e
 */
ImageToolbox.prototype._handleFileUpload = function (e) {
	var file = e.target.files[0];
	openImage(file);
	// Clear the input so it registers as changed if the next
	// selected has the same file name as the last.
	e.target.value = null;
};
