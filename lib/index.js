"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

var escapeStringRegexp = require('escape-string-regexp');

var ansiStyles = require('ansi-styles');

var ansiHTML = require('ansi-html');

var stdoutColor = require('supports-color').stdout; // determine if we're in a browser


var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'; // if we're in a browser then we DO support colors
// because we use ansi-html to convert in `console.log`

if (isBrowser) stdoutColor = true;

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

  ansiStyles.dim.open = originalDim; // If we're in a browser then return HTML

  if (isBrowser) str = ansiHTML(str);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJlc2NhcGVTdHJpbmdSZWdleHAiLCJyZXF1aXJlIiwiYW5zaVN0eWxlcyIsImFuc2lIVE1MIiwic3Rkb3V0Q29sb3IiLCJzdGRvdXQiLCJpc0Jyb3dzZXIiLCJ3aW5kb3ciLCJkb2N1bWVudCIsInRlbXBsYXRlIiwiaXNTaW1wbGVXaW5kb3dzVGVybSIsInByb2Nlc3MiLCJwbGF0Zm9ybSIsImVudiIsIlRFUk0iLCJ0b0xvd2VyQ2FzZSIsInN0YXJ0c1dpdGgiLCJsZXZlbE1hcHBpbmciLCJza2lwTW9kZWxzIiwiU2V0Iiwic3R5bGVzIiwiT2JqZWN0IiwiY3JlYXRlIiwiYXBwbHlPcHRpb25zIiwib2JqIiwib3B0aW9ucyIsInNjTGV2ZWwiLCJsZXZlbCIsInVuZGVmaW5lZCIsImVuYWJsZWQiLCJDaGFsayIsImNoYWxrIiwiYXJncyIsImNoYWxrVGFnIiwiY29uY2F0Iiwic2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJjb25zdHJ1Y3RvciIsImJsdWUiLCJvcGVuIiwia2V5cyIsImtleSIsImNsb3NlUmUiLCJSZWdFeHAiLCJjbG9zZSIsImdldCIsImNvZGVzIiwiYnVpbGQiLCJjYWxsIiwiX3N0eWxlcyIsIl9lbXB0eSIsInZpc2libGUiLCJjb2xvciIsImFuc2kiLCJtb2RlbCIsImhhcyIsImFwcGx5IiwiYmdDb2xvciIsImJnTW9kZWwiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwicHJvdG8iLCJkZWZpbmVQcm9wZXJ0aWVzIiwiYnVpbGRlciIsImFwcGx5U3R5bGUiLCJzZWxmIiwiZGVmaW5lUHJvcGVydHkiLCJlbnVtZXJhYmxlIiwic2V0IiwiaGFzR3JleSIsIl9fcHJvdG9fXyIsImFyZ3NMZW4iLCJsZW5ndGgiLCJzdHIiLCJTdHJpbmciLCJhIiwib3JpZ2luYWxEaW0iLCJkaW0iLCJyZXZlcnNlIiwiY29kZSIsInJlcGxhY2UiLCJzdHJpbmdzIiwiQXJyYXkiLCJpc0FycmF5IiwiYXJndW1lbnRzIiwiam9pbiIsInBhcnRzIiwicmF3IiwiaSIsInB1c2giLCJtb2R1bGUiLCJleHBvcnRzIiwic3VwcG9ydHNDb2xvciIsImRlZmF1bHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLHFCQUFxQkMsUUFBUSxzQkFBUixDQUEzQjs7QUFDQSxJQUFNQyxhQUFhRCxRQUFRLGFBQVIsQ0FBbkI7O0FBQ0EsSUFBTUUsV0FBV0YsUUFBUSxXQUFSLENBQWpCOztBQUNBLElBQUlHLGNBQWNILFFBQVEsZ0JBQVIsRUFBMEJJLE1BQTVDLEMsQ0FFQTs7O0FBQ0EsSUFBTUMsWUFDSixPQUFPQyxNQUFQLEtBQWtCLFdBQWxCLElBQWlDLE9BQU9BLE9BQU9DLFFBQWQsS0FBMkIsV0FEOUQsQyxDQUdBO0FBQ0E7O0FBQ0EsSUFBSUYsU0FBSixFQUFlRixjQUFjLElBQWQ7O0FBRWYsSUFBTUssV0FBV1IsUUFBUSxnQkFBUixDQUFqQjs7QUFFQSxJQUFNUyxzQkFDSkMsUUFBUUMsUUFBUixLQUFxQixPQUFyQixJQUNBLENBQUMsQ0FBQ0QsUUFBUUUsR0FBUixDQUFZQyxJQUFaLElBQW9CLEVBQXJCLEVBQXlCQyxXQUF6QixHQUF1Q0MsVUFBdkMsQ0FBa0QsT0FBbEQsQ0FGSCxDLENBSUE7O0FBQ0EsSUFBTUMsZUFBZSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFNBQWpCLEVBQTRCLFNBQTVCLENBQXJCLEMsQ0FFQTs7QUFDQSxJQUFNQyxhQUFhLElBQUlDLEdBQUosQ0FBUSxDQUFDLE1BQUQsQ0FBUixDQUFuQjtBQUVBLElBQU1DLFNBQVNDLE9BQU9DLE1BQVAsQ0FBYyxJQUFkLENBQWY7O0FBRUEsU0FBU0MsWUFBVCxDQUFzQkMsR0FBdEIsRUFBMkJDLE9BQTNCLEVBQW9DO0FBQ2xDQSxZQUFVQSxXQUFXLEVBQXJCLENBRGtDLENBR2xDOztBQUNBLE1BQU1DLFVBQVV0QixjQUFjQSxZQUFZdUIsS0FBMUIsR0FBa0MsQ0FBbEQ7QUFDQUgsTUFBSUcsS0FBSixHQUFZRixRQUFRRSxLQUFSLEtB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LFNBQWQsRUFBeUIsQ0FBekIsQ0FBYjtBQUNBLE1BQU1FLFFBQVEsQ0FBQ0wsUUFBUU0sR0FBUixDQUFZLENBQVosQ0FBRCxDQUFkOztBQUVBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJUCxRQUFRVCxNQUE1QixFQUFvQ2dCLEdBQXBDLEVBQXlDO0FBQ3ZDRixVQUFNRyxJQUFOLENBQVdmLE9BQU8xQyxLQUFLd0QsSUFBSSxDQUFULENBQVAsRUFBb0JSLE9BQXBCLENBQTRCLFNBQTVCLEVBQXVDLE1BQXZDLENBQVg7QUFDQU0sVUFBTUcsSUFBTixDQUFXZixPQUFPTyxRQUFRTSxHQUFSLENBQVlDLENBQVosQ0FBUCxDQUFYO0FBQ0Q7O0FBRUQsU0FBTy9FLFNBQVNzQixLQUFULEVBQWdCdUQsTUFBTUQsSUFBTixDQUFXLEVBQVgsQ0FBaEIsQ0FBUDtBQUNEOztBQUVEaEUsT0FBT3lDLGdCQUFQLENBQXdCaEMsTUFBTU0sU0FBOUIsRUFBeUNoQixNQUF6QztBQUVBc0UsT0FBT0MsT0FBUCxHQUFpQjdELE9BQWpCLEMsQ0FBMEI7O0FBQzFCNEQsT0FBT0MsT0FBUCxDQUFlQyxhQUFmLEdBQStCeEYsV0FBL0I7QUFDQXNGLE9BQU9DLE9BQVAsQ0FBZUUsT0FBZixHQUF5QkgsT0FBT0MsT0FBaEMsQyxDQUF5QyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGVzY2FwZVN0cmluZ1JlZ2V4cCA9IHJlcXVpcmUoJ2VzY2FwZS1zdHJpbmctcmVnZXhwJyk7XG5jb25zdCBhbnNpU3R5bGVzID0gcmVxdWlyZSgnYW5zaS1zdHlsZXMnKTtcbmNvbnN0IGFuc2lIVE1MID0gcmVxdWlyZSgnYW5zaS1odG1sJyk7XG5sZXQgc3Rkb3V0Q29sb3IgPSByZXF1aXJlKCdzdXBwb3J0cy1jb2xvcicpLnN0ZG91dDtcblxuLy8gZGV0ZXJtaW5lIGlmIHdlJ3JlIGluIGEgYnJvd3NlclxuY29uc3QgaXNCcm93c2VyID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5kb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIGlmIHdlJ3JlIGluIGEgYnJvd3NlciB0aGVuIHdlIERPIHN1cHBvcnQgY29sb3JzXG4vLyBiZWNhdXNlIHdlIHVzZSBhbnNpLWh0bWwgdG8gY29udmVydCBpbiBgY29uc29sZS5sb2dgXG5pZiAoaXNCcm93c2VyKSBzdGRvdXRDb2xvciA9IHRydWU7XG5cbmNvbnN0IHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZXMuanMnKTtcblxuY29uc3QgaXNTaW1wbGVXaW5kb3dzVGVybSA9XG4gIHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgJiZcbiAgIShwcm9jZXNzLmVudi5URVJNIHx8ICcnKS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoJ3h0ZXJtJyk7XG5cbi8vIGBzdXBwb3J0c0NvbG9yLmxldmVsYCDihpIgYGFuc2lTdHlsZXMuY29sb3JbbmFtZV1gIG1hcHBpbmdcbmNvbnN0IGxldmVsTWFwcGluZyA9IFsnYW5zaScsICdhbnNpJywgJ2Fuc2kyNTYnLCAnYW5zaTE2bSddO1xuXG4vLyBgY29sb3ItY29udmVydGAgbW9kZWxzIHRvIGV4Y2x1ZGUgZnJvbSB0aGUgQ2hhbGsgQVBJIGR1ZSB0byBjb25mbGljdHNcbmNvbnN0IHNraXBNb2RlbHMgPSBuZXcgU2V0KFsnZ3JheSddKTtcblxuY29uc3Qgc3R5bGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuZnVuY3Rpb24gYXBwbHlPcHRpb25zKG9iaiwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBEZXRlY3QgbGV2ZWwgaWYgbm90IHNldCBtYW51YWxseVxuICBjb25zdCBzY0xldmVsID0gc3Rkb3V0Q29sb3IgPyBzdGRvdXRDb2xvci5sZXZlbCA6IDA7XG4gIG9iai5sZXZlbCA9IG9wdGlvbnMubGV2ZWwgPT09IHVuZGVmaW5lZCA/IHNjTGV2ZWwgOiBvcHRpb25zLmxldmVsO1xuICBvYmouZW5hYmxlZCA9ICdlbmFibGVkJyBpbiBvcHRpb25zID8gb3B0aW9ucy5lbmFibGVkIDogb2JqLmxldmVsID4gMDtcbn1cblxuZnVuY3Rpb24gQ2hhbGsob3B0aW9ucykge1xuICAvLyBXZSBjaGVjayBmb3IgdGhpcy50ZW1wbGF0ZSBoZXJlIHNpbmNlIGNhbGxpbmcgYGNoYWxrLmNvbnN0cnVjdG9yKClgXG4gIC8vIGJ5IGl0c2VsZiB3aWxsIGhhdmUgYSBgdGhpc2Agb2YgYSBwcmV2aW91c2x5IGNvbnN0cnVjdGVkIGNoYWxrIG9iamVjdFxuICBpZiAoIXRoaXMgfHwgISh0aGlzIGluc3RhbmNlb2YgQ2hhbGspIHx8IHRoaXMudGVtcGxhdGUpIHtcbiAgICBjb25zdCBjaGFsayA9IHt9O1xuICAgIGFwcGx5T3B0aW9ucyhjaGFsaywgb3B0aW9ucyk7XG5cbiAgICBjaGFsay50ZW1wbGF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIHJldHVybiBjaGFsa1RhZyguLi5bY2hhbGsudGVtcGxhdGVdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcblxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihjaGFsaywgQ2hhbGsucHJvdG90eXBlKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoY2hhbGsudGVtcGxhdGUsIGNoYWxrKTtcblxuICAgIGNoYWxrLnRlbXBsYXRlLmNvbnN0cnVjdG9yID0gQ2hhbGs7XG5cbiAgICByZXR1cm4gY2hhbGsudGVtcGxhdGU7XG4gIH1cblxuICBhcHBseU9wdGlvbnModGhpcywgb3B0aW9ucyk7XG59XG5cbi8vIFVzZSBicmlnaHQgYmx1ZSBvbiBXaW5kb3dzIGFzIHRoZSBub3JtYWwgYmx1ZSBjb2xvciBpcyBpbGxlZ2libGVcbmlmIChpc1NpbXBsZVdpbmRvd3NUZXJtKSB7XG4gIGFuc2lTdHlsZXMuYmx1ZS5vcGVuID0gJ1xcdTAwMUJbOTRtJztcbn1cblxuZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoYW5zaVN0eWxlcykpIHtcbiAgYW5zaVN0eWxlc1trZXldLmNsb3NlUmUgPSBuZXcgUmVnRXhwKFxuICAgIGVzY2FwZVN0cmluZ1JlZ2V4cChhbnNpU3R5bGVzW2tleV0uY2xvc2UpLFxuICAgICdnJ1xuICApO1xuXG4gIHN0eWxlc1trZXldID0ge1xuICAgIGdldCgpIHtcbiAgICAgIGNvbnN0IGNvZGVzID0gYW5zaVN0eWxlc1trZXldO1xuICAgICAgcmV0dXJuIGJ1aWxkLmNhbGwoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHRoaXMuX3N0eWxlcyA/IHRoaXMuX3N0eWxlcy5jb25jYXQoY29kZXMpIDogW2NvZGVzXSxcbiAgICAgICAgdGhpcy5fZW1wdHksXG4gICAgICAgIGtleVxuICAgICAgKTtcbiAgICB9XG4gIH07XG59XG5cbnN0eWxlcy52aXNpYmxlID0ge1xuICBnZXQoKSB7XG4gICAgcmV0dXJuIGJ1aWxkLmNhbGwodGhpcywgdGhpcy5fc3R5bGVzIHx8IFtdLCB0cnVlLCAndmlzaWJsZScpO1xuICB9XG59O1xuXG5hbnNpU3R5bGVzLmNvbG9yLmNsb3NlUmUgPSBuZXcgUmVnRXhwKFxuICBlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlcy5jb2xvci5jbG9zZSksXG4gICdnJ1xuKTtcbmZvciAoY29uc3QgbW9kZWwgb2YgT2JqZWN0LmtleXMoYW5zaVN0eWxlcy5jb2xvci5hbnNpKSkge1xuICBpZiAoc2tpcE1vZGVscy5oYXMobW9kZWwpKSB7XG4gICAgY29udGludWU7XG4gIH1cblxuICBzdHlsZXNbbW9kZWxdID0ge1xuICAgIGdldCgpIHtcbiAgICAgIGNvbnN0IHsgbGV2ZWwgfSA9IHRoaXM7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICBjb25zdCBvcGVuID0gYW5zaVN0eWxlcy5jb2xvcltsZXZlbE1hcHBpbmdbbGV2ZWxdXVttb2RlbF0uYXBwbHkoXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBhcmdzXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGNvZGVzID0ge1xuICAgICAgICAgIG9wZW4sXG4gICAgICAgICAgY2xvc2U6IGFuc2lTdHlsZXMuY29sb3IuY2xvc2UsXG4gICAgICAgICAgY2xvc2VSZTogYW5zaVN0eWxlcy5jb2xvci5jbG9zZVJlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBidWlsZC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgdGhpcy5fc3R5bGVzID8gdGhpcy5fc3R5bGVzLmNvbmNhdChjb2RlcykgOiBbY29kZXNdLFxuICAgICAgICAgIHRoaXMuX2VtcHR5LFxuICAgICAgICAgIG1vZGVsXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuYW5zaVN0eWxlcy5iZ0NvbG9yLmNsb3NlUmUgPSBuZXcgUmVnRXhwKFxuICBlc2NhcGVTdHJpbmdSZWdleHAoYW5zaVN0eWxlcy5iZ0NvbG9yLmNsb3NlKSxcbiAgJ2cnXG4pO1xuZm9yIChjb25zdCBtb2RlbCBvZiBPYmplY3Qua2V5cyhhbnNpU3R5bGVzLmJnQ29sb3IuYW5zaSkpIHtcbiAgaWYgKHNraXBNb2RlbHMuaGFzKG1vZGVsKSkge1xuICAgIGNvbnRpbnVlO1xuICB9XG5cbiAgY29uc3QgYmdNb2RlbCA9ICdiZycgKyBtb2RlbFswXS50b1VwcGVyQ2FzZSgpICsgbW9kZWwuc2xpY2UoMSk7XG4gIHN0eWxlc1tiZ01vZGVsXSA9IHtcbiAgICBnZXQoKSB7XG4gICAgICBjb25zdCB7IGxldmVsIH0gPSB0aGlzO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3Qgb3BlbiA9IGFuc2lTdHlsZXMuYmdDb2xvcltsZXZlbE1hcHBpbmdbbGV2ZWxdXVttb2RlbF0uYXBwbHkoXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBhcmdzXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGNvZGVzID0ge1xuICAgICAgICAgIG9wZW4sXG4gICAgICAgICAgY2xvc2U6IGFuc2lTdHlsZXMuYmdDb2xvci5jbG9zZSxcbiAgICAgICAgICBjbG9zZVJlOiBhbnNpU3R5bGVzLmJnQ29sb3IuY2xvc2VSZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYnVpbGQuY2FsbChcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIHRoaXMuX3N0eWxlcyA/IHRoaXMuX3N0eWxlcy5jb25jYXQoY29kZXMpIDogW2NvZGVzXSxcbiAgICAgICAgICB0aGlzLl9lbXB0eSxcbiAgICAgICAgICBtb2RlbFxuICAgICAgICApO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHByb3RvID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoKCkgPT4ge30sIHN0eWxlcyk7XG5cbmZ1bmN0aW9uIGJ1aWxkKF9zdHlsZXMsIF9lbXB0eSwga2V5KSB7XG4gIGNvbnN0IGJ1aWxkZXIgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIGFwcGx5U3R5bGUuYXBwbHkoYnVpbGRlciwgYXJncyk7XG4gIH07XG5cbiAgYnVpbGRlci5fc3R5bGVzID0gX3N0eWxlcztcbiAgYnVpbGRlci5fZW1wdHkgPSBfZW1wdHk7XG5cbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJ1aWxkZXIsICdsZXZlbCcsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldCgpIHtcbiAgICAgIHJldHVybiBzZWxmLmxldmVsO1xuICAgIH0sXG4gICAgc2V0KGxldmVsKSB7XG4gICAgICBzZWxmLmxldmVsID0gbGV2ZWw7XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYnVpbGRlciwgJ2VuYWJsZWQnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQoKSB7XG4gICAgICByZXR1cm4gc2VsZi5lbmFibGVkO1xuICAgIH0sXG4gICAgc2V0KGVuYWJsZWQpIHtcbiAgICAgIHNlbGYuZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgfVxuICB9KTtcblxuICAvLyBTZWUgYmVsb3cgZm9yIGZpeCByZWdhcmRpbmcgaW52aXNpYmxlIGdyZXkvZGltIGNvbWJpbmF0aW9uIG9uIFdpbmRvd3NcbiAgYnVpbGRlci5oYXNHcmV5ID0gdGhpcy5oYXNHcmV5IHx8IGtleSA9PT0gJ2dyYXknIHx8IGtleSA9PT0gJ2dyZXknO1xuXG4gIC8vIGBfX3Byb3RvX19gIGlzIHVzZWQgYmVjYXVzZSB3ZSBtdXN0IHJldHVybiBhIGZ1bmN0aW9uLCBidXQgdGhlcmUgaXNcbiAgLy8gbm8gd2F5IHRvIGNyZWF0ZSBhIGZ1bmN0aW9uIHdpdGggYSBkaWZmZXJlbnQgcHJvdG90eXBlXG4gIGJ1aWxkZXIuX19wcm90b19fID0gcHJvdG87IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG9cblxuICByZXR1cm4gYnVpbGRlcjtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdHlsZSguLi5hcmdzKSB7XG4gIC8vIFN1cHBvcnQgdmFyYWdzLCBidXQgc2ltcGx5IGNhc3QgdG8gc3RyaW5nIGluIGNhc2UgdGhlcmUncyBvbmx5IG9uZSBhcmdcbiAgY29uc3QgYXJnc0xlbiA9IGFyZ3MubGVuZ3RoO1xuICBsZXQgc3RyID0gU3RyaW5nKGFyZ3NbMF0pO1xuXG4gIGlmIChhcmdzTGVuID09PSAwKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgaWYgKGFyZ3NMZW4gPiAxKSB7XG4gICAgLy8gRG9uJ3Qgc2xpY2UgYGFyZ3VtZW50c2AsIGl0IHByZXZlbnRzIFY4IG9wdGltaXphdGlvbnNcbiAgICBmb3IgKGxldCBhID0gMTsgYSA8IGFyZ3NMZW47IGErKykge1xuICAgICAgc3RyICs9ICcgJyArIGFyZ3NbYV07XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLmVuYWJsZWQgfHwgdGhpcy5sZXZlbCA8PSAwIHx8ICFzdHIpIHtcbiAgICByZXR1cm4gdGhpcy5fZW1wdHkgPyAnJyA6IHN0cjtcbiAgfVxuXG4gIC8vIFR1cm5zIG91dCB0aGF0IG9uIFdpbmRvd3MgZGltbWVkIGdyYXkgdGV4dCBiZWNvbWVzIGludmlzaWJsZSBpbiBjbWQuZXhlLFxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL2lzc3Vlcy81OFxuICAvLyBJZiB3ZSdyZSBvbiBXaW5kb3dzIGFuZCB3ZSdyZSBkZWFsaW5nXG4gIC8vIHdpdGggYSBncmF5IGNvbG9yLCB0ZW1wb3JhcmlseSBtYWtlICdkaW0nIGEgbm9vcC5cbiAgY29uc3Qgb3JpZ2luYWxEaW0gPSBhbnNpU3R5bGVzLmRpbS5vcGVuO1xuICBpZiAoaXNTaW1wbGVXaW5kb3dzVGVybSAmJiB0aGlzLmhhc0dyZXkpIHtcbiAgICBhbnNpU3R5bGVzLmRpbS5vcGVuID0gJyc7XG4gIH1cblxuICBmb3IgKGNvbnN0IGNvZGUgb2YgdGhpcy5fc3R5bGVzLnNsaWNlKCkucmV2ZXJzZSgpKSB7XG4gICAgLy8gUmVwbGFjZSBhbnkgaW5zdGFuY2VzIGFscmVhZHkgcHJlc2VudCB3aXRoIGEgcmUtb3BlbmluZyBjb2RlXG4gICAgLy8gb3RoZXJ3aXNlIG9ubHkgdGhlIHBhcnQgb2YgdGhlIHN0cmluZyB1bnRpbCBzYWlkIGNsb3NpbmcgY29kZVxuICAgIC8vIHdpbGwgYmUgY29sb3JlZCwgYW5kIHRoZSByZXN0IHdpbGwgc2ltcGx5IGJlICdwbGFpbicuXG4gICAgc3RyID0gY29kZS5vcGVuICsgc3RyLnJlcGxhY2UoY29kZS5jbG9zZVJlLCBjb2RlLm9wZW4pICsgY29kZS5jbG9zZTtcblxuICAgIC8vIENsb3NlIHRoZSBzdHlsaW5nIGJlZm9yZSBhIGxpbmVicmVhayBhbmQgcmVvcGVuXG4gICAgLy8gYWZ0ZXIgbmV4dCBsaW5lIHRvIGZpeCBhIGJsZWVkIGlzc3VlIG9uIG1hY09TXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2NoYWxrL2NoYWxrL3B1bGwvOTJcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxyP1xcbi9nLCBgJHtjb2RlLmNsb3NlfSQmJHtjb2RlLm9wZW59YCk7XG4gIH1cblxuICAvLyBSZXNldCB0aGUgb3JpZ2luYWwgYGRpbWAgaWYgd2UgY2hhbmdlZCBpdCB0b1xuICAvLyB3b3JrIGFyb3VuZCB0aGUgV2luZG93cyBkaW1tZWQgZ3JheSBpc3N1ZVxuICBhbnNpU3R5bGVzLmRpbS5vcGVuID0gb3JpZ2luYWxEaW07XG5cbiAgLy8gSWYgd2UncmUgaW4gYSBicm93c2VyIHRoZW4gcmV0dXJuIEhUTUxcbiAgaWYgKGlzQnJvd3Nlcikgc3RyID0gYW5zaUhUTUwoc3RyKTtcblxuICByZXR1cm4gc3RyO1xufVxuXG5mdW5jdGlvbiBjaGFsa1RhZyhjaGFsaywgc3RyaW5ncykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc3RyaW5ncykpIHtcbiAgICAvLyBJZiBjaGFsaygpIHdhcyBjYWxsZWQgYnkgaXRzZWxmIG9yIHdpdGggYSBzdHJpbmcsXG4gICAgLy8gcmV0dXJuIHRoZSBzdHJpbmcgaXRzZWxmIGFzIGEgc3RyaW5nLlxuICAgIC8vXG4gICAgLy8gVE9ETzogZml4IHJlc3QgcGFyYW1zIGxhdGVyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkuam9pbignICcpO1xuICB9XG5cbiAgLy8gVE9ETzogZml4IHJlc3QgcGFyYW1zIGxhdGVyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgY29uc3QgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgY29uc3QgcGFydHMgPSBbc3RyaW5ncy5yYXdbMF1dO1xuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgc3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIHBhcnRzLnB1c2goU3RyaW5nKGFyZ3NbaSAtIDFdKS5yZXBsYWNlKC9be31cXFxcXS9nLCAnXFxcXCQmJykpO1xuICAgIHBhcnRzLnB1c2goU3RyaW5nKHN0cmluZ3MucmF3W2ldKSk7XG4gIH1cblxuICByZXR1cm4gdGVtcGxhdGUoY2hhbGssIHBhcnRzLmpvaW4oJycpKTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2hhbGsucHJvdG90eXBlLCBzdHlsZXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYWxrKCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxubW9kdWxlLmV4cG9ydHMuc3VwcG9ydHNDb2xvciA9IHN0ZG91dENvbG9yO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzOyAvLyBGb3IgVHlwZVNjcmlwdFxuIl19