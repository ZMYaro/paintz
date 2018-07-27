'use strict';

/**
 * Create a new CurveTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the shape preview is drawn
 */
function CurveTool(cxt, preCxt) {
	DrawingTool.apply(this, arguments);
	
	this._state = CurveTool.STATE_NOT_STARTED;
}

// Constants
CurveTool.STATE_NOT_STARTED = 0;
CurveTool.STATE_LINE_DRAWN = 1;


CurveTool.prototype = Object.create(DrawingTool.prototype);


/**
 * Plot a limited quadratic Bezier segment
 * @private
 * @param {Number} x1 - The x-coordinate of the curve segment's start point
 * @param {Number} y1 - The y-coordinate of the curve segment's start point
 * @param {Number} x2 - The x-coordinate of the curve segment's end point
 * @param {Number} y2 - The y-coordinate of the curve segment's end point
 * @param {Number} x3 - The x-coordinate of the third point
 * @param {Number} y3 - The y-coordinate of the third point
 * @param {CanvasRenderingContext2D} cxt
 */
CurveTool.prototype._plotQuadBezierSeg = function (x1, y1, x2, y2, x3, y3, cxt) {
	var sx = x2 - x3,
		sy = y2 - y3,
		xx = x1-x3, /** Relative values for checks */
		yy = y1-y3,
		xy,
		dx,
		dy,
		err,
		cur = xx * sy - yy * sx; /** Curvature */
	
	// XBegin with shorter part
	if (sx * sx + sy * sy > xx * xx + yy * yy) {
		// Swap P0 P2
		x2 = x1;
		x1 = sx + x3;
		y2 = y1;
		y1 = sy + y3;
		cur = -cur;
	}
	
	//  No straight line
	if (cur != 0) {
		// x-step direction
		xx += sx;
		xx *= sx = x1 < x2 ? 1 : -1;
		// y-step direction
		yy += sy;
		yy *= sy = y1 < y2 ? 1 : -1;
		// Differences 2nd degree
		xy = 2 * xx * yy;
		xx *= xx;
		yy *= yy;
		
		// Negated curvature?
		if (cur * sx * sy < 0) {
			xx = -xx;
			yy = -yy;
			xy = -xy;
			cur = -cur;
		}
		
		// Differences 1st degree
		dx = 4.0 * sy * cur * (x3 - x1) + xx - xy;
		dy = 4.0 * sx * cur * (y1 - y3) + yy - xy;
		
		// Error 1st step
		xx += xx;
		yy += yy;
		err = dx + dy + xy;
		
		do {
			// Plot curve
			DoodleTool.prototype._drawCap.call(this, cxt, x1, y1); //setPixel(x1,y1);
			// Last pixel -> curve finished
			if (x1 == x2 && y1 == y2) {
				return;
			}
			// Save value for test of y-step
			y3 = 2 * err < dx;
			// x-step
			if (2 * err > dy) {
				x1 += sx;
				dx -= xy;
				err += dy += yy;
			}
			// y-step
			if (y3) {
				y1 += sy;
				dy -= xy;
				err += dx += xx;
			}
		} while (dy < 0 && dx > 0); // Gradient negates -> algorithm fails
	}
	// Plot remaining part to end
	LineTool.drawLine(x1, y1, x2, y2, cxt);
}

/**
 * Plot a quadratic Bezier curve
 * @private
 * @param {Number} x1 - The x-coordinate of the curve's start point
 * @param {Number} y1 - The y-coordinate of the curve's start point
 * @param {Number} x2 - The x-coordinate of the curve's end point
 * @param {Number} y2 - The y-coordinate of the curve's end point
 * @param {Number} x3 - The x-coordinate of the third point
 * @param {Number} y3 - The y-coordinate of the third point
 * @param {CanvasRenderingContext2D} cxt
 */
CurveTool.prototype._plotQuadBezier = function (x1, y1, x2, y2, x3, y3, cxt) {
	var x = x1 - x3,
		y = y1 - y3,
		t = x1 - 2 * x3 + x2,
		r;
	
	// Horizontal cut at P4?
	if (x * (x2 - x3) > 0) {
		// Vertical cut at P6 too?
		if (y*(y2-y3) > 0) {
			// Which first?
			if (Math.abs((y1 - 2 * y3 + y2) / t * x) > Math.abs(y)) {
				// Swap points
				x1 = x2;
				x2 = x + x3;
				y1 = y2;
				y2 = y + y3;
			}
		}
		// Now horizontal cut at P4 comes first
		t = (x1-x3)/t;
		// By(t=P4)
		r = (1 - t) * ((1 - t) * y1 + 2.0 * t * y3) + t * t * y2;
		// Gradient dP4 / dx = 0
		t = (x1 * x2 - x3 * x3) * t / (x1 - x3);
		x = Math.floor(t + 0.5);
		y = Math.floor(r + 0.5);
		// Intersect P3 | P0 P1
		r = (y3 - y1) * (t - x1) / (x3 - x1) + y1;
		this._plotQuadBezierSeg(x1, y1, x, y, x, Math.floor(r + 0.5), cxt);
		// Intersect P4 | P1 P2
		r = (y3 - y2) * (t - x2) / (x3 - x2) + y2;
		// P0 = P4, P1 = P8
		x1 = x3 = x;
		y1 = y;
		y3 = Math.floor(r + 0.5);
	}
	
	// Vertical cut at P6?
	if ((y1 - y3) * (y2 - y3) > 0) {
		t = y1 - 2 * y3 + y2;
		t = (y1 - y3) / t;
		// Bx(t=P6)
		r = (1 - t) * ((1 - t) * x1 + 2.0 * t * x3) + t * t * x2;
		// Gradient dP6/dy=0
		t = (y1 * y2 - y3 * y3) * t / (y1 - y3);
		x = Math.floor(r + 0.5);
		y = Math.floor(t + 0.5);
		// Intersect P6 | P0 P1
		r = (x3 - x1) * (t - y1) / (y3 - y1) + x1;
		this._plotQuadBezierSeg(x1, y1, x, y, Math.floor(r + 0.5), y, cxt);
		// Intersect P7 | P1 P2
		r = (x3 - x2) * (t - y2) / (y3 - y2) + x2;
		// P0 = P6, P1 = P7
		x1 = x;
		x3 = Math.floor(r + 0.5);
		y1 = y3 = y;
	}
	
	// Remaining part
	this._plotQuadBezierSeg(x1, y1, x2, y2, x3, y3, cxt);
}

/**
 * Handle the curve tool becoming the active tool.
 * @override
 */
CurveTool.prototype.activate = function () {
	DrawingTool.prototype.activate.apply(this, arguments);
	
	this._state = CurveTool.STATE_NOT_STARTED;
};

/**
 * Handle a curve being started by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
CurveTool.prototype.start = function (pointerState) {
	DrawingTool.prototype.start.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	if (this._state === CurveTool.STATE_NOT_STARTED) {
		this.startX = pointerState.x;
		this.startY = pointerState.y;
	}
};

/**
 * Update the curve when the pointer is moved.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.move = function (pointerState) {
	DrawingTool.prototype.move.apply(this, arguments);
	
	if (!settings.get('antiAlias')) {
		this._roundPointerState(pointerState);
	}
	
	// Erase the previous preview.
	Utils.clearCanvas(this._preCxt);
	
	// Draw the new preview.
	if (this._state === CurveTool.STATE_NOT_STARTED) {
		LineTool.drawLine(this.startX, this.startY, pointerState.x, pointerState.y, this._preCxt);
	} else {
		this._plotQuadBezier(this.startX, this.startY, this.endX, this.endY, pointerState.x, pointerState.y, this._preCxt);
	}
	
	if (!settings.get('antiAlias')) {
		this._deAntiAlias(Utils.colorToRGB(this._lineColor));
	}
};

/**
 * Process when the pointer is released.
 * @override
 * @param {Object} pointerState - The pointer coordinates
 */
CurveTool.prototype.end = function (pointerState) {
	if (this._state === CurveTool.STATE_NOT_STARTED) {
		if (!settings.get('antiAlias')) {
			this._roundPointerState(pointerState);
		}
		this.endX = pointerState.x;
		this.endY = pointerState.y;
		
		this._state = CurveTool.STATE_LINE_DRAWN;
	} else {
		this._cxt.drawImage(this._preCxt.canvas, 0, 0);
		Utils.clearCanvas(this._preCxt);
		undoStack.addState();
		
		this._state = CurveTool.STATE_NOT_STARTED;
	}
};
