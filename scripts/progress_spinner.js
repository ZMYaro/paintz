'use strict';

/**
 * @class
 * Create a new ProgressSpinner instance.
 */
function ProgressSpinner() {
	this._element = document.createElement('progress');
	this._element.className = 'circular';
	
	this._container = document.createElement('div');
	this._container.id = 'progressContainer';
	
	this._container.appendChild(this._element);
	document.body.appendChild(this._container);
}

/**
 * Show the progress spinner.
 */
ProgressSpinner.prototype.show = function () {
	this._container.style.display = 'block';
	this._container.classList.add('visible');
};

/**
 * Hide the progress spinner.
 */
ProgressSpinner.prototype.hide = function () {
	this._container.classList.remove('visible');
	setTimeout((function () {
		this._container.style.display = 'none';
	}).bind(this), Dialog.prototype.TRANSITION_DURATION);
};
