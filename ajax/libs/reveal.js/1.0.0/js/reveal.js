/**
 * Copyright (C) 2011 Hakim El Hattab, http://hakim.se
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Reveal.js is an easy to use HTML based slideshow enhanced by 
 * sexy CSS 3D transforms.
 * 
 * Slides are given unique hash based URL's so that they can be 
 * opened directly.
 * 
 * Public facing methods:
 * - Reveal.initialize( { ... options ... } );
 * - Reveal.navigateTo( indexh, indexv );
 * - Reveal.navigateLeft();
 * - Reveal.navigateRight();
 * - Reveal.navigateUp();
 * - Reveal.navigateDown();
 * 
 * 
 * version 0.1:
 * - First release
 * 
 * version 0.2:		
 * - Refactored code and added inline documentation
 * - Slides now have unique URL's
 * - A basic API to invoke navigation was added
 * 
 * version 0.3:		
 * - Added licensing terms
 * - Fixed broken links on touch devices
 * 
 * version 1.0:
 * - Added controls
 * - Added initialization options
 * - Reveal views in fragments
 * - Revamped, darker, theme
 * - Tweaked markup styles (a, em, strong, b, i, blockquote, q, pre, ul, ol)
 * - Support for themes at initialization (default/linear/concave)
 * - Code highlighting via highlight.js
 * 
 * TODO:
 * - Touch/swipe interactions
 * - Presentation overview via keyboard shortcut
 * 	
 * @author Hakim El Hattab | http://hakim.se
 * @version 1.0
 */
var Reveal = (function(){
	
	var HORIZONTAL_SLIDES_SELECTOR = '#main>section',
		VERTICAL_SLIDES_SELECTOR = 'section.present>section',

		indexh = 0,
		indexv = 0,

		config = {},
		dom = {};
	
	/**
	 * Activates the main program logic.
	 */
	function initialize( options ) {
		// Gather references to DOM elements
		dom.controls = document.querySelector( '.controls' );
		dom.controlsLeft = document.querySelector( '.controls .left' );
		dom.controlsRight = document.querySelector( '.controls .right' );
		dom.controlsUp = document.querySelector( '.controls .up' );
		dom.controlsDown = document.querySelector( '.controls .down' );

		// Add event listeners
		document.addEventListener('keydown', onDocumentKeyDown, false);
		document.addEventListener('touchstart', onDocumentTouchStart, false);
		window.addEventListener('hashchange', onWindowHashChange, false);
		dom.controlsLeft.addEventListener('click', preventAndForward( navigateLeft ), false);
		dom.controlsRight.addEventListener('click', preventAndForward( navigateRight ), false);
		dom.controlsUp.addEventListener('click', preventAndForward( navigateUp ), false);
		dom.controlsDown.addEventListener('click', preventAndForward( navigateDown ), false);

		// Default options
		config.rollingLinks = options.rollingLinks === undefined ? true : options.rollingLinks;
		config.controls = options.controls === undefined ? false : options.controls;
		config.theme = options.theme === undefined ? 'default' : options.theme;

		if( config.controls ) {
			dom.controls.style.display = 'block';
		}

		if( config.theme !== 'default' ) {
			document.body.classList.add( config.theme );
		}

		if( config.rollingLinks ) {
			// Add some 3D magic to our anchors
			linkify();
		}

		// Read the initial hash
		readURL();
	}

	/**
	 * Prevents an events defaults behavior calls the 
	 * specified delegate.
	 */
	function preventAndForward( delegate ) {
		return function( event ) {
			event.preventDefault();
			delegate.call();
		}
	}
	
	/**
	 * Handler for the document level 'keydown' event.
	 * 
	 * @param {Object} event
	 */
	function onDocumentKeyDown( event ) {
		
		if( event.keyCode >= 37 && event.keyCode <= 40 && event.target.contentEditable === 'inherit' ) {
			
			switch( event.keyCode ) {
				case 37: navigateLeft(); break; // left
				case 39: navigateRight(); break; // right
				case 38: navigateUp(); break; // up
				case 40: navigateDown(); break; // down
			}
			
			slide();
			
			event.preventDefault();
			
		}
	}
	
	/**
	 * Handler for the document level 'touchstart' event.
	 * 
	 * This enables very basic tap interaction for touch
	 * devices. Added mainly for performance testing of 3D
	 * transforms on iOS but was so happily surprised with
	 * how smoothly it runs so I left it in here. Apple +1
	 * 
	 * @param {Object} event
	 */
	function onDocumentTouchStart( event ) {
		// We're only interested in one point taps
		if (event.touches.length === 1) {
			// Never prevent taps on anchors and images
			if( event.target.tagName.toLowerCase() === 'a' || event.target.tagName.toLowerCase() === 'img' ) {
				return;
			}
			
			event.preventDefault();
			
			var point = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			};
			
			// Define the extent of the areas that may be tapped
			// to navigate
			var wt = window.innerWidth * 0.3;
			var ht = window.innerHeight * 0.3;
			
			if( point.x < wt ) {
				navigateLeft();
			}
			else if( point.x > window.innerWidth - wt ) {
				navigateRight();
			}
			else if( point.y < ht ) {
				navigateUp();
			}
			else if( point.y > window.innerHeight - ht ) {
				navigateDown();
			}
			
			slide();
			
		}
	}
	
	
	/**
	 * Handler for the window level 'hashchange' event.
	 * 
	 * @param {Object} event
	 */
	function onWindowHashChange( event ) {
		readURL();
	}

	/**
	 * Wrap all links in 3D goodness.
	 */
	function linkify() {
		var supports3DTransforms =  document.body.style['webkitPerspective'] !== undefined || 
                            		document.body.style['MozPerspective'] !== undefined ||
                            		document.body.style['perspective'] !== undefined;

        if( supports3DTransforms ) {
        	var nodes = document.querySelectorAll( 'section a:not(.image)' );

	        for( var i = 0, len = nodes.length; i < len; i++ ) {
	            var node = nodes[i];

	            if( !node.className || !node.className.match( /roll/g ) ) {
	                node.className += ' roll';
	                node.innerHTML = '<span data-title="'+ node.text +'">' + node.innerHTML + '</span>';
	            }
	        };
        }
	}
	
	/**
	 * Updates one dimension of slides by showing the slide
	 * with the specified index.
	 * 
	 * @param {String} selector A CSS selector that will fetch
	 * the group of slides we are working with
	 * @param {Number} index The index of the slide that should be
	 * shown
	 * 
	 * @return {Number} The index of the slide that is now shown,
	 * might differ from the passed in index if it was out of 
	 * bounds.
	 */
	function updateSlides( selector, index ) {
		
		// Select all slides and convert the NodeList result to
		// an array
		var slides = Array.prototype.slice.call( document.querySelectorAll( selector ) );
		
		if( slides.length ) {
			// Enforce max and minimum index bounds
			index = Math.max(Math.min(index, slides.length - 1), 0);
			
			slides[index].setAttribute('class', 'present');
			
			// Any element previous to index is given the 'past' class
			slides.slice(0, index).map(function(element){
				element.setAttribute('class', 'past');
			});
			
			// Any element subsequent to index is given the 'future' class
			slides.slice(index + 1).map(function(element){
				element.setAttribute('class', 'future');
			});
		}
		else {
			// Since there are no slides we can't be anywhere beyond the 
			// zeroth index
			index = 0;
		}
		
		return index;
		
	}
	
	/**
	 * Updates the visual slides to represent the currently
	 * set indices. 
	 */
	function slide() {
		indexh = updateSlides( HORIZONTAL_SLIDES_SELECTOR, indexh );
		indexv = updateSlides( VERTICAL_SLIDES_SELECTOR, indexv );

		updateControls();
		
		writeURL();
	}

	/**
	 * Updates the state and link pointers of the controls.
	 */
	function updateControls() {
		var routes = availableRoutes();

		// Remove the 'enabled' class from all directions
		[ dom.controlsLeft, dom.controlsRight, dom.controlsUp, dom.controlsDown ].forEach( function( node ) {
			node.classList.remove( 'enabled' );
		} )

		if( routes.left ) dom.controlsLeft.classList.add( 'enabled' );
		if( routes.right ) dom.controlsRight.classList.add( 'enabled' );
		if( routes.up ) dom.controlsUp.classList.add( 'enabled' );
		if( routes.down ) dom.controlsDown.classList.add( 'enabled' );
	}

	/**
	 * Determine what available routes there are for navigation.
	 * 
	 * @return {Object} containing four booleans: left/right/up/down
	 */
	function availableRoutes() {
		var horizontalSlides = document.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR );
		var verticalSlides = document.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

		return {
			left: indexh > 0,
			right: indexh < horizontalSlides.length - 1,
			up: indexv > 0,
			down: indexv < verticalSlides.length - 1
		};
	}
	
	/**
	 * Reads the current URL (hash) and navigates accordingly.
	 */
	function readURL() {
		// Break the hash down to separate components
		var bits = window.location.hash.slice(2).split('/');
		
		// Read the index components of the hash
		indexh = bits[0] ? parseInt( bits[0] ) : 0;
		indexv = bits[1] ? parseInt( bits[1] ) : 0;
		
		navigateTo( indexh, indexv );
	}
	
	/**
	 * Updates the page URL (hash) to reflect the current
	 * navigational state. 
	 */
	function writeURL() {
		var url = '/';
		
		// Only include the minimum possible number of components in
		// the URL
		if( indexh > 0 || indexv > 0 ) url += indexh;
		if( indexv > 0 ) url += '/' + indexv;
		
		window.location.hash = url;
	}

	/**
	 * Navigate to the nexy slide fragment.
	 * 
	 * @return {Boolean} true if there was a next fragment,
	 * false otherwise
	 */
	function nextFragment() {	
		if( document.querySelector( VERTICAL_SLIDES_SELECTOR + '.present' ) ) {
			var verticalFragments = document.querySelectorAll( VERTICAL_SLIDES_SELECTOR + '.present .fragment:not(.visible)' );
			if( verticalFragments.length ) {
				verticalFragments[0].classList.add( 'visible' );
				return true;
			}
		}
		else {
			var horizontalFragments = document.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.present .fragment:not(.visible)' );
			if( horizontalFragments.length ) {
				horizontalFragments[0].classList.add( 'visible' );
				return true;
			}
		}

		return false;
	}

	/**
	 * Navigate to the previous slide fragment.
	 * 
	 * @return {Boolean} true if there was a previous fragment,
	 * false otherwise
	 */
	function previousFragment() {
		if( document.querySelector( VERTICAL_SLIDES_SELECTOR + '.present' ) ) {
			var verticalFragments = document.querySelectorAll( VERTICAL_SLIDES_SELECTOR + '.present .fragment.visible' );
			if( verticalFragments.length ) {
				verticalFragments[ verticalFragments.length - 1 ].classList.remove( 'visible' );
				return true;
			}
		}
		else {
			var horizontalFragments = document.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR + '.present .fragment.visible' );
			if( horizontalFragments.length ) {
				horizontalFragments[ horizontalFragments.length - 1 ].classList.remove( 'visible' );
				return true;
			}
		}
		
		return false;
	}
	
	/**
	 * Triggers a navigation to the specified indices.
	 * 
	 * @param {Number} h The horizontal index of the slide to show
	 * @param {Number} v The vertical index of the slide to show
	 */
	function navigateTo( h, v ) {
		indexh = h === undefined ? indexh : h;
		indexv = v === undefined ? indexv : v;
		
		slide();
	}
	
	function navigateLeft() {
		// Prioritize hiding fragments
		if( previousFragment() === false ) {
			indexh --;
			indexv = 0;
			slide();
		}
	}
	function navigateRight() {
		// Prioritize revealing fragments
		if( nextFragment() === false ) {
			indexh ++;
			indexv = 0;
			slide();
		}
	}
	function navigateUp() {
		// Prioritize hiding fragments
		if( previousFragment() === false ) {
			indexv --;
			slide();
		}
	}
	function navigateDown() {
		// Prioritize revealing fragments
		if( nextFragment() === false ) {
			indexv ++;
			slide();
		}
	}
	
	// Expose some methods publicly
	return {
		initialize: initialize,
		navigateTo: navigateTo,
		navigateLeft: navigateLeft,
		navigateRight: navigateRight,
		navigateUp: navigateUp,
		navigateDown: navigateDown
	};
	
})();

