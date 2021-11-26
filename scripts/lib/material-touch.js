/* Script for triggering element active states when touched
 * Supplement to the MaterialZ CSS library
 *
 * Copyright 2015-2021 Zachary Yaro
 * Released under the MIT license
 * https://materialz.dev/LICENSE.txt
 */

 (function () {
	var ELEM_TYPES = ["button", "select"],
		INPUT_TYPES = ["button", "checkbox", "radio", "range", "reset", "submit"];
	
	/**
	 * Check whether a given element is a supported form element.
	 * @param {HTMLElement} elem
	 */
	function isSupported(elem) {
		// Check whether the element is a supported form element,
		return (ELEM_TYPES.indexOf(elem.tagName.toLowerCase()) !== -1 ||
			// a supported <input> type,
			(elem.type && INPUT_TYPES.indexOf(elem.type.toLowerCase()) !== -1) ||
			// or has role="button".
			elem.getAttribute('role') === 'button');
	}
	
	/**
	 * Add the “active” class to the touched element
	 * @param {TouchEvent} e
	 */
	function makeActive(e) {
		if (isSupported(e.target)) {
			if(!!e.target.classList) { // use classList API if available
				e.target.classList.add("active");
			} else {
				e.target.className += " active";
			}
			e.stopPropagation();
		}
	}
	
	/**
	 * Remove the “active” class from the touched element
	 * @param {TouchEvent} e
	 */
	function makeInactive(e) {
		if (isSupported(e.target)) {
			if(!!e.target.classList) { // use classList API if available
				e.target.classList.remove("active");
			} else {
				e.target.className = e.srcElement.className.replace(/\s*active/g, "");
			}
			e.stopPropagation();
		}
	}
	
	window.addEventListener('load', function(e) {
		// Add the event listeners to the body.
		document.body.addEventListener('touchstart', makeActive, false);
		document.body.addEventListener("touchend", makeInactive, false);
		document.body.addEventListener("touchcancel", makeInactive, false);
	}, false);
})();
