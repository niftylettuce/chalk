"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

var escapeStringRegexp = require('escape-string-regexp');

var ansiStyles = require('ansi-styles');

var stdoutColor = require('supports-color').stdout; // determine if we're in a browser


var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'; // if we're in a browser then we DO support colors
// but we need to make it aware to users that they need to
// use ansicolor <https://github.com/xpl/ansicolor>

if (isBrowser) stdoutColor = {
  level: 3,
  hasBasic: true,
  has256: true,
  has16m: true
};

var template = require('./templates.js');

var isSimpleWindowsTerm = process.platform === 'win32' && !(process.env.TERM || '').toLowerCase().startsWith('xterm'); // `supportsColor.level` → `ansiStyles.color[name]` mapping

var levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m']; // `color-convert` models to exclude from the Chalk API due to conflicts

var skipModels = new Set(['gray']);
var styles = Object.create(null);

function applyOptions(obj, options) {
  options = options || {}; // Detect level if not set manually

  var scLevel = stdoutColor ? stdoutColor.level : 0;
  obj.level = options.level === undefined ? scLevel : options.level;
  obj.enabled = 'enabled' in options ? options.enabled : obj.level > 0;
}

function Chalk(options) {
  // We check for this.template here since calling `chalk.constructor()`
  // by itself will have a `this` of a previously constructed chalk object
  if (!this || !_instanceof(this, Chalk) || this.template) {
    var chalk = {};
    applyOptions(chalk, options);

    chalk.template = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return chalkTag.apply(void 0, _toConsumableArray([chalk.template].concat(args)));
    };

    Object.setPrototypeOf(chalk, Chalk.prototype);
    Object.setPrototypeOf(chalk.template, chalk);
    chalk.template.constructor = Chalk;
    return chalk.template;
  }

  applyOptions(this, options);
} // Use bright blue on Windows as the normal blue color is illegible


if (isSimpleWindowsTerm) {
  ansiStyles.blue.open = "\x1B[94m";
}

var _arr = Object.keys(ansiStyles);

var _loop = function _loop() {
  var key = _arr[_i];
  ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
  styles[key] = {
    get: function get() {
      var codes = ansiStyles[key];
      return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, key);
    }
  };
};

for (var _i = 0; _i < _arr.length; _i++) {
  _loop();
}

styles.visible = {
  get: function get() {
    return build.call(this, this._styles || [], true, 'visible');
  }
};
ansiStyles.color.closeRe = new RegExp(escapeStringRegexp(ansiStyles.color.close), 'g');

var _arr2 = Object.keys(ansiStyles.color.ansi);

var _loop2 = function _loop2() {
  var model = _arr2[_i2];

  if (skipModels.has(model)) {
    return "continue";
  }

  styles[model] = {
    get: function get() {
      var level = this.level;
      return function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var open = ansiStyles.color[levelMapping[level]][model].apply(null, args);
        var codes = {
          open: open,
          close: ansiStyles.color.close,
          closeRe: ansiStyles.color.closeRe
        };
        return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
      };
    }
  };
};

for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
  var _ret = _loop2();

  if (_ret === "continue") continue;
}

ansiStyles.bgColor.closeRe = new RegExp(escapeStringRegexp(ansiStyles.bgColor.close), 'g');

var _arr3 = Object.keys(ansiStyles.bgColor.ansi);

var _loop3 = function _loop3() {
  var model = _arr3[_i3];

  if (skipModels.has(model)) {
    return "continue";
  }

  var bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
  styles[bgModel] = {
    get: function get() {
      var level = this.level;
      return function () {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        var open = ansiStyles.bgColor[levelMapping[level]][model].apply(null, args);
        var codes = {
          open: open,
          close: ansiStyles.bgColor.close,
          closeRe: ansiStyles.bgColor.closeRe
        };
        return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
      };
    }
  };
};

for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
  var _ret2 = _loop3();

  if (_ret2 === "continue") continue;
}

var proto = Object.defineProperties(function () {}, styles);

function build(_styles, _empty, key) {
  var builder = function builder() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return applyStyle.apply(builder, args);
  };

  builder._styles = _styles;
  builder._empty = _empty;
  var self = this;
  Object.defineProperty(builder, 'level', {
    enumerable: true,
    get: function get() {
      return self.level;
    },
    set: function set(level) {
      self.level = level;
    }
  });
  Object.defineProperty(builder, 'enabled', {
    enumerable: true,
    get: function get() {
      return self.enabled;
    },
    set: function set(enabled) {
      self.enabled = enabled;
    }
  }); // See below for fix regarding invisible grey/dim combination on Windows

  builder.hasGrey = this.hasGrey || key === 'gray' || key === 'grey'; // `__proto__` is used because we must return a function, but there is
  // no way to create a function with a different prototype

  builder.__proto__ = proto; // eslint-disable-line no-proto

  return builder;
}

function applyStyle() {
  // Support varags, but simply cast to string in case there's only one arg
  var argsLen = arguments.length;
  var str = String(arguments.length <= 0 ? undefined : arguments[0]);

  if (argsLen === 0) {
    return '';
  }

  if (argsLen > 1) {
    // Don't slice `arguments`, it prevents V8 optimizations
    for (var a = 1; a < argsLen; a++) {
      str += ' ' + (a < 0 || arguments.length <= a ? undefined : arguments[a]);
    }
  }

  if (!this.enabled || this.level <= 0 || !str) {
    return this._empty ? '' : str;
  } // Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
  // see https://github.com/chalk/chalk/issues/58
  // If we're on Windows and we're dealing
  // with a gray color, temporarily make 'dim' a noop.


  var originalDim = ansiStyles.dim.open;

  if (isSimpleWindowsTerm && this.hasGrey) {
    ansiStyles.dim.open = '';
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this._styles.slice().reverse()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var code = _step.value;
      // Replace any instances already present with a re-opening code
      // otherwise only the part of the string until said closing code
      // will be colored, and the rest will simply be 'plain'.
      str = code.open + str.replace(code.closeRe, code.open) + code.close; // Close the styling before a linebreak and reopen
      // after next line to fix a bleed issue on macOS
      // https://github.com/chalk/chalk/pull/92

      str = str.replace(/\r?\n/g, "".concat(code.close, "$&").concat(code.open));
    } // Reset the original `dim` if we changed it to
    // work around the Windows dimmed gray issue

  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ansiStyles.dim.open = originalDim;
  return str;
}

function chalkTag(chalk, strings) {
  if (!Array.isArray(strings)) {
    // If chalk() was called by itself or with a string,
    // return the string itself as a string.
    //
    // TODO: fix rest params later
    // eslint-disable-next-line prefer-rest-params
    return [].slice.call(arguments, 1).join(' ');
  } // TODO: fix rest params later
  // eslint-disable-next-line prefer-rest-params


  var args = [].slice.call(arguments, 2);
  var parts = [strings.raw[0]];

  for (var i = 1; i < strings.length; i++) {
    parts.push(String(args[i - 1]).replace(/[{}\\]/g, '\\$&'));
    parts.push(String(strings.raw[i]));
  }

  return template(chalk, parts.join(''));
}

Object.defineProperties(Chalk.prototype, styles);
module.exports = Chalk(); // eslint-disable-line new-cap

module.exports.supportsColor = stdoutColor;
module.exports.default = module.exports; // For TypeScript
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJlc2NhcGVTdHJpbmdSZWdleHAiLCJyZXF1aXJlIiwiYW5zaVN0eWxlcyIsInN0ZG91dENvbG9yIiwic3Rkb3V0IiwiaXNCcm93c2VyIiwid2luZG93IiwiZG9jdW1lbnQiLCJsZXZlbCIsImhhc0Jhc2ljIiwiaGFzMjU2IiwiaGFzMTZtIiwidGVtcGxhdGUiLCJpc1NpbXBsZVdpbmRvd3NUZXJtIiwicHJvY2VzcyIsInBsYXRmb3JtIiwiZW52IiwiVEVSTSIsInRvTG93ZXJDYXNlIiwic3RhcnRzV2l0aCIsImxldmVsTWFwcGluZyIsInNraXBNb2RlbHMiLCJTZXQiLCJzdHlsZXMiLCJPYmplY3QiLCJjcmVhdGUiLCJhcHBseU9wdGlvbnMiLCJvYmoiLCJvcHRpb25zIiwic2NMZXZlbCIsInVuZGVmaW5lZCIsImVuYWJsZWQiLCJDaGFsayIsImNoYWxrIiwiYXJncyIsImNoYWxrVGFnIiwiY29uY2F0Iiwic2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJjb25zdHJ1Y3RvciIsImJsdWUiLCJvcGVuIiwia2V5cyIsImtleSIsImNsb3NlUmUiLCJSZWdFeHAiLCJjbG9zZSIsImdldCIsImNvZGVzIiwiYnVpbGQiLCJjYWxsIiwiX3N0eWxlcyIsIl9lbXB0eSIsInZpc2libGUiLCJjb2xvciIsImFuc2kiLCJtb2RlbCIsImhhcyIsImFwcGx5IiwiYmdDb2xvciIsImJnTW9kZWwiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwicHJvdG8iLCJkZWZpbmVQcm9wZXJ0aWVzIiwiYnVpbGRlciIsImFwcGx5U3R5bGUiLCJzZWxmIiwiZGVmaW5lUHJvcGVydHkiLCJlbnVtZXJhYmxlIiwic2V0IiwiaGFzR3JleSIsIl9fcHJvdG9fXyIsImFyZ3NMZW4iLCJsZW5ndGgiLCJzdHIiLCJTdHJpbmciLCJhIiwib3JpZ2luYWxEaW0iLCJkaW0iLCJyZXZlcnNlIiwiY29kZSIsInJlcGxhY2UiLCJzdHJpbmdzIiwiQXJyYXkiLCJpc0FycmF5IiwiYXJndW1lbnRzIiwiam9pbiIsInBhcnRzIiwicmF3IiwiaSIsInB1c2giLCJtb2R1bGUiLCJleHBvcnRzIiwic3VwcG9ydHNDb2xvciIsImRlZmF1bHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLHFCQUFxQkMsUUFBUSxzQkFBUixDQUEzQjs7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7O0FBQ0EsSUFBSUUsY0FBY0YsUUFBUSxnQkFBUixFQUEwQkcsTUFBNUMsQyxDQUVBOzs7QUFDQSxJQUFNQyxZQUNKLE9BQU9DLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUMsT0FBT0EsT0FBT0MsUUFBZCxLQUEyQixXQUQ5RCxDLENBR0E7QUFDQTtBQUNBOztBQUNBLElBQUlGLFNBQUosRUFDRUYsY0FBYztBQUNaSyxTQUFPLENBREs7QUFFWkMsWUFBVSxJQUZFO0FBR1pDLFVBQVEsSUFISTtBQUlaQyxVQUFRO0FBSkksQ0FBZDs7QUFPRixJQUFNQyxXQUFXWCxRQUFRLGdCQUFSLENBQWpCOztBQUVBLElBQU1ZLHNCQUNKQyxRQUFRQyxRQUFSLEtBQXFCLE9BQXJCLElBQ0EsQ0FBQyxDQUFDRCxRQUFRRSxHQUFSLENBQVlDLElBQVosSUFBb0IsRUFBckIsRUFBeUJDLFdBQXpCLEdBQXVDQyxVQUF2QyxDQUFrRCxPQUFsRCxDQUZILEMsQ0FJQTs7QUFDQSxJQUFNQyxlQUFlLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsU0FBakIsRUFBNEIsU0FBNUIsQ0FBckIsQyxDQUVBOztBQUNBLElBQU1DLGFBQWEsSUFBSUMsR0FBSixDQUFRLENBQUMsTUFBRCxDQUFSLENBQW5CO0FBRUEsSUFBTUMsU0FBU0MsT0FBT0MsTUFBUCxDQUFjLElBQWQsQ0FBZjs7QUFFQSxTQUFTQyxZQUFULENBQXNCQyxHQUF0QixFQUEyQkMsT0FBM0IsRUFBb0M7QUFDbENBLFlBQVVBLFdBQVcsRUFBckIsQ0FEa0MsQ0FHbEM7O0FBQ0EsTUFBTUMsVUFBVTFCLGNBQWNBLFlBQVlLLEtBQTFCLEdBQWtDLENBQWxEO0FBQ0FtQixNQUFJbkIsS0FBSixHQUFZb0IsUUFBUXBCLEtBQVIsS0FBa0JzQixTQUFsQixHQUE4QkQsT0FBOUIsR0FBd0NELFFBQVFwQixLQUE1RDtBQUNBbUIsTUFBSUksT0FBSixHQUFjLGFBQWFILE9BQWIsR0FBdUJBLFFBQVFHLE9BQS9CLEdBQXlDSixJQUFJbkIsS0FBSixHQUFZLENBQW5FO0FBQ0Q7O0FBRUQsU0FBU3dCLEtBQVQsQ0FBZUosT0FBZixFQUF3QjtBQUN0QjtBQUNBO0FBQ0EsTUFBSSxDQUFDLElBQUQsSUFBUyxhQUFFLElBQUYsRUFBa0JJLEtBQWxCLENBQVQsSUFBcUMsS0FBS3BCLFFBQTlDLEVBQXdEO0FBQ3RELFFBQU1xQixRQUFRLEVBQWQ7QUFDQVAsaUJBQWFPLEtBQWIsRUFBb0JMLE9BQXBCOztBQUVBSyxVQUFNckIsUUFBTixHQUFpQixZQUFrQjtBQUFBLHdDQUFOc0IsSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQ2pDLGFBQU9DLDBDQUFZLENBQUNGLE1BQU1yQixRQUFQLEVBQWlCd0IsTUFBakIsQ0FBd0JGLElBQXhCLENBQVosRUFBUDtBQUNELEtBRkQ7O0FBSUFWLFdBQU9hLGNBQVAsQ0FBc0JKLEtBQXRCLEVBQTZCRCxNQUFNTSxTQUFuQztBQUNBZCxXQUFPYSxjQUFQLENBQXNCSixNQUFNckIsUUFBNUIsRUFBc0NxQixLQUF0QztBQUVBQSxVQUFNckIsUUFBTixDQUFlMkIsV0FBZixHQUE2QlAsS0FBN0I7QUFFQSxXQUFPQyxNQUFNckIsUUFBYjtBQUNEOztBQUVEYyxlQUFhLElBQWIsRUFBbUJFLE9BQW5CO0FBQ0QsQyxDQUVEOzs7QUFDQSxJQUFJZixtQkFBSixFQUF5QjtBQUN2QlgsYUFBV3NDLElBQVgsQ0FBZ0JDLElBQWhCLEdBQXVCLFVBQXZCO0FBQ0Q7O1dBRWlCakIsT0FBT2tCLElBQVAsQ0FBWXhDLFVBQVosQzs7O0FBQWIsTUFBTXlDLGNBQU47QUFDSHpDLGFBQVd5QyxHQUFYLEVBQWdCQyxPQUFoQixHQUEwQixJQUFJQyxNQUFKLENBQ3hCN0MsbUJBQW1CRSxXQUFXeUMsR0FBWCxFQUFnQkcsS0FBbkMsQ0FEd0IsRUFFeEIsR0FGd0IsQ0FBMUI7QUFLQXZCLFNBQU9vQixHQUFQLElBQWM7QUFDWkksT0FEWSxpQkFDTjtBQUNKLFVBQU1DLFFBQVE5QyxXQUFXeUMsR0FBWCxDQUFkO0FBQ0EsYUFBT00sTUFBTUMsSUFBTixDQUNMLElBREssRUFFTCxLQUFLQyxPQUFMLEdBQWUsS0FBS0EsT0FBTCxDQUFhZixNQUFiLENBQW9CWSxLQUFwQixDQUFmLEdBQTRDLENBQUNBLEtBQUQsQ0FGdkMsRUFHTCxLQUFLSSxNQUhBLEVBSUxULEdBSkssQ0FBUDtBQU1EO0FBVFcsR0FBZDs7O0FBTkYseUNBQTJDO0FBQUE7QUFpQjFDOztBQUVEcEIsT0FBTzhCLE9BQVAsR0FBaUI7QUFDZk4sS0FEZSxpQkFDVDtBQUNKLFdBQU9FLE1BQU1DLElBQU4sQ0FBVyxJQUFYLEVBQWlCLEtBQUtDLE9BQUwsSUFBZ0IsRUFBakMsRUFBcUMsSUFBckMsRUFBMkMsU0FBM0MsQ0FBUDtBQUNEO0FBSGMsQ0FBakI7QUFNQWpELFdBQVdvRCxLQUFYLENBQWlCVixPQUFqQixHQUEyQixJQUFJQyxNQUFKLENBQ3pCN0MsbUJBQW1CRSxXQUFXb0QsS0FBWCxDQUFpQlIsS0FBcEMsQ0FEeUIsRUFFekIsR0FGeUIsQ0FBM0I7O1lBSW9CdEIsT0FBT2tCLElBQVAsQ0FBWXhDLFdBQVdvRCxLQUFYLENBQWlCQyxJQUE3QixDOzs7QUFBZixNQUFNQyxrQkFBTjs7QUFDSCxNQUFJbkMsV0FBV29DLEdBQVgsQ0FBZUQsS0FBZixDQUFKLEVBQTJCO0FBQ3pCO0FBQ0Q7O0FBRURqQyxTQUFPaUMsS0FBUCxJQUFnQjtBQUNkVCxPQURjLGlCQUNSO0FBQUEsVUFDSXZDLEtBREosR0FDYyxJQURkLENBQ0lBLEtBREo7QUFFSixhQUFPLFlBQWtCO0FBQUEsMkNBQU4wQixJQUFNO0FBQU5BLGNBQU07QUFBQTs7QUFDdkIsWUFBTU8sT0FBT3ZDLFdBQVdvRCxLQUFYLENBQWlCbEMsYUFBYVosS0FBYixDQUFqQixFQUFzQ2dELEtBQXRDLEVBQTZDRSxLQUE3QyxDQUNYLElBRFcsRUFFWHhCLElBRlcsQ0FBYjtBQUlBLFlBQU1jLFFBQVE7QUFDWlAsb0JBRFk7QUFFWkssaUJBQU81QyxXQUFXb0QsS0FBWCxDQUFpQlIsS0FGWjtBQUdaRixtQkFBUzFDLFdBQVdvRCxLQUFYLENBQWlCVjtBQUhkLFNBQWQ7QUFLQSxlQUFPSyxNQUFNQyxJQUFOLENBQ0wsSUFESyxFQUVMLEtBQUtDLE9BQUwsR0FBZSxLQUFLQSxPQUFMLENBQWFmLE1BQWIsQ0FBb0JZLEtBQXBCLENBQWYsR0FBNEMsQ0FBQ0EsS0FBRCxDQUZ2QyxFQUdMLEtBQUtJLE1BSEEsRUFJTEksS0FKSyxDQUFQO0FBTUQsT0FoQkQ7QUFpQkQ7QUFwQmEsR0FBaEI7OztBQUxGLDZDQUF3RDtBQUFBOztBQUFBLDJCQUVwRDtBQXlCSDs7QUFFRHRELFdBQVd5RCxPQUFYLENBQW1CZixPQUFuQixHQUE2QixJQUFJQyxNQUFKLENBQzNCN0MsbUJBQW1CRSxXQUFXeUQsT0FBWCxDQUFtQmIsS0FBdEMsQ0FEMkIsRUFFM0IsR0FGMkIsQ0FBN0I7O1lBSW9CdEIsT0FBT2tCLElBQVAsQ0FBWXhDLFdBQVd5RCxPQUFYLENBQW1CSixJQUEvQixDOzs7QUFBZixNQUFNQyxrQkFBTjs7QUFDSCxNQUFJbkMsV0FBV29DLEdBQVgsQ0FBZUQsS0FBZixDQUFKLEVBQTJCO0FBQ3pCO0FBQ0Q7O0FBRUQsTUFBTUksVUFBVSxPQUFPSixNQUFNLENBQU4sRUFBU0ssV0FBVCxFQUFQLEdBQWdDTCxNQUFNTSxLQUFOLENBQVksQ0FBWixDQUFoRDtBQUNBdkMsU0FBT3FDLE9BQVAsSUFBa0I7QUFDaEJiLE9BRGdCLGlCQUNWO0FBQUEsVUFDSXZDLEtBREosR0FDYyxJQURkLENBQ0lBLEtBREo7QUFFSixhQUFPLFlBQWtCO0FBQUEsMkNBQU4wQixJQUFNO0FBQU5BLGNBQU07QUFBQTs7QUFDdkIsWUFBTU8sT0FBT3ZDLFdBQVd5RCxPQUFYLENBQW1CdkMsYUFBYVosS0FBYixDQUFuQixFQUF3Q2dELEtBQXhDLEVBQStDRSxLQUEvQyxDQUNYLElBRFcsRUFFWHhCLElBRlcsQ0FBYjtBQUlBLFlBQU1jLFFBQVE7QUFDWlAsb0JBRFk7QUFFWkssaUJBQU81QyxXQUFXeUQsT0FBWCxDQUFtQmIsS0FGZDtBQUdaRixtQkFBUzFDLFdBQVd5RCxPQUFYLENBQW1CZjtBQUhoQixTQUFkO0FBS0EsZUFBT0ssTUFBTUMsSUFBTixDQUNMLElBREssRUFFTCxLQUFLQyxPQUFMLEdBQWUsS0FBS0EsT0FBTCxDQUFhZixNQUFiLENBQW9CWSxLQUFwQixDQUFmLEdBQTRDLENBQUNBLEtBQUQsQ0FGdkMsRUFHTCxLQUFLSSxNQUhBLEVBSUxJLEtBSkssQ0FBUDtBQU1ELE9BaEJEO0FBaUJEO0FBcEJlLEdBQWxCOzs7QUFORiw2Q0FBMEQ7QUFBQTs7QUFBQSw0QkFFdEQ7QUEwQkg7O0FBRUQsSUFBTU8sUUFBUXZDLE9BQU93QyxnQkFBUCxDQUF3QixZQUFNLENBQUUsQ0FBaEMsRUFBa0N6QyxNQUFsQyxDQUFkOztBQUVBLFNBQVMwQixLQUFULENBQWVFLE9BQWYsRUFBd0JDLE1BQXhCLEVBQWdDVCxHQUFoQyxFQUFxQztBQUNuQyxNQUFNc0IsVUFBVSxTQUFWQSxPQUFVLEdBQWtCO0FBQUEsdUNBQU4vQixJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFDaEMsV0FBT2dDLFdBQVdSLEtBQVgsQ0FBaUJPLE9BQWpCLEVBQTBCL0IsSUFBMUIsQ0FBUDtBQUNELEdBRkQ7O0FBSUErQixVQUFRZCxPQUFSLEdBQWtCQSxPQUFsQjtBQUNBYyxVQUFRYixNQUFSLEdBQWlCQSxNQUFqQjtBQUVBLE1BQU1lLE9BQU8sSUFBYjtBQUVBM0MsU0FBTzRDLGNBQVAsQ0FBc0JILE9BQXRCLEVBQStCLE9BQS9CLEVBQXdDO0FBQ3RDSSxnQkFBWSxJQUQwQjtBQUV0Q3RCLE9BRnNDLGlCQUVoQztBQUNKLGFBQU9vQixLQUFLM0QsS0FBWjtBQUNELEtBSnFDO0FBS3RDOEQsT0FMc0MsZUFLbEM5RCxLQUxrQyxFQUszQjtBQUNUMkQsV0FBSzNELEtBQUwsR0FBYUEsS0FBYjtBQUNEO0FBUHFDLEdBQXhDO0FBVUFnQixTQUFPNEMsY0FBUCxDQUFzQkgsT0FBdEIsRUFBK0IsU0FBL0IsRUFBMEM7QUFDeENJLGdCQUFZLElBRDRCO0FBRXhDdEIsT0FGd0MsaUJBRWxDO0FBQ0osYUFBT29CLEtBQUtwQyxPQUFaO0FBQ0QsS0FKdUM7QUFLeEN1QyxPQUx3QyxlQUtwQ3ZDLE9BTG9DLEVBSzNCO0FBQ1hvQyxXQUFLcEMsT0FBTCxHQUFlQSxPQUFmO0FBQ0Q7QUFQdUMsR0FBMUMsRUFwQm1DLENBOEJuQzs7QUFDQWtDLFVBQVFNLE9BQVIsR0FBa0IsS0FBS0EsT0FBTCxJQUFnQjVCLFFBQVEsTUFBeEIsSUFBa0NBLFFBQVEsTUFBNUQsQ0EvQm1DLENBaUNuQztBQUNBOztBQUNBc0IsVUFBUU8sU0FBUixHQUFvQlQsS0FBcEIsQ0FuQ21DLENBbUNSOztBQUUzQixTQUFPRSxPQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsVUFBVCxHQUE2QjtBQUMzQjtBQUNBLE1BQU1PLFVBQVUsVUFBS0MsTUFBckI7QUFDQSxNQUFJQyxNQUFNQyx3REFBVjs7QUFFQSxNQUFJSCxZQUFZLENBQWhCLEVBQW1CO0FBQ2pCLFdBQU8sRUFBUDtBQUNEOztBQUVELE1BQUlBLFVBQVUsQ0FBZCxFQUFpQjtBQUNmO0FBQ0EsU0FBSyxJQUFJSSxJQUFJLENBQWIsRUFBZ0JBLElBQUlKLE9BQXBCLEVBQTZCSSxHQUE3QixFQUFrQztBQUNoQ0YsYUFBTyxPQUFXRSxDQUFYLDRCQUFXQSxDQUFYLHlCQUFXQSxDQUFYLEVBQVA7QUFDRDtBQUNGOztBQUVELE1BQUksQ0FBQyxLQUFLOUMsT0FBTixJQUFpQixLQUFLdkIsS0FBTCxJQUFjLENBQS9CLElBQW9DLENBQUNtRSxHQUF6QyxFQUE4QztBQUM1QyxXQUFPLEtBQUt2QixNQUFMLEdBQWMsRUFBZCxHQUFtQnVCLEdBQTFCO0FBQ0QsR0FsQjBCLENBb0IzQjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsTUFBTUcsY0FBYzVFLFdBQVc2RSxHQUFYLENBQWV0QyxJQUFuQzs7QUFDQSxNQUFJNUIsdUJBQXVCLEtBQUswRCxPQUFoQyxFQUF5QztBQUN2Q3JFLGVBQVc2RSxHQUFYLENBQWV0QyxJQUFmLEdBQXNCLEVBQXRCO0FBQ0Q7O0FBM0IwQjtBQUFBO0FBQUE7O0FBQUE7QUE2QjNCLHlCQUFtQixLQUFLVSxPQUFMLENBQWFXLEtBQWIsR0FBcUJrQixPQUFyQixFQUFuQiw4SEFBbUQ7QUFBQSxVQUF4Q0MsSUFBd0M7QUFDakQ7QUFDQTtBQUNBO0FBQ0FOLFlBQU1NLEtBQUt4QyxJQUFMLEdBQVlrQyxJQUFJTyxPQUFKLENBQVlELEtBQUtyQyxPQUFqQixFQUEwQnFDLEtBQUt4QyxJQUEvQixDQUFaLEdBQW1Ed0MsS0FBS25DLEtBQTlELENBSmlELENBTWpEO0FBQ0E7QUFDQTs7QUFDQTZCLFlBQU1BLElBQUlPLE9BQUosQ0FBWSxRQUFaLFlBQXlCRCxLQUFLbkMsS0FBOUIsZUFBd0NtQyxLQUFLeEMsSUFBN0MsRUFBTjtBQUNELEtBdkMwQixDQXlDM0I7QUFDQTs7QUExQzJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBMkMzQnZDLGFBQVc2RSxHQUFYLENBQWV0QyxJQUFmLEdBQXNCcUMsV0FBdEI7QUFFQSxTQUFPSCxHQUFQO0FBQ0Q7O0FBRUQsU0FBU3hDLFFBQVQsQ0FBa0JGLEtBQWxCLEVBQXlCa0QsT0FBekIsRUFBa0M7QUFDaEMsTUFBSSxDQUFDQyxNQUFNQyxPQUFOLENBQWNGLE9BQWQsQ0FBTCxFQUE2QjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBTyxHQUFHckIsS0FBSCxDQUFTWixJQUFULENBQWNvQyxTQUFkLEVBQXlCLENBQXpCLEVBQTRCQyxJQUE1QixDQUFpQyxHQUFqQyxDQUFQO0FBQ0QsR0FSK0IsQ0FVaEM7QUFDQTs7O0FBQ0EsTUFBTXJELE9BQU8sR0FBRzRCLEtBQUgsQ0FBU1osSUFBVCxDQUFjb0MsU0FBZCxFQUF5QixDQUF6QixDQUFiO0FBQ0EsTUFBTUUsUUFBUSxDQUFDTCxRQUFRTSxHQUFSLENBQVksQ0FBWixDQUFELENBQWQ7O0FBRUEsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlQLFFBQVFULE1BQTVCLEVBQW9DZ0IsR0FBcEMsRUFBeUM7QUFDdkNGLFVBQU1HLElBQU4sQ0FBV2YsT0FBTzFDLEtBQUt3RCxJQUFJLENBQVQsQ0FBUCxFQUFvQlIsT0FBcEIsQ0FBNEIsU0FBNUIsRUFBdUMsTUFBdkMsQ0FBWDtBQUNBTSxVQUFNRyxJQUFOLENBQVdmLE9BQU9PLFFBQVFNLEdBQVIsQ0FBWUMsQ0FBWixDQUFQLENBQVg7QUFDRDs7QUFFRCxTQUFPOUUsU0FBU3FCLEtBQVQsRUFBZ0J1RCxNQUFNRCxJQUFOLENBQVcsRUFBWCxDQUFoQixDQUFQO0FBQ0Q7O0FBRUQvRCxPQUFPd0MsZ0JBQVAsQ0FBd0JoQyxNQUFNTSxTQUE5QixFQUF5Q2YsTUFBekM7QUFFQXFFLE9BQU9DLE9BQVAsR0FBaUI3RCxPQUFqQixDLENBQTBCOztBQUMxQjRELE9BQU9DLE9BQVAsQ0FBZUMsYUFBZixHQUErQjNGLFdBQS9CO0FBQ0F5RixPQUFPQyxPQUFQLENBQWVFLE9BQWYsR0FBeUJILE9BQU9DLE9BQWhDLEMsQ0FBeUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBlc2NhcGVTdHJpbmdSZWdleHAgPSByZXF1aXJlKCdlc2NhcGUtc3RyaW5nLXJlZ2V4cCcpO1xuY29uc3QgYW5zaVN0eWxlcyA9IHJlcXVpcmUoJ2Fuc2ktc3R5bGVzJyk7XG5sZXQgc3Rkb3V0Q29sb3IgPSByZXF1aXJlKCdzdXBwb3J0cy1jb2xvcicpLnN0ZG91dDtcblxuLy8gZGV0ZXJtaW5lIGlmIHdlJ3JlIGluIGEgYnJvd3NlclxuY29uc3QgaXNCcm93c2VyID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5kb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIGlmIHdlJ3JlIGluIGEgYnJvd3NlciB0aGVuIHdlIERPIHN1cHBvcnQgY29sb3JzXG4vLyBidXQgd2UgbmVlZCB0byBtYWtlIGl0IGF3YXJlIHRvIHVzZXJzIHRoYXQgdGhleSBuZWVkIHRvXG4vLyB1c2UgYW5zaWNvbG9yIDxodHRwczovL2dpdGh1Yi5jb20veHBsL2Fuc2ljb2xvcj5cbmlmIChpc0Jyb3dzZXIpXG4gIHN0ZG91dENvbG9yID0ge1xuICAgIGxldmVsOiAzLFxuICAgIGhhc0Jhc2ljOiB0cnVlLFxuICAgIGhhczI1NjogdHJ1ZSxcbiAgICBoYXMxNm06IHRydWVcbiAgfTtcblxuY29uc3QgdGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlcy5qcycpO1xuXG5jb25zdCBpc1NpbXBsZVdpbmRvd3NUZXJtID1cbiAgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJlxuICAhKHByb2Nlc3MuZW52LlRFUk0gfHwgJycpLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgneHRlcm0nKTtcblxuLy8gYHN1cHBvcnRzQ29sb3IubGV2ZWxgIOKGkiBgYW5zaVN0eWxlcy5jb2xvcltuYW1lXWAgbWFwcGluZ1xuY29uc3QgbGV2ZWxNYXBwaW5nID0gWydhbnNpJywgJ2Fuc2knLCAnYW5zaTI1NicsICdhbnNpMTZtJ107XG5cbi8vIGBjb2xvci1jb252ZXJ0YCBtb2RlbHMgdG8gZXhjbHVkZSBmcm9tIHRoZSBDaGFsayBBUEkgZHVlIHRvIGNvbmZsaWN0c1xuY29uc3Qgc2tpcE1vZGVscyA9IG5ldyBTZXQoWydncmF5J10pO1xuXG5jb25zdCBzdHlsZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5mdW5jdGlvbiBhcHBseU9wdGlvbnMob2JqLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIERldGVjdCBsZXZlbCBpZiBub3Qgc2V0IG1hbnVhbGx5XG4gIGNvbnN0IHNjTGV2ZWwgPSBzdGRvdXRDb2xvciA/IHN0ZG91dENvbG9yLmxldmVsIDogMDtcbiAgb2JqLmxldmVsID0gb3B0aW9ucy5sZXZlbCA9PT0gdW5kZWZpbmVkID8gc2NMZXZlbCA6IG9wdGlvbnMubGV2ZWw7XG4gIG9iai5lbmFibGVkID0gJ2VuYWJsZWQnIGluIG9wdGlvbnMgPyBvcHRpb25zLmVuYWJsZWQgOiBvYmoubGV2ZWwgPiAwO1xufVxuXG5mdW5jdGlvbiBDaGFsayhvcHRpb25zKSB7XG4gIC8vIFdlIGNoZWNrIGZvciB0aGlzLnRlbXBsYXRlIGhlcmUgc2luY2UgY2FsbGluZyBgY2hhbGsuY29uc3RydWN0b3IoKWBcbiAgLy8gYnkgaXRzZWxmIHdpbGwgaGF2ZSBhIGB0aGlzYCBvZiBhIHByZXZpb3VzbHkgY29uc3RydWN0ZWQgY2hhbGsgb2JqZWN0XG4gIGlmICghdGhpcyB8fCAhKHRoaXMgaW5zdGFuY2VvZiBDaGFsaykgfHwgdGhpcy50ZW1wbGF0ZSkge1xuICAgIGNvbnN0IGNoYWxrID0ge307XG4gICAgYXBwbHlPcHRpb25zKGNoYWxrLCBvcHRpb25zKTtcblxuICAgIGNoYWxrLnRlbXBsYXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgcmV0dXJuIGNoYWxrVGFnKC4uLltjaGFsay50ZW1wbGF0ZV0uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGNoYWxrLCBDaGFsay5wcm90b3R5cGUpO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihjaGFsay50ZW1wbGF0ZSwgY2hhbGspO1xuXG4gICAgY2hhbGsudGVtcGxhdGUuY29uc3RydWN0b3IgPSBDaGFsaztcblxuICAgIHJldHVybiBjaGFsay50ZW1wbGF0ZTtcbiAgfVxuXG4gIGFwcGx5T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbn1cblxuLy8gVXNlIGJyaWdodCBibHVlIG9uIFdpbmRvd3MgYXMgdGhlIG5vcm1hbCBibHVlIGNvbG9yIGlzIGlsbGVnaWJsZVxuaWYgKGlzU2ltcGxlV2luZG93c1Rlcm0pIHtcbiAgYW5zaVN0eWxlcy5ibHVlLm9wZW4gPSAnXFx1MDAxQls5NG0nO1xufVxuXG5mb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhhbnNpU3R5bGVzKSkge1xuICBhbnNpU3R5bGVzW2tleV0uY2xvc2VSZSA9IG5ldyBSZWdFeHAoXG4gICAgZXNjYXBlU3RyaW5nUmVnZXhwKGFuc2lTdHlsZXNba2V5XS5jbG9zZSksXG4gICAgJ2cnXG4gICk7XG5cbiAgc3R5bGVzW2tleV0gPSB7XG4gICAgZ2V0KCkge1xuICAgICAgY29uc3QgY29kZXMgPSBhbnNpU3R5bGVzW2tleV07XG4gICAgICByZXR1cm4gYnVpbGQuY2FsbChcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy5fc3R5bGVzID8gdGhpcy5fc3R5bGVzLmNvbmNhdChjb2RlcykgOiBbY29kZXNdLFxuICAgICAgICB0aGlzLl9lbXB0eSxcbiAgICAgICAga2V5XG4gICAgICApO1xuICAgIH1cbiAgfTtcbn1cblxuc3R5bGVzLnZpc2libGUgPSB7XG4gIGdldCgpIHtcbiAgICByZXR1cm4gYnVpbGQuY2FsbCh0aGlzLCB0aGlzLl9zdHlsZXMgfHwgW10sIHRydWUsICd2aXNpYmxlJyk7XG4gIH1cbn07XG5cbmFuc2lTdHlsZXMuY29sb3IuY2xvc2VSZSA9IG5ldyBSZWdFeHAoXG4gIGVzY2FwZVN0cmluZ1JlZ2V4cChhbnNpU3R5bGVzLmNvbG9yLmNsb3NlKSxcbiAgJ2cnXG4pO1xuZm9yIChjb25zdCBtb2RlbCBvZiBPYmplY3Qua2V5cyhhbnNpU3R5bGVzLmNvbG9yLmFuc2kpKSB7XG4gIGlmIChza2lwTW9kZWxzLmhhcyhtb2RlbCkpIHtcbiAgICBjb250aW51ZTtcbiAgfVxuXG4gIHN0eWxlc1ttb2RlbF0gPSB7XG4gICAgZ2V0KCkge1xuICAgICAgY29uc3QgeyBsZXZlbCB9ID0gdGhpcztcbiAgICAgIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IG9wZW4gPSBhbnNpU3R5bGVzLmNvbG9yW2xldmVsTWFwcGluZ1tsZXZlbF1dW21vZGVsXS5hcHBseShcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGFyZ3NcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY29kZXMgPSB7XG4gICAgICAgICAgb3BlbixcbiAgICAgICAgICBjbG9zZTogYW5zaVN0eWxlcy5jb2xvci5jbG9zZSxcbiAgICAgICAgICBjbG9zZVJlOiBhbnNpU3R5bGVzLmNvbG9yLmNsb3NlUmVcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGJ1aWxkLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICB0aGlzLl9zdHlsZXMgPyB0aGlzLl9zdHlsZXMuY29uY2F0KGNvZGVzKSA6IFtjb2Rlc10sXG4gICAgICAgICAgdGhpcy5fZW1wdHksXG4gICAgICAgICAgbW9kZWxcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuXG5hbnNpU3R5bGVzLmJnQ29sb3IuY2xvc2VSZSA9IG5ldyBSZWdFeHAoXG4gIGVzY2FwZVN0cmluZ1JlZ2V4cChhbnNpU3R5bGVzLmJnQ29sb3IuY2xvc2UpLFxuICAnZydcbik7XG5mb3IgKGNvbnN0IG1vZGVsIG9mIE9iamVjdC5rZXlzKGFuc2lTdHlsZXMuYmdDb2xvci5hbnNpKSkge1xuICBpZiAoc2tpcE1vZGVscy5oYXMobW9kZWwpKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICBjb25zdCBiZ01vZGVsID0gJ2JnJyArIG1vZGVsWzBdLnRvVXBwZXJDYXNlKCkgKyBtb2RlbC5zbGljZSgxKTtcbiAgc3R5bGVzW2JnTW9kZWxdID0ge1xuICAgIGdldCgpIHtcbiAgICAgIGNvbnN0IHsgbGV2ZWwgfSA9IHRoaXM7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICBjb25zdCBvcGVuID0gYW5zaVN0eWxlcy5iZ0NvbG9yW2xldmVsTWFwcGluZ1tsZXZlbF1dW21vZGVsXS5hcHBseShcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGFyZ3NcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY29kZXMgPSB7XG4gICAgICAgICAgb3BlbixcbiAgICAgICAgICBjbG9zZTogYW5zaVN0eWxlcy5iZ0NvbG9yLmNsb3NlLFxuICAgICAgICAgIGNsb3NlUmU6IGFuc2lTdHlsZXMuYmdDb2xvci5jbG9zZVJlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBidWlsZC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgdGhpcy5fc3R5bGVzID8gdGhpcy5fc3R5bGVzLmNvbmNhdChjb2RlcykgOiBbY29kZXNdLFxuICAgICAgICAgIHRoaXMuX2VtcHR5LFxuICAgICAgICAgIG1vZGVsXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgcHJvdG8gPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcygoKSA9PiB7fSwgc3R5bGVzKTtcblxuZnVuY3Rpb24gYnVpbGQoX3N0eWxlcywgX2VtcHR5LCBrZXkpIHtcbiAgY29uc3QgYnVpbGRlciA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gYXBwbHlTdHlsZS5hcHBseShidWlsZGVyLCBhcmdzKTtcbiAgfTtcblxuICBidWlsZGVyLl9zdHlsZXMgPSBfc3R5bGVzO1xuICBidWlsZGVyLl9lbXB0eSA9IF9lbXB0eTtcblxuICBjb25zdCBzZWxmID0gdGhpcztcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYnVpbGRlciwgJ2xldmVsJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0KCkge1xuICAgICAgcmV0dXJuIHNlbGYubGV2ZWw7XG4gICAgfSxcbiAgICBzZXQobGV2ZWwpIHtcbiAgICAgIHNlbGYubGV2ZWwgPSBsZXZlbDtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShidWlsZGVyLCAnZW5hYmxlZCcsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldCgpIHtcbiAgICAgIHJldHVybiBzZWxmLmVuYWJsZWQ7XG4gICAgfSxcbiAgICBzZXQoZW5hYmxlZCkge1xuICAgICAgc2VsZi5lbmFibGVkID0gZW5hYmxlZDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFNlZSBiZWxvdyBmb3IgZml4IHJlZ2FyZGluZyBpbnZpc2libGUgZ3JleS9kaW0gY29tYmluYXRpb24gb24gV2luZG93c1xuICBidWlsZGVyLmhhc0dyZXkgPSB0aGlzLmhhc0dyZXkgfHwga2V5ID09PSAnZ3JheScgfHwga2V5ID09PSAnZ3JleSc7XG5cbiAgLy8gYF9fcHJvdG9fX2AgaXMgdXNlZCBiZWNhdXNlIHdlIG11c3QgcmV0dXJuIGEgZnVuY3Rpb24sIGJ1dCB0aGVyZSBpc1xuICAvLyBubyB3YXkgdG8gY3JlYXRlIGEgZnVuY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBwcm90b3R5cGVcbiAgYnVpbGRlci5fX3Byb3RvX18gPSBwcm90bzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b1xuXG4gIHJldHVybiBidWlsZGVyO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlKC4uLmFyZ3MpIHtcbiAgLy8gU3VwcG9ydCB2YXJhZ3MsIGJ1dCBzaW1wbHkgY2FzdCB0byBzdHJpbmcgaW4gY2FzZSB0aGVyZSdzIG9ubHkgb25lIGFyZ1xuICBjb25zdCBhcmdzTGVuID0gYXJncy5sZW5ndGg7XG4gIGxldCBzdHIgPSBTdHJpbmcoYXJnc1swXSk7XG5cbiAgaWYgKGFyZ3NMZW4gPT09IDApIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBpZiAoYXJnc0xlbiA+IDEpIHtcbiAgICAvLyBEb24ndCBzbGljZSBgYXJndW1lbnRzYCwgaXQgcHJldmVudHMgVjggb3B0aW1pemF0aW9uc1xuICAgIGZvciAobGV0IGEgPSAxOyBhIDwgYXJnc0xlbjsgYSsrKSB7XG4gICAgICBzdHIgKz0gJyAnICsgYXJnc1thXTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMuZW5hYmxlZCB8fCB0aGlzLmxldmVsIDw9IDAgfHwgIXN0cikge1xuICAgIHJldHVybiB0aGlzLl9lbXB0eSA/ICcnIDogc3RyO1xuICB9XG5cbiAgLy8gVHVybnMgb3V0IHRoYXQgb24gV2luZG93cyBkaW1tZWQgZ3JheSB0ZXh0IGJlY29tZXMgaW52aXNpYmxlIGluIGNtZC5leGUsXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvaXNzdWVzLzU4XG4gIC8vIElmIHdlJ3JlIG9uIFdpbmRvd3MgYW5kIHdlJ3JlIGRlYWxpbmdcbiAgLy8gd2l0aCBhIGdyYXkgY29sb3IsIHRlbXBvcmFyaWx5IG1ha2UgJ2RpbScgYSBub29wLlxuICBjb25zdCBvcmlnaW5hbERpbSA9IGFuc2lTdHlsZXMuZGltLm9wZW47XG4gIGlmIChpc1NpbXBsZVdpbmRvd3NUZXJtICYmIHRoaXMuaGFzR3JleSkge1xuICAgIGFuc2lTdHlsZXMuZGltLm9wZW4gPSAnJztcbiAgfVxuXG4gIGZvciAoY29uc3QgY29kZSBvZiB0aGlzLl9zdHlsZXMuc2xpY2UoKS5yZXZlcnNlKCkpIHtcbiAgICAvLyBSZXBsYWNlIGFueSBpbnN0YW5jZXMgYWxyZWFkeSBwcmVzZW50IHdpdGggYSByZS1vcGVuaW5nIGNvZGVcbiAgICAvLyBvdGhlcndpc2Ugb25seSB0aGUgcGFydCBvZiB0aGUgc3RyaW5nIHVudGlsIHNhaWQgY2xvc2luZyBjb2RlXG4gICAgLy8gd2lsbCBiZSBjb2xvcmVkLCBhbmQgdGhlIHJlc3Qgd2lsbCBzaW1wbHkgYmUgJ3BsYWluJy5cbiAgICBzdHIgPSBjb2RlLm9wZW4gKyBzdHIucmVwbGFjZShjb2RlLmNsb3NlUmUsIGNvZGUub3BlbikgKyBjb2RlLmNsb3NlO1xuXG4gICAgLy8gQ2xvc2UgdGhlIHN0eWxpbmcgYmVmb3JlIGEgbGluZWJyZWFrIGFuZCByZW9wZW5cbiAgICAvLyBhZnRlciBuZXh0IGxpbmUgdG8gZml4IGEgYmxlZWQgaXNzdWUgb24gbWFjT1NcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vY2hhbGsvY2hhbGsvcHVsbC85MlxuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHI/XFxuL2csIGAke2NvZGUuY2xvc2V9JCYke2NvZGUub3Blbn1gKTtcbiAgfVxuXG4gIC8vIFJlc2V0IHRoZSBvcmlnaW5hbCBgZGltYCBpZiB3ZSBjaGFuZ2VkIGl0IHRvXG4gIC8vIHdvcmsgYXJvdW5kIHRoZSBXaW5kb3dzIGRpbW1lZCBncmF5IGlzc3VlXG4gIGFuc2lTdHlsZXMuZGltLm9wZW4gPSBvcmlnaW5hbERpbTtcblxuICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBjaGFsa1RhZyhjaGFsaywgc3RyaW5ncykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc3RyaW5ncykpIHtcbiAgICAvLyBJZiBjaGFsaygpIHdhcyBjYWxsZWQgYnkgaXRzZWxmIG9yIHdpdGggYSBzdHJpbmcsXG4gICAgLy8gcmV0dXJuIHRoZSBzdHJpbmcgaXRzZWxmIGFzIGEgc3RyaW5nLlxuICAgIC8vXG4gICAgLy8gVE9ETzogZml4IHJlc3QgcGFyYW1zIGxhdGVyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkuam9pbignICcpO1xuICB9XG5cbiAgLy8gVE9ETzogZml4IHJlc3QgcGFyYW1zIGxhdGVyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgY29uc3QgcGFydHMgPSBbc3RyaW5ncy5yYXdbMF1dO1xuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIHBhcnRzLnB1c2goU3RyaW5nKGFyZ3NbaSAtIDFdKS5yZXBsYWNlKC9be31cXFxcXS9nLCAnXFxcXCQmJykpO1xuICAgIHBhcnRzLnB1c2goU3RyaW5nKHN0cmluZ3MucmF3W2ldKSk7XG4gIH1cblxuICByZXR1cm4gdGVtcGxhdGUoY2hhbGssIHBhcnRzLmpvaW4oJycpKTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2hhbGsucHJvdG90eXBlLCBzdHlsZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYWxrKCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxubW9kdWxlLmV4cG9ydHMuc3VwcG9ydHNDb2xvciA9IHN0ZG91dENvbG9yO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzOyAvLyBGb3IgVHlwZVNjcmlwdFxuIl19