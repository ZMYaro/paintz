'use strict';

/**
 * @class
 * Create a new ProgressSpinner instance.
 */
function ProgressSpinner() {
	this._element = document.createElement('progress');
	this._element.className = 'circular';
	this._element.style.display = 'block';
	this._element.style.margin = 'auto';
	this._element.style.top = '40%';
}

/**
 * Show the progress spinner.
 */
ProgressSpinner.prototype.show = function () {
	dialogsContainer.style.display = 'block';
	dialogsContainer.appendChild(this._element);
	dialogsContainer.classList.add('visible');
};

/**
 * Hide the progress spinner.
 */
ProgressSpinner.prototype.hide = function () {
	dialogsContainer.removeChild(this._element);
	dialogsContainer.classList.remove('visible');
	setTimeout(function () {
		dialogsContainer.style.display = 'none';
	}, Dialog.prototype.TRANSITION_DURATION);
};
