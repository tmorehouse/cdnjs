/*!
 * Globalize v1.0.0-alpha.16
 *
 * http://github.com/jquery/globalize
 *
 * Copyright 2010, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-01-22T13:16Z
 */

// Core
module.exports = require( "./globalize" );

// Extent core with the following modules
require( "./globalize/message" );
require( "./globalize/number" );
require( "./globalize/plural" );

// Load after globalize/number
require( "./globalize/currency" );
require( "./globalize/date" );
