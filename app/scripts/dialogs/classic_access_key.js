'use strict';

/**
 * @class
 * Create a new ClassicAccessKeyDialog instance.
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function ClassicAccessKeyDialog(trigger) {
	Dialog.call(this, 'classic_access_key', trigger);
	
	this._keySequencePosition = undefined;
	this._keySequenceDisplay;
}
// Extend Dialog.
ClassicAccessKeyDialog.prototype = Object.create(Dialog.prototype);
ClassicAccessKeyDialog.prototype.constructor = ClassicAccessKeyDialog;

// Define constants.
/** @override @constant {String} The width of the dialog, as a CSS value */
ClassicAccessKeyDialog.prototype.WIDTH = '304px';
/** @constant {Object} Maps of key sequences to actions */
ClassicAccessKeyDialog.prototype.KEY_SEQUENCES = {
	'F': { // File menu...
		'N': function () { dialogs.clear.open(); }, // New (clear)
		'O': function () { document.getElementById('upload').click(); }, // Open...
		'S': function () { dialogs.save.open(); }, // Save
		'A': function () { dialogs.save.open(); }, // Save As...
		'C': function () {
			alert('\u201cFrom Scanner or Camera...\u201d is not currently supported in PaintZ.'); },
		'V': function () { window.print(); }, // Print Preview
		'U': function () {
			alert('\u201cPage Setup...\u201d is not currently supported in PaintZ.'); },
		'P': function () { window.print(); }, // Print...
		'E': function () {
			dialogs.save._createDownloadURL().then(dialogs.save._boundHandleShare); }, // Send...
		'B': function () {
			alert('\u201cSet As Background (Tiled)\u201d is not currently supported in PaintZ.'); },
		'K': function () {
			alert('\u201cSet As Background (Centered)\u201d is not currently supported in PaintZ.'); },
		'X': function () { window.close(); }, // Exit
		// Win7 File menu...
		'R': { // Print submenu...
			'P': function () { window.print(); }, // Print
			'S': function () {
				alert('\u201cPage setup\u201d is not currently supported in PaintZ.'); },
			'V': function () { window.print(); } // Print preview
		},
		'M': function () {
			alert('\u201cFrom scanner or camera\u201d is not currently supported in PaintZ.'); },
		'D': function () {
			dialogs.save._createDownloadURL().then(dialogs.save._boundHandleShare); }, // Send in email
		'T': function () { dialogs.about.open(); } // About Paint
	},
	'E': { // Edit menu...
		'U': function () { undoStack.undo(); }, // Undo
		'R': function () { undoStack.redo(); }, // Repeat
		'T': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.cut(); } }, // Cut
		'C': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.copy(); } }, // Copy
		'P': function () { if (!clipboard.triggerPaste()) {
			alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.'); } }, // Paste
		'L': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.clear(); } }, // Clear Selection
		'A': function () {
			// Select All
			if (tools.currentTool !== tools.selection) {
				tools.switchTool('selection');
			}
			tools.currentTool.selectAll(canvas.width, canvas.height);
		},
		'O': function () {
			alert('\u201cCopy To...\u201d is not currently supported in PaintZ.'); },
		'F': function () { document.getElementById('pasteFrom').click(); } // Paste From
	},
	'V': { // View menu...
		'T': function () {
			alert('\u201cShow/Hide Tool Box\u201d is not currently supported in PaintZ.'); },
		'C': function () {
			alert('\u201cShow/Hide Color Box\u201d is not currently supported in PaintZ.'); },
		'S': function () {
			alert('\u201cShow/Hide Status Bar\u201d is not currently supported in PaintZ.'); }, 
		'E': function () { tools.switchTool('text'); }, // Text Toolbar
		'V': function () { toolbar.toolboxes.app.attemptFullScreen(); }, // View Bitmap
		'Z': { // Zoom submenu...
			'N': function () { zoomManager.level = 1; }, // Normal Size
			'L': function () { zoomManager.level = 4; }, // Large Size
			'U': function () { toolbar.toolboxes.zoom.percent.focus(); }, // Custom...
			'G': function () { settings.set('grid', !settings.get('grid')); }, // Show Grid
			'H': function () {
				alert('\u201cShow Thumbnail\u201d is not currently supported in PaintZ.'); }, 
		},
		// Win7 View tab...
		'I': function () { zoomManager.zoomIn(); }, // Zoom in
		'O': function () { zoomManager.zoomOut(); }, // Zoom out
		'M': function () { zoomManager.level = 1; }, // 100%
		'R': function () {
				alert('\u201cShow/Hide Rulers\u201d is not currently supported in PaintZ.'); },
		'G': function () { settings.set('grid', !settings.get('grid')); }, // Gridlines
		'F': function () { toolbar.toolboxes.app.attemptFullScreen(); } // Full screen
	},
	'I': { // Image menu...
		'F': function () {
			// Flip/Rotate...
			if (!(tools.currentTool instanceof SelectionTool)) {
				tools.switchTool('selection');
			}
		},
		'S': function () {
				alert('\u201cStretch/Skew\u201d is not currently supported in PaintZ.'); },
		'I': function () {
			// Invert Colors
			if (tools.currentTool instanceof SelectionTool) {
				tools.currentTool.invertColors();
			} else {
				tools.selection.invertColors();
			}
		},
		'A': function () { dialogs.resize.open(); }, // Attributes...
		'C': function () { dialogs.clear._clear(); }, // Clear Image
		'D': function () {
			// Draw Opaque
			if (tools.currentTool instanceof SelectionTool) {
				settings.set('transparentSelection', !settings.get('transparentSelection'));
				toolbar.toolboxes.selectToolOptions.transparentSelectionOff.checked = !settings.get('transparentSelection');
				toolbar.toolboxes.selectToolOptions.transparentSelectionOn.checked = settings.get('transparentSelection');
			} else if (tools.currentTool === tools.text) {
				settings.set('textFill', !settings.get('textFill'));
				toolbar.toolboxes.textToolOptions.textFillOff.checked = !settings.get('textFill');
				toolbar.toolboxes.textToolOptions.textFillOn.checked = settings.get('textFill');
			}
		}
	},
	'C': { // Colors menu...
		'E': function () { dialogs.colorPicker.open(); } // Edit colors...
	},
	'H': { // Help menu...
		'H': function () { dialogs.help.open(); }, // Help Topics
		'A': function () { dialogs.about.open(); }, // About Paint,
		// Win7 Home tab...
		'V': { // Paste menu...
			'P': function () { if (!clipboard.triggerPaste()) {
				alert('For now, you need to use ' + (Utils.isApple ? '\u2318' : 'Ctrl+') + 'V to paste an image into PaintZ.'); } }, // Paste
			'F': function () { document.getElementById('pasteFrom').click(); }, // Paste from
		},
		'X': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.cut(); } }, // Cut
		'C': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.copy(); } }, // Copy
		'S': { // First part of SE, SH, or SZ
			'E': { // Select menu...
				'R': function () { tools.switchTool('selection'); }, // Rectangular selection
				'F': function () { tools.switchTool('freeformSelection'); }, // Free-form selection
				'A': function () {
					// Select all
					if (tools.currentTool !== tools.selection) {
						tools.switchTool('selection');
					}
					tools.currentTool.selectAll(canvas.width, canvas.height);
				},
				'I': function () {
					alert('\u201cInvert selection\u201d is not currently supported in PaintZ.'); },
				'D': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.clear(); } }, // Delete
				'T': function () {
					// Transparent selection
					if (tools.currentTool instanceof SelectionTool) {
						settings.set('transparentSelection', !settings.get('transparentSelection'));
						toolbar.toolboxes.selectToolOptions.transparentSelectionOff.checked = !settings.get('transparentSelection');
						toolbar.toolboxes.selectToolOptions.transparentSelectionOn.checked = settings.get('transparentSelection');
					} else if (tools.currentTool === tools.text) {
						settings.set('textFill', !settings.get('textFill'));
						toolbar.toolboxes.textToolOptions.textFillOff.checked = !settings.get('textFill');
						toolbar.toolboxes.textToolOptions.textFillOn.checked = settings.get('textFill');
					}
				}
			},
			'H': function () { tools.switchTool('line'); }, // Shapes
			'Z': function () {
				// Size
				if (toolbar.currentToolOptionsToolbox === toolbar.toolboxes.drawToolOptions) {
					toolbar.toolboxes.drawToolOptions.lineWidthSelect.focus();
				}
			}
		},
		'R': { // First part of RP, RE, or RO
			'P': function () { if (tools.currentTool instanceof SelectionTool) { tools.currentTool.cropToSelection(); } }, // Crop
			'E': function () { dialogs.resize.open(); }, // Resize
			'O': { // Rotate menu...
				'R': function () {
					// Rotate right 90°
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.rotate(true);
					} else {
						tools.selection.rotate(true);
					}
				},
				'L': function () {
					// Rotate left 90°
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.rotate(false);
					} else {
						tools.selection.rotate(false);
					}
				},
				'T': function () {
					// Rotate 180°
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.rotate(true);
						tools.currentTool.rotate(true);
					} else {
						tools.selection.rotate(true);
						tools.selection.rotate(true);
					}
				},
				'V': function () {
					// Flip vertical
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.flip(true);
					} else {
						tools.selection.flip(true);
					}
				},
				'H': function () {
					// Flip horizontal
					if (tools.currentTool instanceof SelectionTool) {
						tools.currentTool.flip(false);
					} else {
						tools.selection.flip(false);
					}
				}
			}
		},
		'P': function () { tools.switchTool('pencil'); }, // Pencil
		'K': function () { tools.switchTool('floodFill'); }, // Fill with color
		'T': function () { tools.switchTool('text'); }, // 
		'E': { // First part of ER or EC
			'R': function () { tools.switchTool('eraser'); }, // Eraser
			'C': function () { dialogs.colorPicker.open(); }, // Edit colors
		},
		'D': function () { tools.switchTool('eyedropper'); }, // Color picker
		'M': function () {
			alert('\u201cMagnifier\u201d is not currently supported in PaintZ.'); },
		'B': function () { tools.switchTool('doodle'); }, // Brushes
		'O': function () {  }, // 
		'I': function () {  }, // 
	}
};

/**
 * @override
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
ClassicAccessKeyDialog.prototype._setUp = function (contents) {
	Dialog.prototype._setUp.call(this, contents);
	
	this._element.tabIndex = -1;
	this._element.style.outline = 'none';
	
	this._keySequenceDisplay = this._element.querySelector('#keySequence');
	
	// Add event listener to handle additional keys in the sequence.
	this._element.addEventListener('keydown', this._handleKeyDown.bind(this), false);
};

/**
 * @override
 * Open the dialog and note the first key in the sequence.
 * @param {String} firstKey - The key pressed (with Alt) to open the dialog
 * @returns {Boolean} If the dialog was opened validly
 */
ClassicAccessKeyDialog.prototype.open = function (firstKey) {
	if (!window.matchMedia || !window.matchMedia('(display-mode: standalone)').matches) {
		// Only allow access key overrides in standalone windows.
		return false;
	}
	
	Dialog.prototype.open.call(this);
	
	this._keySequencePosition = this.KEY_SEQUENCES[firstKey];
	if (!this._keySequencePosition) {
		// Prevent the dialog being opened with an invalid start of sequence.
		this.close();
		return false;
	}
	
	this._keySequenceDisplay.innerHTML = '<kbd>Alt</kbd>+<kbd>' + firstKey + '</kbd>';
	return true;
};

/**
 * @override
 * Focus the dialog itself instead of searching for a child to focus.
 */
ClassicAccessKeyDialog.prototype.focus = function () {
	this._element.focus();
};

/**
 * @override
 * Close the dialog and clear any key sequence position.
 * @param {Event} [e] - The event that triggered the close, if any.
 * @returns {Promise} Resolves when the dialog has closed
 */
ClassicAccessKeyDialog.prototype.close = function (e) {
	this._keySequencePosition = undefined;
	
	return Dialog.prototype.close.call(this, e);
};

/**
 * @private
 * Handle keyboard shortcuts with the dialog active.
 * @param {KeyboardEvent} e
 */
ClassicAccessKeyDialog.prototype._handleKeyDown = function (e) {
	var instantAbort =
			(!this._keySequencePosition ||
			e.ctrlKey || e.metaKey ||
			e.keyCode < 65 || e.keyCode > 90);
	if (instantAbort) {
		// Abort if other modifier keys are added or the pressed key is not a letter.
		if (e.keyCode !== 27) {
			// The default dialog behavior handles closing on Esc.
			this.close();
		}
		return;
	}
	
	var keyLetter = String.fromCharCode(e.keyCode),
		nextInSequence = this._keySequencePosition[keyLetter];
	
	if (!nextInSequence) {
		this.close();
		return;
	}
	
	e.preventDefault();
	
	this._keySequenceDisplay.innerHTML += ', <kbd>' + keyLetter + '</kbd>';
	
	if (typeof(nextInSequence) === 'object') {
		// If it led to another object, that is now the position in the sequence.
		this._keySequencePosition = nextInSequence;
	} else if (typeof(nextInSequence) === 'function') {
		// If it led to the function, that is the end of the sequence.
		this.close()
			.then(nextInSequence);
	}
};
