/**
 * rome - Customizable date (and time) picker. Opt-in UI, no jQuery!
 * @version v1.2.0
 * @link https://github.com/bevacqua/rome
 * @license MIT
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.rome=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(_dereq_,module,exports){
module.exports = _dereq_('./src/contra.emitter.js');

},{"./src/contra.emitter.js":3}],3:[function(_dereq_,module,exports){
(function (process){
(function (root, undefined) {
  'use strict';

  var undef = '' + undefined;
  function atoa (a, n) { return Array.prototype.slice.call(a, n); }
  function debounce (fn, args, ctx) { if (!fn) { return; } tick(function run () { fn.apply(ctx || null, args || []); }); }

  // cross-platform ticker
  var si = typeof setImmediate === 'function', tick;
  if (si) {
    tick = function (fn) { setImmediate(fn); };
  } else if (typeof process !== undef && process.nextTick) {
    tick = process.nextTick;
  } else {
    tick = function (fn) { setTimeout(fn, 0); };
  }

  function _emitter (thing, options) {
    var opts = options || {};
    var evt = {};
    if (thing === undefined) { thing = {}; }
    thing.on = function (type, fn) {
      if (!evt[type]) {
        evt[type] = [fn];
      } else {
        evt[type].push(fn);
      }
      return thing;
    };
    thing.once = function (type, fn) {
      fn._once = true; // thing.off(fn) still works!
      thing.on(type, fn);
      return thing;
    };
    thing.off = function (type, fn) {
      var c = arguments.length;
      if (c === 1) {
        delete evt[type];
      } else if (c === 0) {
        evt = {};
      } else {
        var et = evt[type];
        if (!et) { return thing; }
        et.splice(et.indexOf(fn), 1);
      }
      return thing;
    };
    thing.emit = function () {
      var args = atoa(arguments);
      var type = args.shift();
      var et = evt[type];
      if (type === 'error' && opts.throws !== false && !et) { throw args.length === 1 ? args[0] : args; }
      if (!et) { return thing; }
      evt[type] = et.filter(function emitter (listen) {
        if (opts.async) { debounce(listen, args, thing); } else { listen.apply(thing, args); }
        return !listen._once;
      });
      return thing;
    };
    return thing;
  }

  // cross-platform export
  if (typeof module !== undef && module.exports) {
    module.exports = _emitter;
  } else {
    root.contra = root.contra || {};
    root.contra.emitter = _emitter;
  }
})(this);

}).call(this,_dereq_("FWaASH"))
},{"FWaASH":1}],4:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var debounce = _dereq_('lodash.debounce'),
    isFunction = _dereq_('lodash.isfunction'),
    isObject = _dereq_('lodash.isobject');

/** Used as an internal `_.debounce` options object */
var debounceOptions = {
  'leading': false,
  'maxWait': 0,
  'trailing': false
};

/**
 * Creates a function that, when executed, will only call the `func` function
 * at most once per every `wait` milliseconds. Provide an options object to
 * indicate that `func` should be invoked on the leading and/or trailing edge
 * of the `wait` timeout. Subsequent calls to the throttled function will
 * return the result of the last `func` call.
 *
 * Note: If `leading` and `trailing` options are `true` `func` will be called
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to throttle.
 * @param {number} wait The number of milliseconds to throttle executions to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * var throttled = _.throttle(updatePosition, 100);
 * jQuery(window).on('scroll', throttled);
 *
 * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (!isFunction(func)) {
    throw new TypeError;
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? options.leading : leading;
    trailing = 'trailing' in options ? options.trailing : trailing;
  }
  debounceOptions.leading = leading;
  debounceOptions.maxWait = wait;
  debounceOptions.trailing = trailing;

  return debounce(func, wait, debounceOptions);
}

module.exports = throttle;

},{"lodash.debounce":5,"lodash.isfunction":8,"lodash.isobject":9}],5:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isFunction = _dereq_('lodash.isfunction'),
    isObject = _dereq_('lodash.isobject'),
    now = _dereq_('lodash.now');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeMax = Math.max;

/**
 * Creates a function that will delay the execution of `func` until after
 * `wait` milliseconds have elapsed since the last time it was invoked.
 * Provide an options object to indicate that `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
 * to the debounced function will return the result of the last `func` call.
 *
 * Note: If `leading` and `trailing` options are `true` `func` will be called
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * var lazyLayout = _.debounce(calculateLayout, 150);
 * jQuery(window).on('resize', lazyLayout);
 *
 * // execute `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * });
 *
 * // ensure `batchLog` is executed once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * source.addEventListener('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }, false);
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (!isFunction(func)) {
    throw new TypeError;
  }
  wait = nativeMax(0, wait) || 0;
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
    trailing = 'trailing' in options ? options.trailing : trailing;
  }
  var delayed = function() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  };

  var maxDelayed = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || (maxWait !== wait)) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  };

  return function() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  };
}

module.exports = debounce;

},{"lodash.isfunction":8,"lodash.isobject":9,"lodash.now":6}],6:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isNative = _dereq_('lodash._isnative');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var stamp = _.now();
 * _.defer(function() { console.log(_.now() - stamp); });
 * // => logs the number of milliseconds it took for the deferred function to be called
 */
var now = isNative(now = Date.now) && now || function() {
  return new Date().getTime();
};

module.exports = now;

},{"lodash._isnative":7}],7:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == 'function' && reNative.test(value);
}

module.exports = isNative;

},{}],8:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],9:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = _dereq_('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":10}],10:[function(_dereq_,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],11:[function(_dereq_,module,exports){
var now = _dereq_('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for (var i = 0; i < cp.length; i++) {
          if (!cp[i].cancelled) {
            cp[i].callback(last)
          }
        }
      }, next)
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function() {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.apply(global, arguments)
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":12}],12:[function(_dereq_,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,_dereq_("FWaASH"))
},{"FWaASH":1}],13:[function(_dereq_,module,exports){
'use strict';

var isInput = _dereq_('./isInput');
var bindings = {};

function has (source, target) {
  var binding = bindings[source.id];
  return binding && binding[target.id];
}

function insert (source, target) {
  var binding = bindings[source.id];
  if (!binding) {
    binding = bindings[source.id] = {};
  }
  var invalidate = invalidator(target);
  binding[target.id] = invalidate;
  source.on('data', invalidate);
  source.on('destroyed', remove.bind(null, source, target));
}

function remove (source, target) {
  var binding = bindings[source.id];
  if (!binding) {
    return;
  }
  var invalidate = binding[target.id];
  source.off('data', invalidate);
  delete binding[target.id];
}

function invalidator (target) {
  return function invalidate () {
    target.refresh();
  };
}

function add (source, target) {
  if (isInput(target.associated) || has(source, target)) {
    return;
  }
  insert(source, target);
}

module.exports = {
  add: add,
  remove: remove
};

},{"./isInput":24}],14:[function(_dereq_,module,exports){
'use strict';

var emitter = _dereq_('contra.emitter');
var raf = _dereq_('raf');
var dom = _dereq_('./dom');
var text = _dereq_('./text');
var parse = _dereq_('./parse');
var clone = _dereq_('./clone');
var defaults = _dereq_('./defaults');
var momentum = _dereq_('./momentum');
var classes = _dereq_('./classes');
var events = _dereq_('./events');
var noop = _dereq_('./noop');
var no;

function calendar (calendarOptions) {
  var o;
  var api = emitter({});
  var ref;
  var refCal;
  var container;
  var rendered = false;

  // date variables
  var monthOffsetAttribute = 'data-rome-offset';
  var weekdays = momentum.moment.weekdaysMin();
  var weekdayCount = weekdays.length;
  var calendarMonths = [];
  var lastYear;
  var lastMonth;
  var lastDay;
  var lastDayElement;
  var datewrapper;
  var back;
  var next;

  // time variables
  var secondsInDay = 60 * 60 * 24;
  var time;
  var timelist;

  destroy(true);

  raf(function () {
    init();
  });

  function napi () { return api; }

  function init (initOptions) {
    o = defaults(initOptions || calendarOptions, api);
    if (!container) { container = dom({ className: o.styles.container }); }
    lastMonth = no;
    lastYear = no;
    lastDay = no;
    lastDayElement = no;
    o.appendTo.appendChild(container);

    removeChildren(container);
    rendered = false;
    ref = o.initialValue ? o.initialValue : momentum.moment();
    refCal = ref.clone();

    api.container = container;
    api.destroyed = false;
    api.destroy = destroy.bind(api, false);
    api.emitValues = emitValues;
    api.getDate = getDate;
    api.getDateString = getDateString;
    api.getMoment = getMoment;
    api.hide = hide;
    api.options = changeOptions;
    api.options.reset = resetOptions;
    api.refresh = refresh;
    api.restore = napi;
    api.setValue = setValue;
    api.show = show;

    hideCalendar();
    eventListening();

    api.emit('ready', clone(o));

    return api;
  }

  function destroy (silent) {
    if (container) {
      container.parentNode.removeChild(container);
    }

    if (o) {
      eventListening(true);
    }

    api.destroyed = true;
    api.destroy = napi;
    api.emitValues = napi;
    api.getDate = noop;
    api.getDateString = noop;
    api.getMoment = noop;
    api.hide = napi;
    api.options = napi;
    api.options.reset = napi;
    api.refresh = napi;
    api.restore = init;
    api.setValue = napi;
    api.show = napi;

    if (silent !== true) {
      api.emit('destroyed');
    }
    api.off();

    return api;
  }

  function eventListening (remove) {
    var op = remove ? 'remove' : 'add';
    if (o.autoHideOnBlur) { events[op](document, 'focusin', hideOnBlur); }
    if (o.autoHideOnClick) { events[op](document, 'click', hideOnClick); }
  }

  function changeOptions (options) {
    if (arguments.length === 0) {
      return clone(o);
    }
    destroy();
    init(options);
    return api;
  }

  function resetOptions () {
    return changeOptions({});
  }

  function render () {
    if (rendered) {
      return;
    }
    rendered = true;
    renderDates();
    renderTime();
    api.emit('render');
  }

  function renderDates () {
    if (!o.date) {
      return;
    }
    var i;
    calendarMonths = [];

    datewrapper = dom({ className: o.styles.date, parent: container });

    for (i = 0; i < o.monthsInCalendar; i++) {
      renderMonth(i);
    }

    events.add(back, 'click', subtractMonth);
    events.add(next, 'click', addMonth);
    events.add(datewrapper, 'click', pickDay);

    function renderMonth (i) {
      var month = dom({ className: o.styles.month, parent: datewrapper });
      if (i === 0) {
        back = dom({ type: 'button', className: o.styles.back, parent: month });
      }
      if (i === o.monthsInCalendar -1) {
        next = dom({ type: 'button', className: o.styles.next, parent: month });
      }
      var label = dom({ className: o.styles.monthLabel, parent: month });
      var date = dom({ type: 'table', className: o.styles.dayTable, parent: month });
      var datehead = dom({ type: 'thead', className: o.styles.dayHead, parent: date });
      var dateheadrow = dom({ type: 'tr', className: o.styles.dayRow, parent: datehead });
      var datebody = dom({ type: 'tbody', className: o.styles.dayBody, parent: date });
      var j;

      for (j = 0; j < weekdayCount; j++) {
        dom({ type: 'th', className: o.styles.dayHeadElem, parent: dateheadrow, text: weekdays[weekday(j)] });
      }

      datebody.setAttribute(monthOffsetAttribute, i);
      calendarMonths.push({
        label: label,
        body: datebody
      });
    }
  }

  function renderTime () {
    if (!o.time || !o.timeInterval) {
      return;
    }
    var timewrapper = dom({ className: o.styles.time, parent: container });
    time = dom({ className: o.styles.selectedTime, parent: timewrapper, text: ref.format(o.timeFormat) });
    events.add(time, 'click', toggleTimeList);
    timelist = dom({ className: o.styles.timeList, parent: timewrapper });
    events.add(timelist, 'click', pickTime);
    var next = momentum.moment('00:00:00', 'HH:mm:ss');
    var latest = next.clone().add(1, 'days');
    while (next.isBefore(latest)) {
      dom({ className: o.styles.timeOption, parent: timelist, text: next.format(o.timeFormat) });
      next.add(o.timeInterval, 'seconds');
    }
  }

  function weekday (index, backwards) {
    var factor = backwards ? -1 : 1;
    var offset = index + o.weekStart * factor;
    if (offset >= weekdayCount || offset < 0) {
      offset += weekdayCount * -factor;
    }
    return offset;
  }

  function displayValidTimesOnly () {
    if (!o.time || !rendered) {
      return;
    }
    var times = timelist.children;
    var length = times.length;
    var date;
    var time;
    var item;
    var i;
    for (i = 0; i < length; i++) {
      item = times[i];
      time = momentum.moment(text(item), o.timeFormat);
      date = setTime(ref.clone(), time);
      item.style.display = isInRange(date, false, o.timeValidator) ? 'block' : 'none';
    }
  }

  function toggleTimeList (show) {
    var display = typeof show === 'boolean' ? show : timelist.style.display === 'none';
    if (display) {
      showTimeList();
    } else {
      hideTimeList();
    }
  }

  function showTimeList () { if (timelist) { timelist.style.display = 'block'; } }
  function hideTimeList () { if (timelist) { timelist.style.display = 'none'; } }
  function showCalendar () { container.style.display = 'inline-block'; api.emit('show'); }
  function hideCalendar () { container.style.display = 'none'; api.emit('hide'); }

  function show () {
    render();
    refresh();
    toggleTimeList(!o.date);
    showCalendar();
    return api;
  }

  function hide () {
    hideTimeList();
    raf(hideCalendar);
    return api;
  }

  function hideConditionally () {
    hideTimeList();

    var pos = classes.contains(container, o.styles.positioned);
    if (pos) {
      raf(hideCalendar);
    }
    return api;
  }

  function calendarEventTarget (e) {
    var target = e.target;
    if (target === api.associated) {
      return true;
    }
    while (target) {
      if (target === container) {
        return true;
      }
      target = target.parentNode;
    }
  }

  function hideOnBlur (e) {
    if (calendarEventTarget(e)) {
      return;
    }
    hideConditionally();
  }

  function hideOnClick (e) {
    if (calendarEventTarget(e)) {
      return;
    }
    hideConditionally();
  }

  function subtractMonth () { changeMonth('subtract'); }
  function addMonth () { changeMonth('add'); }
  function changeMonth (op) {
    var bound;
    var direction = op === 'add' ? -1 : 1;
    var offset = o.monthsInCalendar + direction * getMonthOffset(lastDayElement);
    refCal[op]('months', offset);
    bound = inRange(refCal.clone());
    ref = bound || ref;
    if (bound) { refCal = bound.clone(); }
    update();
  }

  function update (silent) {
    updateCalendar();
    updateTime();
    if (silent !== true) { emitValues(); }
    displayValidTimesOnly();
  }

  function updateCalendar () {
    if (!o.date || !rendered) {
      return;
    }
    var y = refCal.year();
    var m = refCal.month();
    var d = refCal.date();
    if (d === lastDay && m === lastMonth && y === lastYear) {
      return;
    }
    var canStay = isDisplayed();
    lastDay = refCal.date();
    lastMonth = refCal.month();
    lastYear = refCal.year();
    if (canStay) { updateCalendarSelection(); return; }
    calendarMonths.forEach(updateMonth);
    renderAllDays();

    function updateMonth (month, i) {
      var offsetCal = refCal.clone().add(i, 'months');
      text(month.label, offsetCal.format(o.monthFormat));
      removeChildren(month.body);
    }
  }

  function updateCalendarSelection () {
    var day = refCal.date() - 1;
    selectDayElement(false);
    calendarMonths.forEach(function (cal) {
      var days;
      if (sameCalendarMonth(cal.date, refCal)) {
        days = cast(cal.body.children).map(aggregate);
        days = Array.prototype.concat.apply([], days).filter(inside);
        selectDayElement(days[day]);
      }
    });

    function cast (like) {
      var dest = [];
      var i;
      for (i = 0; i < like.length; i++) {
        dest.push(like[i]);
      }
      return dest;
    }

    function aggregate (child) {
      return cast(child.children);
    }

    function inside (child) {
      return !classes.contains(child, o.styles.dayPrevMonth) &&
             !classes.contains(child, o.styles.dayNextMonth);
    }
  }

  function isDisplayed () {
    return calendarMonths.some(matches);

    function matches (cal) {
      if (!lastYear) { return false; }
      return sameCalendarMonth(cal.date, refCal);
    }
  }

  function sameCalendarMonth (left, right) {
    return left && right && left.year() === right.year() && left.month() === right.month();
  }

  function updateTime () {
    if (!o.time || !rendered) {
      return;
    }
    text(time, ref.format(o.timeFormat));
  }

  function emitValues () {
    api.emit('data', getDateString());
    api.emit('year', ref.year());
    api.emit('month', ref.month());
    api.emit('day', ref.day());
    api.emit('time', ref.format(o.timeFormat));
    return api;
  }

  function refresh () {
    lastYear = false;
    lastMonth = false;
    lastDay = false;
    update(true);
    return api;
  }

  function setValue (value) {
    var date = parse(value, o.inputFormat);
    if (date === null) {
      return;
    }
    ref = inRange(date) || ref;
    refCal = ref.clone();
    update(true);

    return api;
  }

  function removeChildren (elem, self) {
    while (elem && elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
    if (self === true) {
      elem.parentNode.removeChild(elem);
    }
  }

  function renderAllDays () {
    var i;
    for (i = 0; i < o.monthsInCalendar; i++) {
      renderDays(i);
    }
  }

  function renderDays (offset) {
    var month = calendarMonths[offset];
    var offsetCal = refCal.clone().add(offset, 'months');
    var total = offsetCal.daysInMonth();
    var current = offsetCal.month() !== ref.month() ? -1 : ref.date(); // -1 : 1..31
    var first = offsetCal.clone().date(1);
    var firstDay = weekday(first.day(), true); // 0..6
    var tr = dom({ type: 'tr', className: o.styles.dayRow, parent: month.body });
    var prevMonth = hiddenWhen(offset !== 0, [o.styles.dayBodyElem, o.styles.dayPrevMonth]);
    var nextMonth = hiddenWhen(offset !== o.monthsInCalendar - 1, [o.styles.dayBodyElem, o.styles.dayNextMonth]);
    var disabled = o.styles.dayDisabled;
    var lastDay;

    part({
      base: first.clone().subtract(firstDay, 'days'),
      length: firstDay,
      cell: prevMonth
    });

    part({
      base: first.clone(),
      length: total,
      cell: [o.styles.dayBodyElem],
      selectable: true
    });

    lastDay = first.clone().add(total, 'days');

    part({
      base: lastDay,
      length: weekdayCount - tr.children.length,
      cell: nextMonth
    });

    back.disabled = !isInRange(first, true);
    next.disabled = !isInRange(lastDay, true);
    month.date = offsetCal.clone();

    function part (data) {
      var i, day, node;
      for (i = 0; i < data.length; i++) {
        if (tr.children.length === weekdayCount) {
          tr = dom({ type: 'tr', className: o.styles.dayRow, parent: month.body });
        }
        day = data.base.clone().add(i, 'days');
        node = dom({
          type: 'td',
          parent: tr,
          text: day.format(o.dayFormat),
          className: validationTest(day, data.cell.join(' ').split(' ')).join(' ')
        });
        if (data.selectable && day.date() === current) {
          selectDayElement(node);
        }
      }
    }

    function validationTest (day, cell) {
      if (!isInRange(day, true, o.dateValidator)) { cell.push(disabled); }
      return cell;
    }

    function hiddenWhen (value, cell) {
      if (value) { cell.push(o.styles.dayConcealed); }
      return cell;
    }
  }

  function isInRange (date, allday, validator) {
    var min = !o.min ? false : (allday ? o.min.clone().startOf('day') : o.min);
    var max = !o.max ? false : (allday ? o.max.clone().endOf('day') : o.max);
    if (min && date.isBefore(min)) {
      return false;
    }
    if (max && date.isAfter(max)) {
      return false;
    }
    var valid = (validator || Function.prototype).call(api, date.toDate());
    return valid !== false;
  }

  function inRange (date) {
    if (o.min && date.isBefore(o.min)) {
      return inRange(o.min.clone());
    } else if (o.max && date.isAfter(o.max)) {
      return inRange(o.max.clone());
    }
    var value = date.clone().subtract(1, 'days');
    if (validateTowards(value, date, 'add')) {
      return inTimeRange(value);
    }
    value = date.clone();
    if (validateTowards(value, date, 'subtract')) {
      return inTimeRange(value);
    }
  }

  function inTimeRange (value) {
    var copy = value.clone().subtract(o.timeInterval, 'seconds');
    var times = Math.ceil(secondsInDay / o.timeInterval);
    var i;
    for (i = 0; i < times; i++) {
      copy.add(o.timeInterval, 'seconds');
      if (copy.date() > value.date()) {
        copy.subtract(1, 'days');
      }
      if (o.timeValidator.call(api, copy.toDate()) !== false) {
        return copy;
      }
    }
  }

  function validateTowards (value, date, op) {
    var valid = false;
    while (valid === false) {
      value[op](1, 'days');
      if (value.month() !== date.month()) {
        break;
      }
      valid = o.dateValidator.call(api, value.toDate());
    }
    return valid !== false;
  }

  function pickDay (e) {
    var target = e.target;
    if (classes.contains(target, o.styles.dayDisabled) || !classes.contains(target, o.styles.dayBodyElem)) {
      return;
    }
    var day = parseInt(text(target), 10);
    var prev = classes.contains(target, o.styles.dayPrevMonth);
    var next = classes.contains(target, o.styles.dayNextMonth);
    var offset = getMonthOffset(target) - getMonthOffset(lastDayElement);
    ref.add(offset, 'months');
    if (prev || next) {
      ref.add(prev ? -1 : 1, 'months');
    }
    selectDayElement(target);
    ref.date(day); // must run after setting the month
    setTime(ref, inRange(ref) || ref);
    refCal = ref.clone();
    if (o.autoClose) { hideConditionally(); }
    update();
  }

  function selectDayElement (node) {
    if (lastDayElement) {
      classes.remove(lastDayElement, o.styles.selectedDay);
    }
    if (node) {
      classes.add(node, o.styles.selectedDay);
    }
    lastDayElement = node;
  }

  function getMonthOffset (elem) {
    var offset;
    while (elem && elem.getAttribute) {
      offset = elem.getAttribute(monthOffsetAttribute);
      if (typeof offset === 'string') {
        return parseInt(offset, 10);
      }
      elem = elem.parentNode;
    }
    return 0;
  }

  function setTime (to, from) {
    to.hour(from.hour()).minute(from.minute()).second(from.second());
    return to;
  }

  function pickTime (e) {
    var target = e.target;
    if (!classes.contains(target, o.styles.timeOption)) {
      return;
    }
    var value = momentum.moment(text(target), o.timeFormat);
    setTime(ref, value);
    refCal = ref.clone();
    emitValues();
    updateTime();
    if (!o.date && o.autoClose) {
      hideConditionally();
    } else {
      hideTimeList();
    }
  }

  function getDate () {
    return ref.toDate();
  }

  function getDateString (format) {
    return ref.format(format || o.inputFormat);
  }

  function getMoment () {
    return ref.clone();
  }

  return api;
}

module.exports = calendar;

},{"./classes":15,"./clone":16,"./defaults":18,"./dom":19,"./events":20,"./momentum":25,"./noop":26,"./parse":27,"./text":39,"contra.emitter":2,"raf":11}],15:[function(_dereq_,module,exports){
'use strict';

var trim = /^\s+|\s+$/g;
var whitespace = /\s+/;

function classes (node) {
  return node.className.replace(trim, '').split(whitespace);
}

function set (node, value) {
  node.className = value.join(' ');
}

function add (node, value) {
  var values = remove(node, value);
  values.push(value);
  set(node, values);
}

function remove (node, value) {
  var values = classes(node);
  var i = values.indexOf(value);
  if (i !== -1) {
    values.splice(i, 1);
    set(node, values);
  }
  return values;
}

function contains (node, value) {
  return classes(node).indexOf(value) !== -1;
}

module.exports = {
  add: add,
  remove: remove,
  contains: contains
};

},{}],16:[function(_dereq_,module,exports){
'use strict';

var momentum = _dereq_('./momentum');

// naïve implementation, specifically meant to clone `options` objects
function clone (thing) {
  var copy = {};
  var value;

  for (var key in thing) {
    value = thing[key];

    if (!value) {
      copy[key] = value;
    } else if (momentum.isMoment(value)) {
      copy[key] = value.clone();
    } else if (value._isStylesConfiguration) {
      copy[key] = clone(value);
    } else {
      copy[key] = value;
    }
  }

  return copy;
}

module.exports = clone;

},{"./momentum":25}],17:[function(_dereq_,module,exports){
'use strict';

var index = _dereq_('./index');
var input = _dereq_('./input');
var inline = _dereq_('./inline');
var isInput = _dereq_('./isInput');

function core (elem, options) {
  var cal;
  var existing = index.find(elem);
  if (existing) {
    return existing;
  }

  if (isInput(elem)) {
    cal = input(elem, options);
  } else {
    cal = inline(elem, options);
  }
  cal.associated = elem;
  index.assign(elem, cal);

  return cal;
}

module.exports = core;

},{"./index":21,"./inline":22,"./input":23,"./isInput":24}],18:[function(_dereq_,module,exports){
'use strict';

var parse = _dereq_('./parse');
var isInput = _dereq_('./isInput');
var momentum = _dereq_('./momentum');

function defaults (options, cal) {
  var temp;
  var no;
  var o = options || {};
  if (o.autoHideOnClick === no) { o.autoHideOnClick = true; }
  if (o.autoHideOnBlur === no) { o.autoHideOnBlur = true; }
  if (o.autoClose === no) { o.autoClose = true; }
  if (o.appendTo === no) { o.appendTo = document.body; }
  if (o.appendTo === 'parent') {
    if (isInput(cal.associated)) {
      o.appendTo = cal.associated.parentNode;
    } else {
      throw new Error('Inline calendars must be appended to a parent node explicitly.');
    }
  }
  if (o.invalidate === no) { o.invalidate = true; }
  if (o.required === no) { o.required = false; }
  if (o.date === no) { o.date = true; }
  if (o.time === no) { o.time = true; }
  if (o.date === false && o.time === false) { throw new Error('At least one of `date` or `time` must be `true`.'); }
  if (o.inputFormat === no) {
    if (o.date && o.time) {
      o.inputFormat = 'YYYY-MM-DD HH:mm';
    } else if (o.date) {
      o.inputFormat = 'YYYY-MM-DD';
    } else {
      o.inputFormat = 'HH:mm';
    }
  }
  if (o.initialValue === no) {
    o.initialValue = null;
  } else {
    o.initialValue = parse(o.initialValue, o.inputFormat);
  }
  if (o.min === no) { o.min = null; } else { o.min = parse(o.min, o.inputFormat); }
  if (o.max === no) { o.max = null; } else { o.max = parse(o.max, o.inputFormat); }
  if (o.timeInterval === no) { o.timeInterval = 60 * 30; } // 30 minutes by default
  if (o.min && o.max) {
    if (o.max.isBefore(o.min)) {
      temp = o.max;
      o.max = o.min;
      o.min = temp;
    }
    if (o.date === true) {
      if (o.max.clone().subtract(1, 'days').isBefore(o.min)) {
        throw new Error('`max` must be at least one day after `min`');
      }
    } else if (o.timeInterval * 1000 - o.min % (o.timeInterval * 1000) > o.max - o.min) {
      throw new Error('`min` to `max` range must allow for at least one time option that matches `timeInterval`');
    }
  }
  if (o.dateValidator === no) { o.dateValidator = Function.prototype; }
  if (o.timeValidator === no) { o.timeValidator = Function.prototype; }
  if (o.timeFormat === no) { o.timeFormat = 'HH:mm'; }
  if (o.weekStart === no) { o.weekStart = momentum.moment().weekday(0).day(); }
  if (o.monthsInCalendar === no) { o.monthsInCalendar = 1; }
  if (o.monthFormat === no) { o.monthFormat = 'MMMM YYYY'; }
  if (o.dayFormat === no) { o.dayFormat = 'DD'; }
  if (o.styles === no) { o.styles = {}; }

  o.styles._isStylesConfiguration = true;

  var styl = o.styles;
  if (styl.back === no) { styl.back = 'rd-back'; }
  if (styl.container === no) { styl.container = 'rd-container'; }
  if (styl.positioned === no) { styl.positioned = 'rd-container-attachment'; }
  if (styl.date === no) { styl.date = 'rd-date'; }
  if (styl.dayBody === no) { styl.dayBody = 'rd-days-body'; }
  if (styl.dayBodyElem === no) { styl.dayBodyElem = 'rd-day-body'; }
  if (styl.dayPrevMonth === no) { styl.dayPrevMonth = 'rd-day-prev-month'; }
  if (styl.dayNextMonth === no) { styl.dayNextMonth = 'rd-day-next-month'; }
  if (styl.dayDisabled === no) { styl.dayDisabled = 'rd-day-disabled'; }
  if (styl.dayConcealed === no) { styl.dayConcealed = 'rd-day-concealed'; }
  if (styl.dayHead === no) { styl.dayHead = 'rd-days-head'; }
  if (styl.dayHeadElem === no) { styl.dayHeadElem = 'rd-day-head'; }
  if (styl.dayRow === no) { styl.dayRow = 'rd-days-row'; }
  if (styl.dayTable === no) { styl.dayTable = 'rd-days'; }
  if (styl.month === no) { styl.month = 'rd-month'; }
  if (styl.monthLabel === no) { styl.monthLabel = 'rd-month-label'; }
  if (styl.next === no) { styl.next = 'rd-next'; }
  if (styl.selectedDay === no) { styl.selectedDay = 'rd-day-selected'; }
  if (styl.selectedTime === no) { styl.selectedTime = 'rd-time-selected'; }
  if (styl.time === no) { styl.time = 'rd-time'; }
  if (styl.timeList === no) { styl.timeList = 'rd-time-list'; }
  if (styl.timeOption === no) { styl.timeOption = 'rd-time-option'; }

  return o;
}

module.exports = defaults;

},{"./isInput":24,"./momentum":25,"./parse":27}],19:[function(_dereq_,module,exports){
'use strict';

function dom (options) {
  var o = options || {};
  if (!o.type) { o.type = 'div'; }
  var elem = document.createElement(o.type);
  if (o.className) { elem.className = o.className; }
  if (o.text) { elem.innerText = elem.textContent = o.text; }
  if (o.parent) { o.parent.appendChild(elem); }
  return elem;
}

module.exports = dom;

},{}],20:[function(_dereq_,module,exports){
'use strict';

var addEvent = addEventEasy;
var removeEvent = removeEventEasy;

if (!window.addEventListener) {
  addEvent = addEventHard;
}

if (!window.removeEventListener) {
  removeEvent = removeEventHard;
}

function addEventEasy (element, evt, fn) {
  return element.addEventListener(evt, fn);
}

function addEventHard (element, evt, fn) {
  return element.attachEvent('on' + evt, function (ae) {
    var e = ae || window.event;
    e.target = e.target || e.srcElement;
    e.preventDefault  = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    fn.call(element, e);
  });
}

function removeEventEasy (element, evt, fn) {
  return element.removeEventListener(evt, fn);
}

function removeEventHard (element, evt, fn) {
  return element.detachEvent('on' + evt, fn);
}

module.exports = {
  add: addEvent,
  remove: removeEvent
};

},{}],21:[function(_dereq_,module,exports){
'use strict';
var no;
var ikey = 'data-rome-id';
var index = [];

function find (thing) { // can be a DOM element or a number
  if (typeof thing !== 'number' && thing && thing.getAttribute) {
    return find(thing.getAttribute(ikey));
  }
  var existing = index[thing];
  if (existing !== no) {
    return existing;
  }
  return null;
}

function assign (elem, instance) {
  elem.setAttribute(ikey, instance.id = index.push(instance) - 1);
}

module.exports = {
  find: find,
  assign: assign
};

},{}],22:[function(_dereq_,module,exports){
'use strict';

var raf = _dereq_('raf');
var calendar = _dereq_('./calendar');

function inline (elem, calendarOptions) {
  var o = calendarOptions || {};

  o.appendTo = elem;

  var api = calendar(o)
    .on('ready', ready);

  function ready () {
    raf(api.show);
  }

  return api;
}

module.exports = inline;

},{"./calendar":14,"raf":11}],23:[function(_dereq_,module,exports){
'use strict';

var throttle = _dereq_('lodash.throttle');
var raf = _dereq_('raf');
var clone = _dereq_('./clone');
var calendar = _dereq_('./calendar');
var momentum = _dereq_('./momentum');
var classes = _dereq_('./classes');
var events = _dereq_('./events');

function inputCalendar (input, calendarOptions) {
  var o;
  var api = calendar(calendarOptions);
  var throttledTakeInput = throttle(takeInput, 50);
  var throttledPosition = throttle(position, 30);
  var ignoreInvalidation;
  var ignoreShow;

  bindEvents();

  function init (superOptions) {
    o = clone(superOptions);

    classes.add(api.container, o.styles.positioned);
    events.add(api.container, 'mousedown', containerMouseDown);
    events.add(api.container, 'click', containerClick);

    api.getDate = unrequire(api.getDate);
    api.getDateString = unrequire(api.getDateString);
    api.getMoment = unrequire(api.getMoment);

    if (o.initialValue) {
      input.value = o.initialValue.format(o.inputFormat);
    }

    api.on('data', updateInput);
    api.on('show', throttledPosition);

    eventListening();
    throttledTakeInput();
  }

  function destroy () {
    eventListening(true);
    raf(bindEvents);
  }

  function bindEvents () {
    api.once('ready', init);
    api.once('destroyed', destroy);
  }

  function eventListening (remove) {
    var op = remove ? 'remove' : 'add';
    events[op](input, 'click', show);
    events[op](input, 'touchend', show);
    events[op](input, 'focusin', show);
    events[op](input, 'change', throttledTakeInput);
    events[op](input, 'keypress', throttledTakeInput);
    events[op](input, 'keydown', throttledTakeInput);
    events[op](input, 'input', throttledTakeInput);
    if (o.invalidate) { events[op](input, 'blur', invalidateInput); }
    events[op](window, 'resize', throttledPosition);
  }

  function containerClick () {
    ignoreShow = true;
    input.focus();
    ignoreShow = false;
  }

  function containerMouseDown () {
    ignoreInvalidation = true;
    raf(unignore);

    function unignore () {
      ignoreInvalidation = false;
    }
  }

  function invalidateInput () {
    if (!ignoreInvalidation && !isEmpty()) {
      api.emitValues();
    }
  }

  function show () {
    if (ignoreShow) {
      return;
    }
    api.show();
  }

  function position () {
    var bounds = input.getBoundingClientRect();
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    api.container.style.top  = bounds.top + scrollTop + input.offsetHeight + 'px';
    api.container.style.left = bounds.left + 'px';
  }

  function takeInput () {
    var value = input.value.trim();
    if (isEmpty()) {
      return;
    }
    var date = momentum.moment(value, o.inputFormat);
    api.setValue(date);
  }

  function updateInput (data) {
    input.value = data;
  }

  function isEmpty () {
    return o.required === false && input.value.trim() === '';
  }

  function unrequire (fn) {
    return function maybe () {
      return isEmpty() ? null : fn.apply(this, arguments);
    };
  }

  return api;
}

module.exports = inputCalendar;

},{"./calendar":14,"./classes":15,"./clone":16,"./events":20,"./momentum":25,"lodash.throttle":4,"raf":11}],24:[function(_dereq_,module,exports){
'use strict';

function isInput (elem) {
  return elem && elem.nodeName && elem.nodeName.toLowerCase() === 'input';
}

module.exports = isInput;

},{}],25:[function(_dereq_,module,exports){
'use strict';

function isMoment (value) {
  return value && Object.prototype.hasOwnProperty.call(value, '_isAMomentObject');
}

var api = {
  moment: null,
  isMoment: isMoment
};

module.exports = api;

},{}],26:[function(_dereq_,module,exports){
'use strict';

function noop () {}

module.exports = noop;

},{}],27:[function(_dereq_,module,exports){
'use strict';

var momentum = _dereq_('./momentum');

function raw (date, format) {
  if (typeof date === 'string') {
    return momentum.moment(date, format);
  }
  if (Object.prototype.toString.call(date) === '[object Date]') {
    return momentum.moment(date);
  }
  if (momentum.isMoment(date)) {
    return date.clone();
  }
}

function parse (date, format) {
  var m = raw(date, typeof format === 'string' ? format : null);
  return m && m.isValid() ? m : null;
}

module.exports = parse;

},{"./momentum":25}],28:[function(_dereq_,module,exports){
if (!Array.prototype.every) {
  Array.prototype.every = function (fn, ctx) {
    var context, i;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var source = Object(this);
    var len = source.length >>> 0;

    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function');
    }

    if (arguments.length > 1) {
      context = ctx;
    }

    i = 0;

    while (i < len) {
      if (i in source) {
        var test = fn.call(context, source[i], i, source);
        if (!test) {
          return false;
        }
      }
      i++;
    }
    return true;
  };
}

},{}],29:[function(_dereq_,module,exports){
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fn, ctx) {
    var f = [];
    this.forEach(function (v, i, t) {
      if (fn.call(ctx, v, i, t)) { f.push(v); }
    }, ctx);
    return f;
  };
}

},{}],30:[function(_dereq_,module,exports){
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fn, ctx) {
    if (this === void 0 || this === null || typeof fn !== 'function') {
      throw new TypeError();
    }
    var t = this;
    var len = t.length;
    for (var i = 0; i < len; i++) {
      if (i in t) { fn.call(ctx, t[i], i, t); }
    }
  };
}

},{}],31:[function(_dereq_,module,exports){
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (what, start) {
    if (this === undefined || this === null) {
      throw new TypeError();
    }
    var length = this.length;
    start = +start || 0;
    if (Math.abs(start) === Infinity) {
      start = 0;
    } else if (start < 0) {
      start += length;
      if (start < 0) { start = 0; }
    }
    for (; start < length; start++) {
      if (this[start] === what) {
        return start;
      }
    }
    return -1;
  };
}

},{}],32:[function(_dereq_,module,exports){
Array.isArray || (Array.isArray = function (a) {
  return '' + a !== a && Object.prototype.toString.call(a) === '[object Array]';
});

},{}],33:[function(_dereq_,module,exports){
if (!Array.prototype.map) {
  Array.prototype.map = function (fn, ctx) {
    var context, result, i;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var source = Object(this);
    var len = source.length >>> 0;

    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function');
    }

    if (arguments.length > 1) {
      context = ctx;
    }

    result = new Array(len);
    i = 0;

    while (i < len) {
      if (i in source) {
        result[i] = fn.call(context, source[i], i, source);
      }
      i++;
    }
    return result;
  };
}

},{}],34:[function(_dereq_,module,exports){
if (!Array.prototype.some) {
  Array.prototype.some = function (fn, ctx) {
    var context, i;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var source = Object(this);
    var len = source.length >>> 0;

    if (typeof fn !== 'function') {
      throw new TypeError(fn + ' is not a function');
    }

    if (arguments.length > 1) {
      context = ctx;
    }

    i = 0;

    while (i < len) {
      if (i in source) {
        var test = fn.call(context, source[i], i, source);
        if (test) {
          return true;
        }
      }
      i++;
    }
    return false;
  };
}

},{}],35:[function(_dereq_,module,exports){
if (!Function.prototype.bind) {
  Function.prototype.bind = function (context) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    var curried = Array.prototype.slice.call(arguments, 1);
    var original = this;
    var NoOp = function () {};
    var bound = function () {
      var ctx = this instanceof NoOp && context ? this : context;
      var args = curried.concat(Array.prototype.slice.call(arguments));
      return original.apply(ctx, args);
    };
    NoOp.prototype = this.prototype;
    bound.prototype = new NoOp();
    return bound;
  };
}

},{}],36:[function(_dereq_,module,exports){
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

},{}],37:[function(_dereq_,module,exports){
'use strict';

// these are only required for IE < 9
// maybe move to IE-specific distro?
_dereq_('./polyfills/function.bind');
_dereq_('./polyfills/array.foreach');
_dereq_('./polyfills/array.map');
_dereq_('./polyfills/array.filter');
_dereq_('./polyfills/array.isarray');
_dereq_('./polyfills/array.indexof');
_dereq_('./polyfills/array.every');
_dereq_('./polyfills/array.some');
_dereq_('./polyfills/string.trim');

var core = _dereq_('./core');
var index = _dereq_('./index');
var use = _dereq_('./use');

core.use = use.bind(core);
core.find = index.find;
core.val = _dereq_('./validators');

module.exports = core;

},{"./core":17,"./index":21,"./polyfills/array.every":28,"./polyfills/array.filter":29,"./polyfills/array.foreach":30,"./polyfills/array.indexof":31,"./polyfills/array.isarray":32,"./polyfills/array.map":33,"./polyfills/array.some":34,"./polyfills/function.bind":35,"./polyfills/string.trim":36,"./use":40,"./validators":41}],38:[function(_dereq_,module,exports){
(function (global){
var rome = _dereq_('./rome');
var momentum = _dereq_('./momentum');

rome.use(global.moment);

if (momentum.moment === void 0) {
  throw new Error('rome depends on moment.js, you can get it at http://momentjs.com, or you could use the bundled distribution file instead.');
}

module.exports = rome;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./momentum":25,"./rome":37}],39:[function(_dereq_,module,exports){
'use strict';

function text (elem, value) {
  if (arguments.length === 2) {
    elem.innerText = elem.textContent = value;
  }
  return elem.innerText || elem.textContent;
}

module.exports = text;

},{}],40:[function(_dereq_,module,exports){
'use strict';

var momentum = _dereq_('./momentum');

function use (moment) {
  this.moment = momentum.moment = moment;
}

module.exports = use;

},{"./momentum":25}],41:[function(_dereq_,module,exports){
'use strict';

var index = _dereq_('./index');
var parse = _dereq_('./parse');
var association = _dereq_('./association');

function compareBuilder (compare) {
  return function factory (value) {
    var fixed = parse(value);

    return function validate (date) {
      var cal = index.find(value);
      var left = parse(date);
      var right = fixed || cal && cal.getMoment();
      if (!right) {
        return true;
      }
      if (cal) {
        association.add(this, cal);
      }
      return compare(left, right);
    };
  };
}

function rangeBuilder (how, compare) {
  return function factory (start, end) {
    var dates;
    var len = arguments.length;

    if (Array.isArray(start)) {
      dates = start;
    } else {
      if (len === 1) {
        dates = [start];
      } else if (len === 2) {
        dates = [[start, end]];
      }
    }

    return function validate (date) {
      return dates.map(expand.bind(this))[how](compare.bind(this, date));
    };

    function expand (value) {
      var start, end;
      var cal = index.find(value);
      if (cal) {
        start = end = cal.getMoment();
      } else if (Array.isArray(value)) {
        start = value[0]; end = value[1];
      } else {
        start = end = value;
      }
      if (cal) {
        association.add(cal, this);
      }
      return {
        start: parse(start).startOf('day').toDate(),
        end: parse(end).endOf('day').toDate()
      };
    }
  };
}

var afterEq  = compareBuilder(function (left, right) { return left >= right; });
var after    = compareBuilder(function (left, right) { return left  > right; });
var beforeEq = compareBuilder(function (left, right) { return left <= right; });
var before   = compareBuilder(function (left, right) { return left  < right; });

var except   = rangeBuilder('every', function (left, right) { return right.start  > left || right.end  < left; });
var only     = rangeBuilder('some',  function (left, right) { return right.start <= left && right.end >= left; });

module.exports = {
  afterEq: afterEq,
  after: after,
  beforeEq: beforeEq,
  before: before,
  except: except,
  only: only
};

},{"./association":13,"./index":21,"./parse":27}]},{},[38])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWNvL2Rldi9yb21lL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvbm9kZV9tb2R1bGVzL2NvbnRyYS5lbWl0dGVyL2luZGV4LmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvbm9kZV9tb2R1bGVzL2NvbnRyYS5lbWl0dGVyL3NyYy9jb250cmEuZW1pdHRlci5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVib3VuY2UvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVib3VuY2Uvbm9kZV9tb2R1bGVzL2xvZGFzaC5ub3cvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guZGVib3VuY2Uvbm9kZV9tb2R1bGVzL2xvZGFzaC5ub3cvbm9kZV9tb2R1bGVzL2xvZGFzaC5faXNuYXRpdmUvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL25vZGVfbW9kdWxlcy9sb2Rhc2guaXNmdW5jdGlvbi9pbmRleC5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9pbmRleC5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9ub2RlX21vZHVsZXMvbG9kYXNoLl9vYmplY3R0eXBlcy9pbmRleC5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL25vZGVfbW9kdWxlcy9yYWYvaW5kZXguanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9ub2RlX21vZHVsZXMvcmFmL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9hc3NvY2lhdGlvbi5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9jYWxlbmRhci5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9jbGFzc2VzLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL2Nsb25lLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL2NvcmUuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvZGVmYXVsdHMuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvZG9tLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL2V2ZW50cy5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9pbmxpbmUuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvaW5wdXQuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvaXNJbnB1dC5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9tb21lbnR1bS5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9ub29wLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3BhcnNlLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5ldmVyeS5qcyIsIi9Vc2Vycy9uaWNvL2Rldi9yb21lL3NyYy9wb2x5ZmlsbHMvYXJyYXkuZmlsdGVyLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5mb3JlYWNoLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5pbmRleG9mLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5pc2FycmF5LmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3BvbHlmaWxscy9hcnJheS5tYXAuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvcG9seWZpbGxzL2FycmF5LnNvbWUuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvcG9seWZpbGxzL2Z1bmN0aW9uLmJpbmQuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvcG9seWZpbGxzL3N0cmluZy50cmltLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3JvbWUuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvcm9tZS5zdGFuZGFsb25lLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3RleHQuanMiLCIvVXNlcnMvbmljby9kZXYvcm9tZS9zcmMvdXNlLmpzIiwiL1VzZXJzL25pY28vZGV2L3JvbWUvc3JjL3ZhbGlkYXRvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9zcmMvY29udHJhLmVtaXR0ZXIuanMnKTtcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4oZnVuY3Rpb24gKHJvb3QsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIHVuZGVmID0gJycgKyB1bmRlZmluZWQ7XG4gIGZ1bmN0aW9uIGF0b2EgKGEsIG4pIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGEsIG4pOyB9XG4gIGZ1bmN0aW9uIGRlYm91bmNlIChmbiwgYXJncywgY3R4KSB7IGlmICghZm4pIHsgcmV0dXJuOyB9IHRpY2soZnVuY3Rpb24gcnVuICgpIHsgZm4uYXBwbHkoY3R4IHx8IG51bGwsIGFyZ3MgfHwgW10pOyB9KTsgfVxuXG4gIC8vIGNyb3NzLXBsYXRmb3JtIHRpY2tlclxuICB2YXIgc2kgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nLCB0aWNrO1xuICBpZiAoc2kpIHtcbiAgICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH07XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09IHVuZGVmICYmIHByb2Nlc3MubmV4dFRpY2spIHtcbiAgICB0aWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgfSBlbHNlIHtcbiAgICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldFRpbWVvdXQoZm4sIDApOyB9O1xuICB9XG5cbiAgZnVuY3Rpb24gX2VtaXR0ZXIgKHRoaW5nLCBvcHRpb25zKSB7XG4gICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHZhciBldnQgPSB7fTtcbiAgICBpZiAodGhpbmcgPT09IHVuZGVmaW5lZCkgeyB0aGluZyA9IHt9OyB9XG4gICAgdGhpbmcub24gPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICAgIGlmICghZXZ0W3R5cGVdKSB7XG4gICAgICAgIGV2dFt0eXBlXSA9IFtmbl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBldnRbdHlwZV0ucHVzaChmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpbmc7XG4gICAgfTtcbiAgICB0aGluZy5vbmNlID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgICBmbi5fb25jZSA9IHRydWU7IC8vIHRoaW5nLm9mZihmbikgc3RpbGwgd29ya3MhXG4gICAgICB0aGluZy5vbih0eXBlLCBmbik7XG4gICAgICByZXR1cm4gdGhpbmc7XG4gICAgfTtcbiAgICB0aGluZy5vZmYgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIGlmIChjID09PSAxKSB7XG4gICAgICAgIGRlbGV0ZSBldnRbdHlwZV07XG4gICAgICB9IGVsc2UgaWYgKGMgPT09IDApIHtcbiAgICAgICAgZXZ0ID0ge307XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZXQgPSBldnRbdHlwZV07XG4gICAgICAgIGlmICghZXQpIHsgcmV0dXJuIHRoaW5nOyB9XG4gICAgICAgIGV0LnNwbGljZShldC5pbmRleE9mKGZuKSwgMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpbmc7XG4gICAgfTtcbiAgICB0aGluZy5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhdG9hKGFyZ3VtZW50cyk7XG4gICAgICB2YXIgdHlwZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICAgIHZhciBldCA9IGV2dFt0eXBlXTtcbiAgICAgIGlmICh0eXBlID09PSAnZXJyb3InICYmIG9wdHMudGhyb3dzICE9PSBmYWxzZSAmJiAhZXQpIHsgdGhyb3cgYXJncy5sZW5ndGggPT09IDEgPyBhcmdzWzBdIDogYXJnczsgfVxuICAgICAgaWYgKCFldCkgeyByZXR1cm4gdGhpbmc7IH1cbiAgICAgIGV2dFt0eXBlXSA9IGV0LmZpbHRlcihmdW5jdGlvbiBlbWl0dGVyIChsaXN0ZW4pIHtcbiAgICAgICAgaWYgKG9wdHMuYXN5bmMpIHsgZGVib3VuY2UobGlzdGVuLCBhcmdzLCB0aGluZyk7IH0gZWxzZSB7IGxpc3Rlbi5hcHBseSh0aGluZywgYXJncyk7IH1cbiAgICAgICAgcmV0dXJuICFsaXN0ZW4uX29uY2U7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGluZztcbiAgICB9O1xuICAgIHJldHVybiB0aGluZztcbiAgfVxuXG4gIC8vIGNyb3NzLXBsYXRmb3JtIGV4cG9ydFxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gdW5kZWYgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9lbWl0dGVyO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuY29udHJhID0gcm9vdC5jb250cmEgfHwge307XG4gICAgcm9vdC5jb250cmEuZW1pdHRlciA9IF9lbWl0dGVyO1xuICB9XG59KSh0aGlzKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJGV2FBU0hcIikpIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJvdW5jZScpLFxuICAgIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0Jyk7XG5cbi8qKiBVc2VkIGFzIGFuIGludGVybmFsIGBfLmRlYm91bmNlYCBvcHRpb25zIG9iamVjdCAqL1xudmFyIGRlYm91bmNlT3B0aW9ucyA9IHtcbiAgJ2xlYWRpbmcnOiBmYWxzZSxcbiAgJ21heFdhaXQnOiAwLFxuICAndHJhaWxpbmcnOiBmYWxzZVxufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBleGVjdXRlZCwgd2lsbCBvbmx5IGNhbGwgdGhlIGBmdW5jYCBmdW5jdGlvblxuICogYXQgbW9zdCBvbmNlIHBlciBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvXG4gKiBpbmRpY2F0ZSB0aGF0IGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZVxuICogb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbFxuICogcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGNhbGwuXG4gKlxuICogTm90ZTogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCBgZnVuY2Agd2lsbCBiZSBjYWxsZWRcbiAqIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gaXNcbiAqIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gKiBAcGFyYW0ge251bWJlcn0gd2FpdCBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBleGVjdXRpb25zIHRvLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIGF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmdcbiAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApO1xuICogalF1ZXJ5KHdpbmRvdykub24oJ3Njcm9sbCcsIHRocm90dGxlZCk7XG4gKlxuICogLy8gZXhlY3V0ZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzXG4gKiBqUXVlcnkoJy5pbnRlcmFjdGl2ZScpLm9uKCdjbGljaycsIF8udGhyb3R0bGUocmVuZXdUb2tlbiwgMzAwMDAwLCB7XG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gIH1cbiAgaWYgKG9wdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgbGVhZGluZyA9IGZhbHNlO1xuICB9IGVsc2UgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/IG9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgfVxuICBkZWJvdW5jZU9wdGlvbnMubGVhZGluZyA9IGxlYWRpbmc7XG4gIGRlYm91bmNlT3B0aW9ucy5tYXhXYWl0ID0gd2FpdDtcbiAgZGVib3VuY2VPcHRpb25zLnRyYWlsaW5nID0gdHJhaWxpbmc7XG5cbiAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGRlYm91bmNlT3B0aW9ucyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdsb2Rhc2guaXNmdW5jdGlvbicpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgbm93ID0gcmVxdWlyZSgnbG9kYXNoLm5vdycpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgZGVsYXkgdGhlIGV4ZWN1dGlvbiBvZiBgZnVuY2AgdW50aWwgYWZ0ZXJcbiAqIGB3YWl0YCBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgaXQgd2FzIGludm9rZWQuXG4gKiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvIGluZGljYXRlIHRoYXQgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uXG4gKiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFN1YnNlcXVlbnQgY2FsbHNcbiAqIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgY2FsbC5cbiAqXG4gKiBOb3RlOiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgIGBmdW5jYCB3aWxsIGJlIGNhbGxlZFxuICogb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBpc1xuICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF0gVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGNhbGxlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIGF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXhcbiAqIHZhciBsYXp5TGF5b3V0ID0gXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCk7XG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgbGF6eUxheW91dCk7XG4gKlxuICogLy8gZXhlY3V0ZSBgc2VuZE1haWxgIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHNcbiAqIGpRdWVyeSgnI3Bvc3Rib3gnKS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSk7XG4gKlxuICogLy8gZW5zdXJlIGBiYXRjaExvZ2AgaXMgZXhlY3V0ZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHNcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7XG4gKiAgICdtYXhXYWl0JzogMTAwMFxuICogfSwgZmFsc2UpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBhcmdzLFxuICAgICAgbWF4VGltZW91dElkLFxuICAgICAgcmVzdWx0LFxuICAgICAgc3RhbXAsXG4gICAgICB0aGlzQXJnLFxuICAgICAgdGltZW91dElkLFxuICAgICAgdHJhaWxpbmdDYWxsLFxuICAgICAgbGFzdENhbGxlZCA9IDAsXG4gICAgICBtYXhXYWl0ID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgfVxuICB3YWl0ID0gbmF0aXZlTWF4KDAsIHdhaXQpIHx8IDA7XG4gIGlmIChvcHRpb25zID09PSB0cnVlKSB7XG4gICAgdmFyIGxlYWRpbmcgPSB0cnVlO1xuICAgIHRyYWlsaW5nID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heFdhaXQgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucyAmJiAobmF0aXZlTWF4KHdhaXQsIG9wdGlvbnMubWF4V2FpdCkgfHwgMCk7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgdmFyIGRlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3coKSAtIHN0YW1wKTtcbiAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcbiAgICAgIGlmIChtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG1heFRpbWVvdXRJZCk7XG4gICAgICB9XG4gICAgICB2YXIgaXNDYWxsZWQgPSB0cmFpbGluZ0NhbGw7XG4gICAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoaXNDYWxsZWQpIHtcbiAgICAgICAgbGFzdENhbGxlZCA9IG5vdygpO1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgcmVtYWluaW5nKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1heERlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gICAgbWF4VGltZW91dElkID0gdGltZW91dElkID0gdHJhaWxpbmdDYWxsID0gdW5kZWZpbmVkO1xuICAgIGlmICh0cmFpbGluZyB8fCAobWF4V2FpdCAhPT0gd2FpdCkpIHtcbiAgICAgIGxhc3RDYWxsZWQgPSBub3coKTtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgc3RhbXAgPSBub3coKTtcbiAgICB0aGlzQXJnID0gdGhpcztcbiAgICB0cmFpbGluZ0NhbGwgPSB0cmFpbGluZyAmJiAodGltZW91dElkIHx8ICFsZWFkaW5nKTtcblxuICAgIGlmIChtYXhXYWl0ID09PSBmYWxzZSkge1xuICAgICAgdmFyIGxlYWRpbmdDYWxsID0gbGVhZGluZyAmJiAhdGltZW91dElkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIW1heFRpbWVvdXRJZCAmJiAhbGVhZGluZykge1xuICAgICAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgICB9XG4gICAgICB2YXIgcmVtYWluaW5nID0gbWF4V2FpdCAtIChzdGFtcCAtIGxhc3RDYWxsZWQpLFxuICAgICAgICAgIGlzQ2FsbGVkID0gcmVtYWluaW5nIDw9IDA7XG5cbiAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICBpZiAobWF4VGltZW91dElkKSB7XG4gICAgICAgICAgbWF4VGltZW91dElkID0gY2xlYXJUaW1lb3V0KG1heFRpbWVvdXRJZCk7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIW1heFRpbWVvdXRJZCkge1xuICAgICAgICBtYXhUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KG1heERlbGF5ZWQsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc0NhbGxlZCAmJiB0aW1lb3V0SWQpIHtcbiAgICAgIHRpbWVvdXRJZCA9IGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgICBlbHNlIGlmICghdGltZW91dElkICYmIHdhaXQgIT09IG1heFdhaXQpIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgd2FpdCk7XG4gICAgfVxuICAgIGlmIChsZWFkaW5nQ2FsbCkge1xuICAgICAgaXNDYWxsZWQgPSB0cnVlO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICB9XG4gICAgaWYgKGlzQ2FsbGVkICYmICF0aW1lb3V0SWQgJiYgIW1heFRpbWVvdXRJZCkge1xuICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYm91bmNlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5faXNuYXRpdmUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBVbml4IGVwb2NoXG4gKiAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgc3RhbXAgPSBfLm5vdygpO1xuICogXy5kZWZlcihmdW5jdGlvbigpIHsgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTsgfSk7XG4gKiAvLyA9PiBsb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBmdW5jdGlvbiB0byBiZSBjYWxsZWRcbiAqL1xudmFyIG5vdyA9IGlzTmF0aXZlKG5vdyA9IERhdGUubm93KSAmJiBub3cgfHwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbm93O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUgKi9cbnZhciByZU5hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBTdHJpbmcodG9TdHJpbmcpXG4gICAgLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJylcbiAgICAucmVwbGFjZSgvdG9TdHJpbmd8IGZvciBbXlxcXV0rL2csICcuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNOYXRpdmUodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nICYmIHJlTmF0aXZlLnRlc3QodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmF0aXZlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgLy8gY2hlY2sgaWYgdGhlIHZhbHVlIGlzIHRoZSBFQ01BU2NyaXB0IGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0XG4gIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAvLyBhbmQgYXZvaWQgYSBWOCBidWdcbiAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MVxuICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBPYmplY3QgKi9cbnZhciBvYmplY3RUeXBlcyA9IHtcbiAgJ2Jvb2xlYW4nOiBmYWxzZSxcbiAgJ2Z1bmN0aW9uJzogdHJ1ZSxcbiAgJ29iamVjdCc6IHRydWUsXG4gICdudW1iZXInOiBmYWxzZSxcbiAgJ3N0cmluZyc6IGZhbHNlLFxuICAndW5kZWZpbmVkJzogZmFsc2Vcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VHlwZXM7XG4iLCJ2YXIgbm93ID0gcmVxdWlyZSgncGVyZm9ybWFuY2Utbm93JylcbiAgLCBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHt9IDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IGdsb2JhbFsncmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgY2FmID0gZ2xvYmFsWydjYW5jZWwnICsgc3VmZml4XSB8fCBnbG9iYWxbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXJhZjsgaSsrKSB7XG4gIHJhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ1JlcXVlc3QnICsgc3VmZml4XVxuICBjYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWwnICsgc3VmZml4XVxuICAgICAgfHwgZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICghY3BbaV0uY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgbmV4dClcbiAgICB9XG4gICAgcXVldWUucHVzaCh7XG4gICAgICBoYW5kbGU6ICsraWQsXG4gICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICBjYW5jZWxsZWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIGNhZiA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYocXVldWVbaV0uaGFuZGxlID09PSBoYW5kbGUpIHtcbiAgICAgICAgcXVldWVbaV0uY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgcmV0dXJuIHJhZi5hcHBseShnbG9iYWwsIGFyZ3VtZW50cylcbn1cbm1vZHVsZS5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICBjYWYuYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpXG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXBlcmZvcm1hbmNlLW5vdy5tYXBcbiovXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiRldhQVNIXCIpKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzSW5wdXQgPSByZXF1aXJlKCcuL2lzSW5wdXQnKTtcbnZhciBiaW5kaW5ncyA9IHt9O1xuXG5mdW5jdGlvbiBoYXMgKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHZhciBiaW5kaW5nID0gYmluZGluZ3Nbc291cmNlLmlkXTtcbiAgcmV0dXJuIGJpbmRpbmcgJiYgYmluZGluZ1t0YXJnZXQuaWRdO1xufVxuXG5mdW5jdGlvbiBpbnNlcnQgKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHZhciBiaW5kaW5nID0gYmluZGluZ3Nbc291cmNlLmlkXTtcbiAgaWYgKCFiaW5kaW5nKSB7XG4gICAgYmluZGluZyA9IGJpbmRpbmdzW3NvdXJjZS5pZF0gPSB7fTtcbiAgfVxuICB2YXIgaW52YWxpZGF0ZSA9IGludmFsaWRhdG9yKHRhcmdldCk7XG4gIGJpbmRpbmdbdGFyZ2V0LmlkXSA9IGludmFsaWRhdGU7XG4gIHNvdXJjZS5vbignZGF0YScsIGludmFsaWRhdGUpO1xuICBzb3VyY2Uub24oJ2Rlc3Ryb3llZCcsIHJlbW92ZS5iaW5kKG51bGwsIHNvdXJjZSwgdGFyZ2V0KSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZSAoc291cmNlLCB0YXJnZXQpIHtcbiAgdmFyIGJpbmRpbmcgPSBiaW5kaW5nc1tzb3VyY2UuaWRdO1xuICBpZiAoIWJpbmRpbmcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGludmFsaWRhdGUgPSBiaW5kaW5nW3RhcmdldC5pZF07XG4gIHNvdXJjZS5vZmYoJ2RhdGEnLCBpbnZhbGlkYXRlKTtcbiAgZGVsZXRlIGJpbmRpbmdbdGFyZ2V0LmlkXTtcbn1cblxuZnVuY3Rpb24gaW52YWxpZGF0b3IgKHRhcmdldCkge1xuICByZXR1cm4gZnVuY3Rpb24gaW52YWxpZGF0ZSAoKSB7XG4gICAgdGFyZ2V0LnJlZnJlc2goKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkIChzb3VyY2UsIHRhcmdldCkge1xuICBpZiAoaXNJbnB1dCh0YXJnZXQuYXNzb2NpYXRlZCkgfHwgaGFzKHNvdXJjZSwgdGFyZ2V0KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbnNlcnQoc291cmNlLCB0YXJnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkOiBhZGQsXG4gIHJlbW92ZTogcmVtb3ZlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW1pdHRlciA9IHJlcXVpcmUoJ2NvbnRyYS5lbWl0dGVyJyk7XG52YXIgcmFmID0gcmVxdWlyZSgncmFmJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi9kb20nKTtcbnZhciB0ZXh0ID0gcmVxdWlyZSgnLi90ZXh0Jyk7XG52YXIgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuL2Nsb25lJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG52YXIgbm9vcCA9IHJlcXVpcmUoJy4vbm9vcCcpO1xudmFyIG5vO1xuXG5mdW5jdGlvbiBjYWxlbmRhciAoY2FsZW5kYXJPcHRpb25zKSB7XG4gIHZhciBvO1xuICB2YXIgYXBpID0gZW1pdHRlcih7fSk7XG4gIHZhciByZWY7XG4gIHZhciByZWZDYWw7XG4gIHZhciBjb250YWluZXI7XG4gIHZhciByZW5kZXJlZCA9IGZhbHNlO1xuXG4gIC8vIGRhdGUgdmFyaWFibGVzXG4gIHZhciBtb250aE9mZnNldEF0dHJpYnV0ZSA9ICdkYXRhLXJvbWUtb2Zmc2V0JztcbiAgdmFyIHdlZWtkYXlzID0gbW9tZW50dW0ubW9tZW50LndlZWtkYXlzTWluKCk7XG4gIHZhciB3ZWVrZGF5Q291bnQgPSB3ZWVrZGF5cy5sZW5ndGg7XG4gIHZhciBjYWxlbmRhck1vbnRocyA9IFtdO1xuICB2YXIgbGFzdFllYXI7XG4gIHZhciBsYXN0TW9udGg7XG4gIHZhciBsYXN0RGF5O1xuICB2YXIgbGFzdERheUVsZW1lbnQ7XG4gIHZhciBkYXRld3JhcHBlcjtcbiAgdmFyIGJhY2s7XG4gIHZhciBuZXh0O1xuXG4gIC8vIHRpbWUgdmFyaWFibGVzXG4gIHZhciBzZWNvbmRzSW5EYXkgPSA2MCAqIDYwICogMjQ7XG4gIHZhciB0aW1lO1xuICB2YXIgdGltZWxpc3Q7XG5cbiAgZGVzdHJveSh0cnVlKTtcblxuICByYWYoZnVuY3Rpb24gKCkge1xuICAgIGluaXQoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbmFwaSAoKSB7IHJldHVybiBhcGk7IH1cblxuICBmdW5jdGlvbiBpbml0IChpbml0T3B0aW9ucykge1xuICAgIG8gPSBkZWZhdWx0cyhpbml0T3B0aW9ucyB8fCBjYWxlbmRhck9wdGlvbnMsIGFwaSk7XG4gICAgaWYgKCFjb250YWluZXIpIHsgY29udGFpbmVyID0gZG9tKHsgY2xhc3NOYW1lOiBvLnN0eWxlcy5jb250YWluZXIgfSk7IH1cbiAgICBsYXN0TW9udGggPSBubztcbiAgICBsYXN0WWVhciA9IG5vO1xuICAgIGxhc3REYXkgPSBubztcbiAgICBsYXN0RGF5RWxlbWVudCA9IG5vO1xuICAgIG8uYXBwZW5kVG8uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICAgIHJlbW92ZUNoaWxkcmVuKGNvbnRhaW5lcik7XG4gICAgcmVuZGVyZWQgPSBmYWxzZTtcbiAgICByZWYgPSBvLmluaXRpYWxWYWx1ZSA/IG8uaW5pdGlhbFZhbHVlIDogbW9tZW50dW0ubW9tZW50KCk7XG4gICAgcmVmQ2FsID0gcmVmLmNsb25lKCk7XG5cbiAgICBhcGkuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIGFwaS5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICBhcGkuZGVzdHJveSA9IGRlc3Ryb3kuYmluZChhcGksIGZhbHNlKTtcbiAgICBhcGkuZW1pdFZhbHVlcyA9IGVtaXRWYWx1ZXM7XG4gICAgYXBpLmdldERhdGUgPSBnZXREYXRlO1xuICAgIGFwaS5nZXREYXRlU3RyaW5nID0gZ2V0RGF0ZVN0cmluZztcbiAgICBhcGkuZ2V0TW9tZW50ID0gZ2V0TW9tZW50O1xuICAgIGFwaS5oaWRlID0gaGlkZTtcbiAgICBhcGkub3B0aW9ucyA9IGNoYW5nZU9wdGlvbnM7XG4gICAgYXBpLm9wdGlvbnMucmVzZXQgPSByZXNldE9wdGlvbnM7XG4gICAgYXBpLnJlZnJlc2ggPSByZWZyZXNoO1xuICAgIGFwaS5yZXN0b3JlID0gbmFwaTtcbiAgICBhcGkuc2V0VmFsdWUgPSBzZXRWYWx1ZTtcbiAgICBhcGkuc2hvdyA9IHNob3c7XG5cbiAgICBoaWRlQ2FsZW5kYXIoKTtcbiAgICBldmVudExpc3RlbmluZygpO1xuXG4gICAgYXBpLmVtaXQoJ3JlYWR5JywgY2xvbmUobykpO1xuXG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3kgKHNpbGVudCkge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgaWYgKG8pIHtcbiAgICAgIGV2ZW50TGlzdGVuaW5nKHRydWUpO1xuICAgIH1cblxuICAgIGFwaS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIGFwaS5kZXN0cm95ID0gbmFwaTtcbiAgICBhcGkuZW1pdFZhbHVlcyA9IG5hcGk7XG4gICAgYXBpLmdldERhdGUgPSBub29wO1xuICAgIGFwaS5nZXREYXRlU3RyaW5nID0gbm9vcDtcbiAgICBhcGkuZ2V0TW9tZW50ID0gbm9vcDtcbiAgICBhcGkuaGlkZSA9IG5hcGk7XG4gICAgYXBpLm9wdGlvbnMgPSBuYXBpO1xuICAgIGFwaS5vcHRpb25zLnJlc2V0ID0gbmFwaTtcbiAgICBhcGkucmVmcmVzaCA9IG5hcGk7XG4gICAgYXBpLnJlc3RvcmUgPSBpbml0O1xuICAgIGFwaS5zZXRWYWx1ZSA9IG5hcGk7XG4gICAgYXBpLnNob3cgPSBuYXBpO1xuXG4gICAgaWYgKHNpbGVudCAhPT0gdHJ1ZSkge1xuICAgICAgYXBpLmVtaXQoJ2Rlc3Ryb3llZCcpO1xuICAgIH1cbiAgICBhcGkub2ZmKCk7XG5cbiAgICByZXR1cm4gYXBpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRMaXN0ZW5pbmcgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgaWYgKG8uYXV0b0hpZGVPbkJsdXIpIHsgZXZlbnRzW29wXShkb2N1bWVudCwgJ2ZvY3VzaW4nLCBoaWRlT25CbHVyKTsgfVxuICAgIGlmIChvLmF1dG9IaWRlT25DbGljaykgeyBldmVudHNbb3BdKGRvY3VtZW50LCAnY2xpY2snLCBoaWRlT25DbGljayk7IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZU9wdGlvbnMgKG9wdGlvbnMpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNsb25lKG8pO1xuICAgIH1cbiAgICBkZXN0cm95KCk7XG4gICAgaW5pdChvcHRpb25zKTtcbiAgICByZXR1cm4gYXBpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRPcHRpb25zICgpIHtcbiAgICByZXR1cm4gY2hhbmdlT3B0aW9ucyh7fSk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIgKCkge1xuICAgIGlmIChyZW5kZXJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZW5kZXJlZCA9IHRydWU7XG4gICAgcmVuZGVyRGF0ZXMoKTtcbiAgICByZW5kZXJUaW1lKCk7XG4gICAgYXBpLmVtaXQoJ3JlbmRlcicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyRGF0ZXMgKCkge1xuICAgIGlmICghby5kYXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpO1xuICAgIGNhbGVuZGFyTW9udGhzID0gW107XG5cbiAgICBkYXRld3JhcHBlciA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMuZGF0ZSwgcGFyZW50OiBjb250YWluZXIgfSk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgby5tb250aHNJbkNhbGVuZGFyOyBpKyspIHtcbiAgICAgIHJlbmRlck1vbnRoKGkpO1xuICAgIH1cblxuICAgIGV2ZW50cy5hZGQoYmFjaywgJ2NsaWNrJywgc3VidHJhY3RNb250aCk7XG4gICAgZXZlbnRzLmFkZChuZXh0LCAnY2xpY2snLCBhZGRNb250aCk7XG4gICAgZXZlbnRzLmFkZChkYXRld3JhcHBlciwgJ2NsaWNrJywgcGlja0RheSk7XG5cbiAgICBmdW5jdGlvbiByZW5kZXJNb250aCAoaSkge1xuICAgICAgdmFyIG1vbnRoID0gZG9tKHsgY2xhc3NOYW1lOiBvLnN0eWxlcy5tb250aCwgcGFyZW50OiBkYXRld3JhcHBlciB9KTtcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIGJhY2sgPSBkb20oeyB0eXBlOiAnYnV0dG9uJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5iYWNrLCBwYXJlbnQ6IG1vbnRoIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGkgPT09IG8ubW9udGhzSW5DYWxlbmRhciAtMSkge1xuICAgICAgICBuZXh0ID0gZG9tKHsgdHlwZTogJ2J1dHRvbicsIGNsYXNzTmFtZTogby5zdHlsZXMubmV4dCwgcGFyZW50OiBtb250aCB9KTtcbiAgICAgIH1cbiAgICAgIHZhciBsYWJlbCA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMubW9udGhMYWJlbCwgcGFyZW50OiBtb250aCB9KTtcbiAgICAgIHZhciBkYXRlID0gZG9tKHsgdHlwZTogJ3RhYmxlJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlUYWJsZSwgcGFyZW50OiBtb250aCB9KTtcbiAgICAgIHZhciBkYXRlaGVhZCA9IGRvbSh7IHR5cGU6ICd0aGVhZCcsIGNsYXNzTmFtZTogby5zdHlsZXMuZGF5SGVhZCwgcGFyZW50OiBkYXRlIH0pO1xuICAgICAgdmFyIGRhdGVoZWFkcm93ID0gZG9tKHsgdHlwZTogJ3RyJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlSb3csIHBhcmVudDogZGF0ZWhlYWQgfSk7XG4gICAgICB2YXIgZGF0ZWJvZHkgPSBkb20oeyB0eXBlOiAndGJvZHknLCBjbGFzc05hbWU6IG8uc3R5bGVzLmRheUJvZHksIHBhcmVudDogZGF0ZSB9KTtcbiAgICAgIHZhciBqO1xuXG4gICAgICBmb3IgKGogPSAwOyBqIDwgd2Vla2RheUNvdW50OyBqKyspIHtcbiAgICAgICAgZG9tKHsgdHlwZTogJ3RoJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlIZWFkRWxlbSwgcGFyZW50OiBkYXRlaGVhZHJvdywgdGV4dDogd2Vla2RheXNbd2Vla2RheShqKV0gfSk7XG4gICAgICB9XG5cbiAgICAgIGRhdGVib2R5LnNldEF0dHJpYnV0ZShtb250aE9mZnNldEF0dHJpYnV0ZSwgaSk7XG4gICAgICBjYWxlbmRhck1vbnRocy5wdXNoKHtcbiAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICBib2R5OiBkYXRlYm9keVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyVGltZSAoKSB7XG4gICAgaWYgKCFvLnRpbWUgfHwgIW8udGltZUludGVydmFsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1ld3JhcHBlciA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMudGltZSwgcGFyZW50OiBjb250YWluZXIgfSk7XG4gICAgdGltZSA9IGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMuc2VsZWN0ZWRUaW1lLCBwYXJlbnQ6IHRpbWV3cmFwcGVyLCB0ZXh0OiByZWYuZm9ybWF0KG8udGltZUZvcm1hdCkgfSk7XG4gICAgZXZlbnRzLmFkZCh0aW1lLCAnY2xpY2snLCB0b2dnbGVUaW1lTGlzdCk7XG4gICAgdGltZWxpc3QgPSBkb20oeyBjbGFzc05hbWU6IG8uc3R5bGVzLnRpbWVMaXN0LCBwYXJlbnQ6IHRpbWV3cmFwcGVyIH0pO1xuICAgIGV2ZW50cy5hZGQodGltZWxpc3QsICdjbGljaycsIHBpY2tUaW1lKTtcbiAgICB2YXIgbmV4dCA9IG1vbWVudHVtLm1vbWVudCgnMDA6MDA6MDAnLCAnSEg6bW06c3MnKTtcbiAgICB2YXIgbGF0ZXN0ID0gbmV4dC5jbG9uZSgpLmFkZCgxLCAnZGF5cycpO1xuICAgIHdoaWxlIChuZXh0LmlzQmVmb3JlKGxhdGVzdCkpIHtcbiAgICAgIGRvbSh7IGNsYXNzTmFtZTogby5zdHlsZXMudGltZU9wdGlvbiwgcGFyZW50OiB0aW1lbGlzdCwgdGV4dDogbmV4dC5mb3JtYXQoby50aW1lRm9ybWF0KSB9KTtcbiAgICAgIG5leHQuYWRkKG8udGltZUludGVydmFsLCAnc2Vjb25kcycpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdlZWtkYXkgKGluZGV4LCBiYWNrd2FyZHMpIHtcbiAgICB2YXIgZmFjdG9yID0gYmFja3dhcmRzID8gLTEgOiAxO1xuICAgIHZhciBvZmZzZXQgPSBpbmRleCArIG8ud2Vla1N0YXJ0ICogZmFjdG9yO1xuICAgIGlmIChvZmZzZXQgPj0gd2Vla2RheUNvdW50IHx8IG9mZnNldCA8IDApIHtcbiAgICAgIG9mZnNldCArPSB3ZWVrZGF5Q291bnQgKiAtZmFjdG9yO1xuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVZhbGlkVGltZXNPbmx5ICgpIHtcbiAgICBpZiAoIW8udGltZSB8fCAhcmVuZGVyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVzID0gdGltZWxpc3QuY2hpbGRyZW47XG4gICAgdmFyIGxlbmd0aCA9IHRpbWVzLmxlbmd0aDtcbiAgICB2YXIgZGF0ZTtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgaXRlbTtcbiAgICB2YXIgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGl0ZW0gPSB0aW1lc1tpXTtcbiAgICAgIHRpbWUgPSBtb21lbnR1bS5tb21lbnQodGV4dChpdGVtKSwgby50aW1lRm9ybWF0KTtcbiAgICAgIGRhdGUgPSBzZXRUaW1lKHJlZi5jbG9uZSgpLCB0aW1lKTtcbiAgICAgIGl0ZW0uc3R5bGUuZGlzcGxheSA9IGlzSW5SYW5nZShkYXRlLCBmYWxzZSwgby50aW1lVmFsaWRhdG9yKSA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlVGltZUxpc3QgKHNob3cpIHtcbiAgICB2YXIgZGlzcGxheSA9IHR5cGVvZiBzaG93ID09PSAnYm9vbGVhbicgPyBzaG93IDogdGltZWxpc3Quc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnO1xuICAgIGlmIChkaXNwbGF5KSB7XG4gICAgICBzaG93VGltZUxpc3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZVRpbWVMaXN0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvd1RpbWVMaXN0ICgpIHsgaWYgKHRpbWVsaXN0KSB7IHRpbWVsaXN0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOyB9IH1cbiAgZnVuY3Rpb24gaGlkZVRpbWVMaXN0ICgpIHsgaWYgKHRpbWVsaXN0KSB7IHRpbWVsaXN0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH0gfVxuICBmdW5jdGlvbiBzaG93Q2FsZW5kYXIgKCkgeyBjb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snOyBhcGkuZW1pdCgnc2hvdycpOyB9XG4gIGZ1bmN0aW9uIGhpZGVDYWxlbmRhciAoKSB7IGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyBhcGkuZW1pdCgnaGlkZScpOyB9XG5cbiAgZnVuY3Rpb24gc2hvdyAoKSB7XG4gICAgcmVuZGVyKCk7XG4gICAgcmVmcmVzaCgpO1xuICAgIHRvZ2dsZVRpbWVMaXN0KCFvLmRhdGUpO1xuICAgIHNob3dDYWxlbmRhcigpO1xuICAgIHJldHVybiBhcGk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlICgpIHtcbiAgICBoaWRlVGltZUxpc3QoKTtcbiAgICByYWYoaGlkZUNhbGVuZGFyKTtcbiAgICByZXR1cm4gYXBpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlkZUNvbmRpdGlvbmFsbHkgKCkge1xuICAgIGhpZGVUaW1lTGlzdCgpO1xuXG4gICAgdmFyIHBvcyA9IGNsYXNzZXMuY29udGFpbnMoY29udGFpbmVyLCBvLnN0eWxlcy5wb3NpdGlvbmVkKTtcbiAgICBpZiAocG9zKSB7XG4gICAgICByYWYoaGlkZUNhbGVuZGFyKTtcbiAgICB9XG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGVuZGFyRXZlbnRUYXJnZXQgKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKHRhcmdldCA9PT0gYXBpLmFzc29jaWF0ZWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB3aGlsZSAodGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0ID09PSBjb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlT25CbHVyIChlKSB7XG4gICAgaWYgKGNhbGVuZGFyRXZlbnRUYXJnZXQoZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGlkZUNvbmRpdGlvbmFsbHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZGVPbkNsaWNrIChlKSB7XG4gICAgaWYgKGNhbGVuZGFyRXZlbnRUYXJnZXQoZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaGlkZUNvbmRpdGlvbmFsbHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1YnRyYWN0TW9udGggKCkgeyBjaGFuZ2VNb250aCgnc3VidHJhY3QnKTsgfVxuICBmdW5jdGlvbiBhZGRNb250aCAoKSB7IGNoYW5nZU1vbnRoKCdhZGQnKTsgfVxuICBmdW5jdGlvbiBjaGFuZ2VNb250aCAob3ApIHtcbiAgICB2YXIgYm91bmQ7XG4gICAgdmFyIGRpcmVjdGlvbiA9IG9wID09PSAnYWRkJyA/IC0xIDogMTtcbiAgICB2YXIgb2Zmc2V0ID0gby5tb250aHNJbkNhbGVuZGFyICsgZGlyZWN0aW9uICogZ2V0TW9udGhPZmZzZXQobGFzdERheUVsZW1lbnQpO1xuICAgIHJlZkNhbFtvcF0oJ21vbnRocycsIG9mZnNldCk7XG4gICAgYm91bmQgPSBpblJhbmdlKHJlZkNhbC5jbG9uZSgpKTtcbiAgICByZWYgPSBib3VuZCB8fCByZWY7XG4gICAgaWYgKGJvdW5kKSB7IHJlZkNhbCA9IGJvdW5kLmNsb25lKCk7IH1cbiAgICB1cGRhdGUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZSAoc2lsZW50KSB7XG4gICAgdXBkYXRlQ2FsZW5kYXIoKTtcbiAgICB1cGRhdGVUaW1lKCk7XG4gICAgaWYgKHNpbGVudCAhPT0gdHJ1ZSkgeyBlbWl0VmFsdWVzKCk7IH1cbiAgICBkaXNwbGF5VmFsaWRUaW1lc09ubHkoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhbGVuZGFyICgpIHtcbiAgICBpZiAoIW8uZGF0ZSB8fCAhcmVuZGVyZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHkgPSByZWZDYWwueWVhcigpO1xuICAgIHZhciBtID0gcmVmQ2FsLm1vbnRoKCk7XG4gICAgdmFyIGQgPSByZWZDYWwuZGF0ZSgpO1xuICAgIGlmIChkID09PSBsYXN0RGF5ICYmIG0gPT09IGxhc3RNb250aCAmJiB5ID09PSBsYXN0WWVhcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY2FuU3RheSA9IGlzRGlzcGxheWVkKCk7XG4gICAgbGFzdERheSA9IHJlZkNhbC5kYXRlKCk7XG4gICAgbGFzdE1vbnRoID0gcmVmQ2FsLm1vbnRoKCk7XG4gICAgbGFzdFllYXIgPSByZWZDYWwueWVhcigpO1xuICAgIGlmIChjYW5TdGF5KSB7IHVwZGF0ZUNhbGVuZGFyU2VsZWN0aW9uKCk7IHJldHVybjsgfVxuICAgIGNhbGVuZGFyTW9udGhzLmZvckVhY2godXBkYXRlTW9udGgpO1xuICAgIHJlbmRlckFsbERheXMoKTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vbnRoIChtb250aCwgaSkge1xuICAgICAgdmFyIG9mZnNldENhbCA9IHJlZkNhbC5jbG9uZSgpLmFkZChpLCAnbW9udGhzJyk7XG4gICAgICB0ZXh0KG1vbnRoLmxhYmVsLCBvZmZzZXRDYWwuZm9ybWF0KG8ubW9udGhGb3JtYXQpKTtcbiAgICAgIHJlbW92ZUNoaWxkcmVuKG1vbnRoLmJvZHkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhbGVuZGFyU2VsZWN0aW9uICgpIHtcbiAgICB2YXIgZGF5ID0gcmVmQ2FsLmRhdGUoKSAtIDE7XG4gICAgc2VsZWN0RGF5RWxlbWVudChmYWxzZSk7XG4gICAgY2FsZW5kYXJNb250aHMuZm9yRWFjaChmdW5jdGlvbiAoY2FsKSB7XG4gICAgICB2YXIgZGF5cztcbiAgICAgIGlmIChzYW1lQ2FsZW5kYXJNb250aChjYWwuZGF0ZSwgcmVmQ2FsKSkge1xuICAgICAgICBkYXlzID0gY2FzdChjYWwuYm9keS5jaGlsZHJlbikubWFwKGFnZ3JlZ2F0ZSk7XG4gICAgICAgIGRheXMgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBkYXlzKS5maWx0ZXIoaW5zaWRlKTtcbiAgICAgICAgc2VsZWN0RGF5RWxlbWVudChkYXlzW2RheV0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gY2FzdCAobGlrZSkge1xuICAgICAgdmFyIGRlc3QgPSBbXTtcbiAgICAgIHZhciBpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxpa2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVzdC5wdXNoKGxpa2VbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWdncmVnYXRlIChjaGlsZCkge1xuICAgICAgcmV0dXJuIGNhc3QoY2hpbGQuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluc2lkZSAoY2hpbGQpIHtcbiAgICAgIHJldHVybiAhY2xhc3Nlcy5jb250YWlucyhjaGlsZCwgby5zdHlsZXMuZGF5UHJldk1vbnRoKSAmJlxuICAgICAgICAgICAgICFjbGFzc2VzLmNvbnRhaW5zKGNoaWxkLCBvLnN0eWxlcy5kYXlOZXh0TW9udGgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRGlzcGxheWVkICgpIHtcbiAgICByZXR1cm4gY2FsZW5kYXJNb250aHMuc29tZShtYXRjaGVzKTtcblxuICAgIGZ1bmN0aW9uIG1hdGNoZXMgKGNhbCkge1xuICAgICAgaWYgKCFsYXN0WWVhcikgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIHJldHVybiBzYW1lQ2FsZW5kYXJNb250aChjYWwuZGF0ZSwgcmVmQ2FsKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYW1lQ2FsZW5kYXJNb250aCAobGVmdCwgcmlnaHQpIHtcbiAgICByZXR1cm4gbGVmdCAmJiByaWdodCAmJiBsZWZ0LnllYXIoKSA9PT0gcmlnaHQueWVhcigpICYmIGxlZnQubW9udGgoKSA9PT0gcmlnaHQubW9udGgoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVRpbWUgKCkge1xuICAgIGlmICghby50aW1lIHx8ICFyZW5kZXJlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0ZXh0KHRpbWUsIHJlZi5mb3JtYXQoby50aW1lRm9ybWF0KSk7XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0VmFsdWVzICgpIHtcbiAgICBhcGkuZW1pdCgnZGF0YScsIGdldERhdGVTdHJpbmcoKSk7XG4gICAgYXBpLmVtaXQoJ3llYXInLCByZWYueWVhcigpKTtcbiAgICBhcGkuZW1pdCgnbW9udGgnLCByZWYubW9udGgoKSk7XG4gICAgYXBpLmVtaXQoJ2RheScsIHJlZi5kYXkoKSk7XG4gICAgYXBpLmVtaXQoJ3RpbWUnLCByZWYuZm9ybWF0KG8udGltZUZvcm1hdCkpO1xuICAgIHJldHVybiBhcGk7XG4gIH1cblxuICBmdW5jdGlvbiByZWZyZXNoICgpIHtcbiAgICBsYXN0WWVhciA9IGZhbHNlO1xuICAgIGxhc3RNb250aCA9IGZhbHNlO1xuICAgIGxhc3REYXkgPSBmYWxzZTtcbiAgICB1cGRhdGUodHJ1ZSk7XG4gICAgcmV0dXJuIGFwaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFZhbHVlICh2YWx1ZSkge1xuICAgIHZhciBkYXRlID0gcGFyc2UodmFsdWUsIG8uaW5wdXRGb3JtYXQpO1xuICAgIGlmIChkYXRlID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlZiA9IGluUmFuZ2UoZGF0ZSkgfHwgcmVmO1xuICAgIHJlZkNhbCA9IHJlZi5jbG9uZSgpO1xuICAgIHVwZGF0ZSh0cnVlKTtcblxuICAgIHJldHVybiBhcGk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbiAoZWxlbSwgc2VsZikge1xuICAgIHdoaWxlIChlbGVtICYmIGVsZW0uZmlyc3RDaGlsZCkge1xuICAgICAgZWxlbS5yZW1vdmVDaGlsZChlbGVtLmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBpZiAoc2VsZiA9PT0gdHJ1ZSkge1xuICAgICAgZWxlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlckFsbERheXMgKCkge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBvLm1vbnRoc0luQ2FsZW5kYXI7IGkrKykge1xuICAgICAgcmVuZGVyRGF5cyhpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXJEYXlzIChvZmZzZXQpIHtcbiAgICB2YXIgbW9udGggPSBjYWxlbmRhck1vbnRoc1tvZmZzZXRdO1xuICAgIHZhciBvZmZzZXRDYWwgPSByZWZDYWwuY2xvbmUoKS5hZGQob2Zmc2V0LCAnbW9udGhzJyk7XG4gICAgdmFyIHRvdGFsID0gb2Zmc2V0Q2FsLmRheXNJbk1vbnRoKCk7XG4gICAgdmFyIGN1cnJlbnQgPSBvZmZzZXRDYWwubW9udGgoKSAhPT0gcmVmLm1vbnRoKCkgPyAtMSA6IHJlZi5kYXRlKCk7IC8vIC0xIDogMS4uMzFcbiAgICB2YXIgZmlyc3QgPSBvZmZzZXRDYWwuY2xvbmUoKS5kYXRlKDEpO1xuICAgIHZhciBmaXJzdERheSA9IHdlZWtkYXkoZmlyc3QuZGF5KCksIHRydWUpOyAvLyAwLi42XG4gICAgdmFyIHRyID0gZG9tKHsgdHlwZTogJ3RyJywgY2xhc3NOYW1lOiBvLnN0eWxlcy5kYXlSb3csIHBhcmVudDogbW9udGguYm9keSB9KTtcbiAgICB2YXIgcHJldk1vbnRoID0gaGlkZGVuV2hlbihvZmZzZXQgIT09IDAsIFtvLnN0eWxlcy5kYXlCb2R5RWxlbSwgby5zdHlsZXMuZGF5UHJldk1vbnRoXSk7XG4gICAgdmFyIG5leHRNb250aCA9IGhpZGRlbldoZW4ob2Zmc2V0ICE9PSBvLm1vbnRoc0luQ2FsZW5kYXIgLSAxLCBbby5zdHlsZXMuZGF5Qm9keUVsZW0sIG8uc3R5bGVzLmRheU5leHRNb250aF0pO1xuICAgIHZhciBkaXNhYmxlZCA9IG8uc3R5bGVzLmRheURpc2FibGVkO1xuICAgIHZhciBsYXN0RGF5O1xuXG4gICAgcGFydCh7XG4gICAgICBiYXNlOiBmaXJzdC5jbG9uZSgpLnN1YnRyYWN0KGZpcnN0RGF5LCAnZGF5cycpLFxuICAgICAgbGVuZ3RoOiBmaXJzdERheSxcbiAgICAgIGNlbGw6IHByZXZNb250aFxuICAgIH0pO1xuXG4gICAgcGFydCh7XG4gICAgICBiYXNlOiBmaXJzdC5jbG9uZSgpLFxuICAgICAgbGVuZ3RoOiB0b3RhbCxcbiAgICAgIGNlbGw6IFtvLnN0eWxlcy5kYXlCb2R5RWxlbV0sXG4gICAgICBzZWxlY3RhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBsYXN0RGF5ID0gZmlyc3QuY2xvbmUoKS5hZGQodG90YWwsICdkYXlzJyk7XG5cbiAgICBwYXJ0KHtcbiAgICAgIGJhc2U6IGxhc3REYXksXG4gICAgICBsZW5ndGg6IHdlZWtkYXlDb3VudCAtIHRyLmNoaWxkcmVuLmxlbmd0aCxcbiAgICAgIGNlbGw6IG5leHRNb250aFxuICAgIH0pO1xuXG4gICAgYmFjay5kaXNhYmxlZCA9ICFpc0luUmFuZ2UoZmlyc3QsIHRydWUpO1xuICAgIG5leHQuZGlzYWJsZWQgPSAhaXNJblJhbmdlKGxhc3REYXksIHRydWUpO1xuICAgIG1vbnRoLmRhdGUgPSBvZmZzZXRDYWwuY2xvbmUoKTtcblxuICAgIGZ1bmN0aW9uIHBhcnQgKGRhdGEpIHtcbiAgICAgIHZhciBpLCBkYXksIG5vZGU7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHIuY2hpbGRyZW4ubGVuZ3RoID09PSB3ZWVrZGF5Q291bnQpIHtcbiAgICAgICAgICB0ciA9IGRvbSh7IHR5cGU6ICd0cicsIGNsYXNzTmFtZTogby5zdHlsZXMuZGF5Um93LCBwYXJlbnQ6IG1vbnRoLmJvZHkgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZGF5ID0gZGF0YS5iYXNlLmNsb25lKCkuYWRkKGksICdkYXlzJyk7XG4gICAgICAgIG5vZGUgPSBkb20oe1xuICAgICAgICAgIHR5cGU6ICd0ZCcsXG4gICAgICAgICAgcGFyZW50OiB0cixcbiAgICAgICAgICB0ZXh0OiBkYXkuZm9ybWF0KG8uZGF5Rm9ybWF0KSxcbiAgICAgICAgICBjbGFzc05hbWU6IHZhbGlkYXRpb25UZXN0KGRheSwgZGF0YS5jZWxsLmpvaW4oJyAnKS5zcGxpdCgnICcpKS5qb2luKCcgJylcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkYXRhLnNlbGVjdGFibGUgJiYgZGF5LmRhdGUoKSA9PT0gY3VycmVudCkge1xuICAgICAgICAgIHNlbGVjdERheUVsZW1lbnQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0aW9uVGVzdCAoZGF5LCBjZWxsKSB7XG4gICAgICBpZiAoIWlzSW5SYW5nZShkYXksIHRydWUsIG8uZGF0ZVZhbGlkYXRvcikpIHsgY2VsbC5wdXNoKGRpc2FibGVkKTsgfVxuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGlkZGVuV2hlbiAodmFsdWUsIGNlbGwpIHtcbiAgICAgIGlmICh2YWx1ZSkgeyBjZWxsLnB1c2goby5zdHlsZXMuZGF5Q29uY2VhbGVkKTsgfVxuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNJblJhbmdlIChkYXRlLCBhbGxkYXksIHZhbGlkYXRvcikge1xuICAgIHZhciBtaW4gPSAhby5taW4gPyBmYWxzZSA6IChhbGxkYXkgPyBvLm1pbi5jbG9uZSgpLnN0YXJ0T2YoJ2RheScpIDogby5taW4pO1xuICAgIHZhciBtYXggPSAhby5tYXggPyBmYWxzZSA6IChhbGxkYXkgPyBvLm1heC5jbG9uZSgpLmVuZE9mKCdkYXknKSA6IG8ubWF4KTtcbiAgICBpZiAobWluICYmIGRhdGUuaXNCZWZvcmUobWluKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobWF4ICYmIGRhdGUuaXNBZnRlcihtYXgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciB2YWxpZCA9ICh2YWxpZGF0b3IgfHwgRnVuY3Rpb24ucHJvdG90eXBlKS5jYWxsKGFwaSwgZGF0ZS50b0RhdGUoKSk7XG4gICAgcmV0dXJuIHZhbGlkICE9PSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluUmFuZ2UgKGRhdGUpIHtcbiAgICBpZiAoby5taW4gJiYgZGF0ZS5pc0JlZm9yZShvLm1pbikpIHtcbiAgICAgIHJldHVybiBpblJhbmdlKG8ubWluLmNsb25lKCkpO1xuICAgIH0gZWxzZSBpZiAoby5tYXggJiYgZGF0ZS5pc0FmdGVyKG8ubWF4KSkge1xuICAgICAgcmV0dXJuIGluUmFuZ2Uoby5tYXguY2xvbmUoKSk7XG4gICAgfVxuICAgIHZhciB2YWx1ZSA9IGRhdGUuY2xvbmUoKS5zdWJ0cmFjdCgxLCAnZGF5cycpO1xuICAgIGlmICh2YWxpZGF0ZVRvd2FyZHModmFsdWUsIGRhdGUsICdhZGQnKSkge1xuICAgICAgcmV0dXJuIGluVGltZVJhbmdlKHZhbHVlKTtcbiAgICB9XG4gICAgdmFsdWUgPSBkYXRlLmNsb25lKCk7XG4gICAgaWYgKHZhbGlkYXRlVG93YXJkcyh2YWx1ZSwgZGF0ZSwgJ3N1YnRyYWN0JykpIHtcbiAgICAgIHJldHVybiBpblRpbWVSYW5nZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5UaW1lUmFuZ2UgKHZhbHVlKSB7XG4gICAgdmFyIGNvcHkgPSB2YWx1ZS5jbG9uZSgpLnN1YnRyYWN0KG8udGltZUludGVydmFsLCAnc2Vjb25kcycpO1xuICAgIHZhciB0aW1lcyA9IE1hdGguY2VpbChzZWNvbmRzSW5EYXkgLyBvLnRpbWVJbnRlcnZhbCk7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IHRpbWVzOyBpKyspIHtcbiAgICAgIGNvcHkuYWRkKG8udGltZUludGVydmFsLCAnc2Vjb25kcycpO1xuICAgICAgaWYgKGNvcHkuZGF0ZSgpID4gdmFsdWUuZGF0ZSgpKSB7XG4gICAgICAgIGNvcHkuc3VidHJhY3QoMSwgJ2RheXMnKTtcbiAgICAgIH1cbiAgICAgIGlmIChvLnRpbWVWYWxpZGF0b3IuY2FsbChhcGksIGNvcHkudG9EYXRlKCkpICE9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZVRvd2FyZHMgKHZhbHVlLCBkYXRlLCBvcCkge1xuICAgIHZhciB2YWxpZCA9IGZhbHNlO1xuICAgIHdoaWxlICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHZhbHVlW29wXSgxLCAnZGF5cycpO1xuICAgICAgaWYgKHZhbHVlLm1vbnRoKCkgIT09IGRhdGUubW9udGgoKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHZhbGlkID0gby5kYXRlVmFsaWRhdG9yLmNhbGwoYXBpLCB2YWx1ZS50b0RhdGUoKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWxpZCAhPT0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBwaWNrRGF5IChlKSB7XG4gICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGlmIChjbGFzc2VzLmNvbnRhaW5zKHRhcmdldCwgby5zdHlsZXMuZGF5RGlzYWJsZWQpIHx8ICFjbGFzc2VzLmNvbnRhaW5zKHRhcmdldCwgby5zdHlsZXMuZGF5Qm9keUVsZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBkYXkgPSBwYXJzZUludCh0ZXh0KHRhcmdldCksIDEwKTtcbiAgICB2YXIgcHJldiA9IGNsYXNzZXMuY29udGFpbnModGFyZ2V0LCBvLnN0eWxlcy5kYXlQcmV2TW9udGgpO1xuICAgIHZhciBuZXh0ID0gY2xhc3Nlcy5jb250YWlucyh0YXJnZXQsIG8uc3R5bGVzLmRheU5leHRNb250aCk7XG4gICAgdmFyIG9mZnNldCA9IGdldE1vbnRoT2Zmc2V0KHRhcmdldCkgLSBnZXRNb250aE9mZnNldChsYXN0RGF5RWxlbWVudCk7XG4gICAgcmVmLmFkZChvZmZzZXQsICdtb250aHMnKTtcbiAgICBpZiAocHJldiB8fCBuZXh0KSB7XG4gICAgICByZWYuYWRkKHByZXYgPyAtMSA6IDEsICdtb250aHMnKTtcbiAgICB9XG4gICAgc2VsZWN0RGF5RWxlbWVudCh0YXJnZXQpO1xuICAgIHJlZi5kYXRlKGRheSk7IC8vIG11c3QgcnVuIGFmdGVyIHNldHRpbmcgdGhlIG1vbnRoXG4gICAgc2V0VGltZShyZWYsIGluUmFuZ2UocmVmKSB8fCByZWYpO1xuICAgIHJlZkNhbCA9IHJlZi5jbG9uZSgpO1xuICAgIGlmIChvLmF1dG9DbG9zZSkgeyBoaWRlQ29uZGl0aW9uYWxseSgpOyB9XG4gICAgdXBkYXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBzZWxlY3REYXlFbGVtZW50IChub2RlKSB7XG4gICAgaWYgKGxhc3REYXlFbGVtZW50KSB7XG4gICAgICBjbGFzc2VzLnJlbW92ZShsYXN0RGF5RWxlbWVudCwgby5zdHlsZXMuc2VsZWN0ZWREYXkpO1xuICAgIH1cbiAgICBpZiAobm9kZSkge1xuICAgICAgY2xhc3Nlcy5hZGQobm9kZSwgby5zdHlsZXMuc2VsZWN0ZWREYXkpO1xuICAgIH1cbiAgICBsYXN0RGF5RWxlbWVudCA9IG5vZGU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNb250aE9mZnNldCAoZWxlbSkge1xuICAgIHZhciBvZmZzZXQ7XG4gICAgd2hpbGUgKGVsZW0gJiYgZWxlbS5nZXRBdHRyaWJ1dGUpIHtcbiAgICAgIG9mZnNldCA9IGVsZW0uZ2V0QXR0cmlidXRlKG1vbnRoT2Zmc2V0QXR0cmlidXRlKTtcbiAgICAgIGlmICh0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQob2Zmc2V0LCAxMCk7XG4gICAgICB9XG4gICAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFRpbWUgKHRvLCBmcm9tKSB7XG4gICAgdG8uaG91cihmcm9tLmhvdXIoKSkubWludXRlKGZyb20ubWludXRlKCkpLnNlY29uZChmcm9tLnNlY29uZCgpKTtcbiAgICByZXR1cm4gdG87XG4gIH1cblxuICBmdW5jdGlvbiBwaWNrVGltZSAoZSkge1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICBpZiAoIWNsYXNzZXMuY29udGFpbnModGFyZ2V0LCBvLnN0eWxlcy50aW1lT3B0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSBtb21lbnR1bS5tb21lbnQodGV4dCh0YXJnZXQpLCBvLnRpbWVGb3JtYXQpO1xuICAgIHNldFRpbWUocmVmLCB2YWx1ZSk7XG4gICAgcmVmQ2FsID0gcmVmLmNsb25lKCk7XG4gICAgZW1pdFZhbHVlcygpO1xuICAgIHVwZGF0ZVRpbWUoKTtcbiAgICBpZiAoIW8uZGF0ZSAmJiBvLmF1dG9DbG9zZSkge1xuICAgICAgaGlkZUNvbmRpdGlvbmFsbHkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZVRpbWVMaXN0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RGF0ZSAoKSB7XG4gICAgcmV0dXJuIHJlZi50b0RhdGUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERhdGVTdHJpbmcgKGZvcm1hdCkge1xuICAgIHJldHVybiByZWYuZm9ybWF0KGZvcm1hdCB8fCBvLmlucHV0Rm9ybWF0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1vbWVudCAoKSB7XG4gICAgcmV0dXJuIHJlZi5jbG9uZSgpO1xuICB9XG5cbiAgcmV0dXJuIGFwaTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYWxlbmRhcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRyaW0gPSAvXlxccyt8XFxzKyQvZztcbnZhciB3aGl0ZXNwYWNlID0gL1xccysvO1xuXG5mdW5jdGlvbiBjbGFzc2VzIChub2RlKSB7XG4gIHJldHVybiBub2RlLmNsYXNzTmFtZS5yZXBsYWNlKHRyaW0sICcnKS5zcGxpdCh3aGl0ZXNwYWNlKTtcbn1cblxuZnVuY3Rpb24gc2V0IChub2RlLCB2YWx1ZSkge1xuICBub2RlLmNsYXNzTmFtZSA9IHZhbHVlLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gYWRkIChub2RlLCB2YWx1ZSkge1xuICB2YXIgdmFsdWVzID0gcmVtb3ZlKG5vZGUsIHZhbHVlKTtcbiAgdmFsdWVzLnB1c2godmFsdWUpO1xuICBzZXQobm9kZSwgdmFsdWVzKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlIChub2RlLCB2YWx1ZSkge1xuICB2YXIgdmFsdWVzID0gY2xhc3Nlcyhub2RlKTtcbiAgdmFyIGkgPSB2YWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gIGlmIChpICE9PSAtMSkge1xuICAgIHZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgc2V0KG5vZGUsIHZhbHVlcyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZnVuY3Rpb24gY29udGFpbnMgKG5vZGUsIHZhbHVlKSB7XG4gIHJldHVybiBjbGFzc2VzKG5vZGUpLmluZGV4T2YodmFsdWUpICE9PSAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogYWRkLFxuICByZW1vdmU6IHJlbW92ZSxcbiAgY29udGFpbnM6IGNvbnRhaW5zXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG5cbi8vIG5hw692ZSBpbXBsZW1lbnRhdGlvbiwgc3BlY2lmaWNhbGx5IG1lYW50IHRvIGNsb25lIGBvcHRpb25zYCBvYmplY3RzXG5mdW5jdGlvbiBjbG9uZSAodGhpbmcpIHtcbiAgdmFyIGNvcHkgPSB7fTtcbiAgdmFyIHZhbHVlO1xuXG4gIGZvciAodmFyIGtleSBpbiB0aGluZykge1xuICAgIHZhbHVlID0gdGhpbmdba2V5XTtcblxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIGNvcHlba2V5XSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAobW9tZW50dW0uaXNNb21lbnQodmFsdWUpKSB7XG4gICAgICBjb3B5W2tleV0gPSB2YWx1ZS5jbG9uZSgpO1xuICAgIH0gZWxzZSBpZiAodmFsdWUuX2lzU3R5bGVzQ29uZmlndXJhdGlvbikge1xuICAgICAgY29weVtrZXldID0gY2xvbmUodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb3B5W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29weTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4ID0gcmVxdWlyZSgnLi9pbmRleCcpO1xudmFyIGlucHV0ID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xudmFyIGlubGluZSA9IHJlcXVpcmUoJy4vaW5saW5lJyk7XG52YXIgaXNJbnB1dCA9IHJlcXVpcmUoJy4vaXNJbnB1dCcpO1xuXG5mdW5jdGlvbiBjb3JlIChlbGVtLCBvcHRpb25zKSB7XG4gIHZhciBjYWw7XG4gIHZhciBleGlzdGluZyA9IGluZGV4LmZpbmQoZWxlbSk7XG4gIGlmIChleGlzdGluZykge1xuICAgIHJldHVybiBleGlzdGluZztcbiAgfVxuXG4gIGlmIChpc0lucHV0KGVsZW0pKSB7XG4gICAgY2FsID0gaW5wdXQoZWxlbSwgb3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgY2FsID0gaW5saW5lKGVsZW0sIG9wdGlvbnMpO1xuICB9XG4gIGNhbC5hc3NvY2lhdGVkID0gZWxlbTtcbiAgaW5kZXguYXNzaWduKGVsZW0sIGNhbCk7XG5cbiAgcmV0dXJuIGNhbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGFyc2UgPSByZXF1aXJlKCcuL3BhcnNlJyk7XG52YXIgaXNJbnB1dCA9IHJlcXVpcmUoJy4vaXNJbnB1dCcpO1xudmFyIG1vbWVudHVtID0gcmVxdWlyZSgnLi9tb21lbnR1bScpO1xuXG5mdW5jdGlvbiBkZWZhdWx0cyAob3B0aW9ucywgY2FsKSB7XG4gIHZhciB0ZW1wO1xuICB2YXIgbm87XG4gIHZhciBvID0gb3B0aW9ucyB8fCB7fTtcbiAgaWYgKG8uYXV0b0hpZGVPbkNsaWNrID09PSBubykgeyBvLmF1dG9IaWRlT25DbGljayA9IHRydWU7IH1cbiAgaWYgKG8uYXV0b0hpZGVPbkJsdXIgPT09IG5vKSB7IG8uYXV0b0hpZGVPbkJsdXIgPSB0cnVlOyB9XG4gIGlmIChvLmF1dG9DbG9zZSA9PT0gbm8pIHsgby5hdXRvQ2xvc2UgPSB0cnVlOyB9XG4gIGlmIChvLmFwcGVuZFRvID09PSBubykgeyBvLmFwcGVuZFRvID0gZG9jdW1lbnQuYm9keTsgfVxuICBpZiAoby5hcHBlbmRUbyA9PT0gJ3BhcmVudCcpIHtcbiAgICBpZiAoaXNJbnB1dChjYWwuYXNzb2NpYXRlZCkpIHtcbiAgICAgIG8uYXBwZW5kVG8gPSBjYWwuYXNzb2NpYXRlZC5wYXJlbnROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lubGluZSBjYWxlbmRhcnMgbXVzdCBiZSBhcHBlbmRlZCB0byBhIHBhcmVudCBub2RlIGV4cGxpY2l0bHkuJyk7XG4gICAgfVxuICB9XG4gIGlmIChvLmludmFsaWRhdGUgPT09IG5vKSB7IG8uaW52YWxpZGF0ZSA9IHRydWU7IH1cbiAgaWYgKG8ucmVxdWlyZWQgPT09IG5vKSB7IG8ucmVxdWlyZWQgPSBmYWxzZTsgfVxuICBpZiAoby5kYXRlID09PSBubykgeyBvLmRhdGUgPSB0cnVlOyB9XG4gIGlmIChvLnRpbWUgPT09IG5vKSB7IG8udGltZSA9IHRydWU7IH1cbiAgaWYgKG8uZGF0ZSA9PT0gZmFsc2UgJiYgby50aW1lID09PSBmYWxzZSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0F0IGxlYXN0IG9uZSBvZiBgZGF0ZWAgb3IgYHRpbWVgIG11c3QgYmUgYHRydWVgLicpOyB9XG4gIGlmIChvLmlucHV0Rm9ybWF0ID09PSBubykge1xuICAgIGlmIChvLmRhdGUgJiYgby50aW1lKSB7XG4gICAgICBvLmlucHV0Rm9ybWF0ID0gJ1lZWVktTU0tREQgSEg6bW0nO1xuICAgIH0gZWxzZSBpZiAoby5kYXRlKSB7XG4gICAgICBvLmlucHV0Rm9ybWF0ID0gJ1lZWVktTU0tREQnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvLmlucHV0Rm9ybWF0ID0gJ0hIOm1tJztcbiAgICB9XG4gIH1cbiAgaWYgKG8uaW5pdGlhbFZhbHVlID09PSBubykge1xuICAgIG8uaW5pdGlhbFZhbHVlID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICBvLmluaXRpYWxWYWx1ZSA9IHBhcnNlKG8uaW5pdGlhbFZhbHVlLCBvLmlucHV0Rm9ybWF0KTtcbiAgfVxuICBpZiAoby5taW4gPT09IG5vKSB7IG8ubWluID0gbnVsbDsgfSBlbHNlIHsgby5taW4gPSBwYXJzZShvLm1pbiwgby5pbnB1dEZvcm1hdCk7IH1cbiAgaWYgKG8ubWF4ID09PSBubykgeyBvLm1heCA9IG51bGw7IH0gZWxzZSB7IG8ubWF4ID0gcGFyc2Uoby5tYXgsIG8uaW5wdXRGb3JtYXQpOyB9XG4gIGlmIChvLnRpbWVJbnRlcnZhbCA9PT0gbm8pIHsgby50aW1lSW50ZXJ2YWwgPSA2MCAqIDMwOyB9IC8vIDMwIG1pbnV0ZXMgYnkgZGVmYXVsdFxuICBpZiAoby5taW4gJiYgby5tYXgpIHtcbiAgICBpZiAoby5tYXguaXNCZWZvcmUoby5taW4pKSB7XG4gICAgICB0ZW1wID0gby5tYXg7XG4gICAgICBvLm1heCA9IG8ubWluO1xuICAgICAgby5taW4gPSB0ZW1wO1xuICAgIH1cbiAgICBpZiAoby5kYXRlID09PSB0cnVlKSB7XG4gICAgICBpZiAoby5tYXguY2xvbmUoKS5zdWJ0cmFjdCgxLCAnZGF5cycpLmlzQmVmb3JlKG8ubWluKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BtYXhgIG11c3QgYmUgYXQgbGVhc3Qgb25lIGRheSBhZnRlciBgbWluYCcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoby50aW1lSW50ZXJ2YWwgKiAxMDAwIC0gby5taW4gJSAoby50aW1lSW50ZXJ2YWwgKiAxMDAwKSA+IG8ubWF4IC0gby5taW4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYG1pbmAgdG8gYG1heGAgcmFuZ2UgbXVzdCBhbGxvdyBmb3IgYXQgbGVhc3Qgb25lIHRpbWUgb3B0aW9uIHRoYXQgbWF0Y2hlcyBgdGltZUludGVydmFsYCcpO1xuICAgIH1cbiAgfVxuICBpZiAoby5kYXRlVmFsaWRhdG9yID09PSBubykgeyBvLmRhdGVWYWxpZGF0b3IgPSBGdW5jdGlvbi5wcm90b3R5cGU7IH1cbiAgaWYgKG8udGltZVZhbGlkYXRvciA9PT0gbm8pIHsgby50aW1lVmFsaWRhdG9yID0gRnVuY3Rpb24ucHJvdG90eXBlOyB9XG4gIGlmIChvLnRpbWVGb3JtYXQgPT09IG5vKSB7IG8udGltZUZvcm1hdCA9ICdISDptbSc7IH1cbiAgaWYgKG8ud2Vla1N0YXJ0ID09PSBubykgeyBvLndlZWtTdGFydCA9IG1vbWVudHVtLm1vbWVudCgpLndlZWtkYXkoMCkuZGF5KCk7IH1cbiAgaWYgKG8ubW9udGhzSW5DYWxlbmRhciA9PT0gbm8pIHsgby5tb250aHNJbkNhbGVuZGFyID0gMTsgfVxuICBpZiAoby5tb250aEZvcm1hdCA9PT0gbm8pIHsgby5tb250aEZvcm1hdCA9ICdNTU1NIFlZWVknOyB9XG4gIGlmIChvLmRheUZvcm1hdCA9PT0gbm8pIHsgby5kYXlGb3JtYXQgPSAnREQnOyB9XG4gIGlmIChvLnN0eWxlcyA9PT0gbm8pIHsgby5zdHlsZXMgPSB7fTsgfVxuXG4gIG8uc3R5bGVzLl9pc1N0eWxlc0NvbmZpZ3VyYXRpb24gPSB0cnVlO1xuXG4gIHZhciBzdHlsID0gby5zdHlsZXM7XG4gIGlmIChzdHlsLmJhY2sgPT09IG5vKSB7IHN0eWwuYmFjayA9ICdyZC1iYWNrJzsgfVxuICBpZiAoc3R5bC5jb250YWluZXIgPT09IG5vKSB7IHN0eWwuY29udGFpbmVyID0gJ3JkLWNvbnRhaW5lcic7IH1cbiAgaWYgKHN0eWwucG9zaXRpb25lZCA9PT0gbm8pIHsgc3R5bC5wb3NpdGlvbmVkID0gJ3JkLWNvbnRhaW5lci1hdHRhY2htZW50JzsgfVxuICBpZiAoc3R5bC5kYXRlID09PSBubykgeyBzdHlsLmRhdGUgPSAncmQtZGF0ZSc7IH1cbiAgaWYgKHN0eWwuZGF5Qm9keSA9PT0gbm8pIHsgc3R5bC5kYXlCb2R5ID0gJ3JkLWRheXMtYm9keSc7IH1cbiAgaWYgKHN0eWwuZGF5Qm9keUVsZW0gPT09IG5vKSB7IHN0eWwuZGF5Qm9keUVsZW0gPSAncmQtZGF5LWJvZHknOyB9XG4gIGlmIChzdHlsLmRheVByZXZNb250aCA9PT0gbm8pIHsgc3R5bC5kYXlQcmV2TW9udGggPSAncmQtZGF5LXByZXYtbW9udGgnOyB9XG4gIGlmIChzdHlsLmRheU5leHRNb250aCA9PT0gbm8pIHsgc3R5bC5kYXlOZXh0TW9udGggPSAncmQtZGF5LW5leHQtbW9udGgnOyB9XG4gIGlmIChzdHlsLmRheURpc2FibGVkID09PSBubykgeyBzdHlsLmRheURpc2FibGVkID0gJ3JkLWRheS1kaXNhYmxlZCc7IH1cbiAgaWYgKHN0eWwuZGF5Q29uY2VhbGVkID09PSBubykgeyBzdHlsLmRheUNvbmNlYWxlZCA9ICdyZC1kYXktY29uY2VhbGVkJzsgfVxuICBpZiAoc3R5bC5kYXlIZWFkID09PSBubykgeyBzdHlsLmRheUhlYWQgPSAncmQtZGF5cy1oZWFkJzsgfVxuICBpZiAoc3R5bC5kYXlIZWFkRWxlbSA9PT0gbm8pIHsgc3R5bC5kYXlIZWFkRWxlbSA9ICdyZC1kYXktaGVhZCc7IH1cbiAgaWYgKHN0eWwuZGF5Um93ID09PSBubykgeyBzdHlsLmRheVJvdyA9ICdyZC1kYXlzLXJvdyc7IH1cbiAgaWYgKHN0eWwuZGF5VGFibGUgPT09IG5vKSB7IHN0eWwuZGF5VGFibGUgPSAncmQtZGF5cyc7IH1cbiAgaWYgKHN0eWwubW9udGggPT09IG5vKSB7IHN0eWwubW9udGggPSAncmQtbW9udGgnOyB9XG4gIGlmIChzdHlsLm1vbnRoTGFiZWwgPT09IG5vKSB7IHN0eWwubW9udGhMYWJlbCA9ICdyZC1tb250aC1sYWJlbCc7IH1cbiAgaWYgKHN0eWwubmV4dCA9PT0gbm8pIHsgc3R5bC5uZXh0ID0gJ3JkLW5leHQnOyB9XG4gIGlmIChzdHlsLnNlbGVjdGVkRGF5ID09PSBubykgeyBzdHlsLnNlbGVjdGVkRGF5ID0gJ3JkLWRheS1zZWxlY3RlZCc7IH1cbiAgaWYgKHN0eWwuc2VsZWN0ZWRUaW1lID09PSBubykgeyBzdHlsLnNlbGVjdGVkVGltZSA9ICdyZC10aW1lLXNlbGVjdGVkJzsgfVxuICBpZiAoc3R5bC50aW1lID09PSBubykgeyBzdHlsLnRpbWUgPSAncmQtdGltZSc7IH1cbiAgaWYgKHN0eWwudGltZUxpc3QgPT09IG5vKSB7IHN0eWwudGltZUxpc3QgPSAncmQtdGltZS1saXN0JzsgfVxuICBpZiAoc3R5bC50aW1lT3B0aW9uID09PSBubykgeyBzdHlsLnRpbWVPcHRpb24gPSAncmQtdGltZS1vcHRpb24nOyB9XG5cbiAgcmV0dXJuIG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGRvbSAob3B0aW9ucykge1xuICB2YXIgbyA9IG9wdGlvbnMgfHwge307XG4gIGlmICghby50eXBlKSB7IG8udHlwZSA9ICdkaXYnOyB9XG4gIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvLnR5cGUpO1xuICBpZiAoby5jbGFzc05hbWUpIHsgZWxlbS5jbGFzc05hbWUgPSBvLmNsYXNzTmFtZTsgfVxuICBpZiAoby50ZXh0KSB7IGVsZW0uaW5uZXJUZXh0ID0gZWxlbS50ZXh0Q29udGVudCA9IG8udGV4dDsgfVxuICBpZiAoby5wYXJlbnQpIHsgby5wYXJlbnQuYXBwZW5kQ2hpbGQoZWxlbSk7IH1cbiAgcmV0dXJuIGVsZW07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRkRXZlbnQgPSBhZGRFdmVudEVhc3k7XG52YXIgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEVhc3k7XG5cbmlmICghd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgYWRkRXZlbnQgPSBhZGRFdmVudEhhcmQ7XG59XG5cbmlmICghd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgcmVtb3ZlRXZlbnQgPSByZW1vdmVFdmVudEhhcmQ7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50RWFzeSAoZWxlbWVudCwgZXZ0LCBmbikge1xuICByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2dCwgZm4pO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudEhhcmQgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2dCwgZnVuY3Rpb24gKGFlKSB7XG4gICAgdmFyIGUgPSBhZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgZS50YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCAgPSBlLnByZXZlbnREZWZhdWx0IHx8IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0ICgpIHsgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlOyB9O1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uID0gZS5zdG9wUHJvcGFnYXRpb24gfHwgZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uICgpIHsgZS5jYW5jZWxCdWJibGUgPSB0cnVlOyB9O1xuICAgIGZuLmNhbGwoZWxlbWVudCwgZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFdmVudEVhc3kgKGVsZW1lbnQsIGV2dCwgZm4pIHtcbiAgcmV0dXJuIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGZuKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYXJkIChlbGVtZW50LCBldnQsIGZuKSB7XG4gIHJldHVybiBlbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBldnQsIGZuKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogYWRkRXZlbnQsXG4gIHJlbW92ZTogcmVtb3ZlRXZlbnRcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgbm87XG52YXIgaWtleSA9ICdkYXRhLXJvbWUtaWQnO1xudmFyIGluZGV4ID0gW107XG5cbmZ1bmN0aW9uIGZpbmQgKHRoaW5nKSB7IC8vIGNhbiBiZSBhIERPTSBlbGVtZW50IG9yIGEgbnVtYmVyXG4gIGlmICh0eXBlb2YgdGhpbmcgIT09ICdudW1iZXInICYmIHRoaW5nICYmIHRoaW5nLmdldEF0dHJpYnV0ZSkge1xuICAgIHJldHVybiBmaW5kKHRoaW5nLmdldEF0dHJpYnV0ZShpa2V5KSk7XG4gIH1cbiAgdmFyIGV4aXN0aW5nID0gaW5kZXhbdGhpbmddO1xuICBpZiAoZXhpc3RpbmcgIT09IG5vKSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBhc3NpZ24gKGVsZW0sIGluc3RhbmNlKSB7XG4gIGVsZW0uc2V0QXR0cmlidXRlKGlrZXksIGluc3RhbmNlLmlkID0gaW5kZXgucHVzaChpbnN0YW5jZSkgLSAxKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbmQ6IGZpbmQsXG4gIGFzc2lnbjogYXNzaWduXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFmID0gcmVxdWlyZSgncmFmJyk7XG52YXIgY2FsZW5kYXIgPSByZXF1aXJlKCcuL2NhbGVuZGFyJyk7XG5cbmZ1bmN0aW9uIGlubGluZSAoZWxlbSwgY2FsZW5kYXJPcHRpb25zKSB7XG4gIHZhciBvID0gY2FsZW5kYXJPcHRpb25zIHx8IHt9O1xuXG4gIG8uYXBwZW5kVG8gPSBlbGVtO1xuXG4gIHZhciBhcGkgPSBjYWxlbmRhcihvKVxuICAgIC5vbigncmVhZHknLCByZWFkeSk7XG5cbiAgZnVuY3Rpb24gcmVhZHkgKCkge1xuICAgIHJhZihhcGkuc2hvdyk7XG4gIH1cblxuICByZXR1cm4gYXBpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlubGluZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJyk7XG52YXIgcmFmID0gcmVxdWlyZSgncmFmJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuL2Nsb25lJyk7XG52YXIgY2FsZW5kYXIgPSByZXF1aXJlKCcuL2NhbGVuZGFyJyk7XG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZXZlbnRzJyk7XG5cbmZ1bmN0aW9uIGlucHV0Q2FsZW5kYXIgKGlucHV0LCBjYWxlbmRhck9wdGlvbnMpIHtcbiAgdmFyIG87XG4gIHZhciBhcGkgPSBjYWxlbmRhcihjYWxlbmRhck9wdGlvbnMpO1xuICB2YXIgdGhyb3R0bGVkVGFrZUlucHV0ID0gdGhyb3R0bGUodGFrZUlucHV0LCA1MCk7XG4gIHZhciB0aHJvdHRsZWRQb3NpdGlvbiA9IHRocm90dGxlKHBvc2l0aW9uLCAzMCk7XG4gIHZhciBpZ25vcmVJbnZhbGlkYXRpb247XG4gIHZhciBpZ25vcmVTaG93O1xuXG4gIGJpbmRFdmVudHMoKTtcblxuICBmdW5jdGlvbiBpbml0IChzdXBlck9wdGlvbnMpIHtcbiAgICBvID0gY2xvbmUoc3VwZXJPcHRpb25zKTtcblxuICAgIGNsYXNzZXMuYWRkKGFwaS5jb250YWluZXIsIG8uc3R5bGVzLnBvc2l0aW9uZWQpO1xuICAgIGV2ZW50cy5hZGQoYXBpLmNvbnRhaW5lciwgJ21vdXNlZG93bicsIGNvbnRhaW5lck1vdXNlRG93bik7XG4gICAgZXZlbnRzLmFkZChhcGkuY29udGFpbmVyLCAnY2xpY2snLCBjb250YWluZXJDbGljayk7XG5cbiAgICBhcGkuZ2V0RGF0ZSA9IHVucmVxdWlyZShhcGkuZ2V0RGF0ZSk7XG4gICAgYXBpLmdldERhdGVTdHJpbmcgPSB1bnJlcXVpcmUoYXBpLmdldERhdGVTdHJpbmcpO1xuICAgIGFwaS5nZXRNb21lbnQgPSB1bnJlcXVpcmUoYXBpLmdldE1vbWVudCk7XG5cbiAgICBpZiAoby5pbml0aWFsVmFsdWUpIHtcbiAgICAgIGlucHV0LnZhbHVlID0gby5pbml0aWFsVmFsdWUuZm9ybWF0KG8uaW5wdXRGb3JtYXQpO1xuICAgIH1cblxuICAgIGFwaS5vbignZGF0YScsIHVwZGF0ZUlucHV0KTtcbiAgICBhcGkub24oJ3Nob3cnLCB0aHJvdHRsZWRQb3NpdGlvbik7XG5cbiAgICBldmVudExpc3RlbmluZygpO1xuICAgIHRocm90dGxlZFRha2VJbnB1dCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveSAoKSB7XG4gICAgZXZlbnRMaXN0ZW5pbmcodHJ1ZSk7XG4gICAgcmFmKGJpbmRFdmVudHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZEV2ZW50cyAoKSB7XG4gICAgYXBpLm9uY2UoJ3JlYWR5JywgaW5pdCk7XG4gICAgYXBpLm9uY2UoJ2Rlc3Ryb3llZCcsIGRlc3Ryb3kpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRMaXN0ZW5pbmcgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgZXZlbnRzW29wXShpbnB1dCwgJ2NsaWNrJywgc2hvdyk7XG4gICAgZXZlbnRzW29wXShpbnB1dCwgJ3RvdWNoZW5kJywgc2hvdyk7XG4gICAgZXZlbnRzW29wXShpbnB1dCwgJ2ZvY3VzaW4nLCBzaG93KTtcbiAgICBldmVudHNbb3BdKGlucHV0LCAnY2hhbmdlJywgdGhyb3R0bGVkVGFrZUlucHV0KTtcbiAgICBldmVudHNbb3BdKGlucHV0LCAna2V5cHJlc3MnLCB0aHJvdHRsZWRUYWtlSW5wdXQpO1xuICAgIGV2ZW50c1tvcF0oaW5wdXQsICdrZXlkb3duJywgdGhyb3R0bGVkVGFrZUlucHV0KTtcbiAgICBldmVudHNbb3BdKGlucHV0LCAnaW5wdXQnLCB0aHJvdHRsZWRUYWtlSW5wdXQpO1xuICAgIGlmIChvLmludmFsaWRhdGUpIHsgZXZlbnRzW29wXShpbnB1dCwgJ2JsdXInLCBpbnZhbGlkYXRlSW5wdXQpOyB9XG4gICAgZXZlbnRzW29wXSh3aW5kb3csICdyZXNpemUnLCB0aHJvdHRsZWRQb3NpdGlvbik7XG4gIH1cblxuICBmdW5jdGlvbiBjb250YWluZXJDbGljayAoKSB7XG4gICAgaWdub3JlU2hvdyA9IHRydWU7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgICBpZ25vcmVTaG93ID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBjb250YWluZXJNb3VzZURvd24gKCkge1xuICAgIGlnbm9yZUludmFsaWRhdGlvbiA9IHRydWU7XG4gICAgcmFmKHVuaWdub3JlKTtcblxuICAgIGZ1bmN0aW9uIHVuaWdub3JlICgpIHtcbiAgICAgIGlnbm9yZUludmFsaWRhdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGludmFsaWRhdGVJbnB1dCAoKSB7XG4gICAgaWYgKCFpZ25vcmVJbnZhbGlkYXRpb24gJiYgIWlzRW1wdHkoKSkge1xuICAgICAgYXBpLmVtaXRWYWx1ZXMoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzaG93ICgpIHtcbiAgICBpZiAoaWdub3JlU2hvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhcGkuc2hvdygpO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9zaXRpb24gKCkge1xuICAgIHZhciBib3VuZHMgPSBpbnB1dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgc2Nyb2xsVG9wID0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICBhcGkuY29udGFpbmVyLnN0eWxlLnRvcCAgPSBib3VuZHMudG9wICsgc2Nyb2xsVG9wICsgaW5wdXQub2Zmc2V0SGVpZ2h0ICsgJ3B4JztcbiAgICBhcGkuY29udGFpbmVyLnN0eWxlLmxlZnQgPSBib3VuZHMubGVmdCArICdweCc7XG4gIH1cblxuICBmdW5jdGlvbiB0YWtlSW5wdXQgKCkge1xuICAgIHZhciB2YWx1ZSA9IGlucHV0LnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBkYXRlID0gbW9tZW50dW0ubW9tZW50KHZhbHVlLCBvLmlucHV0Rm9ybWF0KTtcbiAgICBhcGkuc2V0VmFsdWUoZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVJbnB1dCAoZGF0YSkge1xuICAgIGlucHV0LnZhbHVlID0gZGF0YTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICAgIHJldHVybiBvLnJlcXVpcmVkID09PSBmYWxzZSAmJiBpbnB1dC52YWx1ZS50cmltKCkgPT09ICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5yZXF1aXJlIChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiBtYXliZSAoKSB7XG4gICAgICByZXR1cm4gaXNFbXB0eSgpID8gbnVsbCA6IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBhcGk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5wdXRDYWxlbmRhcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaXNJbnB1dCAoZWxlbSkge1xuICByZXR1cm4gZWxlbSAmJiBlbGVtLm5vZGVOYW1lICYmIGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lucHV0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0lucHV0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBpc01vbWVudCAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ19pc0FNb21lbnRPYmplY3QnKTtcbn1cblxudmFyIGFwaSA9IHtcbiAgbW9tZW50OiBudWxsLFxuICBpc01vbWVudDogaXNNb21lbnRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBub29wICgpIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gbm9vcDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1vbWVudHVtID0gcmVxdWlyZSgnLi9tb21lbnR1bScpO1xuXG5mdW5jdGlvbiByYXcgKGRhdGUsIGZvcm1hdCkge1xuICBpZiAodHlwZW9mIGRhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG1vbWVudHVtLm1vbWVudChkYXRlLCBmb3JtYXQpO1xuICB9XG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZSkgPT09ICdbb2JqZWN0IERhdGVdJykge1xuICAgIHJldHVybiBtb21lbnR1bS5tb21lbnQoZGF0ZSk7XG4gIH1cbiAgaWYgKG1vbWVudHVtLmlzTW9tZW50KGRhdGUpKSB7XG4gICAgcmV0dXJuIGRhdGUuY2xvbmUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZSAoZGF0ZSwgZm9ybWF0KSB7XG4gIHZhciBtID0gcmF3KGRhdGUsIHR5cGVvZiBmb3JtYXQgPT09ICdzdHJpbmcnID8gZm9ybWF0IDogbnVsbCk7XG4gIHJldHVybiBtICYmIG0uaXNWYWxpZCgpID8gbSA6IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5ldmVyeSkge1xuICBBcnJheS5wcm90b3R5cGUuZXZlcnkgPSBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgIHZhciBjb250ZXh0LCBpO1xuXG4gICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZSA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gc291cmNlLmxlbmd0aCA+Pj4gMDtcblxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBjb250ZXh0ID0gY3R4O1xuICAgIH1cblxuICAgIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgIGlmIChpIGluIHNvdXJjZSkge1xuICAgICAgICB2YXIgdGVzdCA9IGZuLmNhbGwoY29udGV4dCwgc291cmNlW2ldLCBpLCBzb3VyY2UpO1xuICAgICAgICBpZiAoIXRlc3QpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59XG4iLCJpZiAoIUFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIChmbiwgY3R4KSB7XG4gICAgdmFyIGYgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHYsIGksIHQpIHtcbiAgICAgIGlmIChmbi5jYWxsKGN0eCwgdiwgaSwgdCkpIHsgZi5wdXNoKHYpOyB9XG4gICAgfSwgY3R4KTtcbiAgICByZXR1cm4gZjtcbiAgfTtcbn1cbiIsImlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgIGlmICh0aGlzID09PSB2b2lkIDAgfHwgdGhpcyA9PT0gbnVsbCB8fCB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHQgPSB0aGlzO1xuICAgIHZhciBsZW4gPSB0Lmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoaSBpbiB0KSB7IGZuLmNhbGwoY3R4LCB0W2ldLCBpLCB0KTsgfVxuICAgIH1cbiAgfTtcbn1cbiIsImlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAod2hhdCwgc3RhcnQpIHtcbiAgICBpZiAodGhpcyA9PT0gdW5kZWZpbmVkIHx8IHRoaXMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgIHN0YXJ0ID0gK3N0YXJ0IHx8IDA7XG4gICAgaWYgKE1hdGguYWJzKHN0YXJ0KSA9PT0gSW5maW5pdHkpIHtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9IGVsc2UgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgc3RhcnQgKz0gbGVuZ3RoO1xuICAgICAgaWYgKHN0YXJ0IDwgMCkgeyBzdGFydCA9IDA7IH1cbiAgICB9XG4gICAgZm9yICg7IHN0YXJ0IDwgbGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAodGhpc1tzdGFydF0gPT09IHdoYXQpIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG59XG4iLCJBcnJheS5pc0FycmF5IHx8IChBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKGEpIHtcbiAgcmV0dXJuICcnICsgYSAhPT0gYSAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59KTtcbiIsImlmICghQXJyYXkucHJvdG90eXBlLm1hcCkge1xuICBBcnJheS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKGZuLCBjdHgpIHtcbiAgICB2YXIgY29udGV4dCwgcmVzdWx0LCBpO1xuXG4gICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZSA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gc291cmNlLmxlbmd0aCA+Pj4gMDtcblxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBjb250ZXh0ID0gY3R4O1xuICAgIH1cblxuICAgIHJlc3VsdCA9IG5ldyBBcnJheShsZW4pO1xuICAgIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgIGlmIChpIGluIHNvdXJjZSkge1xuICAgICAgICByZXN1bHRbaV0gPSBmbi5jYWxsKGNvbnRleHQsIHNvdXJjZVtpXSwgaSwgc291cmNlKTtcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cbiIsImlmICghQXJyYXkucHJvdG90eXBlLnNvbWUpIHtcbiAgQXJyYXkucHJvdG90eXBlLnNvbWUgPSBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICAgIHZhciBjb250ZXh0LCBpO1xuXG4gICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZSA9IE9iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gc291cmNlLmxlbmd0aCA+Pj4gMDtcblxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoZm4gKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICBjb250ZXh0ID0gY3R4O1xuICAgIH1cblxuICAgIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgIGlmIChpIGluIHNvdXJjZSkge1xuICAgICAgICB2YXIgdGVzdCA9IGZuLmNhbGwoY29udGV4dCwgc291cmNlW2ldLCBpLCBzb3VyY2UpO1xuICAgICAgICBpZiAodGVzdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiIsImlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG4gICAgdmFyIGN1cnJpZWQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBvcmlnaW5hbCA9IHRoaXM7XG4gICAgdmFyIE5vT3AgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB2YXIgYm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY3R4ID0gdGhpcyBpbnN0YW5jZW9mIE5vT3AgJiYgY29udGV4dCA/IHRoaXMgOiBjb250ZXh0O1xuICAgICAgdmFyIGFyZ3MgPSBjdXJyaWVkLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiBvcmlnaW5hbC5hcHBseShjdHgsIGFyZ3MpO1xuICAgIH07XG4gICAgTm9PcC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICBib3VuZC5wcm90b3R5cGUgPSBuZXcgTm9PcCgpO1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcbn1cbiIsImlmICghU3RyaW5nLnByb3RvdHlwZS50cmltKSB7XG4gIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIHRoZXNlIGFyZSBvbmx5IHJlcXVpcmVkIGZvciBJRSA8IDlcbi8vIG1heWJlIG1vdmUgdG8gSUUtc3BlY2lmaWMgZGlzdHJvP1xucmVxdWlyZSgnLi9wb2x5ZmlsbHMvZnVuY3Rpb24uYmluZCcpO1xucmVxdWlyZSgnLi9wb2x5ZmlsbHMvYXJyYXkuZm9yZWFjaCcpO1xucmVxdWlyZSgnLi9wb2x5ZmlsbHMvYXJyYXkubWFwJyk7XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9hcnJheS5maWx0ZXInKTtcbnJlcXVpcmUoJy4vcG9seWZpbGxzL2FycmF5LmlzYXJyYXknKTtcbnJlcXVpcmUoJy4vcG9seWZpbGxzL2FycmF5LmluZGV4b2YnKTtcbnJlcXVpcmUoJy4vcG9seWZpbGxzL2FycmF5LmV2ZXJ5Jyk7XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9hcnJheS5zb21lJyk7XG5yZXF1aXJlKCcuL3BvbHlmaWxscy9zdHJpbmcudHJpbScpO1xuXG52YXIgY29yZSA9IHJlcXVpcmUoJy4vY29yZScpO1xudmFyIGluZGV4ID0gcmVxdWlyZSgnLi9pbmRleCcpO1xudmFyIHVzZSA9IHJlcXVpcmUoJy4vdXNlJyk7XG5cbmNvcmUudXNlID0gdXNlLmJpbmQoY29yZSk7XG5jb3JlLmZpbmQgPSBpbmRleC5maW5kO1xuY29yZS52YWwgPSByZXF1aXJlKCcuL3ZhbGlkYXRvcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIHJvbWUgPSByZXF1aXJlKCcuL3JvbWUnKTtcbnZhciBtb21lbnR1bSA9IHJlcXVpcmUoJy4vbW9tZW50dW0nKTtcblxucm9tZS51c2UoZ2xvYmFsLm1vbWVudCk7XG5cbmlmIChtb21lbnR1bS5tb21lbnQgPT09IHZvaWQgMCkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ3JvbWUgZGVwZW5kcyBvbiBtb21lbnQuanMsIHlvdSBjYW4gZ2V0IGl0IGF0IGh0dHA6Ly9tb21lbnRqcy5jb20sIG9yIHlvdSBjb3VsZCB1c2UgdGhlIGJ1bmRsZWQgZGlzdHJpYnV0aW9uIGZpbGUgaW5zdGVhZC4nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByb21lO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gdGV4dCAoZWxlbSwgdmFsdWUpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICBlbGVtLmlubmVyVGV4dCA9IGVsZW0udGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gZWxlbS5pbm5lclRleHQgfHwgZWxlbS50ZXh0Q29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0ZXh0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbW9tZW50dW0gPSByZXF1aXJlKCcuL21vbWVudHVtJyk7XG5cbmZ1bmN0aW9uIHVzZSAobW9tZW50KSB7XG4gIHRoaXMubW9tZW50ID0gbW9tZW50dW0ubW9tZW50ID0gbW9tZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4ID0gcmVxdWlyZSgnLi9pbmRleCcpO1xudmFyIHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpO1xudmFyIGFzc29jaWF0aW9uID0gcmVxdWlyZSgnLi9hc3NvY2lhdGlvbicpO1xuXG5mdW5jdGlvbiBjb21wYXJlQnVpbGRlciAoY29tcGFyZSkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFjdG9yeSAodmFsdWUpIHtcbiAgICB2YXIgZml4ZWQgPSBwYXJzZSh2YWx1ZSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdmFsaWRhdGUgKGRhdGUpIHtcbiAgICAgIHZhciBjYWwgPSBpbmRleC5maW5kKHZhbHVlKTtcbiAgICAgIHZhciBsZWZ0ID0gcGFyc2UoZGF0ZSk7XG4gICAgICB2YXIgcmlnaHQgPSBmaXhlZCB8fCBjYWwgJiYgY2FsLmdldE1vbWVudCgpO1xuICAgICAgaWYgKCFyaWdodCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWwpIHtcbiAgICAgICAgYXNzb2NpYXRpb24uYWRkKHRoaXMsIGNhbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29tcGFyZShsZWZ0LCByaWdodCk7XG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmFuZ2VCdWlsZGVyIChob3csIGNvbXBhcmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZhY3RvcnkgKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgZGF0ZXM7XG4gICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdGFydCkpIHtcbiAgICAgIGRhdGVzID0gc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChsZW4gPT09IDEpIHtcbiAgICAgICAgZGF0ZXMgPSBbc3RhcnRdO1xuICAgICAgfSBlbHNlIGlmIChsZW4gPT09IDIpIHtcbiAgICAgICAgZGF0ZXMgPSBbW3N0YXJ0LCBlbmRdXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdmFsaWRhdGUgKGRhdGUpIHtcbiAgICAgIHJldHVybiBkYXRlcy5tYXAoZXhwYW5kLmJpbmQodGhpcykpW2hvd10oY29tcGFyZS5iaW5kKHRoaXMsIGRhdGUpKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZXhwYW5kICh2YWx1ZSkge1xuICAgICAgdmFyIHN0YXJ0LCBlbmQ7XG4gICAgICB2YXIgY2FsID0gaW5kZXguZmluZCh2YWx1ZSk7XG4gICAgICBpZiAoY2FsKSB7XG4gICAgICAgIHN0YXJ0ID0gZW5kID0gY2FsLmdldE1vbWVudCgpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBzdGFydCA9IHZhbHVlWzBdOyBlbmQgPSB2YWx1ZVsxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXJ0ID0gZW5kID0gdmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoY2FsKSB7XG4gICAgICAgIGFzc29jaWF0aW9uLmFkZChjYWwsIHRoaXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQ6IHBhcnNlKHN0YXJ0KS5zdGFydE9mKCdkYXknKS50b0RhdGUoKSxcbiAgICAgICAgZW5kOiBwYXJzZShlbmQpLmVuZE9mKCdkYXknKS50b0RhdGUoKVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBhZnRlckVxICA9IGNvbXBhcmVCdWlsZGVyKGZ1bmN0aW9uIChsZWZ0LCByaWdodCkgeyByZXR1cm4gbGVmdCA+PSByaWdodDsgfSk7XG52YXIgYWZ0ZXIgICAgPSBjb21wYXJlQnVpbGRlcihmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHsgcmV0dXJuIGxlZnQgID4gcmlnaHQ7IH0pO1xudmFyIGJlZm9yZUVxID0gY29tcGFyZUJ1aWxkZXIoZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7IHJldHVybiBsZWZ0IDw9IHJpZ2h0OyB9KTtcbnZhciBiZWZvcmUgICA9IGNvbXBhcmVCdWlsZGVyKGZ1bmN0aW9uIChsZWZ0LCByaWdodCkgeyByZXR1cm4gbGVmdCAgPCByaWdodDsgfSk7XG5cbnZhciBleGNlcHQgICA9IHJhbmdlQnVpbGRlcignZXZlcnknLCBmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHsgcmV0dXJuIHJpZ2h0LnN0YXJ0ICA+IGxlZnQgfHwgcmlnaHQuZW5kICA8IGxlZnQ7IH0pO1xudmFyIG9ubHkgICAgID0gcmFuZ2VCdWlsZGVyKCdzb21lJywgIGZ1bmN0aW9uIChsZWZ0LCByaWdodCkgeyByZXR1cm4gcmlnaHQuc3RhcnQgPD0gbGVmdCAmJiByaWdodC5lbmQgPj0gbGVmdDsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZnRlckVxOiBhZnRlckVxLFxuICBhZnRlcjogYWZ0ZXIsXG4gIGJlZm9yZUVxOiBiZWZvcmVFcSxcbiAgYmVmb3JlOiBiZWZvcmUsXG4gIGV4Y2VwdDogZXhjZXB0LFxuICBvbmx5OiBvbmx5XG59O1xuIl19
(38)
});
