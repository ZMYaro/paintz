'use strict';

/**
 * @class
 * Create a new NoToolOptionsToolbox instance.
 * @param {HTMLElement} [parentToolbar] - The toolbar the toolbox is to be added to
 */
function NoToolOptionsToolbox(parentToolbar) {
	Toolbox.call(this, 'no_tool_options', parentToolbar);
}
// Extend Toolbox.
NoToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
NoToolOptionsToolbox.prototype.constructor = NoToolOptionsToolbox;
