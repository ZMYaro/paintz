'use strict';

/**
 * @class
 * Create a new NoToolOptionsToolbox instance.
 * @param {HTMLElement} [toolbar] - The toolbar the toolbox is to be added to
 */
function NoToolOptionsToolbox(toolbar) {
	Toolbox.call(this, 'no_tool_options', toolbar);
}
// Extend Toolbox.
NoToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
NoToolOptionsToolbox.prototype.constructor = NoToolOptionsToolbox;
