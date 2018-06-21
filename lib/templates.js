"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// eslint-disable-next-line max-len
var TEMPLATE_REGEX = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
var ESCAPE_REGEX = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;
var ESCAPES = new Map([['n', '\n'], ['r', '\r'], ['t', '\t'], ['b', '\b'], ['f', '\f'], ['v', '\v'], ['0', '\0'], ['\\', '\\'], ['e', "\x1B"], ['a', "\x07"]]);

function unescape(c) {
  if (c[0] === 'u' && c.length === 5 || c[0] === 'x' && c.length === 3) {
    return String.fromCharCode(parseInt(c.slice(1), 16));
  }

  return ESCAPES.get(c) || c;
}

function parseArguments(name, args) {
  var results = [];
  var chunks = args.trim().split(/\s*,\s*/g);
  var matches;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = chunks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var chunk = _step.value;

      if (!isNaN(chunk)) {
        results.push(Number(chunk));
      } else if (matches = chunk.match(STRING_REGEX)) {
        results.push(matches[2].replace(ESCAPE_REGEX, function (m, escape, chr) {
          return escape ? unescape(escape) : chr;
        }));
      } else {
        throw new Error("Invalid Chalk template style argument: ".concat(chunk, " (in style '").concat(name, "')"));
      }
    }
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

  return results;
}

function parseStyle(style) {
  STYLE_REGEX.lastIndex = 0;
  var results = [];
  var matches;

  while ((matches = STYLE_REGEX.exec(style)) !== null) {
    var name = matches[1];

    if (matches[2]) {
      var args = parseArguments(name, matches[2]);
      results.push([name].concat(args));
    } else {
      results.push([name]);
    }
  }

  return results;
}

function buildStyle(chalk, styles) {
  var enabled = {};
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = styles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var layer = _step2.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = layer.styles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var style = _step3.value;
          enabled[style[0]] = layer.inverse ? null : style.slice(1);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var current = chalk;

  var _arr = Object.keys(enabled);

  for (var _i = 0; _i < _arr.length; _i++) {
    var styleName = _arr[_i];

    if (Array.isArray(enabled[styleName])) {
      if (!(styleName in current)) {
        throw new Error("Unknown Chalk style: ".concat(styleName));
      }

      if (enabled[styleName].length > 0) {
        var _current;

        current = (_current = current)[styleName].apply(_current, _toConsumableArray(enabled[styleName]));
      } else {
        current = current[styleName];
      }
    }
  }

  return current;
}

module.exports = function (chalk, tmp) {
  var styles = [];
  var chunks = [];
  var chunk = []; // eslint-disable-next-line max-params

  tmp.replace(TEMPLATE_REGEX, function (m, escapeChar, inverse, style, close, chr) {
    if (escapeChar) {
      chunk.push(unescape(escapeChar));
    } else if (style) {
      var str = chunk.join('');
      chunk = [];
      chunks.push(styles.length === 0 ? str : buildStyle(chalk, styles)(str));
      styles.push({
        inverse: inverse,
        styles: parseStyle(style)
      });
    } else if (close) {
      if (styles.length === 0) {
        throw new Error('Found extraneous } in Chalk template literal');
      }

      chunks.push(buildStyle(chalk, styles)(chunk.join('')));
      chunk = [];
      styles.pop();
    } else {
      chunk.push(chr);
    }
  });
  chunks.push(chunk.join(''));

  if (styles.length > 0) {
    var errMsg = "Chalk template literal is missing ".concat(styles.length, " closing bracket").concat(styles.length === 1 ? '' : 's', " (`}`)");
    throw new Error(errMsg);
  }

  return chunks.join('');
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90ZW1wbGF0ZXMuanMiXSwibmFtZXMiOlsiVEVNUExBVEVfUkVHRVgiLCJTVFlMRV9SRUdFWCIsIlNUUklOR19SRUdFWCIsIkVTQ0FQRV9SRUdFWCIsIkVTQ0FQRVMiLCJNYXAiLCJ1bmVzY2FwZSIsImMiLCJsZW5ndGgiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJwYXJzZUludCIsInNsaWNlIiwiZ2V0IiwicGFyc2VBcmd1bWVudHMiLCJuYW1lIiwiYXJncyIsInJlc3VsdHMiLCJjaHVua3MiLCJ0cmltIiwic3BsaXQiLCJtYXRjaGVzIiwiY2h1bmsiLCJpc05hTiIsInB1c2giLCJOdW1iZXIiLCJtYXRjaCIsInJlcGxhY2UiLCJtIiwiZXNjYXBlIiwiY2hyIiwiRXJyb3IiLCJwYXJzZVN0eWxlIiwic3R5bGUiLCJsYXN0SW5kZXgiLCJleGVjIiwiY29uY2F0IiwiYnVpbGRTdHlsZSIsImNoYWxrIiwic3R5bGVzIiwiZW5hYmxlZCIsImxheWVyIiwiaW52ZXJzZSIsImN1cnJlbnQiLCJPYmplY3QiLCJrZXlzIiwic3R5bGVOYW1lIiwiQXJyYXkiLCJpc0FycmF5IiwibW9kdWxlIiwiZXhwb3J0cyIsInRtcCIsImVzY2FwZUNoYXIiLCJjbG9zZSIsInN0ciIsImpvaW4iLCJwb3AiLCJlcnJNc2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBLElBQU1BLGlCQUFpQixzSUFBdkI7QUFDQSxJQUFNQyxjQUFjLGdDQUFwQjtBQUNBLElBQU1DLGVBQWUsa0NBQXJCO0FBQ0EsSUFBTUMsZUFBZSx5Q0FBckI7QUFFQSxJQUFNQyxVQUFVLElBQUlDLEdBQUosQ0FBUSxDQUN0QixDQUFDLEdBQUQsRUFBTSxJQUFOLENBRHNCLEVBRXRCLENBQUMsR0FBRCxFQUFNLElBQU4sQ0FGc0IsRUFHdEIsQ0FBQyxHQUFELEVBQU0sSUFBTixDQUhzQixFQUl0QixDQUFDLEdBQUQsRUFBTSxJQUFOLENBSnNCLEVBS3RCLENBQUMsR0FBRCxFQUFNLElB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O0FBR0EsVUFBTSxJQUFJdUIsS0FBSixDQUFVMEIsTUFBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBT3ZDLE9BQU9xQyxJQUFQLENBQVksRUFBWixDQUFQO0FBQ0QsQ0FyQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxuY29uc3QgVEVNUExBVEVfUkVHRVggPSAvKD86XFxcXCh1W2EtZlxcZF17NH18eFthLWZcXGRdezJ9fC4pKXwoPzpcXHsofik/KFxcdysoPzpcXChbXildKlxcKSk/KD86XFwuXFx3Kyg/OlxcKFteKV0qXFwpKT8pKikoPzpbIFxcdF18KD89XFxyP1xcbikpKXwoXFx9KXwoKD86LnxbXFxyXFxuXFxmXSkrPykvZ2k7XG5jb25zdCBTVFlMRV9SRUdFWCA9IC8oPzpefFxcLikoXFx3KykoPzpcXCgoW14pXSopXFwpKT8vZztcbmNvbnN0IFNUUklOR19SRUdFWCA9IC9eKFsnXCJdKSgoPzpcXFxcLnwoPyFcXDEpW15cXFxcXSkqKVxcMSQvO1xuY29uc3QgRVNDQVBFX1JFR0VYID0gL1xcXFwodVthLWZcXGRdezR9fHhbYS1mXFxkXXsyfXwuKXwoW15cXFxcXSkvZ2k7XG5cbmNvbnN0IEVTQ0FQRVMgPSBuZXcgTWFwKFtcbiAgWyduJywgJ1xcbiddLFxuICBbJ3InLCAnXFxyJ10sXG4gIFsndCcsICdcXHQnXSxcbiAgWydiJywgJ1xcYiddLFxuICBbJ2YnLCAnXFxmJ10sXG4gIFsndicsICdcXHYnXSxcbiAgWycwJywgJ1xcMCddLFxuICBbJ1xcXFwnLCAnXFxcXCddLFxuICBbJ2UnLCAnXFx1MDAxQiddLFxuICBbJ2EnLCAnXFx1MDAwNyddXG5dKTtcblxuZnVuY3Rpb24gdW5lc2NhcGUoYykge1xuICBpZiAoKGNbMF0gPT09ICd1JyAmJiBjLmxlbmd0aCA9PT0gNSkgfHwgKGNbMF0gPT09ICd4JyAmJiBjLmxlbmd0aCA9PT0gMykpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChjLnNsaWNlKDEpLCAxNikpO1xuICB9XG5cbiAgcmV0dXJuIEVTQ0FQRVMuZ2V0KGMpIHx8IGM7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzKG5hbWUsIGFyZ3MpIHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBjb25zdCBjaHVua3MgPSBhcmdzLnRyaW0oKS5zcGxpdCgvXFxzKixcXHMqL2cpO1xuICBsZXQgbWF0Y2hlcztcblxuICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgIGlmICghaXNOYU4oY2h1bmspKSB7XG4gICAgICByZXN1bHRzLnB1c2goTnVtYmVyKGNodW5rKSk7XG4gICAgfSBlbHNlIGlmICgobWF0Y2hlcyA9IGNodW5rLm1hdGNoKFNUUklOR19SRUdFWCkpKSB7XG4gICAgICByZXN1bHRzLnB1c2goXG4gICAgICAgIG1hdGNoZXNbMl0ucmVwbGFjZShcbiAgICAgICAgICBFU0NBUEVfUkVHRVgsXG4gICAgICAgICAgKG0sIGVzY2FwZSwgY2hyKSA9PiAoZXNjYXBlID8gdW5lc2NhcGUoZXNjYXBlKSA6IGNocilcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSW52YWxpZCBDaGFsayB0ZW1wbGF0ZSBzdHlsZSBhcmd1bWVudDogJHtjaHVua30gKGluIHN0eWxlICcke25hbWV9JylgXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBwYXJzZVN0eWxlKHN0eWxlKSB7XG4gIFNUWUxFX1JFR0VYLmxhc3RJbmRleCA9IDA7XG5cbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICBsZXQgbWF0Y2hlcztcblxuICB3aGlsZSAoKG1hdGNoZXMgPSBTVFlMRV9SRUdFWC5leGVjKHN0eWxlKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBuYW1lID0gbWF0Y2hlc1sxXTtcblxuICAgIGlmIChtYXRjaGVzWzJdKSB7XG4gICAgICBjb25zdCBhcmdzID0gcGFyc2VBcmd1bWVudHMobmFtZSwgbWF0Y2hlc1syXSk7XG4gICAgICByZXN1bHRzLnB1c2goW25hbWVdLmNvbmNhdChhcmdzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdHMucHVzaChbbmFtZV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBidWlsZFN0eWxlKGNoYWxrLCBzdHlsZXMpIHtcbiAgY29uc3QgZW5hYmxlZCA9IHt9O1xuXG4gIGZvciAoY29uc3QgbGF5ZXIgb2Ygc3R5bGVzKSB7XG4gICAgZm9yIChjb25zdCBzdHlsZSBvZiBsYXllci5zdHlsZXMpIHtcbiAgICAgIGVuYWJsZWRbc3R5bGVbMF1dID0gbGF5ZXIuaW52ZXJzZSA/IG51bGwgOiBzdHlsZS5zbGljZSgxKTtcbiAgICB9XG4gIH1cblxuICBsZXQgY3VycmVudCA9IGNoYWxrO1xuICBmb3IgKGNvbnN0IHN0eWxlTmFtZSBvZiBPYmplY3Qua2V5cyhlbmFibGVkKSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGVuYWJsZWRbc3R5bGVOYW1lXSkpIHtcbiAgICAgIGlmICghKHN0eWxlTmFtZSBpbiBjdXJyZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gQ2hhbGsgc3R5bGU6ICR7c3R5bGVOYW1lfWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5hYmxlZFtzdHlsZU5hbWVdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnRbc3R5bGVOYW1lXSguLi5lbmFibGVkW3N0eWxlTmFtZV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnRbc3R5bGVOYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3VycmVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoY2hhbGssIHRtcCkgPT4ge1xuICBjb25zdCBzdHlsZXMgPSBbXTtcbiAgY29uc3QgY2h1bmtzID0gW107XG4gIGxldCBjaHVuayA9IFtdO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtcGFyYW1zXG4gIHRtcC5yZXBsYWNlKFRFTVBMQVRFX1JFR0VYLCAobSwgZXNjYXBlQ2hhciwgaW52ZXJzZSwgc3R5bGUsIGNsb3NlLCBjaHIpID0+IHtcbiAgICBpZiAoZXNjYXBlQ2hhcikge1xuICAgICAgY2h1bmsucHVzaCh1bmVzY2FwZShlc2NhcGVDaGFyKSk7XG4gICAgfSBlbHNlIGlmIChzdHlsZSkge1xuICAgICAgY29uc3Qgc3RyID0gY2h1bmsuam9pbignJyk7XG4gICAgICBjaHVuayA9IFtdO1xuICAgICAgY2h1bmtzLnB1c2goc3R5bGVzLmxlbmd0aCA9PT0gMCA/IHN0ciA6IGJ1aWxkU3R5bGUoY2hhbGssIHN0eWxlcykoc3RyKSk7XG4gICAgICBzdHlsZXMucHVzaCh7IGludmVyc2UsIHN0eWxlczogcGFyc2VTdHlsZShzdHlsZSkgfSk7XG4gICAgfSBlbHNlIGlmIChjbG9zZSkge1xuICAgICAgaWYgKHN0eWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCBleHRyYW5lb3VzIH0gaW4gQ2hhbGsgdGVtcGxhdGUgbGl0ZXJhbCcpO1xuICAgICAgfVxuXG4gICAgICBjaHVua3MucHVzaChidWlsZFN0eWxlKGNoYWxrLCBzdHlsZXMpKGNodW5rLmpvaW4oJycpKSk7XG4gICAgICBjaHVuayA9IFtdO1xuICAgICAgc3R5bGVzLnBvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaHVuay5wdXNoKGNocik7XG4gICAgfVxuICB9KTtcblxuICBjaHVua3MucHVzaChjaHVuay5qb2luKCcnKSk7XG5cbiAgaWYgKHN0eWxlcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZXJyTXNnID0gYENoYWxrIHRlbXBsYXRlIGxpdGVyYWwgaXMgbWlzc2luZyAke1xuICAgICAgc3R5bGVzLmxlbmd0aFxuICAgIH0gY2xvc2luZyBicmFja2V0JHtzdHlsZXMubGVuZ3RoID09PSAxID8gJycgOiAncyd9IChcXGB9XFxgKWA7XG4gICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzLmpvaW4oJycpO1xufTtcbiJdfQ==