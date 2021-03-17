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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/after/index.js":
/***/ (function(module, exports) {

module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}


/***/ }),

/***/ "./node_modules/arraybuffer.slice/index.js":
/***/ (function(module, exports) {

/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};


/***/ }),

/***/ "./node_modules/axios/index.js":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");
var settle = __webpack_require__("./node_modules/axios/lib/core/settle.js");
var buildURL = __webpack_require__("./node_modules/axios/lib/helpers/buildURL.js");
var parseHeaders = __webpack_require__("./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__("./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__("./node_modules/axios/lib/core/createError.js");
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__("./node_modules/axios/lib/helpers/btoa.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if ("development" !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__("./node_modules/axios/lib/helpers/cookies.js");

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");
var bind = __webpack_require__("./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__("./node_modules/axios/lib/core/Axios.js");
var defaults = __webpack_require__("./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__("./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__("./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__("./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__("./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__("./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__("./node_modules/axios/lib/defaults.js");
var utils = __webpack_require__("./node_modules/axios/lib/utils.js");
var InterceptorManager = __webpack_require__("./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__("./node_modules/axios/lib/core/dispatchRequest.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__("./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__("./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__("./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__("./node_modules/axios/lib/defaults.js");
var isAbsoluteURL = __webpack_require__("./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__("./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__("./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__("./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__("./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__("./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__("./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/btoa.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__("./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__("./node_modules/axios/lib/helpers/bind.js");
var isBuffer = __webpack_require__("./node_modules/is-buffer/index.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ "./node_modules/backo2/index.js":
/***/ (function(module, exports) {


/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};



/***/ }),

/***/ "./node_modules/base64-arraybuffer/lib/base64-arraybuffer.js":
/***/ (function(module, exports) {

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();


/***/ }),

/***/ "./node_modules/base64-js/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/blob/index.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/buffer/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__("./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__("./node_modules/ieee754/index.js")
var isArray = __webpack_require__("./node_modules/isarray/index.js")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/component-bind/index.js":
/***/ (function(module, exports) {

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};


/***/ }),

/***/ "./node_modules/component-emitter/index.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * Expose `Emitter`.
 */

if (true) {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ }),

/***/ "./node_modules/component-inherit/index.js":
/***/ (function(module, exports) {


module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};

/***/ }),

/***/ "./node_modules/engine.io-client/lib/index.js":
/***/ (function(module, exports, __webpack_require__) {


module.exports = __webpack_require__("./node_modules/engine.io-client/lib/socket.js");

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = __webpack_require__("./node_modules/engine.io-parser/lib/browser.js");


/***/ }),

/***/ "./node_modules/engine.io-client/lib/socket.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies.
 */

var transports = __webpack_require__("./node_modules/engine.io-client/lib/transports/index.js");
var Emitter = __webpack_require__("./node_modules/component-emitter/index.js");
var debug = __webpack_require__("./node_modules/engine.io-client/node_modules/debug/src/browser.js")('engine.io-client:socket');
var index = __webpack_require__("./node_modules/indexof/index.js");
var parser = __webpack_require__("./node_modules/engine.io-parser/lib/browser.js");
var parseuri = __webpack_require__("./node_modules/parseuri/index.js");
var parseqs = __webpack_require__("./node_modules/parseqs/index.js");

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket (uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure
    : (global.location && 'https:' === location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port
      ? location.port
      : (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.transportOptions = opts.transportOptions || {};
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode;

  // other options for Node.js client
  var freeGlobal = typeof global === 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  }

  // set on handshake
  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null;

  // set on heartbeat
  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = __webpack_require__("./node_modules/engine.io-client/lib/transport.js");
Socket.transports = __webpack_require__("./node_modules/engine.io-client/lib/transports/index.js");
Socket.parser = __webpack_require__("./node_modules/engine.io-parser/lib/browser.js");

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // per-transport options
  var options = this.transportOptions[name] || {};

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    query: query,
    socket: this,
    agent: options.agent || this.agent,
    hostname: options.hostname || this.hostname,
    port: options.port || this.port,
    secure: options.secure || this.secure,
    path: options.path || this.path,
    forceJSONP: options.forceJSONP || this.forceJSONP,
    jsonp: options.jsonp || this.jsonp,
    forceBase64: options.forceBase64 || this.forceBase64,
    enablesXDR: options.enablesXDR || this.enablesXDR,
    timestampRequests: options.timestampRequests || this.timestampRequests,
    timestampParam: options.timestampParam || this.timestampParam,
    policyPort: options.policyPort || this.policyPort,
    pfx: options.pfx || this.pfx,
    key: options.key || this.key,
    passphrase: options.passphrase || this.passphrase,
    cert: options.cert || this.cert,
    ca: options.ca || this.ca,
    ciphers: options.ciphers || this.ciphers,
    rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
    perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
    extraHeaders: options.extraHeaders || this.extraHeaders,
    forceNode: options.forceNode || this.forceNode,
    localAddress: options.localAddress || this.localAddress,
    requestTimeout: options.requestTimeout || this.requestTimeout,
    protocols: options.protocols || void (0)
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function () {
    self.onDrain();
  })
  .on('packet', function (packet) {
    self.onPacket(packet);
  })
  .on('error', function (e) {
    self.onError(e);
  })
  .on('close', function () {
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 });
  var failed = false;
  var self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen () {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' === msg.type && 'probe' === msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport () {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  // Handle any error that happens while probing
  function onerror (err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose () {
    onerror('transport closed');
  }

  // When the socket is closed while we're probing
  function onclose () {
    onerror('socket closed');
  }

  // When the socket is upgraded while we're probing
  function onupgrade (to) {
    if (transport && to.name !== transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  // Remove all listeners on the transport and on self
  function cleanup () {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState ||
      'closing' === this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(JSON.parse(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if ('closed' === this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close () {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose () {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade () {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/lib/transport.js":
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var parser = __webpack_require__("./node_modules/engine.io-parser/lib/browser.js");
var Emitter = __webpack_require__("./node_modules/component-emitter/index.js");

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};


/***/ }),

/***/ "./node_modules/engine.io-client/lib/transports/index.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies
 */

var XMLHttpRequest = __webpack_require__("./node_modules/engine.io-client/lib/xmlhttprequest.js");
var XHR = __webpack_require__("./node_modules/engine.io-client/lib/transports/polling-xhr.js");
var JSONP = __webpack_require__("./node_modules/engine.io-client/lib/transports/polling-jsonp.js");
var websocket = __webpack_require__("./node_modules/engine.io-client/lib/transports/websocket.js");

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/lib/transports/polling-jsonp.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module requirements.
 */

var Polling = __webpack_require__("./node_modules/engine.io-client/lib/transports/polling.js");
var inherit = __webpack_require__("./node_modules/component-inherit/index.js");

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/lib/transports/polling-xhr.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module requirements.
 */

var XMLHttpRequest = __webpack_require__("./node_modules/engine.io-client/lib/xmlhttprequest.js");
var Polling = __webpack_require__("./node_modules/engine.io-client/lib/transports/polling.js");
var Emitter = __webpack_require__("./node_modules/component-emitter/index.js");
var inherit = __webpack_require__("./node_modules/component-inherit/index.js");
var debug = __webpack_require__("./node_modules/engine.io-client/node_modules/debug/src/browser.js")('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty () {}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR (opts) {
  Polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;
  this.extraHeaders = opts.extraHeaders;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname !== global.location.hostname ||
      port !== opts.port;
    this.xs = opts.secure !== isSSL;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function () {
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request (opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.requestTimeout = opts.requestTimeout;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {}

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };
      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 2) {
          try {
            var contentType = xhr.getResponseHeader('Content-Type');
            if (self.supportsBinary && contentType === 'application/octet-stream') {
              xhr.responseType = 'arraybuffer';
            }
          } catch (e) {}
        }
        if (4 !== xhr.readyState) return;
        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function () {
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type');
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      data = this.xhr.responseText;
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function () {
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function () {
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

Request.requestsCount = 0;
Request.requests = {};

if (global.document) {
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler () {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/lib/transports/polling.js":
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var Transport = __webpack_require__("./node_modules/engine.io-client/lib/transport.js");
var parseqs = __webpack_require__("./node_modules/parseqs/index.js");
var parser = __webpack_require__("./node_modules/engine.io-parser/lib/browser.js");
var inherit = __webpack_require__("./node_modules/component-inherit/index.js");
var yeast = __webpack_require__("./node_modules/yeast/index.js");
var debug = __webpack_require__("./node_modules/engine.io-client/node_modules/debug/src/browser.js")('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function () {
  var XMLHttpRequest = __webpack_require__("./node_modules/engine.io-client/lib/xmlhttprequest.js");
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function (onPause) {
  var self = this;

  this.readyState = 'pausing';

  function pause () {
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function () {
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function (data) {
  var self = this;
  debug('polling got data %s', data);
  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' === packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function () {
  var self = this;

  function close () {
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' === this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;
  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  parser.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' === schema && Number(this.port) !== 443) ||
     ('http' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};


/***/ }),

/***/ "./node_modules/engine.io-client/lib/transports/websocket.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies.
 */

var Transport = __webpack_require__("./node_modules/engine.io-client/lib/transport.js");
var parser = __webpack_require__("./node_modules/engine.io-parser/lib/browser.js");
var parseqs = __webpack_require__("./node_modules/parseqs/index.js");
var inherit = __webpack_require__("./node_modules/component-inherit/index.js");
var yeast = __webpack_require__("./node_modules/yeast/index.js");
var debug = __webpack_require__("./node_modules/engine.io-client/node_modules/debug/src/browser.js")('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
var NodeWebSocket;
if (typeof window === 'undefined') {
  try {
    NodeWebSocket = __webpack_require__(0);
  } catch (e) { }
}

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  WebSocket = NodeWebSocket;
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  this.protocols = opts.protocols;
  if (!this.usingBrowserWebSocket) {
    WebSocket = NodeWebSocket;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = this.protocols;
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws = this.usingBrowserWebSocket ? (protocols ? new WebSocket(uri, protocols) : new WebSocket(uri)) : new WebSocket(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };
  this.ws.onclose = function () {
    self.onClose();
  };
  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      parser.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error
        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done () {
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function () {
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
    ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function () {
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/lib/xmlhttprequest.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {// browser shim for xmlhttprequest module

var hasCORS = __webpack_require__("./node_modules/has-cors/index.js");

module.exports = function (opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) { }
  }
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/node_modules/debug/src/browser.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__("./node_modules/engine.io-client/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = Object({"MIX_PUSHER_APP_KEY":"","MIX_PUSHER_APP_CLUSTER":"mt1","NODE_ENV":"development"}).DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/engine.io-client/node_modules/debug/src/debug.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__("./node_modules/ms/index.js");

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/engine.io-parser/lib/browser.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * Module dependencies.
 */

var keys = __webpack_require__("./node_modules/engine.io-parser/lib/keys.js");
var hasBinary = __webpack_require__("./node_modules/has-binary2/index.js");
var sliceBuffer = __webpack_require__("./node_modules/arraybuffer.slice/index.js");
var after = __webpack_require__("./node_modules/after/index.js");
var utf8 = __webpack_require__("./node_modules/engine.io-parser/lib/utf8.js");

var base64encoder;
if (global && global.ArrayBuffer) {
  base64encoder = __webpack_require__("./node_modules/base64-arraybuffer/lib/base64-arraybuffer.js");
}

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = __webpack_require__("./node_modules/blob/index.js");

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if (typeof supportsBinary === 'function') {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if (typeof utf8encode === 'function') {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data), { strict: false }) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  if (data === undefined) {
    return err;
  }
  // String data
  if (typeof data === 'string') {
    if (data.charAt(0) === 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      data = tryDecode(data);
      if (data === false) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

function tryDecode(data) {
  try {
    data = utf8.decode(data, { strict: false });
  } catch (e) {
    return false;
  }
  return data;
}

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!base64encoder) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary === 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, false, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data !== 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data === '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = '', n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (chr !== ':') {
      length += chr;
      continue;
    }

    if (length === '' || (length != (n = Number(length)))) {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

    msg = data.substr(i + 1, n);

    if (length != msg.length) {
      // parser error - ignoring payload
      return callback(err, 0, 1);
    }

    if (msg.length) {
      packet = exports.decodePacket(msg, binaryType, false);

      if (err.type === packet.type && err.data === packet.data) {
        // parser error in individual packet - ignoring payload
        return callback(err, 0, 1);
      }

      var ret = callback(packet, i + n, l);
      if (false === ret) return;
    }

    // advance cursor
    i += n;
    length = '';
  }

  if (length !== '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] === 255) break;

      // 310 = char length of Number.MAX_VALUE
      if (msgLength.length > 310) {
        return callback(err, 0, 1);
      }

      msgLength += tailArray[i];
    }

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/engine.io-parser/lib/keys.js":
/***/ (function(module, exports) {


/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};


/***/ }),

/***/ "./node_modules/engine.io-parser/lib/utf8.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/utf8js v2.1.2 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	function checkScalarValue(codePoint, strict) {
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
			if (strict) {
				throw Error(
					'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
					' is not a scalar value'
				);
			}
			return false;
		}
		return true;
	}
	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint, strict) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			if (!checkScalarValue(codePoint, strict)) {
				codePoint = 0xFFFD;
			}
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string, opts) {
		opts = opts || {};
		var strict = false !== opts.strict;

		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint, strict);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol(strict) {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString, opts) {
		opts = opts || {};
		var strict = false !== opts.strict;

		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol(strict)) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.1.2',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return utf8;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/module.js")(module), __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/has-binary2/index.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/* global Blob File */

/*
 * Module requirements.
 */

var isArray = __webpack_require__("./node_modules/has-binary2/node_modules/isarray/index.js");

var toString = Object.prototype.toString;
var withNativeBlob = typeof Blob === 'function' ||
                        typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]';
var withNativeFile = typeof File === 'function' ||
                        typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]';

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Supports Buffer, ArrayBuffer, Blob and File.
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary (obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  if (isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (hasBinary(obj[i])) {
        return true;
      }
    }
    return false;
  }

  if ((typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj)) ||
    (typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer) ||
    (withNativeBlob && obj instanceof Blob) ||
    (withNativeFile && obj instanceof File)
  ) {
    return true;
  }

  // see: https://github.com/Automattic/has-binary/pull/4
  if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }

  return false;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/buffer/index.js").Buffer))

/***/ }),

/***/ "./node_modules/has-binary2/node_modules/isarray/index.js":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/has-cors/index.js":
/***/ (function(module, exports) {


/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}


/***/ }),

/***/ "./node_modules/ieee754/index.js":
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/indexof/index.js":
/***/ (function(module, exports) {


var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/isarray/index.js":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/laravel-echo/dist/echo.js":
/***/ (function(module, exports) {

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Connector = function () {
    function Connector(options) {
        classCallCheck(this, Connector);

        this._defaultOptions = {
            auth: {
                headers: {}
            },
            authEndpoint: '/broadcasting/auth',
            broadcaster: 'pusher',
            csrfToken: null,
            host: null,
            key: null,
            namespace: 'App.Events'
        };
        this.setOptions(options);
        this.connect();
    }

    createClass(Connector, [{
        key: 'setOptions',
        value: function setOptions(options) {
            this.options = _extends(this._defaultOptions, options);
            if (this.csrfToken()) {
                this.options.auth.headers['X-CSRF-TOKEN'] = this.csrfToken();
            }
            return options;
        }
    }, {
        key: 'csrfToken',
        value: function csrfToken() {
            var selector = void 0;
            if (typeof window !== 'undefined' && window['Laravel'] && window['Laravel'].csrfToken) {
                return window['Laravel'].csrfToken;
            } else if (this.options.csrfToken) {
                return this.options.csrfToken;
            } else if (typeof document !== 'undefined' && (selector = document.querySelector('meta[name="csrf-token"]'))) {
                return selector.getAttribute('content');
            }
            return null;
        }
    }]);
    return Connector;
}();

var Channel = function () {
    function Channel() {
        classCallCheck(this, Channel);
    }

    createClass(Channel, [{
        key: 'notification',
        value: function notification(callback) {
            return this.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', callback);
        }
    }, {
        key: 'listenForWhisper',
        value: function listenForWhisper(event, callback) {
            return this.listen('.client-' + event, callback);
        }
    }]);
    return Channel;
}();

var EventFormatter = function () {
    function EventFormatter(namespace) {
        classCallCheck(this, EventFormatter);

        this.setNamespace(namespace);
    }

    createClass(EventFormatter, [{
        key: 'format',
        value: function format(event) {
            if (event.charAt(0) === '.' || event.charAt(0) === '\\') {
                return event.substr(1);
            } else if (this.namespace) {
                event = this.namespace + '.' + event;
            }
            return event.replace(/\./g, '\\');
        }
    }, {
        key: 'setNamespace',
        value: function setNamespace(value) {
            this.namespace = value;
        }
    }]);
    return EventFormatter;
}();

var PusherChannel = function (_Channel) {
    inherits(PusherChannel, _Channel);

    function PusherChannel(pusher, name, options) {
        classCallCheck(this, PusherChannel);

        var _this = possibleConstructorReturn(this, (PusherChannel.__proto__ || Object.getPrototypeOf(PusherChannel)).call(this));

        _this.name = name;
        _this.pusher = pusher;
        _this.options = options;
        _this.eventFormatter = new EventFormatter(_this.options.namespace);
        _this.subscribe();
        return _this;
    }

    createClass(PusherChannel, [{
        key: 'subscribe',
        value: function subscribe() {
            this.subscription = this.pusher.subscribe(this.name);
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.pusher.unsubscribe(this.name);
        }
    }, {
        key: 'listen',
        value: function listen(event, callback) {
            this.on(this.eventFormatter.format(event), callback);
            return this;
        }
    }, {
        key: 'stopListening',
        value: function stopListening(event) {
            this.subscription.unbind(this.eventFormatter.format(event));
            return this;
        }
    }, {
        key: 'on',
        value: function on(event, callback) {
            this.subscription.bind(event, callback);
            return this;
        }
    }]);
    return PusherChannel;
}(Channel);

var PusherPrivateChannel = function (_PusherChannel) {
    inherits(PusherPrivateChannel, _PusherChannel);

    function PusherPrivateChannel() {
        classCallCheck(this, PusherPrivateChannel);
        return possibleConstructorReturn(this, (PusherPrivateChannel.__proto__ || Object.getPrototypeOf(PusherPrivateChannel)).apply(this, arguments));
    }

    createClass(PusherPrivateChannel, [{
        key: 'whisper',
        value: function whisper(eventName, data) {
            this.pusher.channels.channels[this.name].trigger('client-' + eventName, data);
            return this;
        }
    }]);
    return PusherPrivateChannel;
}(PusherChannel);

var PusherPresenceChannel = function (_PusherChannel) {
    inherits(PusherPresenceChannel, _PusherChannel);

    function PusherPresenceChannel() {
        classCallCheck(this, PusherPresenceChannel);
        return possibleConstructorReturn(this, (PusherPresenceChannel.__proto__ || Object.getPrototypeOf(PusherPresenceChannel)).apply(this, arguments));
    }

    createClass(PusherPresenceChannel, [{
        key: 'here',
        value: function here(callback) {
            this.on('pusher:subscription_succeeded', function (data) {
                callback(Object.keys(data.members).map(function (k) {
                    return data.members[k];
                }));
            });
            return this;
        }
    }, {
        key: 'joining',
        value: function joining(callback) {
            this.on('pusher:member_added', function (member) {
                callback(member.info);
            });
            return this;
        }
    }, {
        key: 'leaving',
        value: function leaving(callback) {
            this.on('pusher:member_removed', function (member) {
                callback(member.info);
            });
            return this;
        }
    }, {
        key: 'whisper',
        value: function whisper(eventName, data) {
            this.pusher.channels.channels[this.name].trigger('client-' + eventName, data);
            return this;
        }
    }]);
    return PusherPresenceChannel;
}(PusherChannel);

var SocketIoChannel = function (_Channel) {
    inherits(SocketIoChannel, _Channel);

    function SocketIoChannel(socket, name, options) {
        classCallCheck(this, SocketIoChannel);

        var _this = possibleConstructorReturn(this, (SocketIoChannel.__proto__ || Object.getPrototypeOf(SocketIoChannel)).call(this));

        _this.events = {};
        _this.name = name;
        _this.socket = socket;
        _this.options = options;
        _this.eventFormatter = new EventFormatter(_this.options.namespace);
        _this.subscribe();
        _this.configureReconnector();
        return _this;
    }

    createClass(SocketIoChannel, [{
        key: 'subscribe',
        value: function subscribe() {
            this.socket.emit('subscribe', {
                channel: this.name,
                auth: this.options.auth || {}
            });
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.unbind();
            this.socket.emit('unsubscribe', {
                channel: this.name,
                auth: this.options.auth || {}
            });
        }
    }, {
        key: 'listen',
        value: function listen(event, callback) {
            this.on(this.eventFormatter.format(event), callback);
            return this;
        }
    }, {
        key: 'on',
        value: function on(event, callback) {
            var _this2 = this;

            var listener = function listener(channel, data) {
                if (_this2.name == channel) {
                    callback(data);
                }
            };
            this.socket.on(event, listener);
            this.bind(event, listener);
        }
    }, {
        key: 'configureReconnector',
        value: function configureReconnector() {
            var _this3 = this;

            var listener = function listener() {
                _this3.subscribe();
            };
            this.socket.on('reconnect', listener);
            this.bind('reconnect', listener);
        }
    }, {
        key: 'bind',
        value: function bind(event, callback) {
            this.events[event] = this.events[event] || [];
            this.events[event].push(callback);
        }
    }, {
        key: 'unbind',
        value: function unbind() {
            var _this4 = this;

            Object.keys(this.events).forEach(function (event) {
                _this4.events[event].forEach(function (callback) {
                    _this4.socket.removeListener(event, callback);
                });
                delete _this4.events[event];
            });
        }
    }]);
    return SocketIoChannel;
}(Channel);

var SocketIoPrivateChannel = function (_SocketIoChannel) {
    inherits(SocketIoPrivateChannel, _SocketIoChannel);

    function SocketIoPrivateChannel() {
        classCallCheck(this, SocketIoPrivateChannel);
        return possibleConstructorReturn(this, (SocketIoPrivateChannel.__proto__ || Object.getPrototypeOf(SocketIoPrivateChannel)).apply(this, arguments));
    }

    createClass(SocketIoPrivateChannel, [{
        key: 'whisper',
        value: function whisper(eventName, data) {
            this.socket.emit('client event', {
                channel: this.name,
                event: 'client-' + eventName,
                data: data
            });
            return this;
        }
    }]);
    return SocketIoPrivateChannel;
}(SocketIoChannel);

var SocketIoPresenceChannel = function (_SocketIoPrivateChann) {
    inherits(SocketIoPresenceChannel, _SocketIoPrivateChann);

    function SocketIoPresenceChannel() {
        classCallCheck(this, SocketIoPresenceChannel);
        return possibleConstructorReturn(this, (SocketIoPresenceChannel.__proto__ || Object.getPrototypeOf(SocketIoPresenceChannel)).apply(this, arguments));
    }

    createClass(SocketIoPresenceChannel, [{
        key: 'here',
        value: function here(callback) {
            this.on('presence:subscribed', function (members) {
                callback(members.map(function (m) {
                    return m.user_info;
                }));
            });
            return this;
        }
    }, {
        key: 'joining',
        value: function joining(callback) {
            this.on('presence:joining', function (member) {
                return callback(member.user_info);
            });
            return this;
        }
    }, {
        key: 'leaving',
        value: function leaving(callback) {
            this.on('presence:leaving', function (member) {
                return callback(member.user_info);
            });
            return this;
        }
    }]);
    return SocketIoPresenceChannel;
}(SocketIoPrivateChannel);

var NullChannel = function (_Channel) {
    inherits(NullChannel, _Channel);

    function NullChannel() {
        classCallCheck(this, NullChannel);
        return possibleConstructorReturn(this, (NullChannel.__proto__ || Object.getPrototypeOf(NullChannel)).apply(this, arguments));
    }

    createClass(NullChannel, [{
        key: 'subscribe',
        value: function subscribe() {}
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {}
    }, {
        key: 'listen',
        value: function listen(event, callback) {
            return this;
        }
    }, {
        key: 'stopListening',
        value: function stopListening(event) {
            return this;
        }
    }, {
        key: 'on',
        value: function on(event, callback) {
            return this;
        }
    }]);
    return NullChannel;
}(Channel);

var NullPrivateChannel = function (_NullChannel) {
    inherits(NullPrivateChannel, _NullChannel);

    function NullPrivateChannel() {
        classCallCheck(this, NullPrivateChannel);
        return possibleConstructorReturn(this, (NullPrivateChannel.__proto__ || Object.getPrototypeOf(NullPrivateChannel)).apply(this, arguments));
    }

    createClass(NullPrivateChannel, [{
        key: 'whisper',
        value: function whisper(eventName, data) {
            return this;
        }
    }]);
    return NullPrivateChannel;
}(NullChannel);

var NullPresenceChannel = function (_NullChannel) {
    inherits(NullPresenceChannel, _NullChannel);

    function NullPresenceChannel() {
        classCallCheck(this, NullPresenceChannel);
        return possibleConstructorReturn(this, (NullPresenceChannel.__proto__ || Object.getPrototypeOf(NullPresenceChannel)).apply(this, arguments));
    }

    createClass(NullPresenceChannel, [{
        key: 'here',
        value: function here(callback) {
            return this;
        }
    }, {
        key: 'joining',
        value: function joining(callback) {
            return this;
        }
    }, {
        key: 'leaving',
        value: function leaving(callback) {
            return this;
        }
    }, {
        key: 'whisper',
        value: function whisper(eventName, data) {
            return this;
        }
    }]);
    return NullPresenceChannel;
}(NullChannel);

var PusherConnector = function (_Connector) {
    inherits(PusherConnector, _Connector);

    function PusherConnector() {
        var _ref;

        classCallCheck(this, PusherConnector);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = possibleConstructorReturn(this, (_ref = PusherConnector.__proto__ || Object.getPrototypeOf(PusherConnector)).call.apply(_ref, [this].concat(args)));

        _this.channels = {};
        return _this;
    }

    createClass(PusherConnector, [{
        key: 'connect',
        value: function connect() {
            this.pusher = new Pusher(this.options.key, this.options);
        }
    }, {
        key: 'listen',
        value: function listen(name, event, callback) {
            return this.channel(name).listen(event, callback);
        }
    }, {
        key: 'channel',
        value: function channel(name) {
            if (!this.channels[name]) {
                this.channels[name] = new PusherChannel(this.pusher, name, this.options);
            }
            return this.channels[name];
        }
    }, {
        key: 'privateChannel',
        value: function privateChannel(name) {
            if (!this.channels['private-' + name]) {
                this.channels['private-' + name] = new PusherPrivateChannel(this.pusher, 'private-' + name, this.options);
            }
            return this.channels['private-' + name];
        }
    }, {
        key: 'presenceChannel',
        value: function presenceChannel(name) {
            if (!this.channels['presence-' + name]) {
                this.channels['presence-' + name] = new PusherPresenceChannel(this.pusher, 'presence-' + name, this.options);
            }
            return this.channels['presence-' + name];
        }
    }, {
        key: 'leave',
        value: function leave(name) {
            var _this2 = this;

            var channels = [name, 'private-' + name, 'presence-' + name];
            channels.forEach(function (name, index) {
                if (_this2.channels[name]) {
                    _this2.channels[name].unsubscribe();
                    delete _this2.channels[name];
                }
            });
        }
    }, {
        key: 'socketId',
        value: function socketId() {
            return this.pusher.connection.socket_id;
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            this.pusher.disconnect();
        }
    }]);
    return PusherConnector;
}(Connector);

var SocketIoConnector = function (_Connector) {
    inherits(SocketIoConnector, _Connector);

    function SocketIoConnector() {
        var _ref;

        classCallCheck(this, SocketIoConnector);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = possibleConstructorReturn(this, (_ref = SocketIoConnector.__proto__ || Object.getPrototypeOf(SocketIoConnector)).call.apply(_ref, [this].concat(args)));

        _this.channels = {};
        return _this;
    }

    createClass(SocketIoConnector, [{
        key: 'connect',
        value: function connect() {
            var io = this.getSocketIO();
            this.socket = io(this.options.host, this.options);
            return this.socket;
        }
    }, {
        key: 'getSocketIO',
        value: function getSocketIO() {
            if (typeof io !== 'undefined') {
                return io;
            }
            if (this.options.client !== 'undefined') {
                return this.options.client;
            }
            throw new Error('Socket.io client not found. Should be globally available or passed via options.client');
        }
    }, {
        key: 'listen',
        value: function listen(name, event, callback) {
            return this.channel(name).listen(event, callback);
        }
    }, {
        key: 'channel',
        value: function channel(name) {
            if (!this.channels[name]) {
                this.channels[name] = new SocketIoChannel(this.socket, name, this.options);
            }
            return this.channels[name];
        }
    }, {
        key: 'privateChannel',
        value: function privateChannel(name) {
            if (!this.channels['private-' + name]) {
                this.channels['private-' + name] = new SocketIoPrivateChannel(this.socket, 'private-' + name, this.options);
            }
            return this.channels['private-' + name];
        }
    }, {
        key: 'presenceChannel',
        value: function presenceChannel(name) {
            if (!this.channels['presence-' + name]) {
                this.channels['presence-' + name] = new SocketIoPresenceChannel(this.socket, 'presence-' + name, this.options);
            }
            return this.channels['presence-' + name];
        }
    }, {
        key: 'leave',
        value: function leave(name) {
            var _this2 = this;

            var channels = [name, 'private-' + name, 'presence-' + name];
            channels.forEach(function (name) {
                if (_this2.channels[name]) {
                    _this2.channels[name].unsubscribe();
                    delete _this2.channels[name];
                }
            });
        }
    }, {
        key: 'socketId',
        value: function socketId() {
            return this.socket.id;
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            this.socket.disconnect();
        }
    }]);
    return SocketIoConnector;
}(Connector);

var NullConnector = function (_Connector) {
    inherits(NullConnector, _Connector);

    function NullConnector() {
        var _ref;

        classCallCheck(this, NullConnector);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = possibleConstructorReturn(this, (_ref = NullConnector.__proto__ || Object.getPrototypeOf(NullConnector)).call.apply(_ref, [this].concat(args)));

        _this.channels = {};
        return _this;
    }

    createClass(NullConnector, [{
        key: 'connect',
        value: function connect() {}
    }, {
        key: 'listen',
        value: function listen(name, event, callback) {
            return new NullChannel();
        }
    }, {
        key: 'channel',
        value: function channel(name) {
            return new NullChannel();
        }
    }, {
        key: 'privateChannel',
        value: function privateChannel(name) {
            return new NullPrivateChannel();
        }
    }, {
        key: 'presenceChannel',
        value: function presenceChannel(name) {
            return new NullPresenceChannel();
        }
    }, {
        key: 'leave',
        value: function leave(name) {}
    }, {
        key: 'socketId',
        value: function socketId() {
            return 'fake-socket-id';
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {}
    }]);
    return NullConnector;
}(Connector);

var Echo = function () {
    function Echo(options) {
        classCallCheck(this, Echo);

        this.options = options;
        if (typeof Vue === 'function' && Vue.http) {
            this.registerVueRequestInterceptor();
        }
        if (typeof axios === 'function') {
            this.registerAxiosRequestInterceptor();
        }
        if (typeof jQuery === 'function') {
            this.registerjQueryAjaxSetup();
        }
        if (this.options.broadcaster == 'pusher') {
            this.connector = new PusherConnector(this.options);
        } else if (this.options.broadcaster == 'socket.io') {
            this.connector = new SocketIoConnector(this.options);
        } else if (this.options.broadcaster == 'null') {
            this.connector = new NullConnector(this.options);
        }
    }

    createClass(Echo, [{
        key: 'registerVueRequestInterceptor',
        value: function registerVueRequestInterceptor() {
            var _this = this;

            Vue.http.interceptors.push(function (request, next) {
                if (_this.socketId()) {
                    request.headers.set('X-Socket-ID', _this.socketId());
                }
                next();
            });
        }
    }, {
        key: 'registerAxiosRequestInterceptor',
        value: function registerAxiosRequestInterceptor() {
            var _this2 = this;

            axios.interceptors.request.use(function (config) {
                if (_this2.socketId()) {
                    config.headers['X-Socket-Id'] = _this2.socketId();
                }
                return config;
            });
        }
    }, {
        key: 'registerjQueryAjaxSetup',
        value: function registerjQueryAjaxSetup() {
            var _this3 = this;

            if (typeof jQuery.ajax != 'undefined') {
                jQuery.ajaxSetup({
                    beforeSend: function beforeSend(xhr) {
                        if (_this3.socketId()) {
                            xhr.setRequestHeader('X-Socket-Id', _this3.socketId());
                        }
                    }
                });
            }
        }
    }, {
        key: 'listen',
        value: function listen(channel, event, callback) {
            return this.connector.listen(channel, event, callback);
        }
    }, {
        key: 'channel',
        value: function channel(_channel) {
            return this.connector.channel(_channel);
        }
    }, {
        key: 'private',
        value: function _private(channel) {
            return this.connector.privateChannel(channel);
        }
    }, {
        key: 'join',
        value: function join(channel) {
            return this.connector.presenceChannel(channel);
        }
    }, {
        key: 'leave',
        value: function leave(channel) {
            this.connector.leave(channel);
        }
    }, {
        key: 'socketId',
        value: function socketId() {
            return this.connector.socketId();
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            this.connector.disconnect();
        }
    }]);
    return Echo;
}();

module.exports = Echo;

/***/ }),

/***/ "./node_modules/ms/index.js":
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ "./node_modules/parseqs/index.js":
/***/ (function(module, exports) {

/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};


/***/ }),

/***/ "./node_modules/parseuri/index.js":
/***/ (function(module, exports) {

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};


/***/ }),

/***/ "./node_modules/process/browser.js":
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/pulltorefreshjs/dist/index.umd.js":
/***/ (function(module, exports, __webpack_require__) {

/*!
 * pulltorefreshjs v0.1.21
 * (c) Rafael Soto
 * Released under the MIT License.
 */
(function (global, factory) {
   true ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.PullToRefresh = factory());
}(this, function () { 'use strict';

  var _shared = {
    pullStartY: null,
    pullMoveY: null,
    handlers: [],
    styleEl: null,
    events: null,
    dist: 0,
    state: 'pending',
    timeout: null,
    distResisted: 0,
    supportsPassive: false,
    supportsPointerEvents: typeof window !== 'undefined' && !!window.PointerEvent
  };

  try {
    window.addEventListener('test', null, {
      get passive() {
        // eslint-disable-line getter-return
        _shared.supportsPassive = true;
      }

    });
  } catch (e) {// do nothing
  }

  function setupDOM(handler) {
    if (!handler.ptrElement) {
      var ptr = document.createElement('div');

      if (handler.mainElement !== document.body) {
        handler.mainElement.parentNode.insertBefore(ptr, handler.mainElement);
      } else {
        document.body.insertBefore(ptr, document.body.firstChild);
      }

      ptr.classList.add(((handler.classPrefix) + "ptr"));
      ptr.innerHTML = handler.getMarkup().replace(/__PREFIX__/g, handler.classPrefix);
      handler.ptrElement = ptr;

      if (typeof handler.onInit === 'function') {
        handler.onInit(handler);
      } // Add the css styles to the style node, and then
      // insert it into the dom


      if (!_shared.styleEl) {
        _shared.styleEl = document.createElement('style');

        _shared.styleEl.setAttribute('id', 'pull-to-refresh-js-style');

        document.head.appendChild(_shared.styleEl);
      }

      _shared.styleEl.textContent = handler.getStyles().replace(/__PREFIX__/g, handler.classPrefix).replace(/\s+/g, ' ');
    }

    return handler;
  }

  function onReset(handler) {
    handler.ptrElement.classList.remove(((handler.classPrefix) + "refresh"));
    handler.ptrElement.style[handler.cssProp] = '0px';
    setTimeout(function () {
      // remove previous ptr-element from DOM
      if (handler.ptrElement && handler.ptrElement.parentNode) {
        handler.ptrElement.parentNode.removeChild(handler.ptrElement);
        handler.ptrElement = null;
      } // reset state


      _shared.state = 'pending';
    }, handler.refreshTimeout);
  }

  function update(handler) {
    var iconEl = handler.ptrElement.querySelector(("." + (handler.classPrefix) + "icon"));
    var textEl = handler.ptrElement.querySelector(("." + (handler.classPrefix) + "text"));

    if (iconEl) {
      if (_shared.state === 'refreshing') {
        iconEl.innerHTML = handler.iconRefreshing;
      } else {
        iconEl.innerHTML = handler.iconArrow;
      }
    }

    if (textEl) {
      if (_shared.state === 'releasing') {
        textEl.innerHTML = handler.instructionsReleaseToRefresh;
      }

      if (_shared.state === 'pulling' || _shared.state === 'pending') {
        textEl.innerHTML = handler.instructionsPullToRefresh;
      }

      if (_shared.state === 'refreshing') {
        textEl.innerHTML = handler.instructionsRefreshing;
      }
    }
  }

  var _ptr = {
    setupDOM: setupDOM,
    onReset: onReset,
    update: update
  };

  var _timeout;

  var screenY = function screenY(event) {
    if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
      return event.screenY;
    }

    return event.touches[0].screenY;
  };

  var _setupEvents = (function () {
    var _el;

    function _onTouchStart(e) {
      // here, we must pick a handler first, and then append their html/css on the DOM
      var target = _shared.handlers.filter(function (h) { return h.contains(e.target); })[0];

      _shared.enable = !!target;

      if (target && _shared.state === 'pending') {
        _el = _ptr.setupDOM(target);

        if (target.shouldPullToRefresh()) {
          _shared.pullStartY = screenY(e);
        }

        clearTimeout(_shared.timeout);

        _ptr.update(target);
      }
    }

    function _onTouchMove(e) {
      if (!(_el && _el.ptrElement && _shared.enable)) {
        return;
      }

      if (!_shared.pullStartY) {
        if (_el.shouldPullToRefresh()) {
          _shared.pullStartY = screenY(e);
        }
      } else {
        _shared.pullMoveY = screenY(e);
      }

      if (_shared.state === 'refreshing') {
        if (e.cancelable && _el.shouldPullToRefresh() && _shared.pullStartY < _shared.pullMoveY) {
          e.preventDefault();
        }

        return;
      }

      if (_shared.state === 'pending') {
        _el.ptrElement.classList.add(((_el.classPrefix) + "pull"));

        _shared.state = 'pulling';

        _ptr.update(_el);
      }

      if (_shared.pullStartY && _shared.pullMoveY) {
        _shared.dist = _shared.pullMoveY - _shared.pullStartY;
      }

      _shared.distExtra = _shared.dist - _el.distIgnore;

      if (_shared.distExtra > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }

        _el.ptrElement.style[_el.cssProp] = (_shared.distResisted) + "px";
        _shared.distResisted = _el.resistanceFunction(_shared.distExtra / _el.distThreshold) * Math.min(_el.distMax, _shared.distExtra);

        if (_shared.state === 'pulling' && _shared.distResisted > _el.distThreshold) {
          _el.ptrElement.classList.add(((_el.classPrefix) + "release"));

          _shared.state = 'releasing';

          _ptr.update(_el);
        }

        if (_shared.state === 'releasing' && _shared.distResisted < _el.distThreshold) {
          _el.ptrElement.classList.remove(((_el.classPrefix) + "release"));

          _shared.state = 'pulling';

          _ptr.update(_el);
        }
      }
    }

    function _onTouchEnd() {
      if (!(_el && _el.ptrElement && _shared.enable)) {
        return;
      } // wait 1/2 sec before unmounting...


      clearTimeout(_timeout);
      _timeout = setTimeout(function () {
        if (_el && _el.ptrElement && _shared.state === 'pending') {
          _ptr.onReset(_el);
        }
      }, 500);

      if (_shared.state === 'releasing' && _shared.distResisted > _el.distThreshold) {
        _shared.state = 'refreshing';
        _el.ptrElement.style[_el.cssProp] = (_el.distReload) + "px";

        _el.ptrElement.classList.add(((_el.classPrefix) + "refresh"));

        _shared.timeout = setTimeout(function () {
          var retval = _el.onRefresh(function () { return _ptr.onReset(_el); });

          if (retval && typeof retval.then === 'function') {
            retval.then(function () { return _ptr.onReset(_el); });
          }

          if (!retval && !_el.onRefresh.length) {
            _ptr.onReset(_el);
          }
        }, _el.refreshTimeout);
      } else {
        if (_shared.state === 'refreshing') {
          return;
        }

        _el.ptrElement.style[_el.cssProp] = '0px';
        _shared.state = 'pending';
      }

      _ptr.update(_el);

      _el.ptrElement.classList.remove(((_el.classPrefix) + "release"));

      _el.ptrElement.classList.remove(((_el.classPrefix) + "pull"));

      _shared.pullStartY = _shared.pullMoveY = null;
      _shared.dist = _shared.distResisted = 0;
    }

    function _onScroll() {
      if (_el) {
        _el.mainElement.classList.toggle(((_el.classPrefix) + "top"), _el.shouldPullToRefresh());
      }
    }

    var _passiveSettings = _shared.supportsPassive ? {
      passive: _shared.passive || false
    } : undefined;

    if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
      window.addEventListener('pointerup', _onTouchEnd);
      window.addEventListener('pointerdown', _onTouchStart);
      window.addEventListener('pointermove', _onTouchMove, _passiveSettings);
    } else {
      window.addEventListener('touchend', _onTouchEnd);
      window.addEventListener('touchstart', _onTouchStart);
      window.addEventListener('touchmove', _onTouchMove, _passiveSettings);
    }

    window.addEventListener('scroll', _onScroll);
    return {
      onTouchEnd: _onTouchEnd,
      onTouchStart: _onTouchStart,
      onTouchMove: _onTouchMove,
      onScroll: _onScroll,

      destroy: function destroy() {
        if (_shared.pointerEventsEnabled && _shared.supportsPointerEvents) {
          window.removeEventListener('pointerdown', _onTouchStart);
          window.removeEventListener('pointerup', _onTouchEnd);
          window.removeEventListener('pointermove', _onTouchMove, _passiveSettings);
        } else {
          window.removeEventListener('touchstart', _onTouchStart);
          window.removeEventListener('touchend', _onTouchEnd);
          window.removeEventListener('touchmove', _onTouchMove, _passiveSettings);
        }

        window.removeEventListener('scroll', _onScroll);
      }

    };
  });

  var _ptrMarkup = "\n<div class=\"__PREFIX__box\">\n  <div class=\"__PREFIX__content\">\n    <div class=\"__PREFIX__icon\"></div>\n    <div class=\"__PREFIX__text\"></div>\n  </div>\n</div>\n";

  var _ptrStyles = "\n.__PREFIX__ptr {\n  box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12);\n  pointer-events: none;\n  font-size: 0.85em;\n  font-weight: bold;\n  top: 0;\n  height: 0;\n  transition: height 0.3s, min-height 0.3s;\n  text-align: center;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  align-content: stretch;\n}\n\n.__PREFIX__box {\n  padding: 10px;\n  flex-basis: 100%;\n}\n\n.__PREFIX__pull {\n  transition: none;\n}\n\n.__PREFIX__text {\n  margin-top: .33em;\n  color: rgba(0, 0, 0, 0.3);\n}\n\n.__PREFIX__icon {\n  color: rgba(0, 0, 0, 0.3);\n  transition: transform .3s;\n}\n\n/*\nWhen at the top of the page, disable vertical overscroll so passive touch\nlisteners can take over.\n*/\n.__PREFIX__top {\n  touch-action: pan-x pan-down pinch-zoom;\n}\n\n.__PREFIX__release .__PREFIX__icon {\n  transform: rotate(180deg);\n}\n";

  var _defaults = {
    distThreshold: 60,
    distMax: 80,
    distReload: 50,
    distIgnore: 0,
    mainElement: 'body',
    triggerElement: 'body',
    ptrElement: '.ptr',
    classPrefix: 'ptr--',
    cssProp: 'min-height',
    iconArrow: '&#8675;',
    iconRefreshing: '&hellip;',
    instructionsPullToRefresh: 'Pull down to refresh',
    instructionsReleaseToRefresh: 'Release to refresh',
    instructionsRefreshing: 'Refreshing',
    refreshTimeout: 500,
    getMarkup: function () { return _ptrMarkup; },
    getStyles: function () { return _ptrStyles; },
    onInit: function () {},
    onRefresh: function () { return location.reload(); },
    resistanceFunction: function (t) { return Math.min(1, t / 2.5); },
    shouldPullToRefresh: function () { return !window.scrollY; }
  };

  var _methods = ['mainElement', 'ptrElement', 'triggerElement'];
  var _setupHandler = (function (options) {
    var _handler = {}; // merge options with defaults

    Object.keys(_defaults).forEach(function (key) {
      _handler[key] = options[key] || _defaults[key];
    }); // normalize timeout value, even if it is zero

    _handler.refreshTimeout = typeof options.refreshTimeout === 'number' ? options.refreshTimeout : _defaults.refreshTimeout; // normalize elements

    _methods.forEach(function (method) {
      if (typeof _handler[method] === 'string') {
        _handler[method] = document.querySelector(_handler[method]);
      }
    }); // attach events lazily


    if (!_shared.events) {
      _shared.events = _setupEvents();
    }

    _handler.contains = function (target) {
      return _handler.triggerElement.contains(target);
    };

    _handler.destroy = function () {
      // stop pending any pending callbacks
      clearTimeout(_shared.timeout); // remove handler from shared state

      var offset = _shared.handlers.indexOf(_handler);

      _shared.handlers.splice(offset, 1);
    };

    return _handler;
  });

  var index = {
    setPassiveMode: function setPassiveMode(isPassive) {
      _shared.passive = isPassive;
    },

    setPointerEventsMode: function setPointerEventsMode(isEnabled) {
      _shared.pointerEventsEnabled = isEnabled;
    },

    destroyAll: function destroyAll() {
      if (_shared.events) {
        _shared.events.destroy();

        _shared.events = null;
      }

      _shared.handlers.forEach(function (h) {
        h.destroy();
      });
    },

    init: function init(options) {
      if ( options === void 0 ) options = {};

      var handler = _setupHandler(options);

      _shared.handlers.push(handler);

      return handler;
    },

    // export utils for testing
    _: {
      setupHandler: _setupHandler,
      setupEvents: _setupEvents,
      setupDOM: _ptr.setupDOM,
      onReset: _ptr.onReset,
      update: _ptr.update
    }
  };

  return index;

}));


/***/ }),

/***/ "./node_modules/socket.io-client/lib/index.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var url = __webpack_require__("./node_modules/socket.io-client/lib/url.js");
var parser = __webpack_require__("./node_modules/socket.io-parser/index.js");
var Manager = __webpack_require__("./node_modules/socket.io-client/lib/manager.js");
var debug = __webpack_require__("./node_modules/socket.io-client/node_modules/debug/src/browser.js")('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup (uri, opts) {
  if (typeof uri === 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.query;
  }
  return io.socket(parsed.path, opts);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = __webpack_require__("./node_modules/socket.io-client/lib/manager.js");
exports.Socket = __webpack_require__("./node_modules/socket.io-client/lib/socket.js");


/***/ }),

/***/ "./node_modules/socket.io-client/lib/manager.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var eio = __webpack_require__("./node_modules/engine.io-client/lib/index.js");
var Socket = __webpack_require__("./node_modules/socket.io-client/lib/socket.js");
var Emitter = __webpack_require__("./node_modules/component-emitter/index.js");
var parser = __webpack_require__("./node_modules/socket.io-parser/index.js");
var on = __webpack_require__("./node_modules/socket.io-client/lib/on.js");
var bind = __webpack_require__("./node_modules/component-bind/index.js");
var debug = __webpack_require__("./node_modules/socket.io-client/node_modules/debug/src/browser.js")('socket.io-client:manager');
var indexOf = __webpack_require__("./node_modules/indexof/index.js");
var Backoff = __webpack_require__("./node_modules/backo2/index.js");

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager (uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' === typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  var _parser = opts.parser || parser;
  this.encoder = new _parser.Encoder();
  this.decoder = new _parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.generateId(nsp);
    }
  }
};

/**
 * generate `socket.id` for the given `nsp`
 *
 * @param {String} nsp
 * @return {String}
 * @api private
 */

Manager.prototype.generateId = function (nsp) {
  return (nsp === '/' ? '' : (nsp + '#')) + this.engine.id;
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function (fn, opts) {
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function () {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function (data) {
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function () {
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function () {
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function (err) {
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.generateId(nsp);
    });

    if (this.autoConnect) {
      // manually call here since connecting event is fired before listening
      onConnecting();
    }
  }

  function onConnecting () {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function (socket) {
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function (packet) {
  debug('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function () {
  debug('cleanup');

  var subsLength = this.subs.length;
  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function () {
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function (reason) {
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function (err) {
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};


/***/ }),

/***/ "./node_modules/socket.io-client/lib/on.js":
/***/ (function(module, exports) {


/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}


/***/ }),

/***/ "./node_modules/socket.io-client/lib/socket.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var parser = __webpack_require__("./node_modules/socket.io-parser/index.js");
var Emitter = __webpack_require__("./node_modules/component-emitter/index.js");
var toArray = __webpack_require__("./node_modules/to-array/index.js");
var on = __webpack_require__("./node_modules/socket.io-client/lib/on.js");
var bind = __webpack_require__("./node_modules/component-bind/index.js");
var debug = __webpack_require__("./node_modules/socket.io-client/node_modules/debug/src/browser.js")('socket.io-client:socket');
var parseqs = __webpack_require__("./node_modules/parseqs/index.js");
var hasBin = __webpack_require__("./node_modules/has-binary2/index.js");

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket (io, nsp, opts) {
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  this.flags = {};
  if (opts && opts.query) {
    this.query = opts.query;
  }
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function () {
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' === this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function () {
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function (ev) {
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var packet = {
    type: (this.flags.binary !== undefined ? this.flags.binary : hasBin(args)) ? parser.BINARY_EVENT : parser.EVENT,
    data: args
  };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' === typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  this.flags = {};

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' !== this.nsp) {
    if (this.query) {
      var query = typeof this.query === 'object' ? parseqs.encode(this.query) : this.query;
      debug('sending connect packet with query %s', query);
      this.packet({type: parser.CONNECT, query: query});
    } else {
      this.packet({type: parser.CONNECT});
    }
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function (packet) {
  var sameNamespace = packet.nsp === this.nsp;
  var rootNamespaceError = packet.type === parser.ERROR && packet.nsp === '/';

  if (!sameNamespace && !rootNamespaceError) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function (packet) {
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function (id) {
  var self = this;
  var sent = false;
  return function () {
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    self.packet({
      type: hasBin(args) ? parser.BINARY_ACK : parser.ACK,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function (packet) {
  var ack = this.acks[packet.id];
  if ('function' === typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function () {
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function () {
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function (compress) {
  this.flags.compress = compress;
  return this;
};

/**
 * Sets the binary flag
 *
 * @param {Boolean} whether the emitted data contains binary
 * @return {Socket} self
 * @api public
 */

Socket.prototype.binary = function (binary) {
  this.flags.binary = binary;
  return this;
};


/***/ }),

/***/ "./node_modules/socket.io-client/lib/url.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module dependencies.
 */

var parseuri = __webpack_require__("./node_modules/parseuri/index.js");
var debug = __webpack_require__("./node_modules/socket.io-client/node_modules/debug/src/browser.js")('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url (uri, loc) {
  var obj = uri;

  // default to window.location
  loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

  return obj;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/socket.io-client/node_modules/debug/src/browser.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__("./node_modules/socket.io-client/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = Object({"MIX_PUSHER_APP_KEY":"","MIX_PUSHER_APP_CLUSTER":"mt1","NODE_ENV":"development"}).DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/socket.io-client/node_modules/debug/src/debug.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__("./node_modules/ms/index.js");

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/socket.io-parser/binary.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = __webpack_require__("./node_modules/socket.io-parser/node_modules/isarray/index.js");
var isBuf = __webpack_require__("./node_modules/socket.io-parser/is-buffer.js");
var toString = Object.prototype.toString;
var withNativeBlob = typeof global.Blob === 'function' || toString.call(global.Blob) === '[object BlobConstructor]';
var withNativeFile = typeof global.File === 'function' || toString.call(global.File) === '[object FileConstructor]';

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet) {
  var buffers = [];
  var packetData = packet.data;
  var pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

function _deconstructPacket(data, buffers) {
  if (!data) return data;

  if (isBuf(data)) {
    var placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (isArray(data)) {
    var newData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      newData[i] = _deconstructPacket(data[i], buffers);
    }
    return newData;
  } else if (typeof data === 'object' && !(data instanceof Date)) {
    var newData = {};
    for (var key in data) {
      newData[key] = _deconstructPacket(data[key], buffers);
    }
    return newData;
  }
  return data;
}

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  packet.attachments = undefined; // no longer useful
  return packet;
};

function _reconstructPacket(data, buffers) {
  if (!data) return data;

  if (data && data._placeholder) {
    return buffers[data.num]; // appropriate buffer (should be natural order anyway)
  } else if (isArray(data)) {
    for (var i = 0; i < data.length; i++) {
      data[i] = _reconstructPacket(data[i], buffers);
    }
  } else if (typeof data === 'object') {
    for (var key in data) {
      data[key] = _reconstructPacket(data[key], buffers);
    }
  }

  return data;
}

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((withNativeBlob && obj instanceof Blob) ||
        (withNativeFile && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (typeof obj === 'object' && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/socket.io-parser/index.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * Module dependencies.
 */

var debug = __webpack_require__("./node_modules/socket.io-parser/node_modules/debug/src/browser.js")('socket.io-parser');
var Emitter = __webpack_require__("./node_modules/component-emitter/index.js");
var binary = __webpack_require__("./node_modules/socket.io-parser/binary.js");
var isArray = __webpack_require__("./node_modules/socket.io-parser/node_modules/isarray/index.js");
var isBuf = __webpack_require__("./node_modules/socket.io-parser/is-buffer.js");

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

var ERROR_PACKET = exports.ERROR + '"encode error"';

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
    encodeAsBinary(obj, callback);
  } else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {

  // first is type
  var str = '' + obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
    str += obj.attachments + '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' !== obj.nsp) {
    str += obj.nsp + ',';
  }

  // immediately followed by the id
  if (null != obj.id) {
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    var payload = tryStringify(obj.data);
    if (payload !== false) {
      str += payload;
    } else {
      return ERROR_PACKET;
    }
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

function tryStringify(str) {
  try {
    return JSON.stringify(str);
  } catch(e){
    return false;
  }
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if (typeof obj === 'string') {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var i = 0;
  // look up type
  var p = {
    type: Number(str.charAt(0))
  };

  if (null == exports.types[p.type]) {
    return error('unknown packet type ' + p.type);
  }

  // look up attachments if type binary
  if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
    var buf = '';
    while (str.charAt(++i) !== '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) !== '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' === str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' === c) break;
      p.nsp += c;
      if (i === str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i === str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    var payload = tryParse(str.substr(i));
    var isPayloadValid = payload !== false && (p.type === exports.ERROR || isArray(payload));
    if (isPayloadValid) {
      p.data = payload;
    } else {
      return error('invalid payload');
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch(e){
    return false;
  }
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length === this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(msg) {
  return {
    type: exports.ERROR,
    data: 'parser error: ' + msg
  };
}


/***/ }),

/***/ "./node_modules/socket.io-parser/is-buffer.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
module.exports = isBuf;

var withNativeBuffer = typeof global.Buffer === 'function' && typeof global.Buffer.isBuffer === 'function';
var withNativeArrayBuffer = typeof global.ArrayBuffer === 'function';

var isView = (function () {
  if (withNativeArrayBuffer && typeof global.ArrayBuffer.isView === 'function') {
    return global.ArrayBuffer.isView;
  } else {
    return function (obj) { return obj.buffer instanceof global.ArrayBuffer; };
  }
})();

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (withNativeBuffer && global.Buffer.isBuffer(obj)) ||
          (withNativeArrayBuffer && (obj instanceof global.ArrayBuffer || isView(obj)));
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/socket.io-parser/node_modules/debug/src/browser.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__("./node_modules/socket.io-parser/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = Object({"MIX_PUSHER_APP_KEY":"","MIX_PUSHER_APP_CLUSTER":"mt1","NODE_ENV":"development"}).DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__("./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/socket.io-parser/node_modules/debug/src/debug.js":
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__("./node_modules/ms/index.js");

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/socket.io-parser/node_modules/isarray/index.js":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/to-array/index.js":
/***/ (function(module, exports) {

module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./node_modules/yeast/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;


/***/ }),

/***/ "./resources/assets/js/store.js":
/***/ (function(module, exports) {

module.exports = {
  getToken: function getToken() {
    var accessToken = window.localStorage.getItem('access_token');

    return accessToken;
  }
};

/***/ }),

/***/ "./resources/assets/js/web.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_laravel_echo__ = __webpack_require__("./node_modules/laravel-echo/dist/echo.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_laravel_echo___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_laravel_echo__);
var store = __webpack_require__("./resources/assets/js/store.js");
window.axios = __webpack_require__("./node_modules/axios/index.js");

alert(1);
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

var token = document.head.querySelector('meta[name="csrf-token"]');

var accessToken = store.getToken();

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}



window.io = __webpack_require__("./node_modules/socket.io-client/lib/index.js");
window.Echo = new __WEBPACK_IMPORTED_MODULE_0_laravel_echo___default.a({
  broadcaster: 'socket.io',
  host: window.App.api_url,
  transports: ['websocket']
});

window.Echo.connector.options.auth.headers["Authorization"] = "Bearer " + accessToken;

window.axios.defaults.baseURL = window.App.api_url;

window.axios.interceptors.request.use(function (config) {
  if (!config.headers.Authorization) {
    if (accessToken) {
      config.headers.Authorization = 'Bearer ' + accessToken;
    }
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});

__webpack_require__("./resources/assets/js/web/pages/index.js");
__webpack_require__("./resources/assets/js/web/pages/login.js");
__webpack_require__("./resources/assets/js/web/pages/avatar.js");
__webpack_require__("./resources/assets/js/web/pages/update_profile.js");
__webpack_require__("./resources/assets/js/web/pages/order_call.js");
__webpack_require__("./resources/assets/js/web/pages/list_order.js");
__webpack_require__("./resources/assets/js/web/pages/point.js");
__webpack_require__("./resources/assets/js/web/pages/chat.js");
__webpack_require__("./resources/assets/js/web/pages/room.js");
__webpack_require__("./resources/assets/js/web/pages/rating.js");
__webpack_require__("./resources/assets/js/web/pages/receipt.js");
__webpack_require__("./resources/assets/js/web/pages/card.js");
__webpack_require__("./resources/assets/js/web/pages/payment.js");
__webpack_require__("./resources/assets/js/web/pages/upload_avatar.js");
__webpack_require__("./resources/assets/js/web/pages/order_nomination.js");
__webpack_require__("./resources/assets/js/web/pages/cast_mypage.js");
__webpack_require__("./resources/assets/js/web/pages/cast_detail.js");
__webpack_require__("./resources/assets/js/web/pages/bank_account.js");
__webpack_require__("./resources/assets/js/web/pages/create_room.js");
__webpack_require__("./resources/assets/js/web/pages/verify.js");
__webpack_require__("./resources/assets/js/web/pages/order_offer.js");
__webpack_require__("./resources/assets/js/web/pages/menu.js");
__webpack_require__("./resources/assets/js/web/pages/confirm_order_call.js");
__webpack_require__("./resources/assets/js/web/pages/list_cast.js");
__webpack_require__("./resources/assets/js/web/pages/order_step_one.js");
__webpack_require__("./resources/assets/js/web/pages/order_step_two.js");
__webpack_require__("./resources/assets/js/web/pages/order_step_three.js");
__webpack_require__("./resources/assets/js/web/pages/cancel_time_order.js");
__webpack_require__("./resources/assets/js/web/pages/payment_method.js");
__webpack_require__("./resources/assets/js/web/pages/timelines_index.js");
__webpack_require__("./resources/assets/js/web/pages/timeline.js");
__webpack_require__("./resources/assets/js/web/pages/resign.js");
__webpack_require__("./resources/assets/js/web/pages/cast_offer.js");

/***/ }),

/***/ "./resources/assets/js/web/pages/avatar.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $('.js-img').on('click', function () {
    id = $(this).attr('id');

    $('#set-default-avatar').on('click', function (e) {
      window.axios.patch('/api/v1/avatars/' + id).then(function (response) {
        window.location = '/profile/edit';
      }).catch(function (error) {
        if (error.response.status == 401) {
          window.location = '/login/line';
        }
      });
    });

    $('#delete-avatar').on('click', function (e) {
      window.axios.delete('/api/v1/avatars/' + id).then(function (response) {
        window.location = '/profile/edit';
      }).catch(function (error) {
        if (error.response.status == 401) {
          window.location = '/login/line';
        }
      });
    });

    $('#update-avatar').on('click', function (e) {
      $('#upload-btn').trigger('click');
    });

    $('#upload-btn').on('change', function (e) {
      var data = new FormData();
      data.append('image', document.getElementById('upload-btn').files[0]);

      window.axios.post('/api/v1/avatars/' + id, data).then(function (response) {
        window.location = '/profile/edit';
      }).catch(function (error) {
        if (error.response.status == 401) {
          window.location = '/login/line';
        }
      });
    });
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/bank_account.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  var backUrl = $('#back-url').val();
  var referrer = document.referrer;

  var num = sessionStorage.getItem("number");
  $('#number').val(num);
  var holderName = sessionStorage.getItem("holderName");
  $('#holder-name').val(holderName);
  var type = sessionStorage.getItem("type");

  if (type) {
    $('.account-type label').addClass('hidden-label');
  } else {
    $('.account-type label').removeClass('hidden-label');
  }
  $('#select-account-type').val(type);

  var num = $('#number').val();
  var holderName = $("#holder-name").val();
  var bankName = $('#bank-name').text();
  var typeClass = $(".account-type label").attr("class");
  if (backUrl != referrer) {
    if (bankName && typeClass == 'hidden-label' && num && holderName) {
      $('.btn-submit-bank').addClass('btn-create-bank-info-color');
      $('.btn-edit-bank').addClass('btn-create-bank-info-color');
    } else {
      $('.btn-submit-bank').removeClass('btn-create-bank-info-color');
      $('.btn-edit-bank').removeClass('btn-create-bank-info-color');
    }
  }

  $('#number').keyup(function (event) {
    function valid(str) {
      var count = 0;
      ['(', ')', '.', '+', '-', ',', ';', 'N', '/', '*', '#', ' '].forEach(function (sample) {
        if (str.indexOf(sample) >= 0) {
          count++;
          return count;
        }
      });
      return count;
    }

    var num = $('#number').val();
    if (valid(num) > 0) {
      num = num.slice(0, num.length - 1);
      $('#number').val(num);
    }
    sessionStorage.setItem("number", num);
    var holderName = $("#holder-name").val();
    var bankName = $('#bank-name').text();
    var typeClass = $(".account-type label").attr("class");

    if (bankName && typeClass == 'hidden-label' && num && holderName) {
      $('.btn-submit-bank').addClass('btn-create-bank-info-color');
      $('.btn-edit-bank').addClass('btn-create-bank-info-color');
    } else {
      $('.btn-submit-bank').removeClass('btn-create-bank-info-color');
      $('.btn-edit-bank').removeClass('btn-create-bank-info-color');
    }
  });

  $('#number').keypress(function (event) {
    var num = $('#number').val();

    if (num.length > 6) {
      return false;
    }
    return true;
  });

  $('#holder-name').keyup(function (event) {
    var num = $('#number').val();
    var holderName = $("#holder-name").val();
    sessionStorage.setItem("holderName", holderName);
    var bankName = $('#bank-name').text();
    var typeClass = $(".account-type label").attr("class");

    if (bankName && typeClass == 'hidden-label' && num && holderName) {
      $('.btn-submit-bank').addClass('btn-create-bank-info-color');
      $('.btn-edit-bank').addClass('btn-create-bank-info-color');
    } else {
      $('.btn-submit-bank').removeClass('btn-create-bank-info-color');
      $('.btn-edit-bank').removeClass('btn-create-bank-info-color');
    }
  });

  $('#select-account-type').change(function (event) {
    var num = $('#number').val();
    var holderName = $("#holder-name").val();
    var bankName = $('#bank-name').text();
    var typeClass = $(".account-type label").attr("class");
    var type = $(".account-type select").val();
    sessionStorage.setItem("type", type);

    if (bankName && typeClass == 'hidden-label' && num && holderName) {
      $('.btn-submit-bank').addClass('btn-create-bank-info-color');
      $('.btn-edit-bank').addClass('btn-create-bank-info-color');
    } else {
      $('.btn-submit-bank').removeClass('btn-create-bank-info-color');
      $('.btn-edit-bank').removeClass('btn-create-bank-info-color');
    }
  });

  $('#select-account-type').click(function (event) {
    var type = $('#select-account-type').val();
    if (type) {
      $('#select-account-type').val(type);
    } else {
      $('#select-account-type').val(1);
    }
    $('.account-type label').addClass('hidden-label');
  });

  $('.btn-submit-bank').click(function (event) {
    localStorage.removeItem("number");
    localStorage.removeItem("holderName");
    localStorage.removeItem("type");

    var formData = new FormData();
    var bankName = $('#bank-name').text();
    var bankCode = $("#bank-code").val();
    var branchName = $('#branch-name').text();
    var branchCode = $("#branch-code").val();
    var type = $("#select-account-type").val();
    var number = $("#number").val();
    var holderName = $("#holder-name").val();

    formData.append('bank_name', bankName);
    formData.append('bank_code', bankCode);
    formData.append('branch_name', branchName);
    formData.append('branch_code', branchCode);
    formData.append('type', type);
    formData.append('number', number);
    formData.append('holder_name', holderName);

    axios.post('/api/v1/cast/bank_accounts', formData).then(function (response) {
      window.location = '/cast_mypage/bank_account';
    }).catch(function (error) {
      $('#create_bank_accounts-content').text(error.response.data.error);
      $('#create_bank_accounts-error').trigger('click');
    });
  });

  $('#btn-update').click(function (event) {
    if ($('#btn-update').attr('class') == 'btn-edit-bank btn-create-bank-info-color') {
      localStorage.removeItem("number");
      localStorage.removeItem("holderName");
      localStorage.removeItem("type");

      var formData = new FormData();
      var bankName = $('#bank-name').text();
      var bankCode = $("#bank-code").val();
      var branchName = $('#branch-name').text();
      var branchCode = $("#branch-code").val();
      var type = $("#select-account-type").val();
      var number = $("#number").val();
      var holderName = $("#holder-name").val();
      var bankAccount = $("#bank-account").val();

      formData.append('bank_name', bankName);
      formData.append('bank_code', bankCode);
      formData.append('branch_name', branchName);
      formData.append('branch_code', branchCode);
      formData.append('type', type);
      formData.append('number', number);
      formData.append('holder_name', holderName);

      axios.post('/api/v1/cast/bank_accounts/' + bankAccount, formData).then(function (response) {
        window.location = '/cast_mypage/bank_account';
      }).catch(function (error) {
        $('#edit_bank_accounts-content').text(error.response.data.error);
        $('#edit_bank_accounts-error').trigger('click');
      });
    }
  });

  $('#bank-name').focusout(function () {
    $('#form-get-name-bank').submit();
  });

  $('.input-branch-name').focusout(function () {
    $('#form-get-name-branch-bank').submit();
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/cancel_time_order.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");

$(document).ready(function () {

  if ($('.select-month').length) {

    var params = {
      current_month: $('.select-month').val(),
      current_date: $('.select-date').val(),
      current_hour: $('.select-hour').val(),
      current_minute: $('.select-minute').val()
    };

    helper.updateLocalStorageValue('first_load_time', params);
  } else {
    if (localStorage.getItem("first_load_time")) {
      localStorage.removeItem("first_load_time");
    }
  }

  if ($('.input-area-offer').length) {
    var params = {
      current_hour_offer: $('.select-hour-offer').val(),
      current_minute_offer: $('.select-minute-offer').val()
    };

    helper.updateLocalStorageValue('first_load_time_offer', params);
  } else {
    if (localStorage.getItem("first_load_time_offer")) {
      localStorage.removeItem("first_load_time_offer");
    }
  }

  $('.date-select__cancel').on("click", function (event) {
    //offer
    if ($('.input-area-offer').length) {
      var currentTime = JSON.parse(localStorage.getItem("first_load_time_offer"));

      var startTimeFrom = $('#start-time-from-offer').val();
      startTimeFrom = startTimeFrom.split(":");
      var startHourFrom = startTimeFrom[0];
      var startMinuteFrom = startTimeFrom[1];

      var startTimeTo = $('#start-time-to-offer').val();
      startTimeTo = startTimeTo.split(":");
      var startHourTo = startTimeTo[0];
      var startMinuteTo = startTimeTo[1];
      var html = '';

      if (localStorage.getItem("order_offer")) {
        var offerId = $('.offer-id').val();
        var orderOffer = JSON.parse(localStorage.getItem("order_offer"));
        if (orderOffer[offerId]) {
          orderOffer = orderOffer[offerId];
          if (orderOffer.hour) {
            var hour = orderOffer.hour;

            var inputHour = $('select[name=select_hour_offer] option');
            $.each(inputHour, function (index, val) {
              if (val.value == orderOffer.hour) {
                $(this).prop('selected', true);
              }
            });

            if (23 < hour) {
              switch (hour) {
                case '24':
                  hour = '00';
                  break;
                case '25':
                  hour = '01';
                  break;
                case '26':
                  hour = '02';
                  break;
              }
            }

            startMinuteFrom = hour == startHourFrom ? parseInt(startMinuteFrom) : 0;
            startMinuteTo = hour == startHourTo ? parseInt(startMinuteTo) : 59;

            for (var i = startMinuteFrom; i <= startMinuteTo; i++) {
              var value = i < 10 ? '0' + parseInt(i) : i;

              html += '<option value="' + value + '">' + value + '\u5206</option>';
            }

            $('.select-minute-offer').html(html);

            $('.select-minute-offer').val(orderOffer.minute);
          } else {
            var hour = currentTime.current_hour_offer;

            var _inputHour = $('select[name=select_hour_offer] option');
            $.each(_inputHour, function (index, val) {
              if (val.value == currentTime.current_hour_offer) {
                $(this).prop('selected', true);
              }
            });

            if (23 < hour) {
              switch (hour) {
                case '24':
                  hour = '00';
                  break;
                case '25':
                  hour = '01';
                  break;
                case '26':
                  hour = '02';
                  break;
              }
            }

            startMinuteFrom = hour == startHourFrom ? parseInt(startMinuteFrom) : 0;
            startMinuteTo = hour == startHourTo ? parseInt(startMinuteTo) : 59;

            for (var i = startMinuteFrom; i <= startMinuteTo; i++) {
              var value = i < 10 ? '0' + parseInt(i) : i;

              html += '<option value="' + value + '">' + value + '\u5206</option>';
            }

            $('.select-minute-offer').html(html);

            $('.select-minute-offer').val(currentTime.current_minute_offer);
          }
        } else {
          var hour = currentTime.current_hour_offer;

          var _inputHour2 = $('select[name=select_hour_offer] option');
          $.each(_inputHour2, function (index, val) {
            if (val.value == currentTime.current_hour_offer) {
              $(this).prop('selected', true);
            }
          });

          if (23 < hour) {
            switch (hour) {
              case '24':
                hour = '00';
                break;
              case '25':
                hour = '01';
                break;
              case '26':
                hour = '02';
                break;
            }
          }

          startMinuteFrom = hour == startHourFrom ? parseInt(startMinuteFrom) : 0;
          startMinuteTo = hour == startHourTo ? parseInt(startMinuteTo) : 59;

          for (var i = startMinuteFrom; i <= startMinuteTo; i++) {
            var value = i < 10 ? '0' + parseInt(i) : i;

            html += '<option value="' + value + '">' + value + '\u5206</option>';
          }

          $('.select-minute-offer').html(html);

          $('.select-minute-offer').val(currentTime.current_minute_offer);
        }
      } else {
        var hour = currentTime.current_hour_offer;

        var _inputHour3 = $('select[name=select_hour_offer] option');
        $.each(_inputHour3, function (index, val) {
          if (val.value == currentTime.current_hour_offer) {
            $(this).prop('selected', true);
          }
        });

        if (23 < hour) {
          switch (hour) {
            case '24':
              hour = '00';
              break;
            case '25':
              hour = '01';
              break;
            case '26':
              hour = '02';
              break;
          }
        }

        startMinuteFrom = hour == startHourFrom ? parseInt(startMinuteFrom) : 0;
        startMinuteTo = hour == startHourTo ? parseInt(startMinuteTo) : 59;

        for (var i = startMinuteFrom; i <= startMinuteTo; i++) {
          var value = i < 10 ? '0' + parseInt(i) : i;

          html += '<option value="' + value + '">' + value + '\u5206</option>';
        }

        $('.select-minute-offer').html(html);

        $('.select-minute-offer').val(currentTime.current_minute_offer);
      }
    }

    if ($('.select-month').length) {
      var firstLoadTime = JSON.parse(localStorage.getItem("first_load_time"));
      //1-1
      if ($('#confirm-orders-nomination').length) {
        if (localStorage.getItem("order_params")) {
          var orderNomination = JSON.parse(localStorage.getItem("order_params"));
          if (orderNomination.current_date) {
            var month = parseInt(orderNomination.current_month);

            //month 
            var inputMonth = $('select[name=sl_month_nomination] option');
            $.each(inputMonth, function (index, val) {
              if (val.value == month) {
                $(this).prop('selected', true);
              }
            });

            //date
            window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
              var html = '';
              Object.keys(response.data).forEach(function (key) {
                if (key != 'debug') {
                  html += '<option value="' + key + '">' + response.data[key] + '</option>';
                }
              });
              $('.select-date').html(html);
              helper.loadShift(true);
              var inputDate = $('select[name=sl_date_nomination] option');
              $.each(inputDate, function (index, val) {
                if (val.value == parseInt(orderNomination.current_date)) {
                  $(this).prop('selected', true);
                }
              });
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });

            //hour
            var _inputHour4 = $('select[name=sl_hour_nomination] option');
            $.each(_inputHour4, function (index, val) {
              if (val.value == parseInt(orderNomination.current_hour)) {
                $(this).prop('selected', true);
              }
            });

            //minute
            var inputMinute = $('select[name=sl_minute_nomination] option');
            $.each(inputMinute, function (index, val) {
              if (val.value == parseInt(orderNomination.current_minute)) {
                $(this).prop('selected', true);
              }
            });
          } else {
            var month = firstLoadTime.current_month;
            $('.select-month').val(month);

            window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
              var html = '';
              Object.keys(response.data).forEach(function (key) {
                if (key != 'debug') {
                  html += '<option value="' + key + '">' + response.data[key] + '</option>';
                }
              });
              $('.select-date').html(html);
              helper.loadShift(true);
              var inputDate = $('select[name=sl_date_nomination] option');

              $.each(inputDate, function (index, val) {
                if (val.value == firstLoadTime.current_date) {
                  $(this).prop('selected', true);
                }
              });
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });

            $('.select-hour').val(firstLoadTime.current_hour);
            $('.select-minute').val(firstLoadTime.current_minute);
          }
        }
      }

      //call
      if ($('#cast-number-call').length) {
        if (localStorage.getItem("order_call")) {
          var orderCall = JSON.parse(localStorage.getItem("order_call"));
          if (orderCall.current_time) {
            var currentDate = orderCall.current_date.split('-');
            var currentTime = orderCall.current_time.split(':');

            var month = parseInt(currentDate[1]);

            //month 
            var _inputMonth = $('select[name=sl_month] option');
            $.each(_inputMonth, function (index, val) {
              if (val.value == month) {
                $(this).prop('selected', true);
              }
            });

            //date
            window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
              var html = '';
              Object.keys(response.data).forEach(function (key) {
                if (key != 'debug') {
                  html += '<option value="' + key + '">' + response.data[key] + '</option>';
                }
              });
              $('.select-date').html(html);

              var inputDate = $('select[name=sl_date] option');

              $.each(inputDate, function (index, val) {
                if (val.value == parseInt(currentDate[2])) {
                  $(this).prop('selected', true);
                }
              });
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });

            //hour
            var _inputHour5 = $('select[name=sl_hour] option');
            $.each(_inputHour5, function (index, val) {
              if (val.value == parseInt(currentTime[0])) {
                $(this).prop('selected', true);
              }
            });
            //minute
            var _inputMinute = $('select[name=sl_minute] option');
            $.each(_inputMinute, function (index, val) {
              if (val.value == parseInt(currentTime[1])) {
                $(this).prop('selected', true);
              }
            });
          } else {
            var month = firstLoadTime.current_month;
            $('.select-month').val(month);

            window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
              var html = '';
              Object.keys(response.data).forEach(function (key) {
                if (key != 'debug') {
                  html += '<option value="' + key + '">' + response.data[key] + '</option>';
                }
              });
              $('.select-date').html(html);

              var inputDate = $('select[name=sl_date] option');

              $.each(inputDate, function (index, val) {
                if (val.value == firstLoadTime.current_date) {
                  $(this).prop('selected', true);
                }
              });
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });

            $('.select-hour').val(firstLoadTime.current_hour);
            $('.select-minute').val(firstLoadTime.current_minute);
          }
        }
      }
    }
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/card.js":
/***/ (function(module, exports) {

//  $(document).ready(function(){
//   function submitSquareForm() {
//     var nonce = $("#card-nonce").val();
//
//     $.ajax({
//       headers: {
//         'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//       },
//       type: "POST",
//       dataType: "json",
//       url: '/webview/card/create',
//       data: {
//         nonce: nonce,
//       },
//       success: function (msg) {
//         if (!msg.success) {
//           var error = msg.error;
//           $(".notify span").text(error);
//         } else {
//           window.location.href = backUrl;
//         }
//       },
//     });
//   }
// });

/***/ }),

/***/ "./resources/assets/js/web/pages/cast_detail.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
$(document).ready(function () {
  function dayOfWeek() {
    return ['日', '月', '火', '水', '木', '金', '土'];
  }

  var checkApp = {
    isAppleDevice: function isAppleDevice() {
      if (navigator.userAgent.match(/(iPhone|iPod|iPad)/) != null) {
        return true;
      }
      return false;
    }
  };

  $('#favorite-cast-detail').on('click', function (e) {
    var _this = $(this);
    id = _this.attr('data-user-id');
    is_favorited = _this.attr('data-is-favorited');

    window.axios.post('/api/v1/favorites/' + id).then(function (response) {
      if (is_favorited == '0') {
        $('#favorite-cast-detail').html('<img src="/assets/web/images/common/like.svg"><span class="text-color">\u30A4\u30A4\u30CD\u6E08</span>');
      } else {
        $('#favorite-cast-detail').html('<img src="/assets/web/images/common/unlike.svg"><span class="text-color">\u30A4\u30A4\u30CD</span>');
      }

      _this.attr('data-is-favorited', is_favorited == 1 ? 0 : 1);
    }).catch(function (error) {
      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  });

  $('.btn-order-nominee').on('click', function () {
    var castId = $('#cast-id').val();
    var dateShift = $(this).data('shift');
    var newdate = dateShift.split('-');
    var date = newdate[2];
    var month = newdate[1];
    var year = newdate[0];

    if (checkApp.isAppleDevice()) {
      var dateFolowDevice = new Date(month + '/' + date + '/' + year);
    } else {
      var dateFolowDevice = new Date(year + '-' + month + '-' + date);
    }

    var getDayOfWeek = dateFolowDevice.getDay();
    var dayOfWeekString = dayOfWeek()[getDayOfWeek];

    var paramShift = {
      date: date,
      month: month,
      year: year,
      dayOfWeekString: dayOfWeekString
    };

    helper.updateLocalStorageKey('shifts', paramShift, castId);

    window.location = '/nominate?id=' + castId;
  });

  // Like/unlike timeline
  $('.heart-timeline').on('click', function (e) {
    var id = $(this).attr('data-timeline-id');
    var _this = $('#heart-timeline-' + id);
    total_favorites = _this.attr('data-total-favorites-timeline');
    is_favorited_timeline = _this.attr('data-is-favorited-timeline');

    window.axios.post('/api/v1/timelines/' + id + '/favorites').then(function (response) {
      var total = parseInt(total_favorites);
      if (is_favorited_timeline == 0) {
        var total = total + 1;
        _this.html('<img src="/assets/web/images/common/like.svg">');
        _this.attr('data-total-favorites-timeline', total);
      } else {
        var total = total - 1;
        _this.html('<img src="/assets/web/images/common/unlike.svg">');
        _this.attr('data-total-favorites-timeline', total);
      }

      $('#total-favorites-' + id).text(total);
      _this.attr('data-is-favorited-timeline', is_favorited_timeline == 1 ? 0 : 1);
    }).catch(function (error) {
      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/cast_mypage.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $('#triggerVerify').trigger('click');
  $('#change-point').on('click', function (event) {
    var check = $('#point-cast').is(':disabled');
    if (check) {
      $('#sp-text-point').css('color', '#00C3C3');
      $('#point-cast').prop('disabled', false);
      $('#point-cast').css('background-image', 'url(/assets/webview/images/IC_down.png)');
    } else {
      $('.update-cost').click();
    }
  });

  $('.cf-update-cost').on('click', function (event) {
    var params = {
      cost: $('#point-cast').val()
    };

    window.axios.post('/api/v1/auth/update', params).then(function (response) {
      $('#update-point-success').html('変更が完了しました！');
      $('#update-point-alert').trigger('click');

      setTimeout(function () {
        window.location = '/mypage';
      }, 1500);
    }).catch(function (error) {
      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  });

  var numOfAvgRatePlatium = $('#num-of-avg-rate-platium').val();
  var wid = 0;

  if (numOfAvgRatePlatium) {
    wid = numOfAvgRatePlatium * 100 / 5;
  }

  $('body').append('<style>#star-rating-schedule:before{width: ' + wid + 'px;}</style>');
});

/***/ }),

/***/ "./resources/assets/js/web/pages/cast_offer.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
var couponCastOffer = [];
var couponType = {
  'POINT': 1,
  'DURATION': 2,
  'PERCENT': 3
};

var OrderPaymentMethod = {
  'Credit_Card': 1,
  'Direct_Payment': 2
};

function loadCouponsCastOffer() {
  var duration = $('#duration-cast-offer').val();
  var offerId = $('#cast_offer-id').val();

  var paramCoupon = {
    duration: duration
  };

  window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
    couponCastOffer = response.data['data'];

    if (localStorage.getItem("cast_offer")) {
      var castOffer = JSON.parse(localStorage.getItem("cast_offer"));
      if (castOffer[offerId]) {
        castOffer = castOffer[offerId];

        if (castOffer.coupon) {
          showPriceCoupon(duration, castOffer.coupon);
        }
      }
    }
  }).catch(function (error) {
    console.log(error);
    if (error.response.status == 401) {
      window.location = '/login';
    }
  });
}

function showPriceCoupon() {
  var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var coupon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (coupon) {
    var params = {
      type: 3,
      duration: duration,
      total_cast: 1,
      nominee_ids: $('#cast-id').val(),
      date: $('#date-cast-offer').val(),
      start_time: $('#time-cast-offer').val(),
      class_id: $('#class_cast-id').val()
    };
    if (!couponCastOffer) {
      window.location = '/mypage';
    }

    var couponIds = couponCastOffer.map(function (e) {
      return parseInt(e.id);
    });

    if (couponIds.indexOf(parseInt(coupon)) > -1) {
      couponCastOffer.forEach(function (e) {
        if (e.id == coupon) {
          coupon = e;
        }
      });
    } else {
      window.location = '/mypage';
    }

    if (couponType.POINT == coupon.type) {
      params.duration_coupon = 0;
    }

    if (couponType.DURATION == coupon.type) {
      params.duration_coupon = coupon.time;
    }

    if (couponType.PERCENT == coupon.type) {
      params.duration_coupon = 0;
    }

    switch (coupon.type) {
      case couponType.PERCENT:
        params.duration_coupon = 0;

        break;

      case couponType.POINT:
        params.duration_coupon = 0;

        break;

      case couponType.DURATION:
        params.duration_coupon = coupon.time;

        break;
    }

    window.axios.post('/api/v1/orders/price', params).then(function (response) {
      if (couponType.PERCENT == coupon.type) {
        var tempPoint = response.data['data'];
        var pointCoupon = parseInt(coupon.percent) / 100 * tempPoint;
      }

      if (couponType.POINT == coupon.type) {
        var tempPoint = response.data['data'];
        var pointCoupon = coupon.point;
      }

      if (couponType.DURATION == coupon.type) {
        var totalCouponPoint = response.data['data'];
        var tempPoint = totalCouponPoint.total_point;
        var pointCoupon = totalCouponPoint.order_point_coupon + totalCouponPoint.order_fee_coupon;
      }

      switch (coupon.type) {
        case couponType.PERCENT:
          var tempPoint = response.data['data'];
          var pointCoupon = parseInt(coupon.percent) / 100 * tempPoint;

          break;

        case couponType.POINT:
          var tempPoint = response.data['data'];
          var pointCoupon = coupon.point;

          break;

        case couponType.DURATION:
          var totalCouponPoint = response.data['data'];
          var tempPoint = totalCouponPoint.total_point;
          var pointCoupon = totalCouponPoint.order_point_coupon + totalCouponPoint.order_fee_coupon;

          break;
      }

      if (coupon.max_point) {
        if (coupon.max_point < pointCoupon) {
          pointCoupon = coupon.max_point;
        }

        var maxPoint = parseInt(coupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
        $('.offer-coupon__text').html('\u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + maxPoint + 'P\u306B\u306A\u308A\u307E\u3059\u3002');
      }

      var currentPoint = tempPoint - pointCoupon;
      if (currentPoint < 0) {
        currentPoint = 0;
      }

      $('#total-point-cast-offer').val(currentPoint);

      currentPoint = parseInt(currentPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });
      pointCoupon = parseInt(pointCoupon).toLocaleString(undefined, { minimumFractionDigits: 0 });

      var html = '\u5272\u5F15\u984D<span class="red">' + pointCoupon + ' P</span>';
      var text = '\u5408\u8A08<span >' + currentPoint + ' P</span>';
      $('#point-sale-coupon').html(html);
      $('#current-point').html(text);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  } else {
    var pointShow = $('#current-point-cast-offer').val();
    pointShow = parseInt(pointShow).toLocaleString(undefined, { minimumFractionDigits: 0 });

    $('#point-sale-coupon').html('');
    $('#current-point').html('\u5408\u8A08<span >' + pointShow + ' P</span>');
  }
}

function selectedCouponsCastOffer() {
  $('body').on('change', "#cast-offer-coupon", function () {
    var offerId = $('#cast_offer-id').val();
    var couponId = $(this).val();
    var duration = $('#duration-cast-offer').val();
    var time = $("input:radio[name='time_join_nomination']:checked").val();

    if (!couponCastOffer) {
      window.location = '/mypage';
    }

    var couponIds = couponCastOffer.map(function (e) {
      return e.id;
    });

    var coupon = {};
    if (parseInt(couponId)) {
      if (couponIds.indexOf(parseInt(couponId)) > -1) {
        var paramCoupon = {
          coupon: parseInt(couponId)
        };

        helper.updateLocalStorageKey('cast_offer', paramCoupon, offerId);

        couponCastOffer.forEach(function (e) {
          if (e.id == couponId) {
            coupon = e;
          }
        });

        if (coupon.max_point) {
          var maxPoint = parseInt(coupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
          $('.offer-coupon__text').html('\u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + maxPoint + 'P\u306B\u306A\u308A\u307E\u3059\u3002');
        }
      } else {
        window.location = '/mypage';
      }
    } else {
      $('.offer-coupon__text').html('');
      if (localStorage.getItem("cast_offer")) {
        var castOffer = JSON.parse(localStorage.getItem("cast_offer"));

        if (castOffer[offerId]) {
          castOffer = castOffer[offerId];
          if (castOffer.coupon) {
            helper.deleteLocalStorageKey('cast_offer', 'coupon', offerId);
          }
        }
      }
    }

    showPriceCoupon(duration, couponId);
  });
}

function handlerPaymentMethod() {
  var transfer = $("input:radio[name='payment_method']");
  transfer.on("change", function () {
    var offerId = $('#cast_offer-id').val();
    var transfer = $("input:radio[name='payment_method']:checked").val();

    var param = {
      payment_method: transfer
    };

    helper.updateLocalStorageKey('cast_offer', param, offerId);

    if (OrderPaymentMethod.Direct_Payment == parseInt(transfer)) {
      $('#show-card-cast-offer').css('display', 'none');
    }

    if (OrderPaymentMethod.Credit_Card == parseInt(transfer)) {
      $('#show-card-cast-offer').css('display', 'block');

      if ($('.inactive-button-order').length) {
        $('#confirm-cast-order').addClass("disabled");
        $('.checked-cast-offer').prop('checked', false);
        $('#confirm-cast-order').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      }
    }
  });
}

function createCastOffer() {
  var transfer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  $('.modal-confirm-cast-offer').css('display', 'none');
  $('#confirm-cast-order').prop('disabled', true);
  var castOrderId = $('#cast_offer-id').val();

  var params = {
    temp_point: $('#temp-point-offer').val(),
    order_id: castOrderId
  };

  if ($('#total-point-cast-offer').val()) {
    params.temp_point = parseInt($('#total-point-cast-offer').val());
  } else {
    params.temp_point = parseInt($('#current-point-cast-offer').val());
  }

  if (transfer) {
    params.payment_method = transfer;
  }

  if (localStorage.getItem("cast_offer")) {
    var castOffer = JSON.parse(localStorage.getItem("cast_offer"));
    if (castOffer[castOrderId]) {
      castOffer = castOffer[castOrderId];
      if (castOffer.coupon) {

        var couponIds = couponCastOffer.map(function (e) {
          return parseInt(e.id);
        });

        var coupon = null;
        if (couponIds.indexOf(parseInt(castOffer.coupon)) > -1) {
          couponCastOffer.forEach(function (e) {
            if (e.id == castOffer.coupon) {
              coupon = e;
            }
          });
        } else {
          window.location = '/mypage';
        }

        params.coupon_id = coupon.id;
        params.coupon_name = coupon.name;
        params.coupon_type = coupon.type;

        if (coupon.max_point) {
          params.coupon_max_point = coupon.max_point;
        } else {
          params.coupon_max_point = null;
        }

        switch (coupon.type) {
          case couponType.POINT:
            params.coupon_value = coupon.point;
            break;

          case couponType.DURATION:
            params.coupon_value = coupon.time;
            break;

          case couponType.PERCENT:
            params.coupon_value = coupon.percent;
            break;

          default:
            window.location.href = '/mypage';
        }
      }
    }
  }

  window.axios.post('/api/v1/guest/cast_offers/accept', params).then(function (response) {
    $('#cast-offer-popup').prop('checked', false);
    var roomId = response.data.data.room_id;
    window.location.href = '/message/' + roomId;
  }).catch(function (error) {
    console.log(error);
    $('#confirm-cast-order').prop('disabled', false);
    $('#cast-offer-popup').prop('checked', false);
    if (error.response.status == 401) {
      window.location = '/login';
    } else {
      if (error.response.status == 422 || error.response.status == 400) {
        $('#timeout-offer-message h2').css('font-size', '15px');

        if (error.response.status == 422) {
          $('#timeout-offer-message h2').html('この操作は実行できません');
        } else {
          $('#timeout-offer-message h2').html('この予約の回答期限は終了しました');
        }

        $('#timeout-offer').prop('checked', true);
      } else {
        var err = '';

        switch (parseInt(error.response.status)) {
          case 403:
            err = 'アカウントが凍結されています';

            break;

          case 404:
            err = '支払い方法が未登録です';

            break;

          case 406:
            err = 'こちらの飲み会の提案は取り下げられました。';

            break;

          case 409:
            err = 'クーポンが無効です';

            break;

          case 412:
            err = '退会申請中のため、予約することはできません。';

            break;

          default:
            err = 'サーバーエラーが発生しました';

            break;
        }

        $('#err-offer-message h2').html(err);

        $('#err-offer').prop('checked', true);
      }
    }
  });
}

function checkedCastOffer() {
  $('body').on('change', ".checked-cast-offer", function (event) {
    if ($(this).is(':checked')) {
      var checkCard = $('.inactive-button-order').length;
      var transfer = $("input:radio[name='transfer_order_nominate']:checked").val();

      if (OrderPaymentMethod.Direct_Payment == transfer) {
        checkCard = false;
      }

      if (checkCard) {
        $('#confirm-cast-order').addClass("disable");
        $(this).prop('checked', false);
        $('#confirm-cast-order').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      } else {
        $(this).prop('checked', true);
        $('#sp-cancel').removeClass('sp-disable');
        $('#confirm-cast-order').removeClass('disable');
        $('#confirm-cast-order').prop('disabled', false);
      }
    } else {
      $('#confirm-cast-order').addClass("disable");
      $(this).prop('checked', false);
      $('#confirm-cast-order').prop('disabled', true);
      $('#sp-cancel').addClass("sp-disable");
    }
  });
}

function denyCastOffer() {
  $('body').on('click', "#canceled-cast-offer", function () {
    var castOrderId = $('#cast_offer-id').val();

    window.axios.post('/api/v1/guest/cast_offers/' + parseInt(castOrderId) + '/deny').then(function (response) {
      window.location.href = '/mypage';
    }).catch(function (error) {
      $('#confirm-cast-order').prop('disabled', false);
      $('#cast-offer-popup').prop('checked', false);
      if (error.response.status == 401) {
        window.location = '/login';
      } else {
        if (error.response.status == 422 || error.response.status == 409) {
          $('#timeout-offer-message h2').css('font-size', '15px');

          if (error.response.status == 422) {
            $('#timeout-offer-message h2').html('この操作は実行できません');
          } else {
            $('#timeout-offer-message h2').html('この予約の回答期限は終了しました');
          }

          $('#timeout-offer').prop('checked', true);
        } else {
          var err = '';

          switch (error.response.status) {
            case 406:
              err = 'こちらの飲み会の提案は取り下げられました。';

              break;

            default:
              err = 'サーバーエラーが発生しました';

              break;
          }

          $('#err-offer-message h2').html(err);

          $('#err-offer').prop('checked', true);
        }
      }
    });
  });
}

$(document).ready(function () {

  if ($('#confirm-cast-order').length) {
    loadCouponsCastOffer();
    checkedCastOffer();
    handlerPaymentMethod();
    selectedCouponsCastOffer();
    denyCastOffer();
    var castOrderId = $('#cast_offer-id').val();

    if (localStorage.getItem("cast_offer")) {
      var castOffer = JSON.parse(localStorage.getItem("cast_offer"));
      if (castOffer[castOrderId]) {
        castOffer = castOffer[castOrderId];

        //payment
        if (castOffer.payment_method) {
          var inputTransfer = $("input:radio[name='payment_method']");
          $.each(inputTransfer, function (index, val) {
            if (val.value == parseInt(castOffer.payment_method)) {
              $(this).prop('checked', true);
            }
          });

          if (OrderPaymentMethod.Direct_Payment == parseInt(castOffer.payment_method)) {
            $('#show-card-cast-offer').css('display', 'none');
          }
        }

        if (castOffer.coupon) {
          var selectCoupon = $("#cast-offer-coupon option");
          $.each(selectCoupon, function (index, val) {
            if (val.value == parseInt(castOffer.coupon)) {
              $(this).prop('selected', true);
            }
          });
        }
      }
    }

    $('#confirm-cast-order').on('click', function () {
      $('.modal-confirm-cast-offer').css('display', 'inline-block');
      $('#cast-offer-popup').prop('checked', true);
    });

    $('body').on('click', "#create-cast-offer", function () {
      var transfer = parseInt($("input[name='payment_method']:checked").val());

      if (transfer) {
        if (OrderPaymentMethod.Credit_Card == transfer || OrderPaymentMethod.Direct_Payment == transfer) {
          if (OrderPaymentMethod.Direct_Payment == transfer) {
            window.axios.get('/api/v1/auth/me').then(function (response) {
              var pointUser = response.data['data'].point;
              window.axios.get('/api/v1/guest/points_used').then(function (response) {
                var pointUsed = response.data['data'];

                if ($('#total-point-cast-offer').val()) {
                  var tempPointCastOffer = $('#total-point-cast-offer').val();
                } else {
                  var tempPointCastOffer = $('#current-point-cast-offer').val();
                }

                var tempPointOrder = parseInt(tempPointCastOffer) + parseInt(pointUsed);

                if (parseInt(tempPointOrder) > parseInt(pointUser)) {
                  $('#cast-offer-popup').prop('checked', false);
                  $('.checked-cast-offer').prop('checked', false);
                  $('#sp-cancel').addClass('sp-disable');
                  $('#confirm-cast-order').prop('disabled', true);
                  $('#confirm-cast-order').addClass('disable');

                  if (parseInt(pointUsed) > parseInt(pointUser)) {
                    var point = parseInt(tempPointCastOffer);
                  } else {
                    var point = parseInt(tempPointOrder) - parseInt(pointUser);
                  }

                  window.location.href = '/payment/transfer?point=' + point;

                  return;
                } else {
                  createCastOffer(transfer);
                }
              }).catch(function (error) {
                console.log(error);
                if (error.response.status == 401) {
                  window.location = '/login';
                }
              });
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });
          } else {
            createCastOffer(transfer);
          }
        } else {
          window.location.href = '/mypage';
        }
      } else {
        createCastOffer();
      }
    });

    $('.redirect-mypage').on("click", function (event) {
      window.location = '/mypage';
    });

    $('#btn-cancel-offer').on("click", function (event) {
      $('#cancel-cast-offer').prop('checked', true);
    });

    if ($('#order-status').length) {
      var orderStatus = parseInt($('#order-status').val());

      switch (orderStatus) {

        case 2: //active
        case 3: //processing
        case 4:
          //done
          $('#timeout-offer-message h2').html('既に予約確定しています。');

          break;

        case 5:
          //done
          $('#timeout-offer-message h2').html('既に予約キャンセルしています。');

          break;

        case 6:
          //done
          $('#timeout-offer-message h2').html('こちらの飲み会の提案は取り下げられました。');

          break;

        case 7:
          // Order time out
          $('#timeout-offer-message h2').html('この予約の回答期限は終了しました');

          break;

        case 8:
          // Order time out
          $('#timeout-offer-message h2').html('既に予約キャンセルしています。');

          break;

        case 10:
          //guest denied order
          $('#timeout-offer-message h2').html('既に予約キャンセルしています。');

          break;

        case 11:
          //cast cancel order
          $('#timeout-offer-message h2').html('こちらの飲み会の提案は取り下げられました。');

          break;
      }

      if (1 != orderStatus && 9 != orderStatus) {
        // 1~open, 9~open_for_guest
        $('#timeout-offer').prop('checked', true);
      }
    }
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/chat.js":
/***/ (function(module, exports) {

var sendingMessage = false;
var loadingMore = false;
var flag = false;
$(document).ready(function () {
    var device = 'web';

    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        device = 'ios';
        $('#chat .msg').css('height', '65%');
        $('#chat #message-box').css('height', '100%');
        $('#chat .msg-input').css({
            'position': 'absolute',
            'bottom': '0',
            'margin-bottom': '-30px'
        });

        $('body').on('click', '#content', function () {
            var margin = $('#chat .msg-input').css("margin-bottom");
            var iHeight = window.screen.height;
            var iWidth = window.screen.width;

            if ('-30px' == margin) {
                if (iWidth === 375 && iHeight === 667) {
                    $('#chat .msg-input').css({
                        'margin-bottom': '8px'
                    });
                } else {
                    $('#chat .msg-input').css({
                        'margin-bottom': '0px'
                    });
                }
            }
        });
    }

    $('#message-box').on('touchend', function (e) {
        if ($('#content').is(':focus')) {
            $('#content').blur();
            if ('ios' == device) {
                setTimeout(function () {
                    $('#chat .msg-input').css({
                        'margin-bottom': '-30px'
                    });
                }, 150);
            }
        }
    });

    function isValidImage(url, callback) {
        var image = new Image();
        image.src = url;
        image.onload = function () {
            callback(true);
        };

        image.onerror = function () {
            callback(false);
        };
    }

    var roomId = $("#room-id").val();
    var orderId = $("#order-id").val();
    var userAuthId = $("#user-id").val();
    window.Echo.private('room.' + roomId).listen('MessageCreated', function (e) {
        var message = e.message.message;
        var reg_exUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
        message = message.replace(reg_exUrl, '<a href="$1" target="_blank">$1</a>');

        var createdAt = e.message.created_at;
        var pattern = /([0-9]{2}):([0-9]{2}):/g;
        var result = pattern.exec(createdAt);
        var time = result[1] + ':' + result[2];
        var avatar = e.message.user.avatars[0]['path'];
        var userId = e.message.user.id;
        var classMsg = '';
        if (userAuthId == userId) {
            classMsg = 'msg-right';
        } else {
            classMsg = 'msg-left';
        }

        isValidImage(avatar, function (isValid) {
            if (isValid) {
                avatar = avatar;
            } else {
                avatar = '/assets/web/images/gm1/ic_default_avatar@3x.png';
            }

            if (e.message.type == 2 || e.message.type == 1 && e.message.system_type == 1 || e.message.type == 4 || e.message.type == 6) {
                $("#message-box").append('\n            <div class="messages ' + classMsg + ' msg-wrap">\n            <figure>\n              <a href=""><img src="' + avatar + '"  alt="" title="" class="alignnone size-full wp-image-515" /></a>\n            </figure>\n            <div class="' + classMsg + '-text">\n              <div class="text">\n                <div class="text-wrapper">\n                  <p>' + message.replace(/\n/g, "<br />") + '</p>\n                </div>\n              </div>\n              <div class="time"><p>' + time + '</p></div>\n            </div>\n          </div>\n          ');
            }

            if (e.message.type == 3) {
                $("#message-box").append('\n            <div class="messages ' + classMsg + ' msg-wrap">\n            <figure>\n             <a href=""><img src="' + avatar + '"  alt="" title="" class="alignnone size-full wp-image-515" /></a>\n            </figure>\n            <div class="' + classMsg + '-text">\n              <div class="pic">\n                <p>\n                  <img src="' + e.message.image + '"  alt="" title="" class="">\n                </p>\n             </div>\n              <div class="time"><p>' + time + '</p></div>\n            </div>\n          </div>\n          ');
                $('.pic p img').promise().done(function () {
                    $('img').load(function () {
                        //android detection
                        if (/android/i.test(userAgent)) {
                            $(document).scrollTop($('#message-box')[0].scrollHeight);
                        }

                        // iOS detection
                        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                            setTimeout(function () {
                                $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
                            });
                        }
                    });
                });
            }

            if (e.message.type == 1 && e.message.system_type == 2) {
                $("#message-box").append('\n            <div class="msg-alert">\n              <h3><span>' + time + '</span><br>' + message.replace(/\n/g, "<br />") + '</h3>\n            </div>\n         ');
            }
        });

        //android detection
        if (/android/i.test(userAgent)) {
            $(document).scrollTop($('#message-box')[0].scrollHeight);
        }

        // iOS detection
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            setTimeout(function () {
                $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
            });
        }
    });

    $("#send-message").click(function (event) {
        $('#content').focus();
        var content = $("#content").val();
        if (!$.trim(content)) {
            return false;
        }

        var formData = new FormData();

        formData.append('message', content);
        formData.append('type', 2);

        if (!sendingMessage) {
            sendMessage(formData);
        }
        event.preventDefault();
    });

    $("#content").click(function (event) {
        $("#send-message").prop('disabled', false);
    });

    $("#content").on('keydown', function () {
        $("#send-message").prop('disabled', false);
    });

    var resize = null;

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#my-image').attr('src', e.target.result);
                var oj = {
                    enableExif: true,
                    viewport: {
                        width: $('.wrap-croppie-image').width() - 10,
                        height: $('.wrap-croppie-image').width()
                    },
                    enableOrientation: true
                };

                if (resize) {
                    resize.bind({ url: e.target.result });
                    $('#croppie-image-modal').trigger('click');
                } else {
                    resize = new Croppie($('#my-image')[0], oj);
                    $('#croppie-image-modal').trigger('click');
                }

                $('#crop-image-btn-accept').fadeIn();
            };

            reader.readAsDataURL(input.files[0]);
            $(input.files[0]).val(null);
        }
    }

    $('#crop-image-btn-accept').on('click', function () {
        var formData = new FormData();
        resize.result({
            type: 'canvas',
            size: 'original',
            format: 'jpeg',
            quality: 1,
            circle: false
        }).then(function (dataImg) {
            fetch(dataImg).then(function (res) {
                return res.blob();
            }).then(function (blob) {
                formData.append('image', blob);
                formData.append('type', 3);
                setTimeout(function () {
                    sendMessage(formData);
                }, 200);
            });
        });
    });

    $("#image-camera").change(function (event) {
        readURL(this);
    });

    $("#image").change(function () {
        readURL(this);
    });

    function sendMessage(formData) {
        sendingMessage = true;
        axios.post('/api/v1/rooms/' + roomId + '/messages', formData).then(function (response) {
            var currentDate = new Date();
            if (currentDate.getMinutes() < 10) {
                var minute = '0' + currentDate.getMinutes();
            } else {
                var minute = currentDate.getMinutes();
            }
            var time = currentDate.getHours() + ':' + minute;
            var avatar = response.data.data.user.avatars[0]['path'];

            isValidImage(avatar, function (isValid) {
                if (isValid) {
                    avatar = avatar;
                } else {
                    avatar = '/assets/web/images/gm1/ic_default_avatar@3x.png';
                }

                if (response.data.data.type == 2) {
                    var message = response.data.data.message;
                    var reg_exUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
                    message = message.replace(reg_exUrl, '<a href="$1" target="_blank">$1</a>');

                    $("#message-box").append('\n            <div class="messages msg-right msg-wrap">\n            <figure>\n              <a href=""><img src="' + avatar + '"  alt="" title="" class="alignnone size-full wp-image-515" /></a>\n            </figure>\n            <div class="msg-right-text">\n              <div class="text">\n                <div class="text-wrapper">\n                  <p>' + message.replace(/\n/g, "<br />") + '</p>\n                </div>\n              </div>\n              <div class="time"><p>' + time + '</p></div>\n            </div>\n          </div>\n          ');
                }

                if (response.data.data.type == 3) {
                    $("#message-box").append('\n            <div class="messages msg-right msg-wrap">\n            <figure>\n              <a href=""><img src="' + avatar + '"  alt="" title="" class="alignnone size-full wp-image-515" /></a>\n            </figure>\n            <div class="msg-right-text">\n              <div class="pic">\n                <p>\n                <img src="' + response.data.data.image + '"  alt="" title="" class="">\n                </p>\n              </div>\n              <div class="time"><p>' + time + '</p></div>\n            </div>\n          </div>\n          ');

                    $('.pic p img').promise().done(function () {
                        $('img').load(function () {
                            //android detection
                            if (/android/i.test(userAgent)) {
                                $(document).scrollTop($('#message-box')[0].scrollHeight);
                            }

                            // iOS detection
                            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                                setTimeout(function () {
                                    $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
                                });
                            }
                        });
                    });
                }

                if ($("#messages-today").length == 0) {
                    var today = moment().format('YYYY-MM-DD');
                    var lastMessage = $('.messages').last();
                    var todayElement = "<div class='msg-date " + today + "'  data-date='" + today + "' id='messages-today'><h3>今日</h3></div>";
                    lastMessage.before(todayElement);
                }
            });

            $('body').on('load', '.pic p img', function () {
                $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
            });

            //android detection
            if (/android/i.test(userAgent)) {
                $(document).scrollTop($('#message-box')[0].scrollHeight);
            }

            // iOS detection
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                setTimeout(function () {
                    $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
                });
            }

            $("#content").val(null);
            $("#content").css('height', '30px');
            $("#image-camera").val(null);
            $("#image").val(null);

            sendingMessage = false;
        }).catch(function (error) {
            if (error.response.data.message) {
                var messageError = error.response.data.message;
            }
            if (error.response.data.error) {
                var messageError = error.response.data.error.image[0];
            }
            $('.alert-image-oversize .content-in h2').text(messageError);
            $('#alert-image-oversize').trigger('click');

            setTimeout(function () {
                $('.wrap-alert-image-oversize').css('display', 'none');
            }, 2000);

            sendingMessage = false;
        });
    }

    if (device == 'ios') {
        $('#message-box').on('scroll', function (e) {
            var date = $('.msg-date').attr('data-date');
            if (loadingMore) {
                return false;
            }
            if (!$(".next-page").attr("data-url")) {
                return false;
            }

            if ($(this).scrollTop() == 0) {
                var nextpage = $(".next-page").attr("data-url");

                axios.get(nextpage, {
                    'params': {
                        response_type: 'html'
                    }
                }).then(function (response) {
                    var firstElement = $('.messages').eq(0);
                    $('#message-box').prepend(response.data);
                    var prevEle = $('#message-' + firstElement.attr('data-message-id')).prev();
                    while (!prevEle.attr('id') || prevEle.attr('id') == 'messages-today') {
                        prevEle = prevEle.prev();
                    }
                    window.location.hash = '#message-' + prevEle.attr('data-message-id');

                    // Delete the display date with the same
                    var numOfDate = $('.' + date + '').length;
                    if (numOfDate > 1) {
                        $('.' + date + '').each(function (index) {
                            if (index > 0) {
                                $(this).remove();
                            }
                        });
                    }

                    loadingMore = false;
                }).catch(function (error) {
                    loadingMore = false;
                    console.log(error);
                });

                loadingMore = true;
            }
        });
    } else {
        $(document).on('scroll', function (e) {
            var date = $('.msg-date').attr('data-date');
            if (loadingMore) {
                return false;
            }
            if (!$(".next-page").attr("data-url")) {
                return false;
            }

            if ($(this).scrollTop() == 0) {
                var nextpage = $(".next-page").attr("data-url");

                axios.get(nextpage, {
                    'params': {
                        response_type: 'html'
                    }
                }).then(function (response) {
                    var firstElement = $('.messages').eq(0);
                    $('#message-box').prepend(response.data);
                    var prevEle = $('#message-' + firstElement.attr('data-message-id')).prev();
                    while (!prevEle.attr('id') || prevEle.attr('id') == 'messages-today') {
                        prevEle = prevEle.prev();
                    }
                    window.location.hash = '#message-' + prevEle.attr('data-message-id');

                    // Delete the display date with the same
                    var numOfDate = $('.' + date + '').length;
                    if (numOfDate > 1) {
                        $('.' + date + '').each(function (index) {
                            if (index > 0) {
                                $(this).remove();
                            }
                        });
                    }

                    loadingMore = false;
                }).catch(function (error) {
                    loadingMore = false;
                    console.log(error);
                });

                loadingMore = true;
            }
        });
    }

    // cancel order

    $('.cancel-order').click(function (event) {
        var currentDate = new Date();
        if (currentDate.getMinutes() < 10) {
            var minute = '0' + currentDate.getMinutes();
        } else {
            var minute = currentDate.getMinutes();
        }
        var time = currentDate.getHours() + ':' + minute;

        axios.post('/api/v1/orders/' + orderId + '/cancel').then(function (response) {
            var message = response.data.message;

            $("#message-box").append('\n        <div class="msg-alert">\n          <h3><span>' + time + '</span><br>' + message + '</h3>\n        </div>\n      ');

            $(".msg-head").html('\n        <h2><span class="mitei msg-head-ttl">\u65E5\u7A0B\u672A\u5B9A</span>\u30AD\u30E3\u30B9\u30C8\u306B\u4E88\u7D04\u30EA\u30AF\u30A8\u30B9\u30C8\u3057\u3088\u3046\uFF01</h2>\n      ');
        }).catch(function (error) {
            console.log(error);
        });
    });

    $('.msg-detail-order-nominee').on('click', function () {
        if (flag) {
            $('.time-order-nonimee').css('display', 'none');
            $('.status-bar-nominee').css('display', 'inline');
            flag = false;
        } else {
            $('.time-order-nonimee').css('display', 'inline');
            $('.status-bar-nominee').css('display', 'none');
            flag = true;
        }
    });

    $('.skip-order-nominee').on('click', function () {
        var currentDate = new Date();
        if (currentDate.getMinutes() < 10) {
            var minute = '0' + currentDate.getMinutes();
        } else {
            var minute = currentDate.getMinutes();
        }
        var time = currentDate.getHours() + ':' + minute;
        axios.post('/api/v1/orders/' + orderId + '/skip').then(function (response) {
            var message = response.data.message;

            $(".msg-head").html('\n                <h2><span class="mitei msg-head-ttl">\u65E5\u7A0B\u672A\u5B9A</span>\u30AD\u30E3\u30B9\u30C8\u306B\u4E88\u7D04\u30EA\u30AF\u30A8\u30B9\u30C8\u3057\u3088\u3046\uFF01</h2>\n              ');
        }).catch(function (error) {
            console.log(error);
        });
    });
});

$('.msg-system').each(function (index, val) {
    var content = $(this).text();
    var missingPoint = $(this).data('missing-point');
    var offerId = $(this).data('offer');
    var castOrderId = $(this).data('cast-order-id');
    var text2 = 'コチラ';
    var n = content.search(text2);

    if (n >= 0) {
        var text1 = content.substring(0, n);
        var text3 = content.substring(n + text2.length, content.length);
        var orderId = $(this).data('id');
        if (missingPoint) {
            var result = text2.link('/payment/transfer?point=' + parseInt(missingPoint));
        } else if (offerId) {
            var result = text2.link('/offers/' + parseInt(offerId));
        } else if (castOrderId) {
            var result = text2.link('/cast_offers/' + parseInt(castOrderId));
        } else {
            var result = text2.link('/history/' + orderId);
        }

        var newText = text1 + result + text3;
        $(this).html(newText.replace(/\n/g, "<br />"));
    } else {
        $(this).html(content.replace(/\n/g, "<br />"));
    }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/confirm_order_call.js":
/***/ (function(module, exports, __webpack_require__) {

var coupons = [];
var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
var couponType = {
  'POINT': 1,
  'DURATION': 2,
  'PERCENT': 3
};

var OrderPaymentMethod = {
  'Credit_Card': 1,
  'Direct_Payment': 2
};

function showCoupons(coupon, params) {
  var html = '<section class="details-list">';
  html += '<div class="details-list__line"><p></p></div>';
  html += '<div class="details-list__header">';
  html += '<div class="details-header__title">クーポン</div> </div>';
  html += '<div class="details-list__content show"> <div class="details-list-box">';
  html += '<ul class="" id="show-name-coupon">' + coupon.name + '</ul>';
  html += '<div class="btn2-s"><a href="' + linkStepOne + '">変更</a></div>';
  html += '</div> </div> </section>';

  $('#show-coupons-order').html(html);

  var view = '<div class="details-total__content show_point-coupon">';
  view += '<div class="details-list__header">';
  view += '<div class="">通常料金</div> </div>';
  view += '<div class="details-total__marks" id="current-total-point"></div> </div>';
  view += '<div class="details-total__content show_point-coupon">';
  view += '<div class="details-list__header"> <div class="">割引額</div> </div>';
  view += '<div class="details-total__marks sale-point-coupon" id="sale_point-coupon" ></div> </div>';

  $('#show-point-coupon').html(view);

  if (couponType.DURATION == coupon.type) {
    params.duration_coupon = coupon.time;
  }

  window.axios.post('/api/v1/orders/price', params).then(function (response) {

    if (couponType.PERCENT == coupon.type) {
      var tempPoint = response.data['data'];
      var pointCoupon = parseInt(coupon.percent) / 100 * tempPoint;
    }

    if (couponType.POINT == coupon.type) {
      var tempPoint = response.data['data'];
      var pointCoupon = coupon.point;
    }

    if (couponType.DURATION == coupon.type) {
      var totalCouponPoint = response.data['data'];
      var tempPoint = totalCouponPoint.total_point;
      var pointCoupon = totalCouponPoint.order_point_coupon + totalCouponPoint.order_fee_coupon;
    }

    if (coupon.max_point) {
      if (coupon.max_point < pointCoupon) {
        pointCoupon = coupon.max_point;
      }
    }

    var currentPoint = tempPoint - pointCoupon;
    if (currentPoint < 0) {
      currentPoint = 0;
    }

    $('#temp_point_order_call').val(currentPoint);

    totalPoint = parseInt(currentPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });
    pointCoupon = parseInt(pointCoupon).toLocaleString(undefined, { minimumFractionDigits: 0 });
    tempPoint = parseInt(tempPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });

    $('#current-total-point').text(tempPoint + 'P');
    $('#sale_point-coupon').text('-' + pointCoupon + 'P');
    $('#total_point-order-call').text(totalPoint + 'P~');
  }).catch(function (error) {
    console.log(error);
    if (error.response.status == 401) {
      window.location = '/login';
    }
  });
}

function createOrderCall(orderCall) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var currentTime = arguments[2];

  $('.modal-confirm').css('display', 'none');
  $('#btn-confirm-orders').prop('disabled', true);

  document.getElementById('confirm-order-submit').click();

  if (orderCall.tags) {
    tags = orderCall.tags.toString();
  } else {
    tags = '';
  }

  if ('other_time' != currentTime) {
    var now = new Date();

    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var nd = new Date(utc + 3600000 * 9);
    var day = helper.add_minutes(nd, currentTime);

    var year = day.getFullYear();

    var date = day.getDate();
    if (date < 10) {
      date = '0' + date;
    }

    var month = day.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }

    var hour = day.getHours();
    if (hour < 10) {
      hour = '0' + hour;
    }

    var minute = day.getMinutes();
    if (minute < 10) {
      minute = '0' + minute;
    }

    currentDate = year + '-' + month + '-' + date;
    time = hour + ':' + minute;

    data['currentDate'] = currentDate;
    data['time'] = time;
  }

  var params = {
    prefecture_id: orderCall.prefecture_id,
    address: data['area'],
    class_id: orderCall.cast_class,
    duration: data['duration'],
    nominee_ids: data['castIds'],
    date: data['currentDate'],
    start_time: data['time'],
    type: data['type'],
    total_cast: orderCall.countIds,
    tags: tags,
    temp_point: $('#temp_point_order_call').val()
  };

  if (data['transfer']) {
    params.payment_method = data['transfer'];
  }

  if (orderCall.coupon) {
    var coupon = orderCall.coupon;
    params.coupon_id = coupon.id;
    params.coupon_name = coupon.name;
    params.coupon_type = coupon.type;

    if (coupon.max_point) {
      params.coupon_max_point = coupon.max_point;
    } else {
      params.coupon_max_point = null;
    }

    switch (coupon.type) {
      case couponType.POINT:
        params.coupon_value = coupon.point;
        break;

      case couponType.DURATION:
        params.coupon_value = coupon.time;
        break;

      case couponType.PERCENT:
        params.coupon_value = coupon.percent;
        break;

      default:
        window.location.href = '/mypage';
    }
  }

  window.axios.post('/api/v1/orders', params).then(function (response) {
    $('#orders').prop('checked', false);
    $('#order-done').prop('checked', true);
  }).catch(function (error) {
    $('.modal-confirm').css('display', 'inline-block');
    $('#btn-confirm-orders').prop('disabled', false);
    $('#order-call-popup').prop('checked', false);

    if (error.response.status == 401) {
      window.location = '/login';
    }

    switch (error.response.status) {
      case 404:
        $('#md-require-card').prop('checked', true);
        break;
      case 405:
        $('#invite-code-ended').prop('checked', true);
        break;
      case 406:
        $('.card-expired h2').text('');
        var content = '予約日までにクレジットカードの <br> 1有効期限が切れます  <br> <br> 予約を完了するには  <br> カード情報を更新してください';
        $('.card-expired p').html(content);
        $('.lable-register-card').text('クレジットカード情報を更新する');
        $('#md-require-card').prop('checked', true);
        break;

      default:
        break;
    }

    switch (error.response.status) {
      case 400:
        var title = '開始時間は現在時刻から30分以降の時間を選択してください';
        break;
      case 403:
        var title = 'アカウントが凍結されています';
        break;
      case 409:
        var title = 'クーポンが無効です';
        break;
      case 412:
        var title = '退会申請中のため、予約することはできません。';
        break;
      case 422:
        var title = 'この操作は実行できません';
        break;
      case 500:
        var title = 'サーバーエラーが発生しました';
        break;

      default:
        break;
    }

    if (title) {
      $('.show-message-order-call h2').html(title);
      $('#order-call-popup').prop('checked', true);
    }
  });
}

$(document).ready(function () {
  if ($('#btn-confirm-orders').length) {
    if (localStorage.getItem("order_call")) {
      var orderCall = JSON.parse(localStorage.getItem("order_call"));

      if (orderCall.select_area) {
        var area = orderCall.select_area;

        if ('その他' == area) {
          area = orderCall.text_area;
        }

        $('.word18').text(area);
      } else {
        window.location.href = '/mypage';
      }

      if (orderCall.countIds) {
        $('.cast-numbers-call').text(orderCall.class_name + ' ' + orderCall.countIds + '名');
      } else {
        window.location.href = '/mypage';
      }

      if (orderCall.current_time_set) {
        var currentTime = orderCall.current_time_set;

        if (orderCall.current_duration) {
          var duration = orderCall.current_duration;

          if ('other_duration' == duration) {
            duration = orderCall.select_duration;
          }

          $('.duration-call').text(duration + '時間');
        }

        if ('other_time' == currentTime) {
          var currentDate = orderCall.current_date;
          var time = orderCall.current_time;

          var day = currentDate.split('-');

          var year = day[0];
          var month = day[1];
          var date = day[2];

          $('.time-detail-call').text(year + '年' + month + '月' + date + '日' + ' ' + time);
        } else {
          var now = new Date();

          var utc = now.getTime() + now.getTimezoneOffset() * 60000;
          var nd = new Date(utc + 3600000 * 9);
          var day = helper.add_minutes(nd, currentTime);

          var year = day.getFullYear();

          var date = day.getDate();
          if (date < 10) {
            date = '0' + date;
          }

          var month = day.getMonth() + 1;
          if (month < 10) {
            month = '0' + month;
          }

          var hour = day.getHours();
          if (hour < 10) {
            hour = '0' + hour;
          }

          var minute = day.getMinutes();
          if (minute < 10) {
            minute = '0' + minute;
          }

          var currentDate = year + '-' + month + '-' + date;
          var time = hour + ':' + minute;

          $('.time-detail-call').text(currentTime + '分後');
        }

        // if (orderCall.arrIds) {
        //   var castIds = orderCall.arrIds;
        //   var countIds = castIds.length;
        //   castIds = castIds.toString();
        //   if (countIds) {
        //     if (countIds == orderCall.countIds) {
        //       var type = 1;
        //     } else {
        //       var type = 4;
        //     }
        //   } else {
        //     var type = 2;
        //   }
        // } else {
        //   var castIds = '';
        //   type = 2;
        // }

        var castIds = '';
        var type = 2;
        // var input = {
        //   nominee_ids : castIds,
        // };

        // window.axios.post('/api/v1/casts/list_casts',input)
        // .then(function(response) {
        //   var data = response.data['data'];
        //   $('.total-nominated-call').text(data.length)
        //   if (data.length) {

        //     data.forEach(function (val) {
        //       var avatars = val.avatars;
        //       if(avatars.length) {
        //         if (avatars[0].thumbnail) {
        //           $('.details-list-box__pic').append('<li> <img src= "' + avatars[0].thumbnail + '" class="img-detail-cast" /> </li>');
        //         } else {
        //           $('.details-list-box__pic').append('<li> <img src= "' + avatarsDefault + '" class="img-detail-cast" /> </li>');
        //         }
        //       } else {
        //         $('.details-list-box__pic').append('<li> <img src= "' + avatarsDefault + '" class="img-detail-cast" /> </li>');
        //       }
        //     })

        //     $('.img-detail-cast').error(function(){
        //       $(this).attr("src", avatarsDefault);
        //     });
        //   }

        // }).catch(function(error) {
        //   console.log(error);
        //   if (error.response.status == 401) {
        //     window.location = '/login';
        //   }
        // });

        var params = {
          date: currentDate,
          start_time: time,
          type: type,
          class_id: orderCall.cast_class,
          duration: duration,
          total_cast: orderCall.countIds,
          nominee_ids: castIds
        };

        if (orderCall.coupon) {
          var coupon = orderCall.coupon;
          showCoupons(coupon, params);
        } else {
          window.axios.post('/api/v1/orders/price', params).then(function (response) {
            var tempPoint = response.data['data'];

            $('#temp_point_order_call').val(tempPoint);

            tempPoint = parseInt(tempPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });
            $('#total_point-order-call').text(tempPoint + 'P~');
          }).catch(function (error) {
            console.log(error);
            if (error.response.status == 401) {
              window.location = '/login';
            }
          });
        }
      } else {
        window.location.href = '/mypage';
      }

      if (orderCall.tags) {
        var tags = orderCall.tags;
        tags.forEach(function (data) {
          $('.details-info-list').append('<li class="details-info-list_kibun">' + data + '</li>');
        });
      }

      if (orderCall.payment_method) {
        var inputPayment = $("input:radio[name='transfer_order']");
        $.each(inputPayment, function (index, val) {
          if (val.value == orderCall.payment_method) {
            $(this).prop('checked', true);
          }
        });

        if (OrderPaymentMethod.Direct_Payment == orderCall.payment_method) {
          $('#show-registered-card').css('display', 'none');
        }
      }

      $("input:radio[name='transfer_order']").on("change", function (event) {
        var transfer = $("input:radio[name='transfer_order']:checked").val();

        if (OrderPaymentMethod.Direct_Payment == transfer) {
          $('#show-registered-card').css('display', 'none');
        } else {
          $('#show-registered-card').css('display', 'block');

          var checkCard = $('.inactive-button-order').length;

          if (checkCard) {
            $('.cb-cancel').prop('checked', false);
            $('#sp-cancel').addClass("sp-disable");
            $('#btn-confirm-orders').addClass("disable");
            $('#btn-confirm-orders').prop('disabled', true);
          }
        }

        var params = {
          payment_method: transfer
        };

        helper.updateLocalStorageValue('order_call', params);
      });

      $(".cb-cancel").on("change", function (event) {
        var transfer = $("input:radio[name='transfer_order']:checked").val();

        if ($(this).is(':checked')) {
          var checkCard = $('.inactive-button-order').length;

          if (OrderPaymentMethod.Direct_Payment == transfer) {
            checkCard = false;
          }

          if (checkCard) {
            $(this).prop('checked', false);
            $('#sp-cancel').addClass("sp-disable");
            $('#btn-confirm-orders').prop('disabled', true);
          } else {
            $(this).prop('checked', true);
            $('#sp-cancel').removeClass('sp-disable');
            $('#btn-confirm-orders').removeClass('disable');
            $('#btn-confirm-orders').prop('disabled', false);
          }
        } else {
          $(this).prop('checked', false);
          $('#sp-cancel').addClass("sp-disable");
          $('#btn-confirm-orders').addClass("disable");
          $('#btn-confirm-orders').prop('disabled', true);
        }
      });

      $('.sb-form-orders').on('click', function () {
        var transfer = parseInt($("input[name='transfer_order']:checked").val());
        var data = [];

        data['area'] = area;
        data['duration'] = duration;
        data['castIds'] = castIds;
        data['currentDate'] = currentDate;
        data['time'] = time;
        data['type'] = type;

        if (transfer) {
          if (OrderPaymentMethod.Credit_Card == transfer || OrderPaymentMethod.Direct_Payment == transfer) {
            data['transfer'] = transfer;
            if (OrderPaymentMethod.Direct_Payment == transfer) {
              window.axios.get('/api/v1/auth/me').then(function (response) {
                var pointUser = response.data['data'].point;

                window.axios.get('/api/v1/guest/points_used').then(function (response) {
                  var pointUsed = response.data['data'];
                  var tempPointOrder = parseInt($('#temp_point_order_call').val()) + parseInt(pointUsed);

                  if (parseInt(tempPointOrder) > parseInt(pointUser)) {
                    $('#sp-cancel').addClass('sp-disable');
                    $('.cb-cancel').prop('checked', false);
                    $('#btn-confirm-orders').prop('disabled', true);
                    $('#btn-confirm-orders').addClass('disable');

                    if (parseInt(pointUsed) > parseInt(pointUser)) {
                      var point = parseInt($('#temp_point_order_call').val());
                    } else {
                      var point = parseInt(tempPointOrder) - parseInt(pointUser);
                    }

                    window.location.href = '/payment/transfer?point=' + point;

                    return;
                  } else {
                    createOrderCall(orderCall, data, currentTime);
                  }
                }).catch(function (error) {
                  console.log(error);
                  if (error.response.status == 401) {
                    window.location = '/login';
                  }
                });
              }).catch(function (error) {
                console.log(error);
                if (error.response.status == 401) {
                  window.location = '/login';
                }
              });
            } else {
              createOrderCall(orderCall, data, currentTime);
            }
          } else {
            window.location.href = '/mypage';
          }
        } else {
          createOrderCall(orderCall, data, currentTime);
        }
      });
    } else {
      window.location.href = '/mypage';
    }
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/create_room.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $('#create-room').on('click', function (e) {
    var _this = $(this);
    var params = {
      user_id: _this.attr('data-user-id')
    };

    window.axios.post('/api/v1/rooms', params).then(function (response) {
      id = response.data.data.id;
      window.location = '/message/' + id;
    }).catch(function (error) {
      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/helper.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["getFormData"] = getFormData;
/* harmony export (immutable) */ __webpack_exports__["getResponseMessage"] = getResponseMessage;
/* harmony export (immutable) */ __webpack_exports__["setCookie"] = setCookie;
/* harmony export (immutable) */ __webpack_exports__["getCookie"] = getCookie;
/* harmony export (immutable) */ __webpack_exports__["updateLocalStorageValue"] = updateLocalStorageValue;
/* harmony export (immutable) */ __webpack_exports__["updateLocalStorageKey"] = updateLocalStorageKey;
/* harmony export (immutable) */ __webpack_exports__["add_minutes"] = add_minutes;
/* harmony export (immutable) */ __webpack_exports__["deleteLocalStorageValue"] = deleteLocalStorageValue;
/* harmony export (immutable) */ __webpack_exports__["deleteLocalStorageKey"] = deleteLocalStorageKey;
/* harmony export (immutable) */ __webpack_exports__["loadShift"] = loadShift;
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function getFormData(domQuery) {
  var out = {};
  var data = $(domQuery).serializeArray();

  for (var i = 0; i < data.length; i++) {
    var record = data[i];
    out[record.name] = record.value;
  }
  return out;
}

function getResponseMessage(data) {
  var message = '';
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        message += data[key] + '</br>';
      }
    }
  } else {
    message = data;
  }

  return message;
}

function setCookie(cookie_name, value) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + 365 * 25);
  document.cookie = cookie_name + "=" + escape(value) + "; expires=" + exdate.toUTCString() + "; path=/";
}

function getCookie(cookie_name) {
  if (document.cookie.length > 0) {
    var cookie_start = document.cookie.indexOf(cookie_name + "=");
    if (cookie_start != -1) {
      cookie_start = cookie_start + cookie_name.length + 1;
      var cookie_end = document.cookie.indexOf(";", cookie_start);
      if (cookie_end == -1) {
        cookie_end = document.cookie.length;
      }
      return unescape(document.cookie.substring(cookie_start, cookie_end));
    }
  }

  return "";
}

function updateLocalStorageValue(key, data) {
  var oldData = JSON.parse(localStorage.getItem(key));
  var newData;

  if (oldData) {
    newData = Object.assign({}, oldData, data);
  } else {
    newData = data;
  }

  localStorage.setItem(key, JSON.stringify(newData));
}

function updateLocalStorageKey(key, data, ids) {
  var oldData = JSON.parse(localStorage.getItem(key));
  var newData = {};

  if (oldData) {
    if (oldData[ids]) {
      oldData[ids] = Object.assign({}, oldData[ids], data);
      newData = oldData;
    } else {
      oldData[ids] = data;
      newData = oldData;
    }
  } else {
    newData[ids] = data;
  }

  localStorage.setItem(key, JSON.stringify(newData));
}

function add_minutes(dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
}

function deleteLocalStorageValue(key, delKey) {
  var data = JSON.parse(localStorage.getItem(key));

  if (data) {
    if (data[delKey]) {
      delete data[delKey];
    }
  }

  localStorage.setItem(key, JSON.stringify(data));
}

function deleteLocalStorageKey(key, delKey, ids) {
  var data = JSON.parse(localStorage.getItem(key));

  if (data) {
    if (data[ids]) {
      if (data[ids][delKey]) {
        delete data[ids][delKey];
      }
    }
  }
  localStorage.setItem(key, JSON.stringify(data));
}

function loadShift() {
  var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if ($('select[name=sl_month_nomination]').length) {
    if (localStorage.getItem("shifts")) {
      var castId = $('.cast-id').val();
      var shift = JSON.parse(localStorage.getItem("shifts"));
      if (shift[castId]) {
        shift = shift[castId];

        var date = parseInt(shift.date);
        var month = parseInt(shift.month);
        var day = shift.dayOfWeekString;

        var htmlMonth = '<option value="' + month + '" >' + month + '\u6708</option>';
        var htmlDate = '<option value="' + date + '" >' + date + '\u65E5(' + day + ')</option>';

        $('select[name=sl_month_nomination]').html(htmlMonth);
        $('select[name=sl_date_nomination]').html(htmlDate);

        var currentDate = new Date();
        var utc = currentDate.getTime() + currentDate.getTimezoneOffset() * 60000;
        var nd = new Date(utc + 3600000 * 9);

        var currentDate = parseInt(nd.getDate());

        if (date != currentDate) {
          $('.input-time-number').prop('disabled', 'true');
          $('.input-time-number').parent().removeClass('active');
          $('.input-time-number').parent().addClass('inactive');

          if (localStorage.getItem("order_params")) {
            var orderParams = JSON.parse(localStorage.getItem("order_params"));

            if (!orderParams.current_minute) {
              $('select[name=sl_hour_nomination]>option:eq(21)').prop('selected', true);
              $('select[name=sl_minute_nomination]>option:eq(0)').prop('selected', true);

              $('#date_input').addClass('active');
              $('.input-other-time').prop('checked', 'true');
              $('.date-input-nomination').css('display', 'flex');

              if (!show) {
                $(".date-input").click();
              }

              var time = $('.input-other-time').val();

              var updateTime = {
                current_time_set: time
              };

              this.updateLocalStorageValue('order_params', updateTime);
            }
          } else {
            $('select[name=sl_hour_nomination]>option:eq(21)').prop('selected', true);
            $('select[name=sl_minute_nomination]>option:eq(0)').prop('selected', true);

            $('#date_input').addClass('active');
            $('.input-other-time').prop('checked', 'true');
            $('.date-input-nomination').css('display', 'flex');
            $(".date-input").click();
            var time = $('.input-other-time').val();

            var updateTime = {
              current_time_set: time
            };

            this.updateLocalStorageValue('order_params', updateTime);
          }
        }
      }
    }
  }
}

/***/ }),

/***/ "./resources/assets/js/web/pages/index.js":
/***/ (function(module, exports, __webpack_require__) {

$(document).ready(function () {
  var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
  $('#campaign').trigger('click');

  $('#close-campaign').on('click', function () {
    helper.setCookie('campaign', true);
  });

  $('.modal-close-campaign').on('click', function () {
    helper.setCookie('campaign', true);
  });

  if (helper.getCookie('campaign') == 'true') {
    $('#hide-campaign').hide();
  }

  $('.tc-verification-link').on('click', function () {
    if ($(this).attr('data-user-status') == 0) {
      window.location.href = '/mypage';
      return false;
    }
    if (window.App.payment_service == 'telecom_credit') {
      $('#telecom-credit-form').submit();
    } else {
      window.location.href = '/credit_card';
    }
  });

  //save prefecture in my page

  if ($('#prefecture-id-mypage').length) {
    var prefectureId = $('#prefecture-id-mypage').val();

    if (localStorage.getItem("prefecture_id")) {
      $('#prefecture-id-mypage').val(localStorage.getItem("prefecture_id"));
      prefectureId = localStorage.getItem("prefecture_id");

      // display cast working today in mypape
      var params = {
        prefecture_id: prefectureId,
        working_today: 1,
        response_type: 'html'
      };

      window.axios.get('/api/v1/casts', { params: params }).then(function (response) {
        $('.cast-body').html(response['data']);
      }).catch(function (error) {
        console.log(error);
      });
    }

    if (!localStorage.getItem("prefecture_id")) {
      localStorage.setItem('prefecture_id', prefectureId);
    }
  }

  $('#prefecture-id-mypage').on('change', function () {
    var prefectureId = $('#prefecture-id-mypage').val();

    localStorage.setItem('prefecture_id', prefectureId);

    // display cast working today in mypape
    var params = {
      prefecture_id: prefectureId,
      working_today: 1,
      response_type: 'html'
    };

    window.axios.get('/api/v1/casts', { params: params }).then(function (response) {
      $('.cast-body').html(response['data']);
    }).catch(function (error) {
      console.log(error);
    });
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/list_cast.js":
/***/ (function(module, exports) {

// $(document).ready(function(){
//   const helper = require('./helper');
//   if ($('#sb-select-casts').length) {
//     if(localStorage.getItem("order_call")){
//       var orderCall = JSON.parse(localStorage.getItem("order_call"));
//       var params = {
//         class_id : orderCall.cast_class,
//         latest : 1,
//         order : 1,
//       };

//       if(orderCall.arrIds) {
//         var arrIds = orderCall.arrIds;
//       } else {
//         var arrIds = [];
//       }

//       window.axios.get('/api/v1/casts', {params})
//       .then(function(response) {
//         var data = response.data;
//         var listCasts = (data.data.data);
//         var html = '';
//         listCasts.forEach(function (val) {
//           if(arrIds.indexOf(val.id.toString()) > -1) {
//             var checked = 'checked';
//             var text = 'リクエスト中';
//             var detail = 'cast-detail';
//           } else {
//             var checked = '';
//             var text = 'リクエストする';
//             var detail = '';
//           }

//           if(val.avatars.length) {
//             if (val.avatars[0].path) {
//               var show ='<img src= "' + val.avatars[0].thumbnail + '" class="img-cast" >';
//             } else {
//               var show ='<img src= "' + avatarsDefault + '" class="img-cast" >';
//             }
//           } else {
//             var show ='<img src= "' + avatarsDefault + '" class="img-cast" >';
//           }

//           html +='<div class="cast_block">';
//           html += '<input type="checkbox" name="casts[]" value="'+ val.id +'" id="'+ val.id +'" class="select-casts"'+ checked +'>';
//           html += '<div class="icon"> <p> <a href="' + link + val.id + '/call" class="cast-link '+ detail + '" >';
//           html += show + ' </a> </p> </div>';
//           html += '<span class="sp-name-cast text-ellipsis text-nickname">'+ val.nickname +'('+ val.age + ')</span>'
//           html += '<label for="'+ val.id +'" class="label-select-casts" >' + text + '</label> </div>';
//         })

//         var nextPage = '';
//         if (data.data.next_page_url) {
//           var nextPage = data.data.next_page_url;
//         }

//         html += '<input type="hidden" id="next_page" value="' + nextPage + '" />';
//         $('#list-cast-order').html(html);
//         $('.img-cast').error(function(){
//           $(this).attr("src", avatarsDefault);
//         });
//       })
//       .catch(function (error) {
//         console.log(error);
//         if (error.response.status == 401) {
//           window.location = '/login';
//         }
//       });

//       function checkedCasts() {
//         if(localStorage.getItem("order_call")){
//           var arrIds = JSON.parse(localStorage.getItem("order_call")).arrIds;
//           if(arrIds) {
//             if(arrIds.length) {
//               const inputCasts = $('.select-casts');
//               $.each(inputCasts,function(index,val){
//                 if(arrIds.indexOf(val.value) > -1) {
//                   $(this).prop('checked',true);
//                   $(this).parent().find('.cast-link').addClass('cast-detail');
//                   $('.label-select-casts[for='+  val.value  +']').text('リクエスト中');
//                 }
//               })

//               $(".cast-ids").val(arrIds.toString());
//               $('#sb-select-casts a').text('次に進む(3/4)');
//             }
//           }
//         }
//       }

//       /*Load more list cast order*/
//       var requesting = false;
//       var windowHeight = $(window).height();

//       function needToLoadmore() {
//         return requesting == false && $(window).scrollTop() >= $(document).height() - windowHeight - 500;
//       }

//       function handleOnLoadMore() {
//         // Improve load list image
//         $('.lazy').lazy({
//             placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7..."
//         });

//         if (needToLoadmore()) {
//           var url = $('#next_page').val();

//           if (url) {
//             requesting = true;
//             window.axios.get(loadMore, {
//               params: { next_page: url },
//             }).then(function (res) {
//               res = res.data;
//               $('#next_page').val(res.next_page || '');
//               $('#next_page').before(res.view);
//               checkedCasts();
//               requesting = false;
//             }).catch(function () {
//               requesting = false;
//             });
//           }
//         }
//       }
//       setTimeout(() => {

//         $(document).on('scroll', handleOnLoadMore);
//         $(document).ready(handleOnLoadMore);
//         checkedCasts();
//       }, 500);
//       /*!----*/


//       if (localStorage.getItem("order_call")) {
//         var countIds = JSON.parse(localStorage.getItem("order_call")).countIds;
//         if (localStorage.getItem("full")) {
//             var text = ' 指名できるキャストは'+ countIds + '名です';
//             $('#content-message h2').text(text);
//             $('#max-cast').prop('checked',true);
//             localStorage.removeItem("full");
//         }
//       }
//     } else {
//       window.location.href = '/mypage';
//     }
//   }
// });

/***/ }),

/***/ "./resources/assets/js/web/pages/list_order.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $('.lb-cancel').on('click', function (e) {
    var id = $(this).data('id');
    $('.cf-cancel-order').on('click', function (e) {
      window.axios.post('/api/v1/orders/' + id + '/cancel').then(function (response) {
        $(".lb-modal-cancel").click();
      });
    });
  });

  $('.md-cancel-order').on('click', function (e) {
    window.location.reload();
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/login.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  // console.log('Hello from login console');
});

/***/ }),

/***/ "./resources/assets/js/web/pages/menu.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $('.logout-web').click(function (event) {
    var MenuAPI = $("#menu").data('mmenu');

    MenuAPI.close();

    setTimeout(function () {
      $('#confirm-logout').trigger('click');
    }, 500);
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/order_call.js":
/***/ (function(module, exports, __webpack_require__) {

$(document).ready(function () {
  var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
  if ($("#ge2-1-x input:radio[name='cast_class']:checked").length) {
    $("#ge2-1-x input:radio[name='cast_class']:checked").parent().addClass("active");
    var castClass = $("#ge2-1-x input:radio[name='cast_class']:checked").val();
    if (castClass == 3) {
      $('.notify-campaign-over-cast-class span').text('※”ダイヤモンド”はキャンペーン対象外です');
      $('.notify-campaign-over-cast-class').css('display', 'block');
    }

    if (castClass == 2) {
      $('.notify-campaign-over-cast-class span').text('※”プラチナ”はキャンペーン対象外です');
      $('.notify-campaign-over-cast-class').css('display', 'block');
    }

    if (castClass == 1) {
      $('.notify-campaign-over-cast-class').css('display', 'none');
    }
  }

  $('#btn-confirm-orders').on('click', function () {
    $('#orders').prop('checked', true);
  });

  $('.order-done').on('click', function () {
    window.location.href = '/mypage';
  });

  $('.lable-register-card').on('click', function () {
    if (window.App.payment_service == 'telecom_credit') {
      $('#telecom-credit-form').submit();
    } else {
      window.location.href = '/credit_card';
    }
  });

  if ($('.select-prefecture').length) {
    if (!localStorage.getItem("order_call")) {

      if (localStorage.getItem("prefecture_id")) {
        var prefectureId = localStorage.getItem("prefecture_id");

        var params = {
          prefecture_id: prefectureId
        };

        helper.updateLocalStorageValue('order_call', params);
      }
    }
  }

  if (localStorage.getItem("order_call")) {
    var orderCall = JSON.parse(localStorage.getItem("order_call"));
    //var arrIds = JSON.parse(localStorage.getItem("order_call")).arrIds;

    if ($('.tags-name').length) {
      if (orderCall.tags) {
        var tags = orderCall.tags;
        var inputTags = $("#ge2-1-x .form-grpup .tags-name");

        $.each(inputTags, function (index, val) {
          if (tags.indexOf(val.value) > -1) {
            $(this).prop('checked', true);
            $(this).parent().addClass('active');
          }
        });
      }

      if (orderCall.cast_class) {
        $('.cast-class-id').val(orderCall.cast_class);
      }
    }

    if ($("#step1-create-call").length) {

      //cast-number
      if (orderCall.countIds) {
        $('#cast-number-call').val(orderCall.countIds);
      } else {
        $('#cast-number-call').val(1);
      }

      if (orderCall.cast_class) {
        var _castClass = $('.grade-radio');
        $.each(_castClass, function (index, val) {
          if (val.value == orderCall.cast_class) {
            $(this).prop('checked', true);
          }
        });
      }

      //duration     
      if (orderCall.current_duration) {
        var inputDuration = $("input[name=time_set]");
        $.each(inputDuration, function (index, val) {
          if (val.value == orderCall.current_duration) {
            $(this).prop('checked', true);
            $(this).parent().addClass('active');
          }
        });

        if ('other_duration' == orderCall.current_duration) {
          $('.time-input').css('display', 'flex');
        }

        if (orderCall.select_duration) {
          var selectDuration = $('select[name=sl_duration] option');
          $.each(selectDuration, function (index, val) {
            if (val.value == orderCall.select_duration) {
              $(this).prop('selected', true);
            }
          });
        }
      }

      //current_time_set
      if (orderCall.current_time_set) {
        $(".time-join-call").parent().removeClass('active');

        if ('other_time' == orderCall.current_time_set) {
          $('.date-input-call').css('display', 'flex');

          if (orderCall.current_date) {
            var day = orderCall.current_date;
            day = day.split('-');

            var time = orderCall.current_time;
            $('.time-call').text(time);
            time = time.split(':');

            var month = day[1];
            var date = day[2];
            var hour = time[0];
            var minute = time[1];
            $('.month-call').text(month + '月');
            $('.date-call').text(date + '日');

            month = parseInt(month);

            window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
              var html = '';
              Object.keys(response.data).forEach(function (key) {
                if (key != 'debug') {
                  html += '<option value="' + key + '">' + response.data[key] + '</option>';
                }
              });
              $('.select-date').html(html);

              var inputDate = $('select[name=sl_date] option');

              $.each(inputDate, function (index, val) {
                if (val.value == parseInt(date)) {
                  $(this).prop('selected', true);
                }
              });
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });

            var inputMonth = $('select[name=sl_month] option');
            $.each(inputMonth, function (index, val) {
              if (val.value == month) {
                $(this).prop('selected', true);
              }
            });
          }

          var inputHour = $('select[name=sl_hour] option');
          $.each(inputHour, function (index, val) {
            if (val.value == parseInt(hour)) {
              $(this).prop('selected', true);
            }
          });

          var inputMinute = $('select[name=sl_minute] option');
          $.each(inputMinute, function (index, val) {
            if (val.value == parseInt(minute)) {
              $(this).prop('selected', true);
            }
          });
        }

        var inputTimeSet = $(".time-join-call");
        $.each(inputTimeSet, function (index, val) {
          if (val.value == orderCall.current_time_set) {
            $(this).prop('checked', true);
            $(this).parent().addClass('active');
          }
        });
      }

      if (orderCall.prefecture_id) {
        $('.select-prefecture').val(orderCall.prefecture_id);
        var params = {
          prefecture_id: orderCall.prefecture_id
        };
        window.axios.get('/api/v1/municipalities', { params: params }).then(function (response) {
          var data = response.data;

          var municipalities = data.data;
          html = '';
          municipalities.forEach(function (val) {
            name = val.name;
            html += '<label class="button button--green area">';
            html += '<input type="radio" name="area" value="' + name + '">' + name + '</label>';
          });

          html += '<label id="area_input" class="button button--green area">';
          html += '<input type="radio" name="area" value="その他">その他 </label>';
          html += '<label class="area-input area-call"> <span>希望エリア</span>';
          html += '<input type="text" placeholder="入力してください" name="other_area" value=""> </label>';

          $('#list-municipalities').html(html);

          //area
          if (orderCall.select_area) {
            var inputArea = $("#ge2-1-x input:radio[name='area']");
            if ('その他' == orderCall.select_area) {
              $('.area-call').css('display', 'flex');
              $("input:text[name='other_area']").val(orderCall.text_area);
            }

            $.each(inputArea, function (index, val) {
              if (val.value == orderCall.select_area) {
                $(this).prop('checked', true);
                $(this).parent().addClass('active');
              }
            });
          }
        }).catch(function (error) {
          console.log(error);
          if (error.response.status == 401) {
            window.location = '/login';
          }
        });
      }

      var time = $("input:radio[name='time_join']:checked").val();
      var castClass = $("input:radio[name='cast_class']:checked").val();
      var duration = $("input:radio[name='time_set']:checked").val();

      if ((orderCall.select_area && orderCall.select_area != 'その他' || orderCall.select_area == 'その他' && orderCall.text_area) && time && castClass && duration) {
        $("#step1-create-call").removeClass('disable');
        $("#step1-create-call").prop('disabled', false);
      }

      // if(arrIds) {
      //   helper.deleteLocalStorageValue('order_call','arrIds');
      // }

      if (orderCall.tags) {
        helper.deleteLocalStorageValue('order_call', 'tags');
      }

      if (orderCall.coupon) {
        helper.deleteLocalStorageValue('order_call', 'coupon');
      }
    }
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/order_nomination.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
var couponNominee = [];
var couponType = {
  'POINT': 1,
  'DURATION': 2,
  'PERCENT': 3
};

var OrderPaymentMethod = {
  'Credit_Card': 1,
  'Direct_Payment': 2
};

function loadCouponsOrderNominate() {
  var couponId = null;

  if (localStorage.getItem("order_params")) {
    var orderNominate = JSON.parse(localStorage.getItem("order_params"));
    if (orderNominate.current_duration) {
      var duration = orderNominate.current_duration;

      if ('other_time_set' == duration) {
        duration = 4;

        if (orderNominate.select_duration) {
          duration = orderNominate.select_duration;
        }
      }
    } else {
      var duration = $("input:radio[name='time_set_nomination']:checked").val();

      if (duration) {
        if ('other_time_set' == duration) {
          duration = $('.select-duration option:selected').val();
        }
      } else {
        duration = null;
      }
    }

    if (orderNominate.coupon) {
      couponId = orderNominate.coupon;
    }
  } else {
    var duration = $("input:radio[name='time_set_nomination']:checked").val();

    if (duration) {
      if ('other_time_set' == duration) {
        duration = $('.select-duration option:selected').val();
      }
    } else {
      duration = null;
    }
  }

  var paramCoupon = {
    duration: duration
  };

  window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
    couponNominee = response.data['data'];
    if (couponNominee.length) {
      var html = '<div class="reservation-item">\n                    <div class="caption">\n                      <h2>\u30AF\u30FC\u30DD\u30F3</h2>\n                    </div>\n                    <div class="form-grpup" >\n                      <select id="coupon-order-nominate" class="select-coupon" name=\'select_coupon\'>\n                      <option value="" >\u30AF\u30FC\u30DD\u30F3\u3092\u4F7F\u7528\u3057\u306A\u3044</option> ';

      var selectedCoupon = null;
      couponNominee.forEach(function (coupon) {
        var selected = '';
        var id = coupon.id;
        var name = coupon.name;

        if (couponId == id) {
          selectedCoupon = coupon;
          var time = $("input:radio[name='time_join_nomination']:checked").val();
          priceCoupon(duration, time, helper, couponId);
          selected = 'selected';

          switch (coupon.type) {
            case couponType.POINT:
              $('#value-coupon').val(coupon.point);
              break;

            case couponType.DURATION:
              $('#value-coupon').val(coupon.time);
              break;

            case couponType.PERCENT:
              $('#value-coupon').val(coupon.percent);
              break;

            default:
              window.location.href = '/mypage';
          }

          $('#type-coupon').val(coupon.type);

          $('#name-coupon').val(coupon.name);

          if (coupon.max_point) {
            $('#max_point-coupon').val(coupon.max_point);
          } else {
            $('#max_point-coupon').val('');
          }
        } else {
          selected = '';
        }

        html += '<option value="' + id + '"' + selected + ' >' + name + '</option>';
      });

      html += '</select>';
      html += '<div id=\'show_point-sale-coupon\' > ';

      if (selectedCoupon) {
        if (selectedCoupon.max_point) {
          var max_point = parseInt(selectedCoupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
          html += '<p class = "max-point-coupon" > \u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + max_point + 'P\u306B\u306A\u308A\u307E\u3059\u3002</p> </div>';
        }
      }

      html += '</div> </div>';
      $('#show-coupon-order-nominate').html(html);
    }
  }).catch(function (error) {
    console.log(error);
    if (error.response.status == 401) {
      window.location = '/login';
    }
  });
}

function priceCoupon(duration) {
  var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var helper = arguments[2];
  var couponId = arguments[3];

  if (duration) {
    if ('other_time_set' == duration) {
      duration = $('.select-duration option:selected').val();
    }

    var couponId = parseInt(couponId);

    var castId = $('.cast-id').val();

    var params = {
      type: 3,
      duration: duration,
      total_cast: 1,
      nominee_ids: castId
    };

    if (time) {
      var currentDate = new Date();
      utc = currentDate.getTime() + currentDate.getTimezoneOffset() * 60000;
      nd = new Date(utc + 3600000 * 9);

      var year = nd.getFullYear();

      if (time == 'other_time') {
        var month = $('.select-month').val();
        var checkMonth = nd.getMonth();

        if (month <= checkMonth) {
          var year = nd.getFullYear() + 1;
        }

        if (month < 10) {
          month = '0' + month;
        }

        var day = $('.select-date').val();

        if (day < 10) {
          day = '0' + day;
        }

        var hour = $('.select-hour').val();

        if (hour < 10) {
          hour = '0' + hour;
        }

        var minute = $('.select-minute').val();
        if (minute < 10) {
          minute = '0' + minute;
        }

        var date = year + '-' + month + '-' + day;
        var time = hour + ':' + minute;
      } else {
        var selectDate = helper.add_minutes(nd, time);

        if (helper.add_minutes(nd, 30) > selectDate) {
          selectDate = helper.add_minutes(nd, 30);
        }

        var day = selectDate.getDate();
        if (day < 10) {
          day = '0' + day;
        }

        var month = selectDate.getMonth() + 1;
        if (month < 10) {
          month = '0' + month;
        }
        var hour = selectDate.getHours();
        if (hour < 10) {
          hour = '0' + hour;
        }

        var minute = selectDate.getMinutes();
        if (minute < 10) {
          minute = '0' + minute;
        }
        var date = year + '-' + month + '-' + day;
        var time = hour + ':' + minute;
      }

      params.date = date;
      params.start_time = time;

      if (couponId) {
        if (!couponNominee) {
          window.location = '/mypage';
        }

        var couponIds = couponNominee.map(function (e) {
          return e.id;
        });

        var coupon = {};
        if (couponIds.indexOf(couponId) > -1) {
          couponNominee.forEach(function (e) {
            if (e.id == couponId) {
              coupon = e;
            }
          });
        } else {
          window.location = '/mypage';
        }

        if (coupon.max_point) {
          if ($('#show_point-sale-coupon').length) {
            var max_point = parseInt(coupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
            var html = '<p class = "max-point-coupon" > \u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + max_point + 'P\u306B\u306A\u308A\u307E\u3059\u3002</p> ';
            $('#show_point-sale-coupon').html(html);
          }
        } else {
          $('#show_point-sale-coupon').html('');
        }

        if (couponType.POINT == coupon.type) {
          params.duration_coupon = 0;
        }

        if (couponType.DURATION == coupon.type) {
          params.duration_coupon = coupon.time;
        }

        if (couponType.PERCENT == coupon.type) {
          params.duration_coupon = 0;
        }

        window.axios.post('/api/v1/orders/price', params).then(function (response) {
          if (couponType.PERCENT == coupon.type) {
            var tempPoint = response.data['data'];
            var pointCoupon = parseInt(coupon.percent) / 100 * tempPoint;
          }

          if (couponType.POINT == coupon.type) {
            var tempPoint = response.data['data'];
            var pointCoupon = coupon.point;
          }

          if (couponType.DURATION == coupon.type) {
            var totalCouponPoint = response.data['data'];
            var tempPoint = totalCouponPoint.total_point;
            var pointCoupon = totalCouponPoint.order_point_coupon + totalCouponPoint.order_fee_coupon;
          }

          if (coupon.max_point) {
            if (coupon.max_point < pointCoupon) {
              pointCoupon = coupon.max_point;
            }
          }

          var currentPoint = tempPoint - pointCoupon;
          if (currentPoint < 0) {
            currentPoint = 0;
          }

          $('#current-temp-point').val(currentPoint);

          var params = {
            current_total_point: tempPoint
          };

          helper.updateLocalStorageValue('order_params', params);

          totalPoint = parseInt(currentPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });
          pointCoupon = parseInt(pointCoupon).toLocaleString(undefined, { minimumFractionDigits: 0 });
          tempPoint = parseInt(tempPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });

          var html = '<div class="details-total__content show_point-coupon">\n                            <div class="reservation-total__sum content-coupon">\u901A\u5E38\u6599\u91D1\n                            <span class="details-total__marks" id="tempoint_order-nominate"></span></div>\n                        </div>\n                        <div class="details-total__content show_point-coupon">\n                          <div class="reservation-total__sum content-coupon">\u5272\u5F15\u984D\n                          <span class="details-total__marks sale-point-coupon" id = \'sale_point\'></span></div>\n                        </div>\n            ';

          $('#detail_point-coupon').html(html);
          $('#tempoint_order-nominate').text(tempPoint + 'P');
          $('#sale_point').text('-' + pointCoupon + 'P');
          $('.total-point').text(totalPoint + 'P~');
        }).catch(function (error) {
          console.log(error);
          if (error.response.status == 401) {
            window.location = '/login';
          }
        });
      } else {

        var paramCoupon = {
          duration: parseInt(duration)
        };

        window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
          couponNominee = response.data['data'];
          if (couponNominee.length) {
            var html = '<div class="reservation-item">\n                          <div class="caption">\n                            <h2>\u30AF\u30FC\u30DD\u30F3</h2>\n                          </div>\n                          <div class="form-grpup" >\n                            <select id="coupon-order-nominate" class="select-coupon" name=\'select_coupon\'>\n                            <option value="" >\u30AF\u30FC\u30DD\u30F3\u3092\u4F7F\u7528\u3057\u306A\u3044</option> ';
            couponNominee.forEach(function (coupon) {
              var id = coupon.id;
              var name = coupon.name;
              html += '<option value="' + id + '">' + name + '</option>';
            });

            html += '</select>';
            html += '<div id=\'show_point-sale-coupon\' > </div>';

            html += '</div> </div>';
            $('#show-coupon-order-nominate').html(html);
          } else {
            $('#show-coupon-order-nominate').html('');
          }
        }).catch(function (error) {
          console.log(error);
          if (error.response.status == 401) {
            window.location = '/login';
          }
        });

        $('#detail_point-coupon').html('');
        $('#show_point-sale-coupon').html('');

        window.axios.post('/api/v1/orders/price', params).then(function (response) {
          totalPoint = response.data['data'];
          $('#current-temp-point').val(totalPoint);

          var params = {
            current_total_point: totalPoint
          };

          helper.updateLocalStorageValue('order_params', params);

          totalPoint = parseInt(totalPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });
          $('.total-point').text(totalPoint + 'P~');
        }).catch(function (error) {
          console.log(error);
          if (error.response.status == 401) {
            window.location = '/login';
          }
        });
      }
    } else {
      var cost = $('.cost-order').val();
      var totalPoint = cost * (duration * 6) / 3;

      cost = parseInt(cost).toLocaleString(undefined, { minimumFractionDigits: 0 });

      $('.reservation-total__text').text('内訳：' + cost + '(キャストP/30分)✖' + duration + '時間');
      $('#current-temp-point').val(totalPoint);

      var params = {
        current_total_point: totalPoint
      };

      helper.updateLocalStorageValue('order_params', params);

      totalPoint = parseInt(totalPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });

      $('.total-point').text(totalPoint + 'P~');
    }
  }
}

function selectedCouponsNominate(helper) {
  $('body').on('change', "#coupon-order-nominate", function () {
    var couponId = $(this).val();
    var duration = $("input:radio[name='time_set_nomination']:checked").val();
    var time = $("input:radio[name='time_join_nomination']:checked").val();

    if (!couponNominee) {
      window.location = '/mypage';
    }

    var couponIds = couponNominee.map(function (e) {
      return e.id;
    });

    if (parseInt(couponId)) {
      var coupon = {};
      if (couponIds.indexOf(parseInt(couponId)) > -1) {
        couponNominee.forEach(function (e) {
          if (e.id == couponId) {
            coupon = e;
          }
        });
        var paramCoupon = {
          coupon: parseInt(couponId)
        };

        helper.updateLocalStorageValue('order_params', paramCoupon);

        switch (coupon.type) {
          case couponType.POINT:
            $('#value-coupon').val(coupon.point);
            break;

          case couponType.DURATION:
            $('#value-coupon').val(coupon.time);
            break;

          case couponType.PERCENT:
            $('#value-coupon').val(coupon.percent);
            break;

          default:
            window.location.href = '/mypage';
        }

        $('#type-coupon').val(coupon.type);
        $('#name-coupon').val(coupon.name);

        if (coupon.max_point) {
          $('#max_point-coupon').val(coupon.max_point);
        } else {
          $('#max_point-coupon').val('');
        }
      } else {
        window.location = '/mypage';
      }
    } else {
      if (localStorage.getItem("order_params")) {
        var orderParams = JSON.parse(localStorage.getItem("order_params"));
        if (orderParams.coupon) {
          helper.deleteLocalStorageValue('order_params', 'coupon');
        }
      }
    }

    priceCoupon(duration, time, helper, couponId);
  });
}

function handlerSelectedTransfer() {
  var transfer = $("input:radio[name='transfer_order_nominate']");
  transfer.on("change", function () {
    var transfer = $("input:radio[name='transfer_order_nominate']:checked").val();

    var param = {
      payment_method: transfer
    };

    helper.updateLocalStorageValue('order_params', param);

    if (OrderPaymentMethod.Direct_Payment == parseInt(transfer)) {
      $('#show-card-registered').css('display', 'none');
    }

    if (OrderPaymentMethod.Credit_Card == parseInt(transfer)) {
      $('#show-card-registered').css('display', 'block');

      if ($('.inactive-button-order').length) {
        $('#confirm-orders-nomination').addClass("disable");
        $('.checked-order').prop('checked', false);
        $('#confirm-orders-nomination').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      }
    }
  });
}

function createOrderNominate() {
  $('.modal-confirm-nominate').css('display', 'none');
  $('#confirm-orders-nomination').prop('disabled', 'disabled');
  document.getElementById('confirm-order-nomination-submit').click();
  $('#create-nomination-form').submit();
}

$(document).ready(function () {
  $('body').on('change', ".checked-order", function (event) {
    if ($(this).is(':checked')) {
      var time = $("input:radio[name='time_join_nomination']:checked").val();
      var area = $("input:radio[name='nomination_area']:checked").val();
      var duration = $("input:radio[name='time_set_nomination']:checked").val();
      var date = $('.sp-date').text();
      var cancel = $("input:checkbox[name='confrim_order_nomination']:checked").length;
      var otherArea = $("input:text[name='other_area_nomination']").val();

      var checkCard = $('.inactive-button-order').length;
      var transfer = $("input:radio[name='transfer_order_nominate']:checked").val();

      if (OrderPaymentMethod.Direct_Payment == transfer) {
        checkCard = false;
      }

      if (!area || area == 'その他' && !otherArea || !time || !duration || duration < 1 && 'other_time_set' != duration || time == 'other_time' && !date || checkCard) {

        $('#confirm-orders-nomination').addClass("disable");
        $(this).prop('checked', false);
        $('#confirm-orders-nomination').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      } else {
        $(this).prop('checked', true);
        $('#sp-cancel').removeClass('sp-disable');
        $('#confirm-orders-nomination').removeClass('disable');
        $('#confirm-orders-nomination').prop('disabled', false);
      }
    } else {
      $(this).prop('checked', false);
      $('#confirm-orders-nomination').addClass("disable");
      $('#confirm-orders-nomination').prop('disabled', true);
      $('#sp-cancel').addClass("sp-disable");
    }
  });

  //textArea
  $('body').on('input', "input:text[name='other_area_nomination']", function (e) {
    var params = {
      text_area: $(this).val()
    };

    helper.updateLocalStorageValue('order_params', params);

    var area = $("input:radio[name='nomination_area']:checked").val();

    if (!area || !$(this).val()) {
      $('#confirm-orders-nomination').addClass("disable");
      $('.checked-order').prop('checked', false);
      $('#confirm-orders-nomination').prop('disabled', true);
      $('#sp-cancel').addClass("sp-disable");
    }
  });

  //area
  $('body').on('change', "input:radio[name='nomination_area']", function () {
    var areaNomination = $("input:radio[name='nomination_area']:checked").val();

    if ('その他' == areaNomination) {
      if (localStorage.getItem("order_params")) {
        var orderParams = JSON.parse(localStorage.getItem("order_params"));

        if (orderParams.text_area) {
          $("input:text[name='other_area_nomination']").val(orderParams.text_area);
        }
      }

      if (!$("input:text[name='other_area_nomination']").val()) {
        $('#confirm-orders-nomination').addClass("disable");
        $('.checked-order').prop('checked', false);
        $('#confirm-orders-nomination').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      }
    }

    var params = {
      select_area: areaNomination
    };

    helper.updateLocalStorageValue('order_params', params);
  });

  //duration
  $('body').on('change', ".input-duration", function () {
    if (localStorage.getItem("order_params")) {
      var orderParams = JSON.parse(localStorage.getItem("order_params"));
      if (orderParams.coupon) {
        helper.deleteLocalStorageValue('order_params', 'coupon');
      }
    }

    var time = $("input:radio[name='time_join_nomination']:checked").val();
    var duration = $("input:radio[name='time_set_nomination']:checked").val();

    var params = {
      current_duration: duration
    };

    helper.updateLocalStorageValue('order_params', params);

    if ('other_time_set' == duration) {
      duration = $('.select-duration option:selected').val();
    }

    var cost = $('.cost-order').val();
    var totalPoint = cost * (duration * 6) / 3;

    cost = parseInt(cost).toLocaleString(undefined, { minimumFractionDigits: 0 });

    $('.reservation-total__text').text('内訳：' + cost + '(キャストP/30分)✖' + duration + '時間');

    priceCoupon(duration, time, helper, null);
  });

  $('body').on('change', ".select-duration", function () {
    if (localStorage.getItem("order_params")) {
      var orderParams = JSON.parse(localStorage.getItem("order_params"));

      if (orderParams.coupon) {
        helper.deleteLocalStorageValue('order_params', 'coupon');
      }
    }

    var time = $("input:radio[name='time_join_nomination']:checked").val();
    var duration = $('.select-duration option:selected').val();

    var params = {
      select_duration: duration
    };

    helper.updateLocalStorageValue('order_params', params);

    var cost = $('.cost-order').val();
    var totalPoint = cost * (duration * 6) / 3;

    cost = parseInt(cost).toLocaleString(undefined, { minimumFractionDigits: 0 });

    $('.reservation-total__text').text('内訳：' + cost + '(キャストP/30分)✖' + duration + '時間');

    priceCoupon(duration, time, helper, null);
  });

  //timejoin
  $('body').on('change', ".input-time-join", function () {
    var time = $("input:radio[name='time_join_nomination']:checked").val();
    var duration = $("input:radio[name='time_set_nomination']:checked").val();

    var updateTime = {
      current_time_set: time
    };

    helper.updateLocalStorageValue('order_params', updateTime);

    if ('other_time' == time) {
      if (localStorage.getItem("order_params")) {
        var orderParams = JSON.parse(localStorage.getItem("order_params"));

        if ('other_time' == orderParams.current_time_set) {
          if (orderParams.current_month) {
            var inputMonth = $('select[name=sl_month_nomination] option');
            $.each(inputMonth, function (index, val) {
              if (val.value == orderParams.current_month) {
                $(this).prop('selected', true);
              }
            });

            $('.month-nomination').text(orderParams.current_month + '月');
          }

          if (orderParams.current_date) {
            var inputDate = $('select[name=sl_date_nomination] option');
            $.each(inputDate, function (index, val) {
              if (val.value == orderParams.current_date) {
                $(this).prop('selected', true);
              }
            });
            $('.date-nomination').text(orderParams.current_date + '日');
          }

          if (orderParams.current_hour) {
            var inputHour = $('select[name=sl_hour_nomination] option');
            $.each(inputHour, function (index, val) {
              if (val.value == orderParams.current_hour) {
                $(this).prop('selected', true);
              }
            });

            var inputMinute = $('select[name=sl_minute_nomination] option');
            $.each(inputMinute, function (index, val) {
              if (val.value == orderParams.current_minute) {
                $(this).prop('selected', true);
              }
            });

            var currentTime = orderParams.current_hour + ":" + orderParams.current_minute;
          }

          $('.time-nomination').text(currentTime);
        }
      }
    }

    if ($("input:radio[name='time_set_nomination']:checked").length) {
      if ('other_time_set' == duration) {
        duration = $('.select-duration option:selected').val();
      }

      var couponID = null;
      if ($('#coupon-order-nominate').length) {
        couponID = $('#coupon-order-nominate').val();
      }

      priceCoupon(duration, time, helper, couponID);
    }
  });

  //select-time order 1-1
  $('body').on('click', ".choose-time", function () {
    if ($("input:radio[name='time_set_nomination']:checked").length) {
      var time = $("input:radio[name='time_join_nomination']:checked").val();
      var duration = $("input:radio[name='time_set_nomination']:checked").val();

      if ('other_time_set' == duration) {
        duration = $('.select-duration option:selected').val();
      }

      var couponID = null;
      if ($('#coupon-order-nominate').length) {
        couponID = $('#coupon-order-nominate').val();
      }

      priceCoupon(duration, time, helper, couponID);
    }
  });

  $('#confirm-orders-nomination').on('click', function () {
    $('.modal-confirm-nominate').css('display', 'inline-block');
    $('#orders-nominate').prop('checked', true);
  });

  $('.cf-orders-nominate').on('click', function () {
    var transfer = $("input:radio[name='transfer_order_nominate']:checked").val();
    var checkCard = true;
    if (OrderPaymentMethod.Direct_Payment == transfer) {
      checkCard = false;
    }

    if (checkCard) {
      if ($('#md-require-card').length) {
        $('#md-require-card').click();
      } else {
        createOrderNominate();
      }
    } else {
      window.axios.get('/api/v1/auth/me').then(function (response) {
        var pointUser = response.data['data'].point;

        window.axios.get('/api/v1/guest/points_used').then(function (response) {
          var pointUsed = response.data['data'];
          var tempPointOrder = parseInt($('#current-temp-point').val()) + parseInt(pointUsed);

          if (parseInt(tempPointOrder) > parseInt(pointUser)) {
            $('.checked-order').prop('checked', false);
            $('#sp-cancel').addClass('sp-disable');
            $('#confirm-orders-nomination').prop('disabled', true);
            $('#confirm-orders-nomination').addClass('disable');
            // $('#orders-nominate').prop('checked',false);

            if (parseInt(pointUsed) > parseInt(pointUser)) {
              var point = parseInt($('#current-temp-point').val());
            } else {
              var point = parseInt(tempPointOrder) - parseInt(pointUser);
            }

            window.location.href = '/payment/transfer?point=' + point;

            return;
          } else {
            createOrderNominate();
          }
        }).catch(function (error) {
          console.log(error);
          if (error.response.status == 401) {
            window.location = '/login';
          }
        });
      }).catch(function (error) {
        console.log(error);
        if (error.response.status == 401) {
          window.location = '/login';
        }
      });
    }
  });

  if ($('#create-nomination-form').length) {

    if (localStorage.getItem("order_params")) {
      var orderParams = JSON.parse(localStorage.getItem("order_params"));

      if (orderParams.current_total_point) {
        $('#current-temp-point').val(parseInt(orderParams.current_total_point));
        var currenttempPoint = parseInt(orderParams.current_total_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
        $('.total-point').text(currenttempPoint + 'P~');
      }

      //payment

      if (orderParams.payment_method) {
        var inputTransfer = $("input:radio[name='transfer_order_nominate']");
        $.each(inputTransfer, function (index, val) {
          if (val.value == parseInt(orderParams.payment_method)) {
            $(this).prop('checked', true);
          }
        });

        if (OrderPaymentMethod.Direct_Payment == parseInt(orderParams.payment_method)) {
          $('#show-card-registered').css('display', 'none');
        }
      }

      //duration
      var cost = $('.cost-order').val();
      if (orderParams.current_duration) {
        if ('other_time_set' == orderParams.current_duration) {
          if (orderParams.select_duration) {
            var chooseDuration = orderParams.select_duration;
          } else {
            var chooseDuration = 4;
          }

          $('.time-input-nomination').css('display', 'flex');
        } else {
          var chooseDuration = orderParams.current_duration;
        }

        cost = parseInt(cost).toLocaleString(undefined, { minimumFractionDigits: 0 });

        $('.reservation-total__text').text('内訳：' + cost + '(キャストP/30分)✖' + chooseDuration + '時間');

        var inputDuration = $(".input-duration");

        $.each(inputDuration, function (index, val) {
          if (val.value == orderParams.current_duration) {
            $(this).prop('checked', true);
            $(this).parent().addClass('active');
          }
        });

        if (orderParams.select_duration) {
          var _inputDuration = $('select[name=sl_duration_nominition] option');
          $.each(_inputDuration, function (index, val) {
            if (val.value == orderParams.select_duration) {
              $(this).prop('selected', true);
            }
          });
        }
      }

      //current_time_set
      if (orderParams.current_time_set) {
        $(".input-time-join").parent().removeClass('active');
        if ('other_time' == orderParams.current_time_set) {
          $('.date-input-nomination').css('display', 'flex');

          if (orderParams.current_month) {
            $('.month-nomination').text(orderParams.current_month + '月');
            var month = parseInt(orderParams.current_month);

            window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
              var html = '';
              Object.keys(response.data).forEach(function (key) {
                if (key != 'debug') {
                  html += '<option value="' + key + '">' + response.data[key] + '</option>';
                }
              });
              $('.select-date').html(html);
              if (orderParams.current_date) {
                $('.date-nomination').text(orderParams.current_date + '日');
                var currentDate = parseInt(orderParams.current_date);
                var inputDate = $('select[name=sl_date_nomination] option');

                $.each(inputDate, function (index, val) {
                  if (val.value == currentDate) {
                    $(this).prop('selected', true);
                  }
                });
              }

              helper.loadShift();
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });

            var inputMonth = $('select[name=sl_month_nomination] option');
            $.each(inputMonth, function (index, val) {
              if (val.value == month) {
                $(this).prop('selected', true);
              }
            });
          }

          if (orderParams.current_hour) {
            var currentHour = parseInt(orderParams.current_hour);
            var currentMinute = parseInt(orderParams.current_minute);

            var inputHour = $('select[name=sl_hour_nomination] option');
            $.each(inputHour, function (index, val) {
              if (val.value == currentHour) {
                $(this).prop('selected', true);
              }
            });

            var inputMinute = $('select[name=sl_minute_nomination] option');
            $.each(inputMinute, function (index, val) {
              if (val.value == currentMinute) {
                $(this).prop('selected', true);
              }
            });

            var currentTime = orderParams.current_hour + ":" + orderParams.current_minute;
          }

          $('.time-nomination').text(currentTime);
        }

        var inputTimeSet = $(".input-time-join");
        $.each(inputTimeSet, function (index, val) {
          if (val.value == orderParams.current_time_set) {
            $(this).prop('checked', true);
            $(this).parent().addClass('active');
          }
        });
      }

      if (orderParams.prefecture_id) {
        $('.select-prefecture-nomination').val(orderParams.prefecture_id);
        var params = {
          prefecture_id: orderParams.prefecture_id
        };
        window.axios.get('/api/v1/municipalities', { params: params }).then(function (response) {
          var data = response.data;

          var municipalities = data.data;
          html = '';
          municipalities.forEach(function (val) {
            name = val.name;
            html += '<label class="button button--green area">';
            html += '<input class="input-area" type="radio" name="nomination_area" value="' + name + '">' + name + '</label>';
          });

          html += '<label id="area_input" class="button button--green area ">';
          html += '<input class="input-area" type="radio" name="nomination_area" value="その他">その他</label>';
          html += '<label class="area-input area-nomination"><span>希望エリア</span>';
          html += '<input type="text" id="other_area_nomination" placeholder="入力してください" name="other_area_nomination" value=""></label>';

          $('#list-municipalities-nomination').html(html);

          //area
          if (orderParams.select_area) {
            if ('その他' == orderParams.select_area) {
              $('.area-nomination').css('display', 'flex');
              $("input:text[name='other_area_nomination']").val(orderParams.text_area);
            }

            var inputArea = $(".input-area");
            $.each(inputArea, function (index, val) {
              if (val.value == orderParams.select_area) {
                $(this).prop('checked', true);
                $(this).parent().addClass('active');
              }
            });
          }
        }).catch(function (error) {
          console.log(error);
          if (error.response.status == 401) {
            window.location = '/login';
          }
        });
      }
    } else {
      var params = {
        prefecture_id: $('.select-prefecture-nomination option:selected').val()
      };
      helper.updateLocalStorageValue('order_params', params);
    }
  }

  if ($("label").hasClass("status-code-nomination")) {
    $('.status-code-nomination').click();
  }

  var selectedPrefectureNomination = $(".select-prefecture-nomination");
  selectedPrefectureNomination.on("change", function () {
    $(".checked-order").prop('checked', false);
    $('#confirm-orders-nomination').addClass("disable");
    $('#confirm-orders-nomination').prop('disabled', true);
    $('#sp-cancel').addClass("sp-disable");

    helper.deleteLocalStorageValue('order_params', 'select_area');
    helper.deleteLocalStorageValue('order_params', 'text_area');

    var params = {
      prefecture_id: this.value
    };

    helper.updateLocalStorageValue('order_params', params);

    window.axios.get('/api/v1/municipalities', { params: params }).then(function (response) {
      var data = response.data;

      var municipalities = data.data;
      html = '';
      municipalities.forEach(function (val) {
        name = val.name;
        html += '<label class="button button--green area">';
        html += '<input class="input-area" type="radio" name="nomination_area" value="' + name + '">' + name + '</label>';
      });

      html += '<label id="area_input" class="button button--green area ">';
      html += '<input class="input-area" type="radio" name="nomination_area" value="その他">その他</label>';
      html += '<label class="area-input area-nomination"><span>希望エリア</span>';
      html += '<input type="text" id="other_area_nomination" placeholder="入力してください" name="other_area_nomination" value=""></label>';

      $('#list-municipalities-nomination').html(html);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  });

  if ($('#show-coupon-order-nominate').length) {
    loadCouponsOrderNominate();
    selectedCouponsNominate(helper);
    helper.loadShift();
    handlerSelectedTransfer();

    $('body').on('click', "#popup-note", function () {
      $('#md-note').trigger('click');
    });
  } else {
    if (localStorage.getItem("shifts")) {
      localStorage.removeItem("shifts");
    }
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/order_offer.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
var couponOffer = [];

var couponType = {
  'POINT': 1,
  'DURATION': 2,
  'PERCENT': 3
};

var OrderPaymentMethod = {
  'Credit_Card': 1,
  'Direct_Payment': 2
};

function firstLoad() {
  var hour = $(".select-hour-offer option:selected").val();
  var minute = $(".select-minute-offer option:selected").val();
  var offerId = $('.offer-id').val();
  var date = $('#current-date-offer').val();
  var duration = parseInt($('#duration-offer').val());
  var classId = $('#current-class-id-offer').val();
  var castIds = $('#current-cast-id-offer').val();
  var totalCast = castIds.split(',').length;

  var couponId = null;

  if (!duration) {
    window.location = '/login';
  }

  if (localStorage.getItem("order_offer")) {
    var offerId = $('.offer-id').val();
    var orderOffer = JSON.parse(localStorage.getItem("order_offer"));
    if (orderOffer[offerId]) {
      orderOffer = orderOffer[offerId];

      if (orderOffer.coupon) {
        couponId = orderOffer.coupon.id;
      }

      if (orderOffer.current_date) {
        date = orderOffer.current_date;
        hour = orderOffer.hour;
        minute = orderOffer.minute;

        if (23 < hour) {
          switch (hour) {
            case '24':
              hour = '00';
              break;
            case '25':
              hour = '01';
              break;
            case '26':
              hour = '02';
              break;
          }
        }
      }
    }
  }

  var time = hour + ':' + minute;

  var input = {
    date: date,
    start_time: time,
    duration: duration,
    type: 2,
    class_id: classId,
    total_cast: totalCast,
    nominee_ids: castIds,
    offer: 1
  };

  var paramCoupon = {
    duration: duration
  };

  window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
    couponOffer = response.data['data'];

    var selectedCoupon = null;
    if (couponOffer.length) {
      var html = '<div class="caption">\n                    <h2>\u30AF\u30FC\u30DD\u30F3</h2>\n                  </div>\n                  <div class="form-grpup" >\n                    <select id="coupon-order-offer" class="select-coupon" name=\'select_coupon\'>\n                      <option value="" >\u30AF\u30FC\u30DD\u30F3\u3092\u4F7F\u7528\u3057\u306A\u3044</option>';

      couponOffer.forEach(function (coupon) {
        var selected = '';
        var id = coupon.id;
        var name = coupon.name;

        if (couponId == id) {

          var paramCoupon = {
            coupon: coupon
          };

          helper.updateLocalStorageKey('order_offer', paramCoupon, offerId);

          selectedCoupon = coupon;
          selected = 'selected';

          switch (coupon.type) {
            case couponType.POINT:
              input.duration_coupon = 0;
              break;

            case couponType.DURATION:
              input.duration_coupon = coupon.time;
              break;

            case couponType.PERCENT:
              input.duration_coupon = 0;
              break;

            default:
              window.location.href = '/mypage';
          }
        } else {
          selected = '';
        }

        html += '<option value="' + id + '"' + selected + ' >' + name + '</option>';
      });

      html += '</select>';
      html += '<div id=\'show_point-sale-coupon\' > ';

      if (selectedCoupon) {
        if (selectedCoupon.max_point) {
          var maxPoint = parseInt(selectedCoupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
          html += '<p class = "max-point-coupon" > \u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + maxPoint + 'P\u306B\u306A\u308A\u307E\u3059\u3002</p> </div>';
        }
      }

      html += '</div> </div>';
      $('#show-coupon-order-offer').html(html);
    }

    showPoint(input, offerId, selectedCoupon);
  }).catch(function (error) {
    console.log(error);
    if (error.response.status == 401) {
      window.location = '/login';
    }
  });
}

function selectedCouponsOffer() {
  $('body').on('change', "#coupon-order-offer", function () {
    var hour = $(".select-hour-offer option:selected").val();
    var minute = $(".select-minute-offer option:selected").val();
    var offerId = $('.offer-id').val();
    var date = $('#current-date-offer').val();
    var duration = parseInt($('#duration-offer').val());
    var classId = $('#current-class-id-offer').val();
    var castIds = $('#current-cast-id-offer').val();
    var totalCast = castIds.split(',').length;

    var couponId = $(this).val();

    if (!duration) {
      window.location = '/login';
    }

    if (localStorage.getItem("order_offer")) {
      var offerId = $('.offer-id').val();
      var orderOffer = JSON.parse(localStorage.getItem("order_offer"));
      if (orderOffer[offerId]) {
        orderOffer = orderOffer[offerId];

        if (orderOffer.current_date) {
          date = orderOffer.current_date;
          hour = orderOffer.hour;
          minute = orderOffer.minute;

          if (23 < hour) {
            switch (hour) {
              case '24':
                hour = '00';
                break;
              case '25':
                hour = '01';
                break;
              case '26':
                hour = '02';
                break;
            }
          }
        }
      }
    }

    var time = hour + ':' + minute;

    var input = {
      date: date,
      start_time: time,
      duration: duration,
      type: 2,
      class_id: classId,
      total_cast: totalCast,
      nominee_ids: castIds,
      offer: 1
    };

    if (!couponOffer) {
      window.location = '/mypage';
    }

    var couponIds = couponOffer.map(function (e) {
      return e.id;
    });

    var coupon = null;
    if (parseInt(couponId)) {
      if (couponIds.indexOf(parseInt(couponId)) > -1) {
        couponOffer.forEach(function (e) {
          if (e.id == couponId) {
            coupon = e;
          }
        });

        var paramCoupon = {
          coupon: coupon
        };

        helper.updateLocalStorageKey('order_offer', paramCoupon, offerId);

        if ($('#show_point-sale-coupon').length) {
          if (coupon.max_point) {
            var maxPoint = parseInt(coupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
            var html = '<p class = "max-point-coupon" > \u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + maxPoint + 'P\u306B\u306A\u308A\u307E\u3059\u3002</p> </div>';
            $('#show_point-sale-coupon').html(html);
          }
        }

        switch (coupon.type) {
          case couponType.POINT:
            input.duration_coupon = 0;
            break;

          case couponType.DURATION:
            input.duration_coupon = coupon.time;
            break;

          case couponType.PERCENT:
            input.duration_coupon = 0;
            break;

          default:
            window.location.href = '/mypage';
        }
      } else {
        window.location = '/mypage';
      }
    } else {
      if ($('#show_point-sale-coupon').length) {
        $('#show_point-sale-coupon').html('');
      }

      if (localStorage.getItem("order_offer")) {
        var orderOffer = JSON.parse(localStorage.getItem("order_offer"));
        if (orderOffer[offerId]) {
          orderOffer = orderOffer[offerId];
          if (orderOffer.coupon) {
            helper.deleteLocalStorageKey('order_offer', 'coupon', offerId);
          }
        }
      }
    }

    showPoint(input, offerId, coupon);
  });
}

function showPoint(input, offerId) {
  var coupon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  window.axios.post('/api/v1/orders/price', input).then(function (response) {
    if (response.data.data) {
      var result = response.data.data;
      var nightFee = parseInt(result.allowance_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
      var orderPoint = parseInt(result.order_point + result.order_fee).toLocaleString(undefined, { minimumFractionDigits: 0 });
      var tempPoint = result.allowance_point + result.order_point + result.order_fee;
      var currentPoint = tempPoint;

      $('#order-point').html(orderPoint + 'P');
      $('#night-fee').html(nightFee + 'P');

      if (coupon) {
        if (couponType.PERCENT == coupon.type) {
          var pointCoupon = parseInt(coupon.percent) / 100 * tempPoint;
        }

        if (couponType.POINT == coupon.type) {
          var pointCoupon = coupon.point;
        }

        if (couponType.DURATION == coupon.type) {
          var pointCoupon = result.order_point_coupon + result.order_fee_coupon;
        }

        if (coupon.max_point) {
          if (coupon.max_point < pointCoupon) {
            pointCoupon = coupon.max_point;
          }
        }

        currentPoint = tempPoint - pointCoupon;
        if (currentPoint < 0) {
          currentPoint = 0;
        }

        pointCoupon = parseInt(pointCoupon).toLocaleString(undefined, { minimumFractionDigits: 0 });
        $('#sale-point-coupon').text('-' + pointCoupon + 'P');

        $('#show-point-coupon-offer').css('display', 'flex');
      } else {
        $('#sale-point-coupon').text('');
        $('#show-point-coupon-offer').css('display', 'none');
      }

      var data = {
        current_total_point: currentPoint
      };

      helper.updateLocalStorageKey('order_offer', data, offerId);
      $('#temp-point-offer').val(currentPoint);

      currentPoint = parseInt(currentPoint).toLocaleString(undefined, { minimumFractionDigits: 0 });
      $('#total-point-order').html(currentPoint + 'P');
      $('.total-amount').text(currentPoint + 'P');
    }
  }).catch(function (error) {
    console.log(error);
    if (error.response.status == 401) {
      window.location = '/login';
    }
  });
}

function selectedTransfer() {
  var transfer = $("input:radio[name='transfer_order_offer']");
  transfer.on("change", function () {
    var offerId = $('.offer-id').val();
    var transfer = $("input:radio[name='transfer_order_offer']:checked").val();

    var param = {
      payment_method: transfer
    };

    helper.updateLocalStorageKey('order_offer', param, offerId);

    if (OrderPaymentMethod.Direct_Payment == parseInt(transfer)) {
      $('#card-registered').css('display', 'none');
    }

    if (OrderPaymentMethod.Credit_Card == parseInt(transfer)) {
      $('#card-registered').css('display', 'block');

      if ($('.inactive-button-order').length) {
        $('#confirm-orders-offer').addClass("disable");
        $('.checked-order-offer').prop('checked', false);
        $('#confirm-orders-offer').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      }
    }
  });
}

function createOrderOffer() {
  var transfer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  $('.modal-confirm-offer').css('display', 'none');
  $('#confirm-orders-offer').prop('disabled', true);

  var area = $("input:radio[name='offer_area']:checked").val();
  if ('その他' == area) {
    area = $("input:text[name='other_area_offer']").val();
  }

  var hour = $(".select-hour-offer option:selected").val();
  if (23 < hour) {
    switch (hour) {
      case '24':
        hour = '00';
        break;
      case '25':
        hour = '01';
        break;
      case '26':
        hour = '02';
        break;
    }
  }
  var minute = $(".select-minute-offer option:selected").val();

  var time = hour + ':' + minute;

  var offerId = $('.offer-id').val();
  if (localStorage.getItem("order_offer")) {
    var orderOffer = JSON.parse(localStorage.getItem("order_offer"));
    if (orderOffer[offerId]) {
      orderOffer = orderOffer[offerId];
      if (orderOffer.current_date) {
        var date = orderOffer.current_date;
      } else {
        var date = $('#current-date-offer').val();
      }
    }
  } else {
    var date = $('#current-date-offer').val();
  }

  var duration = $("#duration-offer").val();
  var classId = $('#current-class-id-offer').val();
  var castIds = $('#current-cast-id-offer').val();
  var totalCast = castIds.split(',').length;
  var offerId = $('.offer-id').val();

  var params = {
    prefecture_id: orderOffer.prefecture_id,
    address: area,
    class_id: classId,
    duration: duration,
    date: date,
    start_time: time,
    total_cast: totalCast,
    type: 2,
    nominee_ids: castIds,
    temp_point: $('#temp-point-offer').val(),
    offer_id: offerId
  };

  if (transfer) {
    params.payment_method = transfer;
  }

  if (orderOffer.coupon) {
    var coupon = orderOffer.coupon;
    params.coupon_id = coupon.id;
    params.coupon_name = coupon.name;
    params.coupon_type = coupon.type;

    if (coupon.max_point) {
      params.coupon_max_point = coupon.max_point;
    } else {
      params.coupon_max_point = null;
    }

    switch (coupon.type) {
      case couponType.POINT:
        params.coupon_value = coupon.point;
        break;

      case couponType.DURATION:
        params.coupon_value = coupon.time;
        break;

      case couponType.PERCENT:
        params.coupon_value = coupon.percent;
        break;

      default:
        window.location.href = '/mypage';
    }
  }

  window.axios.post('/api/v1/orders/create_offer', params).then(function (response) {
    $('#order-offer-popup').prop('checked', false);
    var roomId = response.data.data.room_id;
    window.location.href = '/message/' + roomId;
  }).catch(function (error) {
    $('#confirm-orders-offer').prop('disabled', false);
    $('#order-offer-popup').prop('checked', false);
    if (error.response.status == 401) {
      window.location = '/login';
    } else {
      if (error.response.status == 422) {
        $('#timeout-offer-message h2').css('font-size', '15px');

        $('#timeout-offer-message h2').html('この予約は募集が締め切られました');

        $('#close-offer').addClass('mypage');

        $('#timeout-offer').prop('checked', true);

        $('.mypage').on("click", function (event) {
          window.location = '/mypage';
        });
      } else {
        if (error.response.status == 406) {
          $('#admin-edited').prop('checked', true);

          $('#reload-offer').on("click", function (event) {
            if (localStorage.getItem("order_offer")) {
              localStorage.removeItem("order_offer");
            }
            window.location = '/offers/' + offerId;
          });
        } else {
          var content = '';
          var err = '';

          switch (error.response.status) {
            case 400:
              var err = '開始時間は現在時刻から30分以降の時間を選択してください';
              break;
            case 404:
              var err = '支払い方法が未登録です';
              break;
            case 409:
              var err = 'クーポンが無効です';
              break;
            case 412:
              var err = '退会申請中のため、予約することはできません。';
              break;
            case 500:
              var err = 'この操作は実行できません';
              break;

            default:
              break;
          }

          $('#err-offer-message h2').html(err);
          $('#err-offer-message p').html(content);

          $('#err-offer').prop('checked', true);
        }
      }
    }
  });
}

$(document).ready(function () {
  function dayOfWeek() {
    return ['日', '月', '火', '水', '木', '金', '土'];
  }

  var checkApp = {
    isAppleDevice: function isAppleDevice() {
      if (navigator.userAgent.match(/(iPhone|iPod|iPad)/) != null) {
        return true;
      }

      return false;
    }
  };

  if ($('.offer-status').length) {
    $offerStatus = $('.offer-status').val();

    if (3 == $offerStatus || 4 == $offerStatus || $('.deleted_at').val()) {
      $('#timeout-offer-message h2').css('font-size', '15px');

      if ($('.deleted_at').val()) {
        $('#timeout-offer-message h2').html('この予約は無効になりました');
      } else {
        $('#timeout-offer-message h2').html('この予約は募集が締め切られました');
      }

      $('#close-offer').addClass('mypage');

      $('#timeout-offer').prop('checked', true);

      $('.mypage').on("click", function (event) {
        window.location = '/mypage';
      });
    }
  }

  $('body').on('change', ".checked-order-offer", function (event) {
    if ($(this).is(':checked')) {
      if (localStorage.getItem("order_offer")) {
        var offerId = $('.offer-id').val();
        var orderOffer = JSON.parse(localStorage.getItem("order_offer"));

        if (orderOffer[offerId]) {
          orderOffer = orderOffer[offerId];
          var area = $("input:radio[name='offer_area']:checked").val();
          var otherArea = $("input:text[name='other_area_offer']").val();
          var checkExpired = $("#check-expired").val();
          var checkCard = $('.inactive-button-order').length;
          var transfer = $("input:radio[name='transfer_order_offer']:checked").val();

          if (OrderPaymentMethod.Direct_Payment == transfer) {
            checkCard = false;
          }

          if (checkExpired == 1 || !area || area == 'その他' && !otherArea || checkCard || !orderOffer.current_date) {
            $('#confirm-orders-offer').addClass("disable");
            $(this).prop('checked', false);
            $('#confirm-orders-offer').prop('disabled', true);
            $('#sp-cancel').addClass("sp-disable");
          } else {
            $(this).prop('checked', true);
            $('#sp-cancel').removeClass('sp-disable');
            $('#confirm-orders-offer').removeClass('disable');
            $('#confirm-orders-offer').prop('disabled', false);
          }
        } else {
          $('#confirm-orders-offer').addClass("disable");
          $(this).prop('checked', false);
          $('#confirm-orders-offer').prop('disabled', true);
          $('#sp-cancel').addClass("sp-disable");
        }
      } else {
        $('#confirm-orders-offer').addClass("disable");
        $(this).prop('checked', false);
        $('#confirm-orders-offer').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      }
    } else {
      $(this).prop('checked', false);
      $('#confirm-orders-offer').addClass("disable");
      $('#confirm-orders-offer').prop('disabled', true);
      $('#sp-cancel').addClass("sp-disable");
    }
  });

  //order-active
  $('#confirm-orders-offer').on("click", function (event) {
    $('.modal-confirm-offer').css('display', 'inline-block');
    $('#order-offer-popup').prop('checked', true);
  });

  $('.attention-offer').on("click", function (event) {
    $('#show-attention').prop('checked', true);
  });

  $('body').on('click', "#lb-order-offer", function (event) {
    var transfer = parseInt($("input[name='transfer_order_offer']:checked").val());

    if (transfer) {
      if (OrderPaymentMethod.Credit_Card == transfer || OrderPaymentMethod.Direct_Payment == transfer) {
        if (OrderPaymentMethod.Direct_Payment == transfer) {
          window.axios.get('/api/v1/auth/me').then(function (response) {
            var pointUser = response.data['data'].point;

            window.axios.get('/api/v1/guest/points_used').then(function (response) {
              var pointUsed = response.data['data'];
              var tempPointOrder = parseInt($('#temp-point-offer').val()) + parseInt(pointUsed);

              if (parseInt(tempPointOrder) > parseInt(pointUser)) {
                $('#order-offer-popup').prop('checked', false);
                $('.checked-order-offer').prop('checked', false);
                $('#sp-cancel').addClass('sp-disable');
                $('#confirm-orders-offer').prop('disabled', true);
                $('#confirm-orders-offer').addClass('disable');

                if (parseInt(pointUsed) > parseInt(pointUser)) {
                  var point = parseInt($('#temp-point-offer').val());
                } else {
                  var point = parseInt(tempPointOrder) - parseInt(pointUser);
                }

                window.location.href = '/payment/transfer?point=' + point;

                return;
              } else {
                createOrderOffer(transfer);
              }
            }).catch(function (error) {
              console.log(error);
              if (error.response.status == 401) {
                window.location = '/login';
              }
            });
          }).catch(function (error) {
            console.log(error);
            if (error.response.status == 401) {
              window.location = '/login';
            }
          });
        } else {
          createOrderOffer(transfer);
        }
      } else {
        window.location.href = '/mypage';
      }
    } else {
      createOrderOffer();
    }
  });

  //textArea
  $('body').on('input', "input:text[name='other_area_offer']", function (e) {
    var offerId = $('.offer-id').val();
    var otherArea = $(this).val();

    var params = {
      text_area: otherArea
    };

    helper.updateLocalStorageKey('order_offer', params, offerId);

    var area = $("input:radio[name='offer_area']:checked").val();

    if (!area || !otherArea) {
      $('#confirm-orders-offer').addClass("disable");
      $(".checked-order-offer").prop('checked', false);
      $('#confirm-orders-offer').prop('disabled', true);
      $('#sp-cancel').addClass("sp-disable");
    }
  });

  //area
  $('body').on('change', "input:radio[name='offer_area']", function () {
    var offerId = $('.offer-id').val();
    var areaOffer = $("input:radio[name='offer_area']:checked").val();

    if ('その他' == areaOffer) {
      if (localStorage.getItem("order_offer")) {
        var orderOffer = JSON.parse(localStorage.getItem("order_offer"));

        if (orderOffer.text_area) {
          $("input:text[name='other_area_offer']").val(orderOffer.text_area);
        }
      }

      if (!$("input:text[name='other_area_offer']").val()) {
        $('#confirm-orders-offer').addClass("disable");
        $(".checked-order-offer").prop('checked', false);
        $('#confirm-orders-offer').prop('disabled', true);
        $('#sp-cancel').addClass("sp-disable");
      }
    }

    var params = {
      select_area: areaOffer
    };

    helper.updateLocalStorageKey('order_offer', params, offerId);
  });

  $('.select-hour-offer').on('change', function (e) {
    var hour = $(this).val();

    if (23 < hour) {
      switch (hour) {
        case '24':
          hour = '00';
          break;
        case '25':
          hour = '01';
          break;
        case '26':
          hour = '02';
          break;
      }
    }

    var startTimeFrom = $('#start-time-from-offer').val();
    startTimeFrom = startTimeFrom.split(":");
    var startHourFrom = startTimeFrom[0];
    var startMinuteFrom = startTimeFrom[1];

    var startTimeTo = $('#start-time-to-offer').val();
    startTimeTo = startTimeTo.split(":");
    var startHourTo = startTimeTo[0];
    var startMinuteTo = startTimeTo[1];
    var html = '';

    startMinuteFrom = hour == startHourFrom ? parseInt(startMinuteFrom) : 0;
    startMinuteTo = hour == startHourTo ? parseInt(startMinuteTo) : 59;

    for (var i = startMinuteFrom; i <= startMinuteTo; i++) {
      var value = i < 10 ? '0' + parseInt(i) : i;

      html += '<option value="' + value + '">' + value + '\u5206</option>';
    }

    $('.select-minute-offer').html(html);
  });

  //time

  $('body').on('click', ".date-select-offer", function () {
    var hour = $(".select-hour-offer option:selected").val();
    var minute = $(".select-minute-offer option:selected").val();
    var currentDate = $('#current-date-offer').val();
    var offerId = $('.offer-id').val();
    currentDate = currentDate.split('-');

    var now = new Date();
    var check = hour;

    if (23 < hour) {
      switch (hour) {
        case '24':
          check = '00';
          break;
        case '25':
          check = '01';
          break;
        case '26':
          check = '02';
          break;
      }

      if (checkApp.isAppleDevice()) {
        var checkDate = new Date(currentDate[1] + '/' + currentDate[2] + '/' + currentDate[0] + ' ' + check + ':' + minute);
      } else {
        var checkDate = new Date(currentDate[0] + '-' + currentDate[1] + '-' + currentDate[2] + ' ' + check + ':' + minute);
      }

      checkDate.setDate(checkDate.getDate() + 1);
    } else {
      if (checkApp.isAppleDevice()) {
        var checkDate = new Date(currentDate[1] + '/' + currentDate[2] + '/' + currentDate[0] + ' ' + check + ':' + minute);
      } else {
        var checkDate = new Date(currentDate[0] + '-' + currentDate[1] + '-' + currentDate[2] + ' ' + check + ':' + minute);
      }
    }

    utc = now.getTime() + now.getTimezoneOffset() * 60000;
    nd = new Date(utc + 3600000 * 9);

    if (helper.add_minutes(nd, 30) > checkDate) {
      checkDate = helper.add_minutes(nd, 30);
    }

    var startTimeTo = $('#start-time-to-offer').val();
    startTimeTo = startTimeTo.split(":");
    var startHourTo = startTimeTo[0];
    var startMinuteTo = startTimeTo[1];
    var startTimeFrom = $('#start-time-from-offer').val();
    startTimeFrom = startTimeFrom.split(":");
    var startHourFrom = startTimeFrom[0];

    if (startHourTo <= startHourFrom) {
      if (checkApp.isAppleDevice()) {
        var timeTo = new Date(currentDate[1] + '/' + currentDate[2] + '/' + currentDate[0] + ' ' + startHourTo + ':' + startMinuteTo);
      } else {
        var timeTo = new Date(currentDate[0] + '-' + currentDate[1] + '-' + currentDate[2] + ' ' + startHourTo + ':' + startMinuteTo);
      }

      timeTo.setDate(timeTo.getDate() + 1);
    } else {
      if (checkApp.isAppleDevice()) {
        var timeTo = new Date(currentDate[1] + '/' + currentDate[2] + '/' + currentDate[0] + ' ' + startHourTo + ':' + startMinuteTo);
      } else {
        var timeTo = new Date(currentDate[0] + '-' + currentDate[1] + '-' + currentDate[2] + ' ' + startHourTo + ':' + startMinuteTo);
      }
    }

    if (timeTo < checkDate) {
      checkDate = timeTo;
    }

    var monthOffer = checkDate.getMonth() + 1;
    if (monthOffer < 10) {
      monthOffer = '0' + monthOffer;
    }
    var dateOffer = checkDate.getDate();
    if (dateOffer < 10) {
      dateOffer = '0' + dateOffer;
    }

    var yearOffer = checkDate.getFullYear();

    var hourOffer = checkDate.getHours();
    if (hourOffer < 10) {
      hourOffer = '0' + hourOffer;
    }

    var minuteOffer = checkDate.getMinutes();
    if (minuteOffer < 10) {
      minuteOffer = '0' + minuteOffer;
    }

    var time = yearOffer + '-' + monthOffer + '-' + dateOffer;

    if (checkApp.isAppleDevice()) {
      var dateFolowDevice = new Date(monthOffer + '/' + dateOffer + '/' + yearOffer);
    } else {
      var dateFolowDevice = new Date(yearOffer + '-' + monthOffer + '-' + dateOffer);
    }

    var getDayOfWeek = dateFolowDevice.getDay();
    var dayOfWeekString = dayOfWeek()[getDayOfWeek];

    $('#temp-date-offer').text(yearOffer + '年' + monthOffer + '月' + dateOffer + '日(' + dayOfWeekString + ')');
    $('.time-offer').text(hourOffer + ':' + minuteOffer + '~');

    check = hourOffer;

    if (currentDate[2] != dateOffer) {
      switch (hourOffer) {
        case '00':
          hourOffer = '24';
          break;
        case '01':
          hourOffer = '25';
          break;
        case '02':
          hourOffer = '26';
          break;
      }
    }

    $('.select-hour-offer').val(hourOffer);
    $('.select-minute-offer').val(minuteOffer);

    var params = {
      current_date: time,
      hour: hourOffer,
      minute: minuteOffer
    };

    helper.updateLocalStorageKey('order_offer', params, offerId);

    var duration = $("#duration-offer").val();

    var castIds = $('#current-cast-id-offer').val();
    var totalCast = castIds.split(',');
    var classId = $('#current-class-id-offer').val();

    var input = {
      date: time,
      start_time: check + ':' + minuteOffer,
      type: 2,
      duration: duration,
      total_cast: totalCast.length,
      nominee_ids: castIds,
      class_id: classId,
      offer: 1
    };

    if (!couponOffer) {
      window.location = '/mypage';
    }

    var couponId = null;
    if ($('#coupon-order-offer').length) {
      couponId = $('#coupon-order-offer').val();
    }

    var couponIds = couponOffer.map(function (e) {
      return e.id;
    });

    var coupon = null;
    if (parseInt(couponId)) {
      if (couponIds.indexOf(parseInt(couponId)) > -1) {
        couponOffer.forEach(function (e) {
          if (e.id == couponId) {
            coupon = e;
          }
        });

        switch (coupon.type) {
          case couponType.POINT:
            input.duration_coupon = 0;
            break;

          case couponType.DURATION:
            input.duration_coupon = coupon.time;
            break;

          case couponType.PERCENT:
            input.duration_coupon = 0;
            break;

          default:
            window.location.href = '/mypage';
        }
      } else {
        window.location = '/mypage';
      }
    }

    showPoint(input, offerId, coupon);
  });

  if ($('#temp-point-offer').length) {
    var offerId = $('.offer-id').val();
    if (localStorage.getItem("order_offer")) {
      var _orderOffer = JSON.parse(localStorage.getItem("order_offer"));

      if (_orderOffer[offerId]) {
        _orderOffer = _orderOffer[offerId];

        // if(orderOffer.current_total_point){
        //   totalPoint = parseInt(orderOffer.current_total_point).toLocaleString(undefined,{ minimumFractionDigits: 0 });
        //   $('.total-amount').text(totalPoint +'P');
        //   $('#temp-point-offer').val(orderOffer.current_total_point);
        // }


        //payment

        if (_orderOffer.payment_method) {
          var inputTransfer = $("input:radio[name='transfer_order_offer']");
          $.each(inputTransfer, function (index, val) {
            if (val.value == parseInt(_orderOffer.payment_method)) {
              $(this).prop('checked', true);
            }
          });

          if (OrderPaymentMethod.Direct_Payment == parseInt(_orderOffer.payment_method)) {
            $('#card-registered').css('display', 'none');
          }
        }

        if (_orderOffer.current_date) {
          currentDate = _orderOffer.current_date.split('-');
          if (checkApp.isAppleDevice()) {
            var dateFolowDevice = new Date(currentDate[1] + '/' + currentDate[2] + '/' + currentDate[0]);
          } else {
            var dateFolowDevice = new Date(currentDate[0] + '-' + currentDate[1] + '-' + currentDate[2]);
          }

          var getDayOfWeek = dateFolowDevice.getDay();
          var dayOfWeekString = dayOfWeek()[getDayOfWeek];
          $('#temp-date-offer').text(currentDate[0] + '年' + currentDate[1] + '月' + currentDate[2] + '日(' + dayOfWeekString + ')');
        }

        //time
        if (_orderOffer.hour) {
          var hour = _orderOffer.hour;
          var inputHour = $('select[name=select_hour_offer] option');
          $.each(inputHour, function (index, val) {
            if (val.value == hour) {
              $(this).prop('selected', true);
            }
          });

          if (23 < hour) {
            switch (hour) {
              case '24':
                hour = '00';
                break;
              case '25':
                hour = '01';
                break;
              case '26':
                hour = '02';
                break;
            }
          }

          $('.time-offer').text(hour + ":" + _orderOffer.minute + '~');

          var startTimeFrom = $('#start-time-from-offer').val();
          startTimeFrom = startTimeFrom.split(":");
          var startHourFrom = startTimeFrom[0];
          var startMinuteFrom = startTimeFrom[1];

          var startTimeTo = $('#start-time-to-offer').val();
          startTimeTo = startTimeTo.split(":");
          var startHourTo = startTimeTo[0];
          var startMinuteTo = startTimeTo[1];
          var html = '';

          startMinuteFrom = _orderOffer.hour == startHourFrom ? startMinuteFrom : 0;
          startMinuteTo = _orderOffer.hour == startHourTo ? startMinuteTo : 59;

          for (var i = startMinuteFrom; i <= startMinuteTo; i++) {
            var value = i < 10 ? '0' + parseInt(i) : i;
            var selected = i == _orderOffer.minute ? 'selected' : '';

            html += '<option value="' + value + '" ' + selected + '>' + value + '\u5206</option>';
          }

          $('.select-minute-offer').html(html);
        }

        if (_orderOffer.prefecture_id) {
          $('.select-prefecture-offer').val(_orderOffer.prefecture_id);
          var params = {
            prefecture_id: _orderOffer.prefecture_id
          };

          window.axios.get('/api/v1/municipalities', { params: params }).then(function (response) {
            var data = response.data;

            var municipalities = data.data;
            html = '';
            municipalities.forEach(function (val) {
              name = val.name;
              html += '<label class="button button--green area">';
              html += '<input class="input-area-offer" type="radio" name="offer_area" value="' + name + '">' + name + '</label>';
            });

            html += '<label id="area_input" class="button button--green area ">';
            html += '<input class="input-area-offer" type="radio" name="offer_area" value="その他">その他</label>';
            html += '<label class="area-input area-offer"><span>希望エリア</span>';
            html += '<input type="text" id="other_area_offer" placeholder="入力してください" name="other_area_offer" value=""></label>';

            $('#list-municipalities-offer').html(html);

            //area
            if (_orderOffer.select_area) {
              if ('その他' == _orderOffer.select_area) {
                $('.area-offer').css('display', 'flex');
                $("input:text[name='other_area_offer']").val(_orderOffer.text_area);
              }

              var inputArea = $(".input-area-offer");
              inputArea.parent().removeClass('active');

              $.each(inputArea, function (index, val) {
                if (val.value == _orderOffer.select_area) {
                  $(this).prop('checked', true);
                  $(this).parent().addClass('active');
                }
              });
            }
          }).catch(function (error) {
            console.log(error);
            if (error.response.status == 401) {
              window.location = '/login';
            }
          });
        }
      }
    } else {
      var params = {
        prefecture_id: $('.select-prefecture-offer option:selected').val()
      };
      helper.updateLocalStorageKey('order_offer', params, offerId);
    }
  }

  var currentUrl = window.location.href;
  var regex = /offers\/\d/;

  if (currentUrl.match(regex)) {
    $('.btn-choose-time-success').click(function (event) {
      $('#temp-time-offer').removeClass('color-placeholder');
      $('#temp-time-offer').addClass('color-choose-time');
    });

    if (localStorage.getItem("order_offer")) {
      var offerId = $('.offer-id').val();
      var orderOffer = JSON.parse(localStorage.getItem("order_offer"));
      if (orderOffer[offerId]) {
        $('#temp-time-offer').removeClass('color-placeholder');
        $('#temp-time-offer').addClass('color-choose-time');
      }
    } else {
      $('#temp-time-offer').removeClass('color-choose-time');
      $('#temp-time-offer').addClass('color-placeholder');
    }

    $('.details-list').css({
      display: 'none'
    });
    if ($('#temp-point-offer').length) {
      // Set the date we're counting down to
      var date = $('#expired-date').val();
      var month = $('#expired-month').val();
      var year = $('#expired-year').val();
      var hour = $('#expired-hour').val();
      var minute = $('#expired-minute').val();

      if (date && month && year && hour && minute) {
        if (checkApp.isAppleDevice()) {
          var dateFolowDevice = new Date(month + '/' + date + '/' + year + ' ' + hour + ':' + minute).getTime();
        } else {
          var dateFolowDevice = new Date(year + '-' + month + '-' + date + ' ' + hour + ':' + minute).getTime();
        }

        // Update the count down every 1 second
        var x = setInterval(function () {
          // Get todays date and time
          var now = new Date();
          var utc = now.getTime() + now.getTimezoneOffset() * 60000;
          var nd = new Date(utc + 3600000 * 9);
          var nowJapan = new Date(nd).getTime();
          // Find the distance between now and the count down date
          var distance = dateFolowDevice - nowJapan;

          // Time calculations for days, hours, minutes and seconds
          var days = Math.floor(distance / (1000 * 60 * 60 * 24));
          var hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
          var minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          var seconds = Math.floor(distance % (1000 * 60) / 1000);
          if (seconds < 10) {
            seconds = '0' + seconds;
          }
          // Output the result in an element with id="demo"
          document.getElementById("time-countdown").innerHTML = hours + days * 24 + "時間" + minutes + "分" + seconds + "秒";
          // If the count down is over, write some text
          if (distance < 0) {
            clearInterval(x);
            document.getElementById("time-countdown").innerHTML = "0時間00分00秒";
            $("#check-expired").val(1);
          }
        }, 1000);
      } else {
        document.getElementById("time-countdown").innerHTML = "00時間00分00秒";
      }
    }
  }

  //select prefecture
  var selectedPrefectureOffer = $(".select-prefecture-offer");
  selectedPrefectureOffer.on("change", function () {
    var offerId = $('.offer-id').val();
    $('#confirm-orders-offer').addClass("disable");
    $('.checked-order-offer').prop('checked', false);
    $('#confirm-orders-offer').prop('disabled', true);
    $('#sp-cancel').addClass("sp-disable");

    helper.deleteLocalStorageKey('order_offer', 'select_area', offerId);
    helper.deleteLocalStorageKey('order_offer', 'text_area', offerId);

    var params = {
      prefecture_id: this.value
    };

    helper.updateLocalStorageKey('order_offer', params, offerId);

    window.axios.get('/api/v1/municipalities', { params: params }).then(function (response) {
      var data = response.data;

      var municipalities = data.data;
      html = '';
      municipalities.forEach(function (val) {
        name = val.name;
        html += '<label class="button button--green area">';
        html += '<input class="input-area-offer" type="radio" name="offer_area" value="' + name + '">' + name + '</label>';
      });

      html += '<label id="area_input" class="button button--green area ">';
      html += '<input class="input-area-offer" type="radio" name="offer_area" value="その他">その他</label>';
      html += '<label class="area-input area-offer"><span>希望エリア</span>';
      html += '<input type="text" id="other_area_offer" placeholder="入力してください" name="other_area_offer" value=""></label>';

      $('#list-municipalities-offer').html(html);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  });

  if ($('#temp-point-offer').length) {
    firstLoad();
    selectedCouponsOffer();
    selectedTransfer();
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/order_step_one.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
var coupons = [];
var couponType = {
  'POINT': 1,
  'DURATION': 2,
  'PERCENT': 3
};

function loadCouponsOrderCall() {
  if (localStorage.getItem("order_call")) {
    var orderCall = JSON.parse(localStorage.getItem("order_call"));
    if (orderCall.current_duration) {
      var duration = orderCall.current_duration;

      if ('other_duration' == duration) {
        duration = 4;

        if (orderCall.select_duration) {
          duration = orderCall.select_duration;
        }
      }
    } else {
      var duration = $("input:radio[name='time_set']:checked").val();

      if (duration) {
        if ('other_duration' == duration) {
          duration = $('#select-duration-call option:selected').val();
        }
      } else {
        duration = null;
      }
    }
  } else {
    var duration = $("input:radio[name='time_set']:checked").val();

    if (duration) {
      if ('other_duration' == duration) {
        duration = $('#select-duration-call option:selected').val();
      }
    } else {
      duration = null;
    }
  }

  var paramCoupon = {
    duration: duration
  };

  window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
    coupons = response.data['data'];
    var html = '';
    if (coupons.length) {
      html += '<div class="reservation-item">';
      html += '<div class="caption">';
      html += '<h2>クーポン</h2> </div>';
      html += '<div class="form-grpup" >';
      html += '<select id="coupon-order" class="select-coupon" > ';
      html += '<option value="" >クーポンを使用しない</option>';
      coupons.forEach(function (coupon) {
        var id = coupon.id;
        var name = coupon.name;
        html += '<option value="' + id + '">' + name + '</option>';
      });

      html += '</select>';
      html += '<div id="show_point-sale-coupon"></div> </div></div>';
    }

    $('#show-coupon-order-call').html(html);
  }).catch(function (error) {
    console.log(error);
    if (error.response.status == 401) {
      window.location = '/login';
    }
  });
}

function selectedCouponsOrderCall() {
  $('body').on('change', "#coupon-order", function () {
    var couponId = parseInt($(this).val());
    if (couponId) {
      if (!coupons) {
        window.location = '/mypage';
      }

      var couponIds = coupons.map(function (e) {
        return e.id;
      });

      var coupon = {};
      if (couponIds.indexOf(parseInt(couponId)) > -1) {
        coupons.forEach(function (e) {
          if (e.id == couponId) {
            coupon = e;
          }
        });
      } else {
        window.location = '/mypage';
      }

      if (coupon.max_point) {
        if ($('#show_point-sale-coupon').length) {
          var maxPoint = parseInt(coupon.max_point).toLocaleString(undefined, { minimumFractionDigits: 0 });
          var html = '<p class = "max-point-coupon" > \u203B\u5272\u5F15\u3055\u308C\u308B\u30DD\u30A4\u30F3\u30C8\u306F\u6700\u5927' + maxPoint + 'P\u306B\u306A\u308A\u307E\u3059\u3002</p> ';
          $('#show_point-sale-coupon').html(html);
        }
      } else {
        $('#show_point-sale-coupon').html('');
      }
    } else {
      $('#show_point-sale-coupon').html('');
    }
  });
}

function handlerSelectedArea() {
  $('body').on('change', ".button--green.area", function () {

    if ($("input:radio[name='area']").length) {
      var areaCall = $("input:radio[name='area']:checked").val();

      if ('その他' == areaCall) {
        if (localStorage.getItem("order_call")) {
          var orderCall = JSON.parse(localStorage.getItem("order_call"));

          if (orderCall.text_area) {
            $("input:text[name='other_area']").val(orderCall.text_area);
          }
        }
      }

      var params = {
        select_area: areaCall
      };

      helper.updateLocalStorageValue('order_call', params);
    }

    $("#ge2-1-x input:radio[name='area']").parent().removeClass("active");
    $("#ge2-1-x input:radio[name='area']:checked").parent().addClass("active");

    var area = $("input:radio[name='area']:checked").val();
    var otherArea = $("input:text[name='other_area']").val();
    var time = $("input:radio[name='time_join']:checked").val();
    var castClass = $("input:radio[name='cast_class']:checked").val();
    var duration = $("input:radio[name='time_set']:checked").val();
    var totalCast = $("input[type='text'][name='txtCast_Number']").val();
    var date = $('.sp-date').text();

    if (!area || area == 'その他' && !otherArea || !time || !castClass || !duration || duration < 1 && 'other_duration' != duration || !totalCast || totalCast < 1 || time == 'other_time' && !date) {
      $("#step1-create-call").addClass("disable");
      $("#step1-create-call").prop('disabled', true);
    } else {
      $("#step1-create-call").removeClass('disable');
      $("#step1-create-call").prop('disabled', false);
    }
  });
}

function handlerCustomArea() {
  $('body').on('input', "input:text[name='other_area']", function () {
    //text-area
    var params = {
      text_area: $(this).val()
    };

    helper.updateLocalStorageValue('order_call', params);

    var otherArea = $(this).val();
    var time = $("input:radio[name='time_join']:checked").val();
    var area = $("input:radio[name='area']:checked").val();
    var castClass = $("input:radio[name='cast_class']:checked").val();
    var duration = $("input:radio[name='time_set']:checked").val();
    var totalCast = $("input[type='text'][name='txtCast_Number']").val();
    var date = $('.sp-date').text();

    if (!time || !area || !otherArea || !castClass || !duration || duration < 1 && 'other_duration' != duration || !totalCast || totalCast < 1 || time == 'other_time' && !date) {
      $("#step1-create-call").addClass("disable");
      $("#step1-create-call").prop('disabled', true);
    } else {
      $("#step1-create-call").removeClass('disable');
      $("#step1-create-call").prop('disabled', false);
    }
  });
}

function handlerSelectedTime() {
  var dateButton = $(".button--green.date");
  dateButton.on("change", function () {
    var time = $("input:radio[name='time_join']:checked").val();

    if ($("input:radio[name='time_join']").length) {
      var updateTime = {
        current_time_set: time
      };

      helper.updateLocalStorageValue('order_call', updateTime);
    }

    $("#ge2-1-x input:radio[name='time_join']").parent().removeClass("active");
    $("#ge2-1-x input:radio[name='time_join']:checked").parent().addClass("active");

    var area = $("input:radio[name='area']:checked").val();
    var otherArea = $("input:text[name='other_area']").val();
    var castClass = $("input:radio[name='cast_class']:checked").val();
    var duration = $("input:radio[name='time_set']:checked").val();
    var totalCast = $("input[type='text'][name='txtCast_Number']").val();
    var date = $('.sp-date').text();

    if (!area || area == 'その他' && !otherArea || !castClass || !duration || duration < 1 && 'other_duration' != duration || !totalCast || totalCast < 1 || time == 'other_time' && !date) {
      $("#step1-create-call").addClass("disable");
      $("#step1-create-call").prop('disabled', true);
    } else {
      $("#step1-create-call").removeClass('disable');
      $("#step1-create-call").prop('disabled', false);
    }
  });

  $('.select-month').on('change', function (e) {
    var month = $(this).val();
    window.axios.post('/api/v1/get_day', { month: month }).then(function (response) {
      var html = '';
      Object.keys(response.data).forEach(function (key) {
        if (key != 'debug') {
          html += '<option value="' + key + '">' + response.data[key] + '</option>';
        }
      });
      $('.select-date').html(html);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  });

  $('body').on('click', ".date-select__ok", function () {
    var month = $('.select-month').val();
    var date = $('.select-date').val();

    if ($('.select-hour').val() < 10) {
      var hour = '0' + $('.select-hour').val();
    } else {
      var hour = $('.select-hour').val();
    }

    if ($('.select-minute').val() < 10) {
      var minute = '0' + $('.select-minute').val();
    } else {
      var minute = $('.select-minute').val();
    }

    var currentDate = new Date();
    utc = currentDate.getTime() + currentDate.getTimezoneOffset() * 60000;
    nd = new Date(utc + 3600000 * 9);

    var year = nd.getFullYear();
    var checkMonth = nd.getMonth();

    var app = {
      isAppleDevice: function isAppleDevice() {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad)/) != null) {
          return true;
        }

        return false;
      }
    };

    if (app.isAppleDevice()) {
      var selectDate = new Date(month + '/' + date + '/' + year + ' ' + hour + ':' + minute);
    } else {
      var selectDate = new Date(year + '-' + month + '-' + date + ' ' + hour + ':' + minute);
    }

    if (month > checkMonth) {
      if (helper.add_minutes(nd, 30) > selectDate) {
        selectDate = helper.add_minutes(nd, 30);
        date = selectDate.getDate();
        month = selectDate.getMonth() + 1;

        hour = selectDate.getHours();
        if (hour < 10) {
          hour = '0' + hour;
        }

        minute = selectDate.getMinutes();
        if (minute < 10) {
          minute = '0' + minute;
        }

        $('.select-month').val(month);
        $('.select-date').val(date);
        $('.select-hour').val(selectDate.getHours());
        $('.select-minute').val(selectDate.getMinutes());
      }
    } else {
      year += 1;
    }

    if (month < 10) {
      month = '0' + month;
    }

    if (date < 10) {
      date = '0' + date;
    }

    if ($('#create-nomination-form').length) {
      var updateOtherTime = {
        current_month: month,
        current_date: date,
        current_hour: hour,
        current_minute: minute
      };

      helper.updateLocalStorageValue('order_params', updateOtherTime);
    }

    var time = hour + ':' + minute;

    if ($("input:radio[name='area']").length) {
      var params = {
        current_date: year + '-' + month + '-' + date,
        current_time: time
      };

      helper.updateLocalStorageValue('order_call', params);
    }

    $('.sp-date').text(date + '日');
    $('.sp-month').text(month + '月');
    $('.sp-time').text(time);

    var area = $("input:radio[name='area']:checked").val();
    var otherArea = $("input:text[name='other_area']").val();
    var castClass = $("input:radio[name='cast_class']:checked").val();
    var duration = $("input:radio[name='time_set']:checked").val();
    var totalCast = $("input[type='text'][name='txtCast_Number']").val();
    var date = $('.sp-date').text();

    if (!area || area == 'その他' && !otherArea || !castClass || !duration || duration < 1 && 'other_duration' != duration || !totalCast || totalCast < 1 || !date) {
      $("#step1-create-call").addClass("disable");
      $("#step1-create-call").prop('disabled', true);
    } else {
      $("#step1-create-call").removeClass('disable');
      $("#step1-create-call").prop('disabled', false);
    }

    $(".overlay").fadeOut();
  });
}

function handlerSelectedDuration() {
  var timeButton = $(".button--green.time");
  timeButton.on("change", function () {
    var duration = $("input:radio[name='time_set']:checked").val();

    if ($("input:radio[name='time_set']").length) {
      var params = {
        current_duration: duration
      };

      helper.updateLocalStorageValue('order_call', params);
    }

    $("#ge2-1-x input:radio[name='time_set']").parent().removeClass("active");
    $("#ge2-1-x input:radio[name='time_set']:checked").parent().addClass("active");

    var area = $("input:radio[name='area']:checked").val();
    var otherArea = $("input:text[name='other_area']").val();
    var castClass = $("input:radio[name='cast_class']:checked").val();
    var totalCast = $("input[type='text'][name='txtCast_Number']").val();
    var time = $("input:radio[name='time_join']:checked").val();
    var date = $('.sp-date').text();

    if (!time || !area || area == 'その他' && !otherArea || !castClass || !duration || duration < 1 && 'other_duration' != duration || !totalCast || totalCast < 1 || time == 'other_time' && !date) {
      $("#step1-create-call").addClass("disable");
      $("#step1-create-call").prop('disabled', true);
    } else {
      $("#step1-create-call").removeClass('disable');
      $("#step1-create-call").prop('disabled', false);
    }

    //show coupon 
    if ('other_duration' == duration) {
      duration = $('#select-duration-call option:selected').val();
    }

    var paramCoupon = {
      duration: duration
    };

    window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
      coupons = response.data['data'];
      var html = '';

      if (coupons.length) {
        html += '<div class="reservation-item">';
        html += '<div class="caption">';
        html += '<h2>クーポン</h2> </div>';
        html += '<div class="form-grpup" >';
        html += '<select id="coupon-order" class="select-coupon" >';
        html += '<option value="">クーポンを使用しない</option>';

        coupons.forEach(function (coupon) {
          var id = coupon.id;
          var name = coupon.name;
          html += '<option value="' + id + '">' + name + '</option>';
        });

        html += '</select>';
        html += '<div id="show_point-sale-coupon"></div> </div></div>';
      }

      $('#show-coupon-order-call').html(html);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  });

  //select-duration 
  $('#select-duration-call').on("change", function () {
    var duration = $('#select-duration-call option:selected').val();

    var params = {
      select_duration: duration
    };

    helper.updateLocalStorageValue('order_call', params);

    //show coupon 

    var paramCoupon = {
      duration: duration
    };

    window.axios.get('/api/v1/coupons', { params: paramCoupon }).then(function (response) {
      coupons = response.data['data'];
      var html = '';

      if (coupons.length) {
        html += '<div class="reservation-item">';
        html += '<div class="caption">';
        html += '<h2>クーポン</h2> </div>';
        html += '<div class="form-grpup" > ';
        html += '<select id="coupon-order" class="select-coupon" >';
        html += '<option value="">クーポンを使用しない</option>';

        coupons.forEach(function (coupon) {
          var id = coupon.id;
          var name = coupon.name;
          html += '<option value="' + id + '">' + name + '</option>';
        });

        html += '</select>';
        html += '<div id="show_point-sale-coupon"></div> </div></div>';
      }

      $('#show-coupon-order-call').html(html);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  });
}

function handlerSelectedCastClass() {
  var castClass = $("input:radio[name='cast_class']");
  castClass.on("change", function () {
    var castClass = $("input:radio[name='cast_class']:checked").val();

    var className = $("input:radio[name='cast_class']:checked").data('name');

    var params = {
      cast_class: castClass,
      class_name: className
    };

    helper.updateLocalStorageValue('order_call', params);

    if (castClass == 3) {
      $('.notify-campaign-over-cast-class span').text('※”ダイヤモンド”はキャンペーン対象外です');
      $('.notify-campaign-over-cast-class').css('display', 'block');
    }

    if (castClass == 2) {
      $('.notify-campaign-over-cast-class span').text('※”プラチナ”はキャンペーン対象外です');
      $('.notify-campaign-over-cast-class').css('display', 'block');
    }

    if (castClass == 1) {
      $('.notify-campaign-over-cast-class').css('display', 'none');
    }

    var area = $("input:radio[name='area']:checked").val();
    var otherArea = $("input:text[name='other_area']").val();
    var duration = $("input:radio[name='time_set']:checked").val();
    var totalCast = $("input[type='text'][name='txtCast_Number']").val();
    var time = $("input:radio[name='time_join']:checked").val();
    var date = $('.sp-date').text();

    if (!time || !area || area == 'その他' && !otherArea || !castClass || !duration || duration < 1 && 'other_duration' != duration || !totalCast || totalCast < 1 || time == 'other_time' && !date) {
      $("#step1-create-call").addClass("disable");
      $("#step1-create-call").prop('disabled', true);
    } else {
      $("#step1-create-call").removeClass('disable');
      $("#step1-create-call").prop('disabled', false);
    }
  });
}

function handlerNumberCasts() {
  $(".cast-number__button-plus").on("click", function () {
    var number_val = parseInt($(".cast-number__value input").val());

    if (number_val >= 1) {
      $(".cast-number__button-minus").addClass('active');
      $(".cast-number__button-minus").css({ "border": "1.5px #00c3c3 solid" });
      $(".cast-number__button-minus").prop('disabled', false);
    }

    if (number_val == 2) {
      $('.notify-campaign-over span').text('※3名はキャンペーン対象外です');
      $('.notify-campaign-over').css('display', 'block');
    }

    if (number_val >= 3) {
      $('.notify-campaign-over span').text('※4名はキャンペーン対象外です');
      $('.notify-campaign-over').css('display', 'block');
    }

    if (number_val == maxCasts - 1) {
      $(this).css({ "border": "1.5px #cccccc solid" });
      $(this).addClass('active');
    }

    if (number_val >= maxCasts) {
      $(this).attr("disabled", "disabled");
    } else {
      number_val = number_val + 1;
      $(".cast-number__value input").val(number_val);
    }

    var params = {
      countIds: number_val
    };

    helper.updateLocalStorageValue('order_call', params);
  });

  $(".cast-number__button-minus").on("click", function () {
    var number_val = parseInt($(".cast-number__value input").val());
    if (number_val == 1) {
      $(this).removeClass('active');
      $(this).attr("disabled", "disabled");
      $(this).css({ "border": "1.5px #cccccc solid" });
    } else {
      $(".cast-number__button-plus").prop('disabled', false);
    }

    if (number_val == 4) {
      $('.notify-campaign-over span').text('※3名はキャンペーン対象外です');
    }

    if (number_val < 4) {
      $('.notify-campaign-over').css('display', 'none');
    }

    if (number_val > 0 && number_val != 1) {
      if (number_val == 2) {
        $(this).removeClass('active');
        $(this).css({ "border": "1.5px #cccccc solid" });
      }
      number_val = number_val - 1;
      $(".cast-number__button-plus").removeClass('active');
      $(".cast-number__button-plus").css({ "border": "1.5px #00c3c3 solid" });
      $(".cast-number__value input").val(number_val);
    }

    var params = {
      countIds: number_val
    };

    helper.updateLocalStorageValue('order_call', params);
  });

  var checkNumber = parseInt($(".cast-number__value input").val());
  var maxCasts = parseInt($("#max_casts").val());

  if (!maxCasts) {
    maxCasts = 10;
  }

  if (checkNumber > 2) {
    if (checkNumber == 3) {
      $('.notify-campaign-over span').text('※3名はキャンペーン対象外です');
    }

    if (checkNumber == 4) {
      $('.notify-campaign-over span').text('※4名はキャンペーン対象外です');
    }

    $('.notify-campaign-over').css('display', 'block');
  }

  if (checkNumber > 1) {
    if (checkNumber == maxCasts) {
      $(".cast-number__button-plus").prop('disabled', false);
      $(".cast-number__button-plus").css({ "border": "1.5px #cccccc solid" });
      $(".cast-number__button-plus").addClass('active');
    }

    $(".cast-number__button-minus").addClass('active');
    $(".cast-number__button-minus").css({ "border": "1.5px #00c3c3 solid" });
    $(".cast-number__button-minus").prop('disabled', false);
  }
}

function handlerSelectedPrefecture() {
  var selectedPrefecture = $(".select-prefecture");
  selectedPrefecture.on("change", function () {
    $("#step1-create-call").addClass("disable");
    $("#step1-create-call").prop('disabled', true);

    helper.deleteLocalStorageValue('order_call', 'select_area');
    helper.deleteLocalStorageValue('order_call', 'text_area');

    var params = {
      prefecture_id: this.value
    };

    helper.updateLocalStorageValue('order_call', params);

    window.axios.get('/api/v1/municipalities', { params: params }).then(function (response) {
      var data = response.data;

      var municipalities = data.data;
      html = '';
      municipalities.forEach(function (val) {
        name = val.name;
        html += '<label class="button button--green area">';
        html += '<input type="radio" name="area" value="' + name + '">' + name + '</label>';
      });

      html += '<label id="area_input" class="button button--green area">';
      html += '<input type="radio" name="area" value="その他">その他 </label>';
      html += '<label class="area-input area-call"> <span>希望エリア</span>';
      html += '<input type="text" placeholder="入力してください" name="other_area" value=""> </label>';

      $('#list-municipalities').html(html);
    }).catch(function (error) {
      console.log(error);
      if (error.response.status == 401) {
        window.location = '/login';
      }
    });
  });
}

function handleStepOne() {
  $('body').on('click', "#step1-create-call", function () {
    if (localStorage.getItem("order_call")) {
      var orderCall = JSON.parse(localStorage.getItem("order_call"));
      if (!orderCall.countIds) {
        var number_val = parseInt($(".cast-number__value input").val());

        var params = {
          countIds: number_val
        };

        helper.updateLocalStorageValue('order_call', params);
      }

      if (!orderCall.current_time_set) {
        var timeJoin = $("input:radio[name='time_join']:checked").val();
        var params = {
          current_time_set: timeJoin
        };

        helper.updateLocalStorageValue('order_call', params);
      }

      if (!orderCall.select_duration) {
        var duration = $('#select-duration-call option:selected').val();
        var params = {
          select_duration: duration
        };

        helper.updateLocalStorageValue('order_call', params);
      }

      if ($('#coupon-order').length) {
        var couponId = parseInt($('#coupon-order').val());

        if (couponId) {
          if (!coupons.length) {
            window.location = '/mypage';
          }

          var couponIds = coupons.map(function (e) {
            return e.id;
          });

          if (couponIds.indexOf(couponId) > -1) {
            var coupon = {};
            coupons.forEach(function (e) {
              if (e.id == couponId) {
                coupon = e;
              }
            });
          }

          if (coupon) {
            var params = {
              coupon: coupon
            };

            helper.updateLocalStorageValue('order_call', params);
          }
        }
      } else {
        if (orderCall.coupon) {
          helper.deleteLocalStorageValue('order_call', 'coupon');
        }
      }
    } else {
      window.location = '/mypage';
    }
  });
}

$(document).ready(function () {
  handlerSelectedArea();
  handlerCustomArea();
  handlerSelectedTime();
  handlerSelectedDuration();
  handlerSelectedCastClass();
  handlerNumberCasts();
  handlerSelectedPrefecture();

  if ($('#step1-create-call').length) {
    loadCouponsOrderCall();
    handleStepOne();
    selectedCouponsOrderCall();
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/order_step_three.js":
/***/ (function(module, exports) {

// const helper = require('./helper');

// function handlerSelectedCasts()
// {
//   $('#list-cast-order').on("change", ".cast_block .select-casts", function(event){
//     var id = $(this).val();
//     var countIds = JSON.parse(localStorage.getItem("order_call")).countIds;
//     if($('.select-casts:checked').length > countIds) {
//       var text = ' 指名できるキャストは'+ countIds + '名です';
//       $('#content-message h2').text(text);
//       $('#max-cast').prop('checked', true);
//       $(this).prop('checked',false);
//     }else {
//       if ($(this).is(':checked')) {
//         if(localStorage.getItem("order_call")){
//           var arrIds = JSON.parse(localStorage.getItem("order_call")).arrIds;
//           if (arrIds) {
//             if(arrIds.length < countIds) {
//               arrIds.push(id);
//               var params = {
//                   arrIds: arrIds
//                 };

//               $(this).prop('checked',true);
//               $(this).parent().find('.cast-link').addClass('cast-detail');
//               $('.label-select-casts[for='+  id  +']').text('リクエスト中');
//             } else {
//               var text = ' 指名できるキャストは'+ countIds + '名です';
//               $('#content-message h2').text(text);
//               $('#max-cast').prop('checked', true);
//               $(this).prop('checked',false);
//             }

//             if(arrIds.length) {
//               $('#sb-select-casts a').text('次に進む(3/4)');
//             } else {
//               $('#sb-select-casts a').text('希望リクエストせずに進む(3/4)');
//             }

//           } else {
//             var arrIds = [id];

//             var params = {
//                 arrIds: arrIds
//               };

//             $(this).prop('checked',true);
//             $(this).parent().find('.cast-link').addClass('cast-detail');
//             $('.label-select-casts[for='+  id  +']').text('リクエスト中');
//             $('#sb-select-casts a').text('次に進む(3/4)');
//           }
//         } else {
//           var arrIds = [id];

//           var params = {
//               arrIds: arrIds
//             };
//         }
//       } else {
//         if(localStorage.getItem("order_call")){
//           var arrIds = JSON.parse(localStorage.getItem("order_call")).arrIds;
//           if(arrIds) {
//             if(arrIds.indexOf(id) > -1) {
//               arrIds.splice(arrIds.indexOf(id), 1);
//             }

//             var params = {
//               arrIds: arrIds,
//             }

//             if(arrIds.length) {
//               $('#sb-select-casts a').text('次に進む(3/4)');
//             } else {
//               $('#sb-select-casts a').text('希望リクエストせずに進む(3/4)');
//             }
//           }
//         }

//         $(this).prop('checked',false);
//         $(this).parent().find('.cast-link').removeClass('cast-detail');
//         $('.label-select-casts[for='+  id  +']').text('リクエストする');
//       }
//     }

//     if(params) {
//       helper.updateLocalStorageValue('order_call', params);
//       $(".cast-ids").val(arrIds.toString());
//     }
//   });

//   $("#cast-order-call a").on("click",function(event){
//     var id = $('#cast-id-info').val();
//     if(localStorage.getItem("order_call")){
//       var arrIds = JSON.parse(localStorage.getItem("order_call")).arrIds;
//       var countIds = JSON.parse(localStorage.getItem("order_call")).countIds;
//       if(arrIds) {
//         if(arrIds.length < countIds) {
//           if(arrIds.indexOf(id) < 0) {
//             arrIds.push(id);

//             var params = {
//               arrIds: arrIds,
//             };
//           }
//         } else {
//           if(arrIds.indexOf(id) < 0) {
//             localStorage.setItem('full',true);
//           }
//         }
//       } else {
//         var arrIds = [];
//         arrIds.push(id);

//         var params = {
//             arrIds: arrIds
//           };
//       }
//     }

//     if(params) {
//       helper.updateLocalStorageValue('order_call', params);
//     }
//   })
// }

// $(document).ready(function () {
//   handlerSelectedCasts();
// });

/***/ }),

/***/ "./resources/assets/js/web/pages/order_step_two.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");

function handlerSelectedTags() {
  $(".form-grpup .checkbox-tags").on("change", function (event) {
    var tagName = $(this).children().val();
    var activeSum = $(".active").length;
    if ($(this).hasClass("active")) {
      $(this).children().prop('checked', false);
      $(this).removeClass('active');

      if (localStorage.getItem("order_call")) {
        var tags = JSON.parse(localStorage.getItem("order_call")).tags;
        if (tags) {
          if (tags.indexOf(tagName) > -1) {
            tags.splice(tags.indexOf(tagName), 1);
          }

          var params = {
            tags: tags
          };
        }
      }
    } else {
      if (activeSum >= 5) {
        $('#max-tags').prop('checked', true);
        $(this).children().prop('checked', false);
        $(this).removeClass('active');
      } else {
        $(this).children().prop('checked', true);
        $(this).addClass('active');

        if (localStorage.getItem("order_call")) {
          var tags = JSON.parse(localStorage.getItem("order_call")).tags;
          if (tags) {
            tags.push(tagName);

            var params = {
              tags: tags
            };
          } else {
            var tags = [tagName];
            var params = {
              tags: tags
            };
          }
        } else {
          var tags = [tagName];
          var params = {
            tags: tags
          };
        }
      }
    }

    if (params) {
      helper.updateLocalStorageValue('order_call', params);
    }
  });
}

$(document).ready(function () {
  handlerSelectedTags();
});

/***/ }),

/***/ "./resources/assets/js/web/pages/payment.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");

$('#gl3 #payment-failed-popup').on('click', function (event) {
    $('#payment-failed').trigger('click');
});

$('#request-buy-point-btn').on('click', function (e) {
    $('#request-buy-point').trigger('click');
    $('#payment-form').submit();
});

$('#payment-confirm-btn').on('click', function (e) {
    $('.wrap-modal-confirm-payment').css('display', 'none');
    setTimeout(function () {
        $('#payment-form').submit();
    }, 200);
});

$('#payment-submit').on('click', function (e) {
    var orderPaymentMethod = $('#order-payment-method').val();
    if (orderPaymentMethod != 2) {
        e.preventDefault();
        if (orderTotalPoint > guestTotalPoint) {
            var missingPoint = orderTotalPoint - guestTotalPoint;
            $('#request-buy-point').trigger('click');
            $('#request-buy-point-modal-title').html(missingPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'Pが足りません');
        } else {
            $('#payment-confirm').trigger('click');
        }
    }
});

$('#request-update-point-btn').on('click', function (e) {
    var url = 'api/v1/guest/orders/' + orderId + '/payment_requests';
    window.axios.patch(url).then(function (response) {
        $('#alert-payment-content').html('修正依頼しました');
        $('#request-update-point').trigger('click');
        $('#alert-payment-label').trigger('click');

        setTimeout(function () {
            window.location.href = '/mypage';
        }, 2000);
    }).catch(function (err) {
        $('#request-update-point').trigger('click');
        $('#payment-failed').trigger('click');
    });
});

$('#payment-form').on('submit', function (e) {
    e.preventDefault();
    var url = $(this).attr('action');
    var orderPaymentMethod = $('#order-payment-method').val();

    if (orderPaymentMethod == 1) {
        window.axios.post(url).then(function (response) {
            var message = helper.getResponseMessage(response.data.message);
            $('#alert-payment-content').html(message);
            $('#alert-payment-label').trigger('click');
            document.getElementById('payment-completed-gtm').click();
            setTimeout(function () {
                window.location.href = '/mypage';
            }, 2000);
        }).catch(function (err) {
            $('#payment-failed').trigger('click');
        });
    } else {
        window.axios.get('/api/v1/auth/me').then(function (response) {
            var guestTotalPoint = response.data.data.point;
            if (orderTotalPoint > guestTotalPoint) {
                window.location.href = '/payment/transfer?order_id=' + orderId + '&point=' + (parseInt(orderTotalPoint) - +parseInt(guestTotalPoint));
            } else {
                window.axios.post(url).then(function (response) {
                    var message = helper.getResponseMessage(response.data.message);
                    $('#alert-payment-content').html(message);
                    $('#alert-payment-label').trigger('click');
                    document.getElementById('payment-completed-gtm').click();
                    setTimeout(function () {
                        window.location.href = '/mypage';
                    }, 2000);
                }).catch(function (err) {
                    $('#payment-failed').trigger('click');
                });
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    // window.axios.get('/api/v1/guest/points_used')
    //     .then(function(response) {
    //         if (response.data && (response.data.data > guestTotalPoint)) {
    //                 window.location.href = '/payment/transfer?point='+ (parseInt(response.data.data) - parseInt(guestTotalPoint));
    //            } else {
    //                 window.axios.post(url).then(response => {
    //                         const message = helper.getResponseMessage(response.data.message);
    //                         $('#alert-payment-content').html(message);
    //                         $('#alert-payment-label').trigger('click');
    //                         document.getElementById('payment-completed-gtm').click();
    //                        setTimeout(() => {
    //                                window.location.href = '/mypage';
    //                             }, 2000);
    //                     }).catch(err => {
    //                         $('#payment-failed').trigger('click');
    //                     });
    //             }
    //         }).catch(function(error) {
    //         console.log(error);
    //     });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/payment_method.js":
/***/ (function(module, exports) {

$(document).ready(function () {
    $('#credit-method').on('click', function () {
        localStorage.setItem('payment_method', 1);
        // window.location.href = '/purchase';
    });

    $('#transfer-method').on('click', function () {
        localStorage.setItem('payment_method', 2);
        //     var point = localStorage.getItem("buy_point")
        //     window.location.href = '/payment/transfer?point='+point;
    });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/point.js":
/***/ (function(module, exports) {

$('#buypoint-confirm').on('click', function () {
    var currentPoint = $('#current_point').val();
    var pointAmount = $('#point-amount').val();
    $('#buypoint-popup').trigger('click');
    window.axios.post('/api/v1/points', { amount: pointAmount }).then(function (response) {
        var newTotalPoint = Number(currentPoint) + Number(pointAmount);
        $('#current_point').val(newTotalPoint);
        $('#total_point').html(newTotalPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        $('#buypoint-alert-content').html('ポイント購入完了しました！');
        $('#buypoint-alert-label').trigger('click');
        $('#buypoint-alert-label').addClass('auto-popup');
        setTimeout(function () {
            if ($('#buypoint-alert-label').hasClass('auto-popup')) {
                $('#buypoint-alert-label').trigger('click');
            }
        }, 5000);
    }).catch(function (err) {
        $('#popup-require-card-label').trigger('click');
    });
});
$('#buypoint-alert-label').on('click', function () {
    $('#buypoint-alert-label').removeClass('auto-popup');
});

/***/ }),

/***/ "./resources/assets/js/web/pages/rating.js":
/***/ (function(module, exports, __webpack_require__) {

var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
$('#rating-submit-btn').on('click', function () {
    $('#rating-confirm-label').click();
});

$('#rating-confirm-btn').on('click', function () {
    $('#rating-confirm-label').click();
    $('#rating-create').submit();
});

$('#rating-create').submit(function (e) {
    e.preventDefault();
    var formData = helper.getFormData(this);
    window.axios.post($(this).attr('action'), formData).then(function (response) {
        var message = helper.getResponseMessage(response.data.message);
        $('#rating-alert-content').html(message);
        $('#rating-alert').trigger('click');
        var nextRatting = Number($('#next-rating-cast').val());
        setTimeout(function () {
            if (nextRatting != -1) {
                window.location.href = '/evaluation?order_id=' + formData.order_id;
            } else {
                window.location.href = '/history/' + formData.order_id;
            }
        }, 1500);
    }).catch(function (err) {
        var message = helper.getResponseMessage(err.response.data.error);
        $('#rating-alert-content').html(message);
        $('#rating-alert').trigger('click');
    });
});

$('#rating-comment').on('keyup', function (e) {
    if ($(this).val().length) {
        $('#rating-submit-btn').prop("disabled", false);
    } else {
        $('#rating-submit-btn').prop("disabled", true);
    }
});

$('#rating-comment').bind('paste', function (e) {
    var pastedData = e.originalEvent.clipboardData.getData('text');
    if (pastedData.length) {
        $('#rating-submit-btn').prop("disabled", false);
    } else {
        $('#rating-submit-btn').prop("disabled", true);
    }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/receipt.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  var point_id = null;
  $('body').on('click', '.popup-create-receipt', function () {
    point_id = $(this).attr('point-id');

    $('#form-receipt').submit(function (e) {
      e.preventDefault();
    }).validate({
      rules: {
        name: {
          maxlength: 50
        },
        content: {
          maxlength: 50
        }
      },
      messages: {
        name: {
          maxlength: "50文字以内で入力してください。"
        },
        content: {
          maxlength: "50文字以内で入力してください。"
        }
      },

      submitHandler: function submitHandler(form) {
        var params = {
          name: $('#name').val(),
          content: $('#content').val(),
          point_id: point_id
        };

        $('.help-block').each(function () {
          $(this).html('');
        });

        window.axios.post('/api/v1/receipts', params).then(function (response) {
          var img_file = response.data.data.img_file;

          $('#img-pdf').attr('src', img_file);
          $('#img-download').attr('href', img_file);
          $('#send-mail').attr('img-file', img_file);

          $('#popup-create-receipt').trigger('click');
          $('#popup-receipt').trigger('click');

          var btn = '#point-' + response.data.data.point_id + '-btn';
          var label = '<label for="popup-receipt" class="btn-bg popup-receipt" img-file="' + img_file + '">領収書を再発行</label>';
          $(btn).html(label);
          $('#name').val('');
          $('#content').val('');
        }).catch(function (error) {
          if (error.response.status == 401) {
            window.location = '/login/line';
          }

          if (error.response.data.error) {
            var errors = error.response.data.error;

            Object.keys(errors).forEach(function (field) {
              $('[data-field="' + field + '"].help-block').html(errors[field][0]);
            });
          }
        });
      }
    });
  });

  $('body').on('click', '.popup-receipt', function () {
    var img_file = $(this).attr('img-file');

    $('#img-pdf').attr('src', img_file);
    $('#img-download').attr('href', img_file);
    $('#send-mail').attr('img-file', img_file);
  });

  $('#send-mail').on('click', function () {
    img_file = $(this).attr('img-file') ? $(this).attr('img-file') : $('.popup-receipt').attr('img-file');

    window.location = 'mailto:?body=' + img_file;
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/resign.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $("#withdraw").on("click", function (e) {
    var params = {
      reason1: localStorage.getItem('reason1'),
      reason2: localStorage.getItem('reason2'),
      reason3: localStorage.getItem('reason3'),
      other_reason: localStorage.getItem("other_reason") ? localStorage.getItem('textarea_reason') : ''
    };

    window.axios.post('/api/v1/resigns/create', params).then(function (response) {

      if (localStorage.getItem("reason1")) {
        localStorage.removeItem("reason1");
      }

      if (localStorage.getItem("reason2")) {
        localStorage.removeItem("reason2");
      }

      if (localStorage.getItem("reason3")) {
        localStorage.removeItem("reason3");
      }

      if (localStorage.getItem("other_reason")) {
        localStorage.removeItem("other_reason");
      }

      localStorage.removeItem("textarea_reason");

      window.location = '/resigns/complete';
    }).catch(function (error) {
      if (error.response.status == 409) {
        window.location = '/mypage';
      }

      if (error.response.status == 422) {
        $("#popup-resign").addClass("active");
      }

      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/room.js":
/***/ (function(module, exports) {

var roomLoading = false;
$(document).ready(function () {
  $("#search-box").val(null);
  var userId = $('#auth').val();
  window.Echo.private('user.' + userId).listen('MessageCreated', function (e) {
    var roomId = e.message.room_id;
    var message = '';

    if (e.message.message !== "") {
      message = e.message.message;
    } else {
      message = e.message.user.nickname + 'さんが写真を送信しました';
    }

    var roomId = e.message.room_id;
    var unreadCount = $('#room_' + roomId).data('unread');

    $('#balloon_' + roomId).removeClass("balloon");
    $('#balloon_' + roomId).addClass("notyfi-msg");
    unreadCount = unreadCount + 1;

    $('#room_' + roomId).data('unread', unreadCount);

    if (unreadCount > 99) {
      unreadCount = '99+';
    }

    $('#room_' + roomId).text(unreadCount);
    $('#latest-message_' + roomId).text(message);

    var count = 0;
    $('.msg').each(function (index, val) {
      var id = $(this).data('id');
      if (id == roomId) {
        count++;
      }
    });

    if (count > 0) {
      $('#list-room').prepend($('#msg_' + roomId));
    } else {
      window.location.reload();
    }
  });

  $('.search-box').keydown(function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
    }
  });

  $('.search-box').keyup(function (event) {
    var keywork = $('.search-box').val();
    axios.get('api/v1/rooms/list_room', {
      'params': {
        nickname: keywork,
        response_type: 'html'
      }
    }).then(function (response) {
      $('#list-room').html(response.data);
    }).catch(function (error) {
      console.log(error);
    });
  });
});

$(window).scroll(function () {
  if ($(document).height() - ($(window).scrollTop() + $(window).height()) <= 10) {
    var nextpage = $(".next-page:last").attr("data-url");
    if (!nextpage) {
      return false;
    }
    if (!roomLoading) {
      roomLoading = true;

      axios.get(nextpage, {
        'params': {
          response_type: 'html'
        }
      }).then(function (response) {
        $('#list-room').append(response['data']);

        roomLoading = false;
      }).catch(function (error) {
        console.log(error);
      });
    }
  }
});

/***/ }),

/***/ "./resources/assets/js/web/pages/timeline.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  var isFocused = false;
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  $('body').on('click', function (e) {
    if ($(e.target).is('#timeline-edit-content') || $(e.target).is('#timeline-edit-content div')) {
      isFocused = true;
    } else {
      isFocused = false;
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      if (isFocused) {
        if (window.screen.height == 812 && window.screen.width == 375) {
          $(".mm-page").addClass('set-height-mmpage-ipx');
          $(".timeline-edit__text").addClass("timeline-edit__text_overflow__ipx");
        }

        if (window.screen.height == 667 && window.screen.width == 375) {
          $(".mm-page").addClass('set-height-mmpage');

          $(".timeline-edit__text").addClass("timeline-edit__text_overflow");
        }
        $('body').css('height', 'intrinsic');
        $("html, body").animate({ scrollTop: 0 }, "fast");
      } else {
        setTimeout(function () {
          if (window.screen.height == 812 && window.screen.width == 375) {
            $(".mm-page").removeClass('set-height-mmpage-ipx');

            $(".timeline-edit__text").removeClass("timeline-edit__text_overflow__ipx");
          }

          if (window.screen.height == 667 && window.screen.width == 375) {
            $(".mm-page").removeClass('set-height-mmpage');

            $(".timeline-edit__text").removeClass("timeline-edit__text_overflow");
          }

          $('body').css('height', '100%');
        }, 100);
      }
    }
  });

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    $(".timeline-edit__area").focusout(function () {
      setTimeout(function () {
        if (window.screen.height == 812 && window.screen.width == 375) {
          $(".mm-page").removeClass('set-height-mmpage-ipx');

          $(".timeline-edit__text").removeClass("timeline-edit__text_overflow__ipx");
        }

        if (window.screen.height == 667 && window.screen.width == 375) {
          $(".mm-page").removeClass('set-height-mmpage');

          $(".timeline-edit__text").removeClass("timeline-edit__text_overflow");
        }

        $('body').css('height', '100%');
      }, 100);
    });
  };

  // Like/unlike timeline in timeline detail
  $('body').on('click', '#heart-timeline', function (e) {
    var _this = $(this);
    var id = _this.attr('data-timeline-id');
    total_favorites = _this.attr('data-total-favorites-timeline');
    is_favorited_timeline = _this.attr('data-is-favorited-timeline');

    var nickname = $('#nickname').val();
    var age = $('#age').val();
    var avatar = $('#avatar').val();
    var userId = $('#timeline-user-id').val();
    var routeUser = $('#route-user').val();

    window.axios.post('/api/v1/timelines/' + id + '/favorites').then(function (response) {
      var total = parseInt(total_favorites);
      if (is_favorited_timeline == 0) {
        var total = total + 1;
        _this.html('<img class="init-cursor" src="/assets/web/images/common/like.svg">');
        _this.attr('data-total-favorites-timeline', total);

        var html = '<div class="timeline-like-item user-' + userId + '">\n              <div class="timeline-like-item__profile">\n                <a href="' + routeUser + '">\n                  <img src="' + avatar + '" alt="">\n                </a>\n              </div>\n              <div class="timeline-like-item__info">\n                <p>' + nickname + '</p>\n                <p>' + age + '\u6B73</p>\n              </div>\n            </div>';

        $('.js-add-favorite').before(html);
      } else {
        var total = total - 1;
        _this.html('<img class="init-cursor" src="/assets/web/images/common/unlike.svg">');
        _this.attr('data-total-favorites-timeline', total);

        $('.user-' + userId).remove();
      }

      $('#total-favorites').text(total);
      _this.attr('data-is-favorited-timeline', is_favorited_timeline == 1 ? 0 : 1);
    }).catch(function (error) {
      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  }); /* End like/unlike timeline in timeline detail */

  /* Post timeline */
  var formDataTimeline = new FormData();
  var flagContent = false;
  var flagImage = false;

  $(document).on("keyup", ".timeline-edit__area", function () {
    var str = $(".timeline-edit__text").text();
    var sum = Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;

    if (sum >= 1) {
      flagContent = true;
      $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');

      $('#timeline-btn-submit').removeAttr('disabled');
    } else {
      flagContent = false;
      if (flagImage || flagContent) {
        $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');
        $('#timeline-btn-submit').removeAttr('disabled');
      } else {
        $('#timeline-btn-submit').removeClass('btn-submit-timeline-blue');
        $('#timeline-btn-submit').attr('disabled', 'disabled');
      }
    }
    if (sum > 240) {
      return false;
    }

    $(".timeline-edit-sum__text").text(sum.toFixed());
  });

  $(document).on("keydown", ".timeline-edit__area", function (e) {
    var str = $(".timeline-edit__text").text();
    var sum = Array.from(str.split(/['\ud83c[\udf00-\udfff]','\ud83d[\udc00-\ude4f]','\ud83d[\ude80-\udeff]', ' ']/).join("|")).length;

    var keyCode = e.keyCode;

    if (keyCode == 8 || keyCode == 46 || keyCode == 37 || keyCode == 39) {
      return true;
    }

    if (sum >= 240) {
      return false;
    }

    flagContent = true;
    $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');
    $('#timeline-btn-submit').removeAttr('disabled');
  });

  $(document).on("keydown", "#positionInput", function (e) {
    var sum = $("#positionInput").val().length;
    var keyCode = e.keyCode;

    if (keyCode == 8 || keyCode == 46 || keyCode == 37 || keyCode == 39) {
      return true;
    }

    if (sum >= 20) {
      return false;
    }
  });

  /////////////////////////////////
  //   timeline image
  ////////////////////////////////


  var timelineEditPic = $(".timeline-edit-pic");
  var timelineEditCamera = $(".timeline-edit-camera");

  timelineEditPic.on("change", function (e) {
    formDataTimeline.delete('image');
    var _insertPicture = e.target.files[0];

    postImage(_insertPicture);
  });

  timelineEditCamera.on("change", function (e) {
    formDataTimeline.delete('image');
    var _insertPicture = e.target.files[0];

    postImage(_insertPicture);
  });

  function postImage(img) {
    $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');
    var reader = new FileReader();

    reader.onload = function (e) {
      $('.timeline-edit-image').empty();

      $('.timeline-edit__area').append('<div class=\'timeline-edit-image\' contenteditable=\'false\'><img src=' + e.target.result + '><div class=\'timeline-edit-image__del\'><img src=\'/assets/web/images/timeline/timeline-create-img_del.svg\'></div></div>');
    };
    reader.readAsDataURL(img);
    formDataTimeline.append('image', img);
    flagImage = true;
    $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');
    $('#timeline-btn-submit').removeAttr('disabled');
  }

  $(document).on("click", ".timeline-edit-image__del", function () {
    formDataTimeline.delete('image');
    $(".timeline-edit-pic").append("<input type='file' style='display: none' name='image' accept='image/*'>");
    $(".timeline-edit-camera").append("<input type='file' style='display: none' name='image' accept='image/*'>");
    $(this).parent(".timeline-edit-image").fadeOut(300, function () {
      $(this).remove();
    });

    flagImage = false;
    if (flagImage || flagContent) {
      $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');
      $('#timeline-btn-submit').removeAttr('disabled');
    } else {
      $('#timeline-btn-submit').removeClass('btn-submit-timeline-blue');
      $('#timeline-btn-submit').attr('disabled', 'disabled');
    }

    $('.timeline-edit__text').focus();
  });

  //////////////////////////////////////
  //          timeline-edit-position
  /////////////////////////////////

  var $timelineEditPosition = $(".timeline-edit-position img");

  $(document).on("click", "#positionOk", function () {
    var positionText = $("#positionInput").val();
    $(".user-info__bottom p").text(positionText);
    document.getElementById('add-location').click();
  });

  var userId = $('#create-timeline-user-id').val();

  $('#timeline-btn-submit').on('click', function () {
    $('#timeline-btn-submit').attr('disabled', 'disabled');
    var location = $('.user-info__bottom p').text().trim();
    var content = $('.timeline-edit__text').html().replace(/<div>/gi, '\n').replace(/<\/div>/gi, '').replace(/<br>/gi, '\n');

    var text = $('.timeline-edit__text').text().trim();
    if (formDataTimeline != '') {
      formDataTimeline.append('content', content);
    }

    if (location !== null) {
      formDataTimeline.append('location', location);
    }

    formDataTimeline.append('user_id', userId);

    if (flagImage || text != '') {
      window.axios.post('/api/v1/timelines/create', formDataTimeline).then(function (response) {
        window.location.href = '/timelines';
      }).catch(function (error) {
        console.log(error);
      });
    }
  });

  //////////////////////////////////////
  //          timeline-delete-post
  /////////////////////////////////

  $('.timeline .btn_cancel').on('click', function () {
    $('#del-post-timeline').trigger('click');
  });

  $('.timeline-edit__text').bind("DOMSubtreeModified", function () {
    var str = $(".timeline-edit__text").text();
    var sum = Array.from(str.split(/['\ud83c[\udf00-\udfff]','\ud83d[\udc00-\ude4f]','\ud83d[\ude80-\udeff]', ' ']/).join("|")).length;

    if (sum > 240) {
      $(this).html(Array.from(str.split(/['\ud83c[\udf00-\udfff]','\ud83d[\udc00-\ude4f]','\ud83d[\ude80-\udeff]', ' ']/).join("|")).slice(0, 240));
      setCaretPosition('timeline-edit-content', str);
    }

    $('#timeline-btn-submit').addClass('btn-submit-timeline-blue');
    $('#timeline-btn-submit').removeAttr('disabled');

    if (sum > 0) {
      $('.timeline-edit__text').removeClass('pl');
    } else {
      $('.timeline-edit__text').addClass('pl');
    }
  });

  $(".timeline-edit__text").bind({
    paste: function paste(e) {
      e.preventDefault();
      var text = '';
      if (e.clipboardData || e.originalEvent.clipboardData) {
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
      } else if (window.clipboardData) {
        text = window.clipboardData.getData('Text');
      }
      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
      } else {
        document.execCommand('paste', false, text);
      }

      setTimeout(function () {
        var str = $(".timeline-edit__text").text();
        var sum = Array.from(str.split(/['\ud83c[\udf00-\udfff]','\ud83d[\udc00-\ude4f]','\ud83d[\ude80-\udeff]', ' ']/).join("|")).length;
        $(".timeline-edit-sum__text").text(sum.toFixed());
      }, 100);
    }
  });

  $("#positionInput").bind({
    paste: function paste() {
      setTimeout(function () {
        var str = $("#positionInput").val();
        if (str.length > 20) {
          $("#positionInput").val(str.slice(0, 20));
          $('#positionInput').focus();
        }
      }, 100);
    }
  });

  $("#positionInput").on('change', function () {
    var str = $("#positionInput").val();
    if (str.length > 20) {
      $("#positionInput").val(str.slice(0, 20));
      $('#positionInput').focus();
    }
  });
  /* End Post timeline */
});

function setCaretPosition(elementId, str) {
  var editableDiv = document.getElementById(elementId);
  var selection = window.getSelection();
  selection.collapse(editableDiv.childNodes[editableDiv.childNodes.length - 1], str.length);
}

/***/ }),

/***/ "./resources/assets/js/web/pages/timelines_index.js":
/***/ (function(module, exports, __webpack_require__) {

var PullToRefresh = __webpack_require__("./node_modules/pulltorefreshjs/dist/index.umd.js");
var userType = {
    'GUEST': 1,
    'CAST': 2,
    'ADMIN': 3
};

function handleFavouritedTimelines(link) {
    $('body').on('click', ".timeline-like__icon", function () {
        var id = $(this).data("id");
        var selected = $(this);
        window.axios.post('/api/v1/timelines/' + id + '/favorites').then(function (response) {
            if (response.data.data.is_favourited) {
                selected.html('<img src="' + btnLike + '">');
            } else {
                selected.html('<img src="' + btnNotLike + '">');
            }

            selected.next().html('<a href="' + link + '/' + response.data.data.id + '">' + response.data.data.total_favorites + '</a>');
        }).catch(function (error) {
            console.log(error);
            if (error.response.status == 401) {
                window.location = '/login';
            }
        });
    });
}

function handleDelTimeline() {
    $('body').on('click', ".timeline-delete", function () {
        var id = $(this).data("id");
        console.log('123123123');
        $('#btn-del-timeline').data('id', '');
        $('#btn-del-timeline').data('id', id);

        $('#timeline-del').prop('checked', true);
    });

    $('body').on('click', "#btn-del-timeline", function () {
        var id = $(this).data("id");
        if (id) {
            window.axios.delete('/api/v1/timelines/' + id).then(function (response) {
                $('#timeline-del').prop('checked', false);
                $('#timeline-' + id).remove();
            }).catch(function (error) {
                console.log(error);
                if (error.response.status == 401) {
                    window.location = '/login';
                }

                if (error.response.status == 404) {
                    $('#timeline-not-found').prop('checked', true);
                }
            });
        } else {
            window.location = '/login';
        }
    });
}

$(document).ready(function () {
    var helper = __webpack_require__("./resources/assets/js/web/pages/helper.js");
    if ($('#timeline-index').length) {
        var needToLoadmore = function needToLoadmore() {
            return requesting == false && $(window).scrollTop() >= $(document).height() - windowHeight - 1000;
        };

        var handleOnLoadMore = function handleOnLoadMore() {
            // Improve load list image
            $('.lazy').lazy({
                placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7..."
            });
            if (needToLoadmore()) {
                var url = $('#next_page').val();

                if (url) {
                    $('.js-loading').removeClass('css-loading-none');
                    requesting = true;

                    window.axios.get(loadMoreTimelines, {
                        params: { next_page: url }
                    }).then(function (res) {
                        res = res.data;
                        $('#next_page').val(res.next_page || '');
                        $('#next_page').before(res.view);

                        requesting = false;
                        // Add page loading icon
                        $('.js-loading').addClass('css-loading-none');
                    }).catch(function () {
                        requesting = false;
                        // Add page loading icon
                        $('.js-loading').addClass('css-loading-none');
                    });
                }
            }
        };

        var userId = null;
        if ($('#user_id_timelines').length) {
            userId = $('#user_id_timelines').val();
        }

        var params = {
            user_id: userId
        };

        window.axios.get('/api/v1/timelines', { params: params }).then(function (response) {
            var data = response.data;
            var timelines = data.data.data;
            var html = '';

            timelines.forEach(function (val) {
                if (val.user.avatars.length) {
                    if (val.user.avatars[0].path) {
                        var show = '<img src= "' + val.user.avatars[0].thumbnail + '"  >';
                    } else {
                        var show = '<img src= "' + avatarsDefault + '"  >';
                    }
                } else {
                    var show = '<img src= "' + avatarsDefault + '"  >';
                }

                var link = showDetail + '/' + val.id;

                html += '<div class="timeline-item" id="timeline-' + val.id + '"> <div class="user-info"> <div class="user-info__profile"> ';
                if (userType.GUEST == val.user.type) {
                    html += '<a href="' + guestDetail + '/' + val.user.id + '">';
                } else {
                    html += '<a href="' + castDetail + '/' + val.user.id + '">';
                }
                html += show + '</a></div>';
                html += '<a href="' + link + '">';
                html += '<div class="user-info__text"> <div class="user-info__top">';
                html += '<p>' + val.user.nickname + '</p>' + '<p>' + val.user.age + '歳</p> </div> ';
                html += '<div class="user-info__bottom">';
                if (val.location.length >= 18) {
                    html += '<p style="font-size: 10px">';
                } else {
                    html += '<p>';
                }

                html += val.location + (val.location ? '・' : '') + moment(val.created_at).format('MM/DD HH:mm') + '</p> </div></div> </a>';

                if ($('#user_id_login').val() == val.user.id) {
                    html += '<div class="timeline-delete" data-id="' + val.id + '"> <img src="' + btnTimelineDel + '" alt=""> </div>';
                }

                html += '</div>';
                html += '<div class="timeline-content"> <a href="' + link + '"> <div class="timeline-article"> <div class="timeline-article__text init-text-justify">';
                html += val.content.replace(/\n/g, "<br />") + '</div></div>';

                if (val.image) {
                    html += '<div class="timeline-images"> <div class="timeline-images__list"> <div class="timeline-images__item">';
                    html += '<img class="rotate" src="' + val.image + '" width="100%"></div></div></div>';
                }

                html += '</a><div class="timeline-like"> <button class="timeline-like__icon" data-id="' + val.id + '">';
                if (val.is_favourited) {
                    html += '<img src="' + btnLike + '"> </button>';
                } else {
                    html += '<img src="' + btnNotLike + '"> </button>';
                }

                html += '<p class="timeline-like__sum"><a href="' + link + '">' + val.total_favorites + '</a> </p> </div></div></div>';
            });

            var nextPage = '';
            if (data.data.next_page_url) {
                var nextPage = data.data.next_page_url;
            }

            html += '<input type="hidden" id="next_page" value="' + nextPage + '" />';
            html += loadingIconButtom;

            $('.timeline-list').html(html);
            setTimeout(function () {
                var imgs = document.getElementsByClassName('rotate');
                if (imgs.length > 0) {
                    var _loop = function _loop(img) {
                        EXIF.getData(img, function () {
                            var orientation = EXIF.getTag(this, "Orientation");
                            if (orientation === 6) {
                                img.setAttribute('style', 'transform: rotate(90deg)');
                            }
                        });
                    };

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = imgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var img = _step.value;

                            _loop(img);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
            }, 1000);
        }).catch(function (error) {
            console.log(error);
            if (error.response.status == 401) {
                window.location = '/login';
            }
        });
        /*Load more list cast order*/
        var requesting = false;
        var windowHeight = $(window).height();

        setTimeout(function () {
            $(document).on('scroll', handleOnLoadMore);
            $(document).ready(handleOnLoadMore);
        }, 500);

        handleFavouritedTimelines(showDetail);
        handleDelTimeline();
    }

    var loadingIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-eclipse" style="background: none;"><path ng-attr-d="{{config.pathCmd}}" ng-attr-fill="{{config.color}}" stroke="none" d="M10 50A40 40 0 0 0 90 50A40 55 0 0 1 10 50" fill="#30ccc3" transform="rotate(255.455 50 57.5)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 57.5;360 50 57.5" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"/></path></svg>';
    if ($('#timeline-index').length) {
        var ptr = PullToRefresh.init({
            mainElement: '#timeline-index',
            instructionsPullToRefresh: ' ',
            instructionsReleaseToRefresh: ' ',
            iconArrow: loadingIcon,
            iconRefreshing: loadingIcon,
            instructionsRefreshing: ' ',
            shouldPullToRefresh: function shouldPullToRefresh() {
                var divTop = $('#timeline-index').offset().top;
                if ($(window).scrollTop() > divTop - 110) {
                    return false;
                } else {
                    return true;
                }
            },
            onRefresh: function onRefresh() {
                window.location.reload();
            }
        });
    }

    var loadingIconButtom = '<div class="sk-circle js-loading css-loading-none">\n            <div class="sk-circle1 sk-child"></div>\n            <div class="sk-circle2 sk-child"></div>\n            <div class="sk-circle3 sk-child"></div>\n            <div class="sk-circle4 sk-child"></div>\n            <div class="sk-circle5 sk-child"></div>\n            <div class="sk-circle6 sk-child"></div>\n            <div class="sk-circle7 sk-child"></div>\n            <div class="sk-circle8 sk-child"></div>\n            <div class="sk-circle9 sk-child"></div>\n            <div class="sk-circle10 sk-child"></div>\n            <div class="sk-circle11 sk-child"></div>\n            <div class="sk-circle12 sk-child"></div>\n          </div>\n        </div>';
});

/***/ }),

/***/ "./resources/assets/js/web/pages/update_profile.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    $('#gm1.gm1-edit .phone.arrow:after').css({
      '-webkit-transform': 'translateY(-60%) translateX(-2px) rotate(404deg)',
      '-ms-transform': 'translateY(-60%) translateX(-2px) rotate(404deg)',
      'transform': 'translateY(-60%) translateX(-2px) rotate(404deg)'
    });
  }

  var maxYear = $('#date-of-birth').attr('max');

  $("#date-of-birth").on("change", function () {
    var today = new Date() / 1000;
    var date = new Date($(this).val()) / 1000;

    var range = (today - date) / (24 * 60 * 60 * 365);
    var age = Math.floor(range);

    $('#age').html(age + '歳 ');

    this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format(this.getAttribute("data-date-format")));
  }).trigger("change");

  $('.hidden').hide();

  $('#update-profile').submit(function (e) {
    e.preventDefault();
  }).validate({
    rules: {
      nickname: {
        required: true,
        maxlength: 20
      },
      date_of_birth: {
        required: true,
        max: maxYear
      },
      intro: {
        maxlength: 30
      },
      description: {
        maxlength: 1000
      }
    },
    messages: {
      date_of_birth: {
        required: "生年月日は、必ず指定してください。",
        max: '年齢は20歳以上で入力してください。'
      },
      nickname: {
        required: "ニックネームは、必ず指定してください。",
        maxlength: "20文字以内で入力してください。"
      },
      intro: {
        maxlength: "30文字以内で入力してください。"
      },
      description: {
        maxlength: "1000文字以内で入力してください。"
      }
    },

    submitHandler: function submitHandler(form) {
      if ($('.css-img #valid').length < 1) {
        if (document.getElementById('upload').files.length <= 0) {
          $('.image-error').html('imageには、画像を指定してください。');
          return false;
        }
      }

      var params = {
        nickname: $('#nickname').val(),
        date_of_birth: $('#date-of-birth').val(),
        gender: $('#gender').val(),
        intro: $('#intro').val(),
        description: $('#description').val(),
        prefecture_id: $('#prefecture-id').val(),
        cost: $('#cost').val(),
        salary_id: $('#salary-id').val(),
        height: $('#height').val(),
        body_type_id: $('#body-type-id').val(),
        hometown_id: $('#hometown-id').val(),
        job_id: $('#job-id').val(),
        drink_volume_type: $('#drink-volume-type').val(),
        smoking_type: $('#smoking-type').val(),
        siblings_type: $('#siblings-type').val(),
        cohabitant_type: $('#cohabitant-type').val()
      };

      var name = $('#name').val();
      var day = $('#day').val();
      var img = $('#img').val();

      Object.keys(params).forEach(function (key) {
        if (!params[key]) {
          delete params[key];
        }
      });

      $('.help-block').each(function () {
        $(this).html('');
      });

      window.axios.post('/api/v1/auth/update', params).then(function (response) {
        if (!name || !day) {
          window.sessionStorage.setItem('popup_mypage', 'プロフィール登録が完了しました');
          window.location.href = '/mypage';
        } else {
          window.sessionStorage.setItem('popup_profile', 'プロフィール登録が完了しました');
          window.location.href = '/profile';
        }
      }).catch(function (error) {
        if (error.response.status == 401) {
          window.location = '/login/line';
        }

        if (error.response.data.error) {
          var errors = error.response.data.error;

          Object.keys(errors).forEach(function (field) {
            $('[data-field="' + field + '"].help-block').html(errors[field][0]);
          });
        };
      });
    }
  });

  $('body').on('change', "#prefecture-id", function () {
    $(this).css('color', 'black');
  });

  $('body').on('change', "#date-of-birth", function () {
    $('.show-message-error').css('display', 'none');
  });

  $('#update-date-of-birth').submit(function (e) {
    e.preventDefault();
  }).validate({
    rules: {
      date_of_birth: {
        required: true,
        max: maxYear
      },

      prefecture_id: {
        required: true
      }
    },

    messages: {
      date_of_birth: {
        required: "生年月日を入力してください",
        max: '20歳未満の方は、ご利用いただけません'
      },
      prefecture_id: {
        required: "ご利用エリアを入力してください"
      }
    },

    submitHandler: function submitHandler(form) {
      var param = {
        date_of_birth: $('#date-of-birth').val(),
        prefecture_id: $('#prefecture-id').val()
        // invite_code: $('#input_invite-code').val(),
      };

      if (!param['date_of_birth']) {
        delete param['date_of_birth'];
      }

      if (!param['prefecture_id']) {
        delete param['prefecture_id'];
      }

      $('.help-block').each(function () {
        $(this).html('');
      });

      window.axios.post('/api/v1/auth/update', param).then(function (response) {
        window.sessionStorage.setItem('popup_mypage', '登録が完了しました');
        window.location.href = '/mypage';
      }).catch(function (error) {
        if (error.response.status == 401) {
          window.location = '/login/line';
        }

        // if(error.response.status == 404) {
        //   $('#invite-code-error').prop('checked',true);
        // }

        if (error.response.status == 409) {
          $('#date-of-birth-error').prop('checked', true);
        }
      });
    }
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/upload_avatar.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  $('#upload-avatar').on('click', function (e) {
    $('#upload').trigger('click');
  });

  $('#upload').on('change', function (e) {
    var data = new FormData();
    data.append('image', document.getElementById('upload').files[0]);

    window.axios.post('/api/v1/avatars', data).then(function (response) {
      window.location = '/profile/edit';
    }).catch(function (error) {
      if (error.response.status == 401) {
        window.location = '/login/line';
      }
    });
  });
});

/***/ }),

/***/ "./resources/assets/js/web/pages/verify.js":
/***/ (function(module, exports) {

$(document).ready(function () {
  var isVerify = null;
  var oldPhone = $('#old-phone').val();

  $('#profile-verify-code').submit(function (e) {
    e.preventDefault();
  }).validate({
    rules: {
      phone: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 11
      }
    },
    messages: {
      phone: {
        required: '正しい電話番号を入力してください',
        number: '正しい電話番号を入力してください',
        minlength: '正しい電話番号を入力してください',
        maxlength: '正しい電話番号を入力してください'
      }
    },

    submitHandler: function submitHandler(form) {
      var param = {
        phone: $('#phone').val()
      };

      if (oldPhone == param['phone']) {
        $('.error-phone').html('入力された電話番号はすでに登録されています');
        $('.error-phone').css('display', '');
        return false;
      }

      $('.error-phone').each(function () {
        $(this).html('');
      });

      window.axios.post('/api/v1/auth/verify_code', param).then(function (response) {
        window.location.href = '/verify/code';
      }).catch(function (error) {
        console.log(error);
        if (error.response.status == 401) {
          window.location = '/login/line';
        }

        if (error.response.data.error) {
          var errors = error.response.data.error;

          Object.keys(errors).forEach(function (field) {
            $('[data-field="' + field + '"].help-block').html(errors[field][0]);
            $('[data-field="' + field + '"].help-block').css('display', '');
          });
        };
      });
    }
  });

  $('#code-number-1').focus();

  $('#phone-number-verify').on('keyup', function () {
    var phoneNumber = $('#phone-number-verify').val();
    var phoneNumberLen = phoneNumber.length;
    if (phoneNumberLen == 11 || phoneNumberLen == 10) {
      $('#send-number').removeClass('number-phone-verify-wrong');
      $('#send-number').addClass('number-phone-verify-correct');
    } else {
      $('#send-number').removeClass('number-phone-verify-correct');
      $('#send-number').addClass('number-phone-verify-wrong');
    }
  });

  $('#send-number').click(function (event) {
    if ($('#send-number').attr('class') == 'number-phone-verify-correct') {
      var formData = new FormData();
      var phone = $('#phone-number-verify').val();
      formData.append('phone', phone);

      window.axios.post('/api/v1/auth/verify_code', formData).then(function (response) {
        window.location = '/verify/code';
      }).catch(function (error) {
        if (error.response.status == 500) {
          var err = 'この操作は実行できません';
        } else {
          if (error.response.data.error.phone) {
            var err = error.response.data.error.phone[0];
          }
        }
        $('.phone-number-incorrect h2').text(err);
        $('#triggerPhoneNumberIncorrect').trigger('click');
      });
    }
  });

  $('#resend-code').click(function () {
    window.axios.post('/api/v1/auth/resend_code').then(function (response) {
      $('#accept-resend-code').css({
        display: 'none'
      });
      $('#trigger-alert-resend-code').trigger('click');
    }).catch(function (error) {
      console.log(error);
    });
  });

  $('#resend-code-voice').click(function () {
    window.axios.post('/api/v1/auth/send_code_by_call').then(function (response) {
      $('#triggerAcceptResenCodeVoice').trigger('click');
      $('#trigger-alert-resend-code-voice').trigger('click');
    }).catch(function (error) {
      console.log(error);
    });
  });

  $('#code-number-1').on('keyup', function (event) {
    if (event.keyCode != 8 && event.keyCode != 32) {
      $('#code-number-2').focus();
    }
  });

  $('#code-number-2').on('keyup', function (event) {
    if (event.keyCode != 8 && event.keyCode != 32) {
      $('#code-number-3').focus();
    }
  });

  $('#code-number-3').on('keyup', function (event) {
    if (event.keyCode != 8 && event.keyCode != 32) {
      $('#code-number-4').focus();
    }
  });

  $('#code-number-4').on('keyup', function () {
    var isVerify = $('#is-verify').val();

    var formData = new FormData();
    var code = $('#code-number-1').val() + $('#code-number-2').val() + $('#code-number-3').val() + $('#code-number-4').val();
    if (code.length == 4) {
      formData.append('code', code);

      window.axios.post('/api/v1/auth/verify', formData).then(function (response) {
        $('#code-number-4').blur();
        $('#verify-success').trigger('click');

        if (isVerify != 0) {
          setTimeout(function () {
            window.location.href = '/profile';
          }, 3000);
        } else {
          setTimeout(function () {
            window.location.href = '/mypage';
          }, 3000);
        }
      }).catch(function (error) {
        $('#code-number-4').blur();
        $('#accept-resend-code').css({
          display: 'block'
        });
        $('#triggerVerifyIncorrect').trigger('click');
      });
    }
  });

  $('#code-verify .enter-number input').blur(function (event) {
    $('#code-verify footer').css({
      display: 'none'
    });
  });

  $('#code-number-1').on('click', function (event) {
    $('#code-verify footer').css({
      display: 'none'
    });
  });

  $('#request-resend-code').click(function (event) {
    $('#triggerAcceptResenCode').trigger('click');
  });

  $('#request-resend-code-voice').click(function (event) {
    $('#triggerAcceptResenCodeVoice').trigger('click');
  });

  $('#deny-resend').click(function (event) {
    $('#accept-resend-code').css({
      display: 'none'
    });
    location.reload();
  });

  $('#resend-success').click(function (event) {
    location.reload();
  });
});

/***/ }),

/***/ 0:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./resources/assets/js/web.js");


/***/ })

/******/ });