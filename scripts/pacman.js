'use strict';

/**
 * Create a new PacMan instance.
 * @param {HTMLCanvasElement} canvas - The canvas on which Pac-Man is to be drawn.
 * @param {Number} x - The x-coordinate at which Pac-Man should start.
 * @param {Number} y - The y-coordinate at which Pac-Man should start.
 */
function PacMan(canvas, x, y) {
	this._started = false;

	this._canvas = canvas;
	this._cxt = canvas.getContext('2d');
	this.x = x || Math.floor(canvas.width * 0.2);
	this.y = y || Math.floor(canvas.height * 0.2);
	this.heading = PacMan.HEADINGS.RIGHT;

	this._startSound = document.getElementById('pacManStartSound');

	this._mouthSize = 0;
	this._mouthOpening = true;

	this._boundUpdate = this._update.bind(this);

	this._initListeners();
}
// Constants.
PacMan.RADIUS = 30;
PacMan.HITBOX_PADDING = 3;
PacMan.SPEED = 2;
PacMan.MOUTH_SPEED = Math.PI / 16;
PacMan.MAX_MOUTH_SIZE = Math.PI / 4;
PacMan.START_SOUND_LENGTH = 4000; // In milliseconds.
PacMan.HEADINGS = {
	RIGHT: 0,
	DOWN: 0.5 * Math.PI,
	LEFT: Math.PI,
	UP: 1.5 * Math.PI
};
PacMan.KEYS = {
	LEFT: [37, 65], // Left, A
	UP: [38, 44, 87], // Up, comma, W
	RIGHT: [39, 68, 69], // Right, D, E
	DOWN: [40, 79, 83] // Down, O, S
};


/**
 * Play the starting sound and start Pac-Man after it plays.
 */
PacMan.prototype.start = function () {
	// Do not start this Pac-Man if it has already started.
	if (this._started) {
		return;
	}
	// Draw Pac-Man, but do not start him moving yet.
	this._draw();
	// Play the start sound.
	if (this._startSound && this._startSound.play) {
		this._startSound.currentTime = 0;
		this._startSound.play();
	}
	// NOW set Pac-Man to have started.
	this._started = true;
	// Start moving after the sound finishes.
	setTimeout(this._boundUpdate, PacMan.START_SOUND_LENGTH);
};

/**
 * Stop and hide Pac-Man.
 */
PacMan.prototype.stop = function () {
	this._erase();
	this._startSound.pause();
	this._started = false;
}

/**
 * Check whether there is a wall in front of Pac-Man.
 * @returns {Boolean}
 */
PacMan.prototype._isBlocked = function () {
	this._cxt.fillStyle = localStorage.lineColor;
	this._cxt.fillRect(this.x - 1, this.y - 1, 3, 3);

	var imageData = this._cxt.getImageData(
		this.x - (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1),
		this.y - (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1),
		(2 * (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1)),
		(2 * (PacMan.RADIUS + PacMan.HITBOX_PADDING + 1))
	);

	var wallColor = {
		r: imageData.data[(((imageData.height / 2) * imageData.width * 4) + ((imageData.width / 2) * 4))],
		g: imageData.data[(((imageData.height / 2) * imageData.width * 4) + ((imageData.width / 2) * 4)) + 1],
		b: imageData.data[(((imageData.height / 2) * imageData.width * 4) + ((imageData.width / 2) * 4)) + 2]
	};

	this._cxt.fillStyle = localStorage.fillColor;
	this._cxt.fillRect(this.x - 1, this.y - 1, 3, 3);

	// Loop over the arc in front of Pac-Man checking for the wall color.
	for (var i = Math.PI / 8; i < Math.PI * 7 / 8; i += 1 / 60) {
		var x = Math.round((PacMan.RADIUS + PacMan.HITBOX_PADDING) * Math.sin(i + this.heading));
		var y = -Math.round((PacMan.RADIUS + PacMan.HITBOX_PADDING) * Math.cos(i + this.heading));

		var col = x + (imageData.width / 2);
		var row = y + (imageData.height / 2);

		var color = {
			r: imageData.data[((row * imageData.width * 4) + (col * 4))],
			g: imageData.data[((row * imageData.width * 4) + (col * 4)) + 1],
			b: imageData.data[((row * imageData.width * 4) + (col * 4)) + 2],
			a: imageData.data[((row * imageData.width * 4) + (col * 4)) + 3]
		};

		// Draw Pac-Man's hitbox (hitarc?) for debugging.
		/*this._cxt.fillStyle = '#00cc00';
		this._cxt.fillRect(this.x + x - 0.1, this.y + y - 0.1, 0.2, 0.2);*/

		if (color.r === wallColor.r &&
				color.g === wallColor.g &&
				color.b === wallColor.b &&
				color.a === 255) {
			return true;
		}
	}

	return false;
};

/**
 * Draw Pac-Man to the canvas.
 */
PacMan.prototype._draw = function () {
	this._cxt.fillStyle = 'yellow';
	this._cxt.beginPath();
	this._cxt.arc(this.x, this.y, PacMan.RADIUS - 1, 0.5 * Math.PI + this.heading, 1.5 * Math.PI + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS - 1, this._mouthSize + this.heading, 0.5 * Math.PI + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS - 1, 1.5 * Math.PI + this.heading, 2 * Math.PI - this._mouthSize + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
};

/**
 * Cover Pac-Man with the current fill color, effectively erasing him
 * and �eating� everything under him.
 */
PacMan.prototype._erase = function () {
	this._cxt.fillStyle = localStorage.fillColor;
	this._cxt.beginPath();
	this._cxt.arc(this.x, this.y, PacMan.RADIUS, 0.5 * Math.PI + this.heading, 1.5 * Math.PI + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS, this._mouthSize + this.heading, 0.5 * Math.PI + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
	this._cxt.beginPath();
	this._cxt.moveTo(this.x, this.y);
	this._cxt.arc(this.x, this.y, PacMan.RADIUS, 1.5 * Math.PI + this.heading, 2 * Math.PI - this._mouthSize + this.heading, false);
	this._cxt.closePath();
	this._cxt.fill();
};

/**
 * Initialize key event listeners for Pac-Man.
 */
PacMan.prototype._initListeners = function () {
	window.addEventListener('keydown', (function (e) {
		if (PacMan.KEYS.UP.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = PacMan.HEADINGS.UP;
		} else if (PacMan.KEYS.RIGHT.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = PacMan.HEADINGS.RIGHT;
		} else if (PacMan.KEYS.DOWN.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = PacMan.HEADINGS.DOWN;
		} else if (PacMan.KEYS.LEFT.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = PacMan.HEADINGS.LEFT;
		}
	}).bind(this), false);
};

PacMan.prototype._update = function () {
	// If this Pac-Man is supposed to be running, loop.
	if (this._started) {
		Utils.raf(this._boundUpdate);
	} else {
		return;
	}

	// �Eat� everything under Pac-Man.
	this._erase();

	// Move Pac-Man.
	if (!this._isBlocked()) {
		switch (this.heading) {
			case PacMan.HEADINGS.UP:
				this.y -= PacMan.SPEED;
				break;
			case PacMan.HEADINGS.RIGHT:
				this.x += PacMan.SPEED;
				break;
			case PacMan.HEADINGS.DOWN:
				this.y += PacMan.SPEED;
				break;
			case PacMan.HEADINGS.LEFT:
				this.x -= PacMan.SPEED;
				break;
		}
	}
	// Animate Pac-Man's mouth.
	this._mouthSize += PacMan.MOUTH_SPEED * (this._mouthOpening ? 1 : -1);
	if (this._mouthOpening && this._mouthSize > PacMan.MAX_MOUTH_SIZE) {
		this._mouthSize = PacMan.MAX_MOUTH_SIZE;
		this._mouthOpening = false;
	} else if (!this._mouthOpening && this._mouthSize < 0) {
		this._mouthSize = 0;
		this._mouthOpening = true;
	}

	// Screen wrap.
	if (this.x < -(PacMan.RADIUS * 2)) {
		this.x = canvas.width + (PacMan.RADIUS * 2);
	} else if (this.x > canvas.width + (PacMan.RADIUS * 2)) {
		this.x = -(PacMan.RADIUS * 2);
	} else if (this.y < -(PacMan.RADIUS * 2)) {
		this.y = canvas.height + (PacMan.RADIUS * 2);
	} else if (this.y > canvas.height + (PacMan.RADIUS * 2)) {
		this.y = -(PacMan.RADIUS * 2);
	}

	// Draw Pac-Man.
	this._draw();
};
