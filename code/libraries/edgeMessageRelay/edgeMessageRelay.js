/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __spreadArrays = this && this.__spreadArrays || function () {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
    s += arguments[i].length;
  }

  for (var r = Array(s), k = 0, i = 0; i < il; i++) {
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
      r[k] = a[j];
    }
  }

  return r;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(3);

var messaging_utils_1 = __webpack_require__(4);

var shared_1 = __webpack_require__(6);

function edgeMessageRelay(_a) {
  var req = _a.req,
      resp = _a.resp,
      topics = _a.topics,
      _b = _a.getRelayTopicSuffix,
      getRelayTopicSuffix = _b === void 0 ? function (topic) {
    return topic;
  } : _b,
      _c = _a.runWaitLoop,
      runWaitLoop = _c === void 0 ? function (cb) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      cb();
    }
  } : _c,
      _d = _a.cacheName,
      cacheName = _d === void 0 ? shared_1.DEFAULT_EDGE_RELAY_CACHE_NAME : _d,
      _e = _a.collectionName,
      collectionName = _e === void 0 ? shared_1.DEFAULT_EDGE_RELAY_CACHE_COLLECTION_NAME : _e; //We don't want this service to run on the platform

  if (!ClearBlade.isEdge()) {
    resp.success('Execution environment is not ClearBlade Edge, exiting.');
  }

  log('edgeMessageRelay - Starting service instance');
  ClearBlade.init({
    request: req
  });
  var messaging = ClearBlade.Messaging();
  var cache = ClearBlade.Cache(cacheName);
  var intervalTopic = 'interval/edgeMessageRelay';
  var intervalID;
  var CACHE_ITEM_NAME = 'edgeIsConnected';
  var CACHE_TTL_INTERVAL = 1800; //seconds

  var TOPICS = __spreadArrays([intervalTopic], topics);

  var subscribePromises = [];

  if (TOPICS.length <= 1) {
    log('edgeMessageRelay - No topics to subscribe to.');
    resp.error('No topics to subscribe to.');
    return;
  }

  TOPICS.forEach(function (topic) {
    log('edgeMessageRelay - Subscribing to topic ' + topic);
    subscribePromises.push(messaging_utils_1.subscriber(topic));
  });

  function WaitLoop() {
    messaging.setInterval(CACHE_TTL_INTERVAL * 1000, intervalTopic, '', -1, function (err, data) {
      if (err) {
        log('edgeMessageRelay - Error invoking setInterval: ' + JSON.stringify(data));
        resp.error('Error invoking setInterval: ' + JSON.stringify(data));
        return;
      }

      intervalID = data;
      log('edgeMessageRelay - Subscribed to Shared Topics. Starting Loop.');

      var loopCallback = function loopCallback() {
        log('edgeMessageRelay - Waiting for new messages');
        messaging.waitForMessage(TOPICS, function (err, msg, topic) {
          if (err) {
            cancelInterval();
            log('edgeMessageRelay - Failed to wait for message: ' + err + ' ' + msg + '  ' + topic);
            resp.error('Failed to wait for message: ' + err + ' ' + msg + '    ' + topic);
            return;
          }

          log('edgeMessageRelay - Message received on topic ' + topic);
          processMessage(msg, topic);
        });
      };

      runWaitLoop(loopCallback);
    });
  }

  function processMessage(msg, topic) {
    switch (topic) {
      case intervalTopic:
        //Refresh the cache by reading the current value and writing it back
        refreshSharedCacheItem(CACHE_ITEM_NAME);
        break;

      default:
        {
          var relayTopic = getRelayTopicSuffix(topic);

          if (relayTopic) {
            relayMessage(msg, relayTopic);
          }
        }
    }
  }

  function getSharedCacheItem(itemName, callback) {
    cache.get(itemName, function (err, data) {
      callback(err, data);
    });
  }

  function setSharedCacheItem(itemName, itemValue) {
    cache.set(itemName, itemValue, function (err, data) {
      if (err) {
        log('Error updating shared cache: ' + JSON.stringify(data));
      } else {
        log('Shared cache updated: edgeIsConnected = true');
      }
    });
  }

  function refreshSharedCacheItem(itemName) {
    getSharedCacheItem(itemName, function (err, data) {
      if (err) {
        log('Error retrieving from shared cache: ' + JSON.stringify(data));
      } else {
        setSharedCacheItem(itemName, data);
      }
    });
  }

  function relayMessage(msg, topic) {
    cache.get('edgeIsConnected', function (err, data) {
      if (err) {
        log('edgeMessageRelay - Error retrieving edgeIsConnected from shared cache:' + JSON.stringify(data));
        addMessageToRelayCache(msg, topic);
      } else {
        log('edgeMessageRelay - edgeIsConnected retrieved from shared cache: ' + JSON.stringify(data));
        var isConnected = JSON.parse(data);

        if (isConnected) {
          log('edgeMessageRelay - Publishing message to topic ' + topic);
          messaging.publish(topic + '/_platform', msg);
        } else {
          log('edgeMessageRelay - Adding message to relay cache');
          addMessageToRelayCache(msg, topic);
        }
      }
    });
  }

  function addMessageToRelayCache(msg, topic) {
    log('edgeMessageRelay - Adding message to edge_relay_cache data collection');
    var col = ClearBlade.Collection({
      collectionName: collectionName
    });
    var newRow = {
      topic: topic,
      payload: msg,
      timestamp: new Date().toISOString()
    };
    col.create(newRow, function (err, res) {
      if (err) {
        log('edgeMessageRelay - Error creating row in edge_relay_cache: ' + JSON.stringify(res));
      } else {
        log('edgeMessageRelay - Row created in edge_relay_cache');
      }
    });
  }

  function cancelInterval() {
    messaging.cancelCBInterval(intervalID, function (err, data) {
      if (err) {
        log('Error cancelling interval: ' + JSON.stringify(data));
        resp.error('Error invoking cancelCBInterval: ' + JSON.stringify(data));
      }

      log('Interval cancelled, exiting...');
      resp.success('Interval canceled: ' + JSON.stringify(data));
    });
  }

  Promise.all(subscribePromises).then(WaitLoop)["catch"](function (err) {
    log('edgeMessageRelay - Error subscribing to topic: ' + JSON.stringify(err));
    resp.error('Error subscribing to topic: ' + err.message);
  });
  Promise.runQueue();
}

exports["default"] = edgeMessageRelay;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var _clearblade_one_way_sync_edge_edge_message_relay__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _clearblade_one_way_sync_edge_edge_message_relay__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_clearblade_one_way_sync_edge_edge_message_relay__WEBPACK_IMPORTED_MODULE_0__);
 // @ts-ignore

global.edgeMessageRelay = _clearblade_one_way_sync_edge_edge_message_relay__WEBPACK_IMPORTED_MODULE_0___default.a;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var g; // This works in non-strict mode

g = function () {
  return this;
}();

try {
  // This works if eval is allowed (see CSP)
  g = g || new Function("return this")();
} catch (e) {
  // This works if the window reference is available
  if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
} // g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}


module.exports = g;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 *  Minimal ES2015+ Promise polyfill
 *
 *  Limitations (also see XXX in source):
 *
 *    - Caller must manually call Promise.runQueue() to process pending jobs.
 *    - No Promise subclassing or non-subclass foreign Promises yet.
 *    - Promise.all() and Promise.race() assume a plain array, not iterator.
 *    - Doesn't handle errors from core operations, e.g. out-of-memory or
 *      internal error when queueing/running jobs.  These are implementation
 *      defined for the most part.
 *
 *  This polyfill was originally used to gain a better understanding of the
 *  ES2015 specification algorithms, before implementing Promises natively.
 *
 *  The polyfill uses a Symbol to mark Promise instances, but falls back to
 *  an ordinary (non-enumerable) property if no Symbol support is available.
 *  Presence of the polyfill itself can be checked using "Promise.isPolyfill".
 *
 *  Unhandled Promise rejections use a custom API signature.  For now, a
 *  single Promise.unhandledRejection() hook receives both 'rawReject' and
 *  'rawHandle' events directly from HostPromiseRejectionTracker, and higher
 *  level (Node.js / WHATWG like) 'reject' and 'handle' events which filter
 *  out cases where a rejected Promise is initially unhandled but gets handled
 *  within the same "tick".
 *
 *  See also: https://github.com/stefanpenner/es6-promise#readme
 */
(function () {
  if (typeof Promise !== "undefined") {
    return;
  } // As far as the specification goes, almost all Promise settling is via
  // concrete resolve/reject functions with mutual protection from being
  // called multiple times.  Sometimes the actual resolve/reject functions
  // are not exposed to calling code, and can safely be omitted which is
  // useful because resolve/reject functions are memory heavy.  These
  // optimizations are enabled by default; set to false to disable.


  var allowOptimization = true; // Job queue to simulate ES2015 job queues, linked list, 'next' reference.
  // While ES2015 doesn't guarantee the relative order of jobs in different
  // job queues, within a certain queue strict FIFO is required.  See ES5.1
  // https://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues:
  // "The PendingJob records from a single Job Queue are always initiated in
  // FIFO order. This specification does not define the order in which
  // multiple Job Queues are serviced."

  var queueHead = null,
      queueTail = null;

  function enqueueJob(job) {
    // Avoid inheriting conflicting properties if caller already didn't
    // ensure it.
    Object.setPrototypeOf(job, null);
    compact(job);

    if (queueHead) {
      queueTail.next = job;
      compact(queueTail);
      queueTail = job;
    } else {
      queueHead = job;
      queueTail = job;
    }
  }

  function dequeueJob() {
    var ret = queueHead;

    if (ret) {
      queueHead = ret.next;

      if (!queueHead) {
        queueTail = null;
      }
    }

    return ret;
  }

  function queueEmpty() {
    return !queueHead;
  } // Helper to define/modify properties more compactly.


  function def(obj, key, val, attrs) {
    if (attrs === void 0) {
      attrs = "wc";
    }

    Object.defineProperty(obj, key, {
      value: val,
      writable: attrs.indexOf("w") >= 0,
      enumerable: attrs.indexOf("e") >= 0,
      configurable: attrs.indexOf("c") >= 0
    });
  } // Helper for Duktape specific object compaction.


  var compact = (typeof Duktape === "undefined" ? "undefined" : _typeof(Duktape)) === "object" && Duktape.compact || function (v) {
    return v;
  }; // Shared no-op function.


  var nop = function nop() {}; // Promise detection (plain or subclassed Promise), in spec has
  // [[PromiseState]] internal slot which isn't affected by Proxy
  // behaviors etc.


  var haveSymbols = typeof Symbol === "function";
  var promiseMarker = haveSymbols ? Symbol("promise") : "__PromiseInstance__";

  function isPromise(p) {
    return p !== null && _typeof(p) === "object" && promiseMarker in p;
  }

  function requirePromise(p) {
    if (!isPromise(p)) {
      throw new TypeError("Promise required");
    }
  } // Raw HostPromiseRejectionTracker call.  This operation should "never"
  // fail but that's in practice unachievable due to possible out-of-memory
  // on any operation (including invocation of the callback).  Higher level
  // hook events are emitted from Promise.runQueue().


  function safeCallUnhandledRejection(event) {
    try {
      cons.unhandledRejection(event);
    } catch (e) {//console.log('Promise.unhandledRejection failed:', e);
    }
  }

  function rejectionTracker(p, operation) {
    try {
      if (operation === "reject") {
        // Unhandled at resolution.
        safeCallUnhandledRejection({
          promise: p,
          event: "rawReject",
          reason: p.value
        });
        def(p, "unhandled", 1);
        cons.potentiallyUnhandled.push(p);
      } else if (operation === "handle") {
        safeCallUnhandledRejection({
          promise: p,
          event: "rawHandle",
          reason: p.value
        });

        if (p.unhandled === 2) {
          // Unhandled, already notified, need handled notification.
          def(p, "unhandled", 3);
          cons.potentiallyUnhandled.push(p);
        } else {
          // Handled but not yet notified -> no action needed.
          // XXX: If this.unhandled was 1, we'd like to remove
          // the Promise from cons.potentiallyUnhandled list.
          // We skip that here because it would mean an expensive
          // list remove.  If cons.potentiallyUnhandled was a
          // Set, it would be natural to remove from Set here.
          delete p.unhandled;
        }
      }
    } catch (e) {//console.log('HostPromiseRejectionTracker failed:', e);
    }
  } // Raw fulfill/reject operations, assume resolution processing done.
  // The specification algorithms RejectPromise() and FulfillPromise()
  // assert that the Promise is pending so the initial check in these
  // implementations (p.state !== void 0) is not needed: the resolve/reject
  // function pairs always ensure a Promise is not ultimately settled twice.
  // With some of the "as if" optimizations we rely on these raw operations
  // to protect against multiple attempts to settle the Promise so the checks
  // are actually needed.


  function doFulfill(p, val) {
    if (p.state !== void 0) {
      return;
    } // additional check needed with optimizations


    p.state = true;
    p.value = val;
    var reactions = p.fulfillReactions;
    delete p.fulfillReactions;
    delete p.rejectReactions;
    compact(p);
    reactions.forEach(function (ent) {
      // Conceptually: create a job from the registered reaction.
      // In practice: reuse the reaction object because it is unique,
      // never leaks to calling code, and is never reused.
      ent.value = val;
      enqueueJob(ent);
    });
  }

  function doReject(p, val) {
    if (p.state !== void 0) {
      return;
    } // additional check needed with optimizations


    p.state = false;
    p.value = val;
    var reactions = p.rejectReactions;
    delete p.fulfillReactions;
    delete p.rejectReactions;
    compact(p);
    reactions.forEach(function (ent) {
      // As for doFulfill(), reuse the registered reaction object.
      ent.value = val;

      if (!ent.handler) {
        // Without a .handler, we're dealing with an optimized
        // entry where only .target exists and the resolve/reject
        // behavior is simulated when the entry runs.  However,
        // we need to know whether to simulate resolve or reject
        // at that time, so flag rejection explicitly (resolve
        // requires no flag).
        ent.rejected = true;
      }

      enqueueJob(ent);
    });

    if (!p.isHandled) {
      rejectionTracker(p, "reject");
    }
  } // Create a new resolve/reject pair for a Promise.  Multiple pairs are
  // needed in thenable handling, with all but the most recent pair being
  // neutralized ('alreadyResolved').  Because Promises are resolved only
  // via this resolution process, it shouldn't be possible for the Promise
  // to be settled but check it anyway: it may be useful for e.g. the C API
  // to forcibly resolve/fulfill/reject a Promise regardless of extant
  // resolve/reject functions.


  function createResolutionFunctions(p) {
    // In ES2015 the resolve/reject functions have a shared 'state' object
    // with a [[AlreadyResolved]] slot.  Here we use an in-scope variable.
    var alreadyResolved = false;

    var reject = function _target(err) {
      if (this instanceof _target ? this.constructor : void 0) {
        throw new TypeError("reject is not constructable");
      }

      if (alreadyResolved) {
        return;
      }

      alreadyResolved = true; // neutralize resolve/reject

      if (p.state !== void 0) {
        return;
      }

      doReject(p, err);
    }; // reject.prototype = null; // drop .prototype object


    var resolve = function _target2(val) {
      if (this instanceof _target2 ? this.constructor : void 0) {
        throw new TypeError("resolve is not constructable");
      }

      if (alreadyResolved) {
        return;
      }

      alreadyResolved = true; // neutralize resolve/reject

      if (p.state !== void 0) {
        return;
      }

      if (val === p) {
        return doReject(p, new TypeError("self resolution"));
      }

      try {
        var then = val !== null && _typeof(val) === "object" && val.then;

        if (typeof then === "function") {
          var t = createResolutionFunctions(p);
          var optimized = allowOptimization;

          if (optimized) {
            // XXX: this optimization may not be useful because the
            // job entry runs usually very quickly, and as part of
            // running the job, the resolve/reject function must be
            // created for the then() call.
            return enqueueJob({
              thenable: val,
              then: then,
              target: p
            });
          } else {
            return enqueueJob({
              thenable: val,
              then: then,
              resolve: t.resolve,
              reject: t.reject
            });
          } // old resolve/reject is neutralized, only new pair is live

        }

        return doFulfill(p, val);
      } catch (e) {
        return doReject(p, e);
      }
    }; // resolve.prototype = null; // drop .prototype object


    return {
      resolve: resolve,
      reject: reject
    };
  } // Job queue simulation.


  function runQueueEntry() {
    // XXX: In optimized cases, creating both resolution functions is
    // not always necessary.  There's also no need for alreadySettled
    // protections for the optimized cases either.
    var job = dequeueJob();
    var tmp;

    if (!job) {
      return false;
    }

    if (job.then) {
      // PromiseResolveThenableJob
      if (job.target) {
        tmp = createResolutionFunctions(job.target);
      }

      try {
        if (tmp) {
          void job.then.call(job.thenable, tmp.resolve, tmp.reject);
        } else {
          void job.then.call(job.thenable, job.resolve, job.reject);
        }
      } catch (e) {
        if (tmp) {
          tmp.reject.call(void 0, e);
        } else {
          job.reject.call(void 0, e);
        }
      }
    } else {
      // PromiseReactionJob
      try {
        if (job.handler === void 0) {
          // Optimized case where two Promises are tied together
          // without the need for an actual 'handler'.
          tmp = createResolutionFunctions(job.target); // must exist in this case

          tmp = job.rejected ? tmp.reject : tmp.resolve;
          tmp.call(void 0, job.value);
          return true;
        } else if (job.handler === "Identity") {
          res = job.value;
        } else if (job.handler === "Thrower") {
          throw job.value;
        } else {
          res = job.handler.call(void 0, job.value);
        }

        if (job.target) {
          createResolutionFunctions(job.target).resolve.call(void 0, res);
        } else {
          job.resolve.call(void 0, res);
        }
      } catch (e) {
        if (job.target) {
          createResolutionFunctions(job.target).reject.call(void 0, e);
        } else {
          job.reject.call(void 0, e);
        }
      }
    }

    return true;
  } // %Promise% constructor.


  var cons = function Promise(executor) {
    if (!(this instanceof Promise ? this.constructor : void 0)) {
      throw new TypeError("Promise must be called as a constructor");
    }

    if (typeof executor !== "function") {
      throw new TypeError("executor must be callable");
    }

    var _this = this;

    def(this, promiseMarker, true, "");
    def(this, "state", void 0); // undefined (pending), true/false

    def(this, "value", void 0);
    def(this, "fulfillReactions", []);
    def(this, "rejectReactions", []);
    def(this, "isHandled", false); // XXX: roll into 'state' to minimize fields

    compact(this);
    var t = createResolutionFunctions(this);

    try {
      void executor(t.resolve, t.reject);
    } catch (e) {
      t.reject(e);
    }
  };

  var proto = cons.prototype;
  def(cons, "prototype", proto, "");
  def(cons, "potentiallyUnhandled", [], ""); // %Promise%.resolve().
  // XXX: direct handling

  function resolve(val) {
    if (isPromise(val) && val.constructor === this) {
      return val;
    }

    return new Promise(function (resolve, reject) {
      resolve(val);
    });
  } // %Promise%.reject()
  // XXX: direct handling


  function reject(val) {
    return new Promise(function (resolve, reject) {
      reject(val);
    });
  } // %Promise%.all().


  function all(list) {
    if (!Array.isArray(list)) {
      throw new TypeError("non-array all() argument not supported");
    }

    var resolveFn, rejectFn;
    var p = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });
    var values = [];
    var index = 0;
    var remaining = 1; // remaining intentionally 1, not 0

    list.forEach(function (x) {
      // XXX: no iterator support
      var t = Promise.resolve(x);

      var f = function promiseAllElement(val) {
        var F = promiseAllElement;

        if (F.alreadyCalled) {
          return;
        }

        F.alreadyCalled = true;
        values[F.index] = val;

        if (--remaining === 0) {
          resolveFn.call(void 0, values);
        }
      }; // In ES2015 the functions would reference a shared state object
      // explicitly.  Here the conceptual state is in scope.


      f.index = index++;
      remaining++;
      t.then(f, rejectFn);
    });

    if (--remaining === 0) {
      resolveFn.call(void 0, values);
    }

    return p;
  } // %Promise%.race().


  function race(list) {
    if (!Array.isArray(list)) {
      throw new TypeError("non-array race() argument not supported");
    }

    var resolveFn, rejectFn;
    var p = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });
    list.forEach(function (x) {
      // XXX: no iterator support
      var t = Promise.resolve(x);
      var func = t.then;
      var optimized = func === then && allowOptimization;

      if (optimized) {
        // If the .then() of the Promise.resolve() is the original
        // built-in implementation, we don't need to queue the actual
        // resolve and reject functions explicitly because (1) the
        // functions don't leak and can't be called by anyone else,
        // and (2) the onFulfilled/onRejected functions would just
        // directly forward the result from 't' to 'p'.
        optimizedThen(t, p);
      } else {
        // Generic case, the result Promise of .then() is ignored.
        void func.call(t, resolveFn, rejectFn);
      }
    });
    return p;
  } // %PromisePrototype%.then(), also used for .catch().


  function then(onFulfilled, onRejected) {
    // No subclassing support here now, no NewPromiseCapability() handling.
    requirePromise(this);
    var resolveFn, rejectFn;
    var p = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });
    var optimized = allowOptimization;

    if (typeof onFulfilled !== "function") {
      onFulfilled = "Identity";
    }

    if (typeof onRejected !== "function") {
      onRejected = "Thrower";
    }

    if (this.state === void 0) {
      // pending
      if (optimized) {
        this.fulfillReactions.push({
          handler: onFulfilled,
          target: p
        });
        this.rejectReactions.push({
          handler: onRejected,
          target: p
        });
      } else {
        this.fulfillReactions.push({
          handler: onFulfilled,
          resolve: resolveFn,
          reject: rejectFn
        });
        this.rejectReactions.push({
          handler: onRejected,
          resolve: resolveFn,
          reject: rejectFn
        });
      }
    } else if (this.state) {
      // fulfilled
      if (optimized) {
        enqueueJob({
          handler: onFulfilled,
          target: p,
          value: this.value
        });
      } else {
        enqueueJob({
          handler: onFulfilled,
          resolve: resolveFn,
          reject: rejectFn,
          value: this.value
        });
      }
    } else {
      // rejected
      if (!this.isHandled) {
        rejectionTracker(this, "handle");
      }

      if (optimized) {
        enqueueJob({
          handler: onRejected,
          target: p,
          value: this.value
        });
      } else {
        enqueueJob({
          handler: onRejected,
          resolve: resolveFn,
          reject: rejectFn,
          value: this.value
        });
      }
    }

    this.isHandled = true;
    return p;
  } // Optimized .then() where a specific source Promise just forwards its
  // result to a target Promise unless its already settled.


  function optimizedThen(source, target) {
    if (source.state === void 0) {
      // pending
      source.fulfillReactions.push({
        target: target
      });
      source.rejectReactions.push({
        target: target
      });
    } else if (source.state) {
      // fulfilled
      enqueueJob({
        target: target,
        value: source.value
      });
    } else {
      // rejected
      if (!source.isHandled) {
        rejectionTracker(source, "handle");
      }

      enqueueJob({
        target: target,
        value: source.value,
        rejected: true
      });
    }

    source.isHandled = true;
  } // %PromisePrototype%.catch.


  var _catch = function _catch(onRejected) {
    return this.then.call(this, void 0, onRejected);
  };

  def(_catch, "name", "catch", "c"); // %Promise%.try(), https://github.com/tc39/proposal-promise-try,
  // simple polyfill-style implementation.

  var _try = function _try(func) {
    // XXX: check 'this' for callability, or Promise / subclass.
    return new this(function (resolve, reject) {
      resolve(func());
    });
  };

  def(_try, "name", "try", "c"); // Emit higher level Node.js/WHATWG like 'reject' and 'handle' events,
  // filtering out some cases where a rejected Promise is initially unhandled
  // but is handled within the same "tick" (for a relatively murky definition
  // of a "tick").
  // https://html.spec.whatwg.org/multipage/webappapis.html#unhandled-promise-rejections
  // https://www.ecma-international.org/ecma-262/8.0/#sec-host-promise-rejection-tracker

  function checkUnhandledRejections() {
    var idx; // The unhandledRejection() callbacks may have queued more Promises,
    // settled existing Promises on the list, etc.  Keep going until
    // the list is empty.  Null out entries to allow early GC when the
    // Promises are no longer reachable.  Callbacks may also queue more
    // ordinary Promise jobs; they are also handled to completion within
    // the tick.
    // XXX: It might be more natural to handle the notification callbacks
    // via the job queue.  This might be a bit simpler, but would change
    // the Promise job vs. unhandledRejection callback ordering a bit.
    // For example, Node.js emits 'handle' events before the related
    // catch callbacks are called, while the polyfill in its current
    // state does not.

    for (idx = 0; idx < cons.potentiallyUnhandled.length; idx++) {
      var p = cons.potentiallyUnhandled[idx];
      cons.potentiallyUnhandled[idx] = null; // For consistency with hook calls from HostPromiseRejectionTracker
      // errors from user callback are silently eaten.  If a process exit
      // is desirable, user callback may call a custom native binding to
      // do that ("process.exit(1)" or similar).
      //
      // Use a custom object argument convention for flexibility.

      if (p.unhandled === 1) {
        safeCallUnhandledRejection({
          promise: p,
          event: "reject",
          reason: p.value
        });
        def(p, "unhandled", 2);
      } else if (p.unhandled === 3) {
        safeCallUnhandledRejection({
          promise: p,
          event: "handle",
          reason: p.value
        });
        delete p.unhandled;
      }
    }

    cons.potentiallyUnhandled.length = 0;
    return idx > 0; // true if we processed entries
  } // Define visible objects and properties.


  (function () {
    def(this, "Promise", cons);
    def(cons, "resolve", resolve);
    def(cons, "reject", reject);
    def(cons, "all", all);
    def(cons, "race", race);
    def(cons, "try", _try);
    def(cons, "isPolyfill", true); // needed by e.g. testcases

    def(proto, "then", then);
    def(proto, "catch", _catch);

    if (haveSymbols) {
      def(proto, Symbol.toStringTag, "Promise", "c");
    } // Custom API to drive the "job queue".  We only want to exit when
    // there are no more Promise jobs or unhandledRejection() callbacks,
    // i.e. no more work to do.  Note that an unhandledRejection()
    // callback may queue more Promise job entries and vice versa.


    def(cons, "runQueue", function _runQueueUntilEmpty() {
      do {
        while (runQueueEntry()) {}

        checkUnhandledRejections();
      } while (!(queueEmpty() && cons.potentiallyUnhandled.length === 0));
    });
    def(cons, "unhandledRejection", nop);
    compact(this);
    compact(cons);
    compact(proto);
  })();
})();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(5);

function subscriber(topic) {
  var messaging = ClearBlade.Messaging();
  var promise = new Promise(function (resolve, reject) {
    messaging.subscribe(topic, function (err, data) {
      if (err) {
        reject(new Error('Error with subscribing: ' + JSON.stringify(data)));
      } else {
        resolve(data);
      }
    });
  });
  return promise;
}

exports.subscriber = subscriber;

function bulkSubscriber(topics) {
  return new Promise(function (resolve, reject) {
    Promise.all(topics.map(function (topic) {
      subscriber(topic);
    })).then(function () {
      resolve();
    })["catch"](function (e) {
      log("Subscription error: " + e.message);
      reject(new Error(e));
    });
    Promise.runQueue();
  });
}

exports.bulkSubscriber = bulkSubscriber;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 *  Minimal ES2015+ Promise polyfill
 *
 *  Limitations (also see XXX in source):
 *
 *    - Caller must manually call Promise.runQueue() to process pending jobs.
 *    - No Promise subclassing or non-subclass foreign Promises yet.
 *    - Promise.all() and Promise.race() assume a plain array, not iterator.
 *    - Doesn't handle errors from core operations, e.g. out-of-memory or
 *      internal error when queueing/running jobs.  These are implementation
 *      defined for the most part.
 *
 *  This polyfill was originally used to gain a better understanding of the
 *  ES2015 specification algorithms, before implementing Promises natively.
 *
 *  The polyfill uses a Symbol to mark Promise instances, but falls back to
 *  an ordinary (non-enumerable) property if no Symbol support is available.
 *  Presence of the polyfill itself can be checked using "Promise.isPolyfill".
 *
 *  Unhandled Promise rejections use a custom API signature.  For now, a
 *  single Promise.unhandledRejection() hook receives both 'rawReject' and
 *  'rawHandle' events directly from HostPromiseRejectionTracker, and higher
 *  level (Node.js / WHATWG like) 'reject' and 'handle' events which filter
 *  out cases where a rejected Promise is initially unhandled but gets handled
 *  within the same "tick".
 *
 *  See also: https://github.com/stefanpenner/es6-promise#readme
 */
(function () {
  if (typeof Promise !== "undefined") {
    return;
  } // As far as the specification goes, almost all Promise settling is via
  // concrete resolve/reject functions with mutual protection from being
  // called multiple times.  Sometimes the actual resolve/reject functions
  // are not exposed to calling code, and can safely be omitted which is
  // useful because resolve/reject functions are memory heavy.  These
  // optimizations are enabled by default; set to false to disable.


  var allowOptimization = true; // Job queue to simulate ES2015 job queues, linked list, 'next' reference.
  // While ES2015 doesn't guarantee the relative order of jobs in different
  // job queues, within a certain queue strict FIFO is required.  See ES5.1
  // https://www.ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues:
  // "The PendingJob records from a single Job Queue are always initiated in
  // FIFO order. This specification does not define the order in which
  // multiple Job Queues are serviced."

  var queueHead = null,
      queueTail = null;

  function enqueueJob(job) {
    // Avoid inheriting conflicting properties if caller already didn't
    // ensure it.
    Object.setPrototypeOf(job, null);
    compact(job);

    if (queueHead) {
      queueTail.next = job;
      compact(queueTail);
      queueTail = job;
    } else {
      queueHead = job;
      queueTail = job;
    }
  }

  function dequeueJob() {
    var ret = queueHead;

    if (ret) {
      queueHead = ret.next;

      if (!queueHead) {
        queueTail = null;
      }
    }

    return ret;
  }

  function queueEmpty() {
    return !queueHead;
  } // Helper to define/modify properties more compactly.


  function def(obj, key, val, attrs) {
    if (attrs === void 0) {
      attrs = "wc";
    }

    Object.defineProperty(obj, key, {
      value: val,
      writable: attrs.indexOf("w") >= 0,
      enumerable: attrs.indexOf("e") >= 0,
      configurable: attrs.indexOf("c") >= 0
    });
  } // Helper for Duktape specific object compaction.


  var compact = (typeof Duktape === "undefined" ? "undefined" : _typeof(Duktape)) === "object" && Duktape.compact || function (v) {
    return v;
  }; // Shared no-op function.


  var nop = function nop() {}; // Promise detection (plain or subclassed Promise), in spec has
  // [[PromiseState]] internal slot which isn't affected by Proxy
  // behaviors etc.


  var haveSymbols = typeof Symbol === "function";
  var promiseMarker = haveSymbols ? Symbol("promise") : "__PromiseInstance__";

  function isPromise(p) {
    return p !== null && _typeof(p) === "object" && promiseMarker in p;
  }

  function requirePromise(p) {
    if (!isPromise(p)) {
      throw new TypeError("Promise required");
    }
  } // Raw HostPromiseRejectionTracker call.  This operation should "never"
  // fail but that's in practice unachievable due to possible out-of-memory
  // on any operation (including invocation of the callback).  Higher level
  // hook events are emitted from Promise.runQueue().


  function safeCallUnhandledRejection(event) {
    try {
      cons.unhandledRejection(event);
    } catch (e) {//console.log('Promise.unhandledRejection failed:', e);
    }
  }

  function rejectionTracker(p, operation) {
    try {
      if (operation === "reject") {
        // Unhandled at resolution.
        safeCallUnhandledRejection({
          promise: p,
          event: "rawReject",
          reason: p.value
        });
        def(p, "unhandled", 1);
        cons.potentiallyUnhandled.push(p);
      } else if (operation === "handle") {
        safeCallUnhandledRejection({
          promise: p,
          event: "rawHandle",
          reason: p.value
        });

        if (p.unhandled === 2) {
          // Unhandled, already notified, need handled notification.
          def(p, "unhandled", 3);
          cons.potentiallyUnhandled.push(p);
        } else {
          // Handled but not yet notified -> no action needed.
          // XXX: If this.unhandled was 1, we'd like to remove
          // the Promise from cons.potentiallyUnhandled list.
          // We skip that here because it would mean an expensive
          // list remove.  If cons.potentiallyUnhandled was a
          // Set, it would be natural to remove from Set here.
          delete p.unhandled;
        }
      }
    } catch (e) {//console.log('HostPromiseRejectionTracker failed:', e);
    }
  } // Raw fulfill/reject operations, assume resolution processing done.
  // The specification algorithms RejectPromise() and FulfillPromise()
  // assert that the Promise is pending so the initial check in these
  // implementations (p.state !== void 0) is not needed: the resolve/reject
  // function pairs always ensure a Promise is not ultimately settled twice.
  // With some of the "as if" optimizations we rely on these raw operations
  // to protect against multiple attempts to settle the Promise so the checks
  // are actually needed.


  function doFulfill(p, val) {
    if (p.state !== void 0) {
      return;
    } // additional check needed with optimizations


    p.state = true;
    p.value = val;
    var reactions = p.fulfillReactions;
    delete p.fulfillReactions;
    delete p.rejectReactions;
    compact(p);
    reactions.forEach(function (ent) {
      // Conceptually: create a job from the registered reaction.
      // In practice: reuse the reaction object because it is unique,
      // never leaks to calling code, and is never reused.
      ent.value = val;
      enqueueJob(ent);
    });
  }

  function doReject(p, val) {
    if (p.state !== void 0) {
      return;
    } // additional check needed with optimizations


    p.state = false;
    p.value = val;
    var reactions = p.rejectReactions;
    delete p.fulfillReactions;
    delete p.rejectReactions;
    compact(p);
    reactions.forEach(function (ent) {
      // As for doFulfill(), reuse the registered reaction object.
      ent.value = val;

      if (!ent.handler) {
        // Without a .handler, we're dealing with an optimized
        // entry where only .target exists and the resolve/reject
        // behavior is simulated when the entry runs.  However,
        // we need to know whether to simulate resolve or reject
        // at that time, so flag rejection explicitly (resolve
        // requires no flag).
        ent.rejected = true;
      }

      enqueueJob(ent);
    });

    if (!p.isHandled) {
      rejectionTracker(p, "reject");
    }
  } // Create a new resolve/reject pair for a Promise.  Multiple pairs are
  // needed in thenable handling, with all but the most recent pair being
  // neutralized ('alreadyResolved').  Because Promises are resolved only
  // via this resolution process, it shouldn't be possible for the Promise
  // to be settled but check it anyway: it may be useful for e.g. the C API
  // to forcibly resolve/fulfill/reject a Promise regardless of extant
  // resolve/reject functions.


  function createResolutionFunctions(p) {
    // In ES2015 the resolve/reject functions have a shared 'state' object
    // with a [[AlreadyResolved]] slot.  Here we use an in-scope variable.
    var alreadyResolved = false;

    var reject = function _target(err) {
      if (this instanceof _target ? this.constructor : void 0) {
        throw new TypeError("reject is not constructable");
      }

      if (alreadyResolved) {
        return;
      }

      alreadyResolved = true; // neutralize resolve/reject

      if (p.state !== void 0) {
        return;
      }

      doReject(p, err);
    }; // reject.prototype = null; // drop .prototype object


    var resolve = function _target2(val) {
      if (this instanceof _target2 ? this.constructor : void 0) {
        throw new TypeError("resolve is not constructable");
      }

      if (alreadyResolved) {
        return;
      }

      alreadyResolved = true; // neutralize resolve/reject

      if (p.state !== void 0) {
        return;
      }

      if (val === p) {
        return doReject(p, new TypeError("self resolution"));
      }

      try {
        var then = val !== null && _typeof(val) === "object" && val.then;

        if (typeof then === "function") {
          var t = createResolutionFunctions(p);
          var optimized = allowOptimization;

          if (optimized) {
            // XXX: this optimization may not be useful because the
            // job entry runs usually very quickly, and as part of
            // running the job, the resolve/reject function must be
            // created for the then() call.
            return enqueueJob({
              thenable: val,
              then: then,
              target: p
            });
          } else {
            return enqueueJob({
              thenable: val,
              then: then,
              resolve: t.resolve,
              reject: t.reject
            });
          } // old resolve/reject is neutralized, only new pair is live

        }

        return doFulfill(p, val);
      } catch (e) {
        return doReject(p, e);
      }
    }; // resolve.prototype = null; // drop .prototype object


    return {
      resolve: resolve,
      reject: reject
    };
  } // Job queue simulation.


  function runQueueEntry() {
    // XXX: In optimized cases, creating both resolution functions is
    // not always necessary.  There's also no need for alreadySettled
    // protections for the optimized cases either.
    var job = dequeueJob();
    var tmp;

    if (!job) {
      return false;
    }

    if (job.then) {
      // PromiseResolveThenableJob
      if (job.target) {
        tmp = createResolutionFunctions(job.target);
      }

      try {
        if (tmp) {
          void job.then.call(job.thenable, tmp.resolve, tmp.reject);
        } else {
          void job.then.call(job.thenable, job.resolve, job.reject);
        }
      } catch (e) {
        if (tmp) {
          tmp.reject.call(void 0, e);
        } else {
          job.reject.call(void 0, e);
        }
      }
    } else {
      // PromiseReactionJob
      try {
        if (job.handler === void 0) {
          // Optimized case where two Promises are tied together
          // without the need for an actual 'handler'.
          tmp = createResolutionFunctions(job.target); // must exist in this case

          tmp = job.rejected ? tmp.reject : tmp.resolve;
          tmp.call(void 0, job.value);
          return true;
        } else if (job.handler === "Identity") {
          res = job.value;
        } else if (job.handler === "Thrower") {
          throw job.value;
        } else {
          res = job.handler.call(void 0, job.value);
        }

        if (job.target) {
          createResolutionFunctions(job.target).resolve.call(void 0, res);
        } else {
          job.resolve.call(void 0, res);
        }
      } catch (e) {
        if (job.target) {
          createResolutionFunctions(job.target).reject.call(void 0, e);
        } else {
          job.reject.call(void 0, e);
        }
      }
    }

    return true;
  } // %Promise% constructor.


  var cons = function Promise(executor) {
    if (!(this instanceof Promise ? this.constructor : void 0)) {
      throw new TypeError("Promise must be called as a constructor");
    }

    if (typeof executor !== "function") {
      throw new TypeError("executor must be callable");
    }

    var _this = this;

    def(this, promiseMarker, true, "");
    def(this, "state", void 0); // undefined (pending), true/false

    def(this, "value", void 0);
    def(this, "fulfillReactions", []);
    def(this, "rejectReactions", []);
    def(this, "isHandled", false); // XXX: roll into 'state' to minimize fields

    compact(this);
    var t = createResolutionFunctions(this);

    try {
      void executor(t.resolve, t.reject);
    } catch (e) {
      t.reject(e);
    }
  };

  var proto = cons.prototype;
  def(cons, "prototype", proto, "");
  def(cons, "potentiallyUnhandled", [], ""); // %Promise%.resolve().
  // XXX: direct handling

  function resolve(val) {
    if (isPromise(val) && val.constructor === this) {
      return val;
    }

    return new Promise(function (resolve, reject) {
      resolve(val);
    });
  } // %Promise%.reject()
  // XXX: direct handling


  function reject(val) {
    return new Promise(function (resolve, reject) {
      reject(val);
    });
  } // %Promise%.all().


  function all(list) {
    if (!Array.isArray(list)) {
      throw new TypeError("non-array all() argument not supported");
    }

    var resolveFn, rejectFn;
    var p = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });
    var values = [];
    var index = 0;
    var remaining = 1; // remaining intentionally 1, not 0

    list.forEach(function (x) {
      // XXX: no iterator support
      var t = Promise.resolve(x);

      var f = function promiseAllElement(val) {
        var F = promiseAllElement;

        if (F.alreadyCalled) {
          return;
        }

        F.alreadyCalled = true;
        values[F.index] = val;

        if (--remaining === 0) {
          resolveFn.call(void 0, values);
        }
      }; // In ES2015 the functions would reference a shared state object
      // explicitly.  Here the conceptual state is in scope.


      f.index = index++;
      remaining++;
      t.then(f, rejectFn);
    });

    if (--remaining === 0) {
      resolveFn.call(void 0, values);
    }

    return p;
  } // %Promise%.race().


  function race(list) {
    if (!Array.isArray(list)) {
      throw new TypeError("non-array race() argument not supported");
    }

    var resolveFn, rejectFn;
    var p = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });
    list.forEach(function (x) {
      // XXX: no iterator support
      var t = Promise.resolve(x);
      var func = t.then;
      var optimized = func === then && allowOptimization;

      if (optimized) {
        // If the .then() of the Promise.resolve() is the original
        // built-in implementation, we don't need to queue the actual
        // resolve and reject functions explicitly because (1) the
        // functions don't leak and can't be called by anyone else,
        // and (2) the onFulfilled/onRejected functions would just
        // directly forward the result from 't' to 'p'.
        optimizedThen(t, p);
      } else {
        // Generic case, the result Promise of .then() is ignored.
        void func.call(t, resolveFn, rejectFn);
      }
    });
    return p;
  } // %PromisePrototype%.then(), also used for .catch().


  function then(onFulfilled, onRejected) {
    // No subclassing support here now, no NewPromiseCapability() handling.
    requirePromise(this);
    var resolveFn, rejectFn;
    var p = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });
    var optimized = allowOptimization;

    if (typeof onFulfilled !== "function") {
      onFulfilled = "Identity";
    }

    if (typeof onRejected !== "function") {
      onRejected = "Thrower";
    }

    if (this.state === void 0) {
      // pending
      if (optimized) {
        this.fulfillReactions.push({
          handler: onFulfilled,
          target: p
        });
        this.rejectReactions.push({
          handler: onRejected,
          target: p
        });
      } else {
        this.fulfillReactions.push({
          handler: onFulfilled,
          resolve: resolveFn,
          reject: rejectFn
        });
        this.rejectReactions.push({
          handler: onRejected,
          resolve: resolveFn,
          reject: rejectFn
        });
      }
    } else if (this.state) {
      // fulfilled
      if (optimized) {
        enqueueJob({
          handler: onFulfilled,
          target: p,
          value: this.value
        });
      } else {
        enqueueJob({
          handler: onFulfilled,
          resolve: resolveFn,
          reject: rejectFn,
          value: this.value
        });
      }
    } else {
      // rejected
      if (!this.isHandled) {
        rejectionTracker(this, "handle");
      }

      if (optimized) {
        enqueueJob({
          handler: onRejected,
          target: p,
          value: this.value
        });
      } else {
        enqueueJob({
          handler: onRejected,
          resolve: resolveFn,
          reject: rejectFn,
          value: this.value
        });
      }
    }

    this.isHandled = true;
    return p;
  } // Optimized .then() where a specific source Promise just forwards its
  // result to a target Promise unless its already settled.


  function optimizedThen(source, target) {
    if (source.state === void 0) {
      // pending
      source.fulfillReactions.push({
        target: target
      });
      source.rejectReactions.push({
        target: target
      });
    } else if (source.state) {
      // fulfilled
      enqueueJob({
        target: target,
        value: source.value
      });
    } else {
      // rejected
      if (!source.isHandled) {
        rejectionTracker(source, "handle");
      }

      enqueueJob({
        target: target,
        value: source.value,
        rejected: true
      });
    }

    source.isHandled = true;
  } // %PromisePrototype%.catch.


  var _catch = function _catch(onRejected) {
    return this.then.call(this, void 0, onRejected);
  };

  def(_catch, "name", "catch", "c"); // %Promise%.try(), https://github.com/tc39/proposal-promise-try,
  // simple polyfill-style implementation.

  var _try = function _try(func) {
    // XXX: check 'this' for callability, or Promise / subclass.
    return new this(function (resolve, reject) {
      resolve(func());
    });
  };

  def(_try, "name", "try", "c"); // Emit higher level Node.js/WHATWG like 'reject' and 'handle' events,
  // filtering out some cases where a rejected Promise is initially unhandled
  // but is handled within the same "tick" (for a relatively murky definition
  // of a "tick").
  // https://html.spec.whatwg.org/multipage/webappapis.html#unhandled-promise-rejections
  // https://www.ecma-international.org/ecma-262/8.0/#sec-host-promise-rejection-tracker

  function checkUnhandledRejections() {
    var idx; // The unhandledRejection() callbacks may have queued more Promises,
    // settled existing Promises on the list, etc.  Keep going until
    // the list is empty.  Null out entries to allow early GC when the
    // Promises are no longer reachable.  Callbacks may also queue more
    // ordinary Promise jobs; they are also handled to completion within
    // the tick.
    // XXX: It might be more natural to handle the notification callbacks
    // via the job queue.  This might be a bit simpler, but would change
    // the Promise job vs. unhandledRejection callback ordering a bit.
    // For example, Node.js emits 'handle' events before the related
    // catch callbacks are called, while the polyfill in its current
    // state does not.

    for (idx = 0; idx < cons.potentiallyUnhandled.length; idx++) {
      var p = cons.potentiallyUnhandled[idx];
      cons.potentiallyUnhandled[idx] = null; // For consistency with hook calls from HostPromiseRejectionTracker
      // errors from user callback are silently eaten.  If a process exit
      // is desirable, user callback may call a custom native binding to
      // do that ("process.exit(1)" or similar).
      //
      // Use a custom object argument convention for flexibility.

      if (p.unhandled === 1) {
        safeCallUnhandledRejection({
          promise: p,
          event: "reject",
          reason: p.value
        });
        def(p, "unhandled", 2);
      } else if (p.unhandled === 3) {
        safeCallUnhandledRejection({
          promise: p,
          event: "handle",
          reason: p.value
        });
        delete p.unhandled;
      }
    }

    cons.potentiallyUnhandled.length = 0;
    return idx > 0; // true if we processed entries
  } // Define visible objects and properties.


  (function () {
    def(this, "Promise", cons);
    def(cons, "resolve", resolve);
    def(cons, "reject", reject);
    def(cons, "all", all);
    def(cons, "race", race);
    def(cons, "try", _try);
    def(cons, "isPolyfill", true); // needed by e.g. testcases

    def(proto, "then", then);
    def(proto, "catch", _catch);

    if (haveSymbols) {
      def(proto, Symbol.toStringTag, "Promise", "c");
    } // Custom API to drive the "job queue".  We only want to exit when
    // there are no more Promise jobs or unhandledRejection() callbacks,
    // i.e. no more work to do.  Note that an unhandledRejection()
    // callback may queue more Promise job entries and vice versa.


    def(cons, "runQueue", function _runQueueUntilEmpty() {
      do {
        while (runQueueEntry()) {}

        checkUnhandledRejections();
      } while (!(queueEmpty() && cons.potentiallyUnhandled.length === 0));
    });
    def(cons, "unhandledRejection", nop);
    compact(this);
    compact(cons);
    compact(proto);
  })();
})();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_EDGE_RELAY_CACHE_COLLECTION_NAME = 'edge_relay_cache';
exports.DEFAULT_EDGE_RELAY_CACHE_NAME = 'edgeDataSharedCache';

/***/ })
/******/ ]);