'use strict';

/**
 * @class
 * Create a new Dialog instance.  A dialog is a box that displays over the rest of the page and must be closed to interact with the rest of the page.
 * @param {String} contentFileName - The name of the HTML partial file with the dialog's contents
 * @param {HTMLElement} [trigger] - The button that triggers the dialog, if any
 */
function Dialog(contentFileName, trigger) {
	this._boundClose = this.close.bind(this);
	
	/** @private {HTMLFormElement} The container for dialog's content */
	this._element = document.createElement('form');
	this._element.className = this.CSS_CLASSES;
	if (this.WIDTH) {
		this._element.style.width = this.WIDTH;
	}
	if (this.MAX_WIDTH) {
		this._element.style.maxWidth = this.MAX_WIDTH;
	}
	this._element.addEventListener('submit', this._boundClose);
	this._element.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
	
	/** {HTMLElement} The element that should contain the dialog and handle positioning it on the page */
	this._dialogContainer = document.getElementById('dialogsContainer');
	
	/** {HTMLElement} The button that triggers the dialog, if any */
	this.trigger = trigger;
	
	// Fetch the dialog content, then set up the dialog.
	this.loadPromise =
		Utils.fetch(this.PARTIALS_DIR + contentFileName + '.html')
			.then(this._setUp.bind(this));
}

// Define constants.
/** @constant {String} The path and prefix for dialog partials */
Dialog.prototype.PARTIALS_DIR = 'partials/dialogs/';
/** @constant {String} The CSS classes for the dialog container element */
Dialog.prototype.CSS_CLASSES = 'dialog card z3';
/** @constant {String} The width of the dialog, as a CSS value */
Dialog.prototype.WIDTH;
/** @constant {String} The maximum width of the dialog, as a CSS value */
Dialog.prototype.MAX_WIDTH;
/** @constant {Number} The duration of the dialog open/close transition, in milliseconds */
Dialog.prototype.TRANSITION_DURATION = 200;

/**
 * @private
 * Populate the dialog with its contents.
 * @param {String} contents - The HTML contents of the dialog
 */
Dialog.prototype._setUp = function (contents) {
	this._element.innerHTML = contents;
	
	// Update keyboard shortcut listings for Apple users.
	if (Utils.isApple) {
		this._element.innerHTML = this._element.innerHTML
			.replace(/Ctrl\+/g, '&#x2318;')
			.replace(/\<kbd>Ctrl\<\/kbd>/g, '<kbd>&#x2318;</kbd>')
			.replace(/Alt\+/g, '&#x2325;')
			.replace(/\<kbd>Alt\<\/kbd>/g, '<kbd>&#x2325;</kbd>')
			.replace(/Shift\+/g, '&#x21e7;')
			.replace(/\<kbd>Shift\<\/kbd>/g, '<kbd>&#x21e7;</kbd>');
	}
	
	// Set up all close buttons.
	Array.from(this._element.querySelectorAll('.closeButton')).forEach(function (closeButton) {
		closeButton.onclick = this.close.bind(this);
	}, this);
	
	// Make the dialog close when Esc is pressed.
	this._element.addEventListener('keydown', (function (e) {
		if (e.keyCode === 27) {
			e.preventDefault();
			this.close();
		}
	}).bind(this), false);
};

/**
 * @private
 * Set the dialog's transform origin so it appears to open from its trigger button.
 */
Dialog.prototype._setTransformOrigin = function () {
	// If there is no trigger element, do nothing.
	if (typeof this.trigger === 'undefined') {
		return;
	}
	
	// Calculate the new transform origin.
	var originX = (this.trigger.offsetLeft - toolbar.scrollLeft - this._element.offsetLeft),
		originY = (this.trigger.offsetTop - this._element.offsetTop);
	
	// Set the transform origin.
	this._element.style.WebkitTransformOrigin =
		this._element.style.MozTransformOrigin =
		this._element.style.MsTransformOrigin =
		this._element.style.OTransformOrigin =
		this._element.style.transformOrigin = originX + 'px ' + originY + 'px';
	
	// Force a reflow.
	this._element.offsetLeft;
};

/**
 * Focus the first appropriate element in the dialog.
 */
Dialog.prototype.focus = function () {
	var firstInput = this._element.querySelector('input, select, textarea');
	if (firstInput) {
		// Focus the first form input element in the dialog.
		firstInput.focus();
	} else {
		// If there are no input elements, focus the submit button.
		var submitButton = this._element.querySelector('button[type=\"submit\"]')
		if (submitButton) {
			submitButton.focus();
		}
	}
};

/**
 * Open the dialog.
 */
Dialog.prototype.open = function () {
	// Disable app keyboard shortcuts and clipboard interceptions.
	keyManager.enabled = false;
	clipboard.enabled = false;
	
	// Show the dialog and dialog container.
	this._dialogContainer.style.display = 'block';
	this._dialogContainer.appendChild(this._element);
	this._setTransformOrigin();
	
	// Make selecting outside the dialog close the dialog.
	this._dialogContainer.addEventListener('pointerdown', this._boundClose);
	
	Utils.raf((function () {
		Utils.raf(this._finishOpen.bind(this));
	}).bind(this));
};

/**
 * @private
 * Finish opening the dialog on the next frame.
 */
Dialog.prototype._finishOpen = function () {
	this._dialogContainer.classList.add('visible');
	this._element.classList.add('open');
	this.focus();
};

/**
 * Close the dialog.
 * @param {Event} [e] - The event that triggered the close, if any.
 */
Dialog.prototype.close = function (e) {
	if (e && e.preventDefault) {
		e.preventDefault();
	}
	
	// Remove the listener that makes selecting outside the dialog close the dialog.
	this._dialogContainer.removeEventListener('pointerdown', this._boundClose);
	
	this._setTransformOrigin();
	this._element.classList.remove('open');
	this._dialogContainer.classList.remove('visible');
	// After the closing animation has completed, hide the dialog box element completely.
	setTimeout(this._finishClose.bind(this), (Utils.prefersReducedMotion ? 1 : this.TRANSITION_DURATION));
};

/**
 * @private
 * Finish closing the dialog after the closing animation.
 */
Dialog.prototype._finishClose = function () {
	// Hide the dialog and dialog container.
	this._dialogContainer.removeChild(this._element);
	this._dialogContainer.style.display = 'none';
	// Re-enable app keyboard shortcuts and clipboard interception.
	keyManager.enabled = true;
	clipboard.enabled = true;
};
