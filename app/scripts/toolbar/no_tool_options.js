'use strict';

/**
 * @class
 * Create a new NoToolOptionsToolbox instance.
 */
function NoToolOptionsToolbox() {
	Toolbox.call(this, 'no_tool_options');
}
// Extend Toolbox.
NoToolOptionsToolbox.prototype = Object.create(Toolbox.prototype);
