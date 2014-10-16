/**
 * Create a new PacMan instance.
 * @param {HTMLCanvasElement} canvas - The canvas on which Pac-Man is to be drawn.
 * @param {Number} x - The x-coordinate at which Pac-Man should start.
 * @param {Number} y - The y-coordinate at which Pac-Man should start.
 */
function PacMan(canvas, x, y) {
	this.canvas = canvas;
	this.cxt = canvas.getContext('2d');
	this.x = x;
	this.y = y;
	this.heading = 90; // 0 = up
	
	this._initListeners();
}
// Constants.
PacMan.SPEED = 2;
PacMan.RADIUS = 30;
PacMan.KEYS = {
	LEFT: [37, 65], // Left, A
	UP: [38, 44, 87], // Up, comma, W
	RIGHT: [39, 68, 69], // Right, D, E
	DOWN: [40, 79, 83] // Down, O, S
};
	

/**
 * Initialize key event listeners for Pac-Man.
 */
PacMan.prototype._initListeners = function () {
	window.addEventListener('keydown', (function (e) {
		if (PacMan.KEYS.UP.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = 0;
		} else if (PacMan.KEYS.RIGHT.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = 90;
		} else if (PacMan.KEYS.DOWN.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = 180;
		} else if (PacMan.KEYS.LEFT.indexOf(e.keyCode) !== -1) {
			e.preventDefault();
			this.heading = 270;
		}
	}).bind(this), false);
};

PacMan.prototype.update = function () {
	// “Eat” everything under Pac-Man.
	this.cxt.fillStyle = fillColor;
	this.cxt.beginPath();
	this.cxt.arc(this.x, this.y, PacMan.RADIUS, 0, 2 * Math.PI);
	this.cxt.closePath();
	this.cxt.fill();
	
	// Move Pac-Man.
	switch (this.heading) {
		case 0:
			this.y -= PacMan.SPEED;
			break;
		case 90:
			this.x += PacMan.SPEED;
			break;
		case 180:
			this.y += PacMan.SPEED;
			break;
		case 270:
			this.x -= PacMan.SPEED;
			break;
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
	// TODO: Animate Pac-Man.
	this.cxt.fillStyle = 'yellow';
	this.cxt.beginPath();
	this.cxt.arc(this.x, this.y, PacMan.RADIUS - 1, 0, 2 * Math.PI);
	this.cxt.closePath();
	this.cxt.fill();
	
	Utils.raf(this.update.bind(this));
};
