/**
 * p5.ColorGenerator 2.0.0
 * HSB and OKLCH color schemes for p5.js.
 *
 * The constructor and every method restore the sketch color mode, including
 * channel ranges. Pass a p5 instance as the second argument in instance mode.
 */
(function (root, factory) {
  var ColorGenerator = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = ColorGenerator;
    module.exports.ColorGenerator = ColorGenerator;
    module.exports.default = ColorGenerator;
  }
  if (root) {
    root.ColorGenerator = ColorGenerator;
    if (typeof root.p5 === 'function') {
      ColorGenerator.attachToP5(root.p5);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var NAMED_COLORS = {
    aliceblue: 1, antiquewhite: 1, aqua: 1, aquamarine: 1, azure: 1, beige: 1,
    bisque: 1, black: 1, blanchedalmond: 1, blue: 1, blueviolet: 1, brown: 1,
    burlywood: 1, cadetblue: 1, chartreuse: 1, chocolate: 1, coral: 1,
    cornflowerblue: 1, cornsilk: 1, crimson: 1, cyan: 1, darkblue: 1,
    darkcyan: 1, darkgoldenrod: 1, darkgray: 1, darkgreen: 1, darkgrey: 1,
    darkkhaki: 1, darkmagenta: 1, darkolivegreen: 1, darkorange: 1,
    darkorchid: 1, darkred: 1, darksalmon: 1, darkseagreen: 1, darkslateblue: 1,
    darkslategray: 1, darkslategrey: 1, darkturquoise: 1, darkviolet: 1,
    deeppink: 1, deepskyblue: 1, dimgray: 1, dimgrey: 1, dodgerblue: 1,
    firebrick: 1, floralwhite: 1, forestgreen: 1, fuchsia: 1, gainsboro: 1,
    ghostwhite: 1, gold: 1, goldenrod: 1, gray: 1, green: 1, greenyellow: 1,
    grey: 1, honeydew: 1, hotpink: 1, indianred: 1, indigo: 1, ivory: 1,
    khaki: 1, lavender: 1, lavenderblush: 1, lawngreen: 1, lemonchiffon: 1,
    lightblue: 1, lightcoral: 1, lightcyan: 1, lightgoldenrodyellow: 1,
    lightgray: 1, lightgreen: 1, lightgrey: 1, lightpink: 1, lightsalmon: 1,
    lightseagreen: 1, lightskyblue: 1, lightslategray: 1, lightslategrey: 1,
    lightsteelblue: 1, lightyellow: 1, lime: 1, limegreen: 1, linen: 1,
    magenta: 1, maroon: 1, mediumaquamarine: 1, mediumblue: 1, mediumorchid: 1,
    mediumpurple: 1, mediumseagreen: 1, mediumslateblue: 1, mediumspringgreen: 1,
    mediumturquoise: 1, mediumvioletred: 1, midnightblue: 1, mintcream: 1,
    mistyrose: 1, moccasin: 1, navajowhite: 1, navy: 1, oldlace: 1, olive: 1,
    olivedrab: 1, orange: 1, orangered: 1, orchid: 1, palegoldenrod: 1,
    palegreen: 1, paleturquoise: 1, palevioletred: 1, papayawhip: 1,
    peachpuff: 1, peru: 1, pink: 1, plum: 1, powderblue: 1, purple: 1,
    rebeccapurple: 1, red: 1, rosybrown: 1, royalblue: 1, saddlebrown: 1,
    salmon: 1, sandybrown: 1, seagreen: 1, seashell: 1, sienna: 1, silver: 1,
    skyblue: 1, slateblue: 1, slategray: 1, slategrey: 1, snow: 1,
    springgreen: 1, steelblue: 1, tan: 1, teal: 1, thistle: 1, tomato: 1,
    turquoise: 1, violet: 1, wheat: 1, white: 1, whitesmoke: 1, yellow: 1,
    yellowgreen: 1
  };

  var HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  var FUNCTIONAL_COLOR = /^(?:rgb|rgba|hsl|hsla|hsb|hsba)\(/i;

  // Machado, Oliveira, and Fernandes (2009), severity 1.0, applied in linear RGB.
  var CVD_MATRICES = {
    protanopia: [
      [0.152286, 1.052583, -0.204868],
      [0.114503, 0.786281, 0.099216],
      [-0.003882, -0.048116, 1.051998]
    ],
    deuteranopia: [
      [0.367322, 0.860646, -0.227968],
      [0.280085, 0.672501, 0.047413],
      [-0.011820, 0.042940, 0.968881]
    ],
    tritanopia: [
      [1.255528, -0.076749, -0.178779],
      [-0.078411, 0.930809, 0.147602],
      [0.004733, 0.691367, 0.303900]
    ]
  };

  var EASINGS = {
    linear: function (t) { return t; },
    easein: function (t) { return t * t; },
    easeout: function (t) { return 1 - (1 - t) * (1 - t); },
    easeinout: function (t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  };

  function attachToP5(p5Constructor, ColorGenerator) {
    if (!p5Constructor || !p5Constructor.prototype) return;
    if (p5Constructor.prototype.createColorGenerator) return;
    p5Constructor.prototype.createColorGenerator = function (colorInput, options) {
      return new ColorGenerator(colorInput, this, options);
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function wrapHue(value) {
    if (!Number.isFinite(value)) {
      throw new TypeError('Hue must be a finite number.');
    }
    return ((value % 360) + 360) % 360;
  }

  function isPlainObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function isP5Instance(value) {
    return !!value &&
      typeof value === 'object' &&
      typeof value.color === 'function' &&
      typeof value.colorMode === 'function' &&
      !!value._colorMaxes;
  }

  function isP5Color(value) {
    return !!value &&
      typeof value === 'object' &&
      Array.isArray(value._array) &&
      value._array.length >= 3;
  }

  function isColorSpec(value) {
    if (!isPlainObject(value)) return false;
    var hasH = Object.prototype.hasOwnProperty.call(value, 'h') ||
      Object.prototype.hasOwnProperty.call(value, 'hue');
    var hasS = Object.prototype.hasOwnProperty.call(value, 's') ||
      Object.prototype.hasOwnProperty.call(value, 'saturation');
    var hasB = Object.prototype.hasOwnProperty.call(value, 'b') ||
      Object.prototype.hasOwnProperty.call(value, 'brightness');
    return hasH && hasS && hasB;
  }

  function isOptions(value) {
    if (!isPlainObject(value) || isColorSpec(value)) return false;
    return Object.prototype.hasOwnProperty.call(value, 'seed') ||
      Object.prototype.hasOwnProperty.call(value, 'space') ||
      Object.prototype.hasOwnProperty.call(value, 'instance');
  }

  function requireCount(value) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new TypeError('Color count must be a non-negative integer.');
    }
    return value;
  }

  function requireFinite(value, label) {
    var number = Number(value);
    if (!Number.isFinite(number)) {
      throw new TypeError(label + ' must be a finite number.');
    }
    return number;
  }

  function numberOr(value, fallback, label) {
    if (value === undefined || value === null) return fallback;
    return requireFinite(value, label);
  }

  function normalizeSpace(space) {
    var value = String(space || 'hsb').toLowerCase();
    if (value !== 'hsb' && value !== 'oklch') {
      throw new Error('Color space must be "hsb" or "oklch".');
    }
    return value;
  }

  function normalizeMixSpace(space) {
    var value = String(space || 'hsb').toLowerCase();
    if (value !== 'hsb' && value !== 'oklch' && value !== 'rgb') {
      throw new Error('Mix space must be "hsb", "oklch", or "rgb".');
    }
    return value;
  }

  function resolveP5(instance) {
    if (isP5Instance(instance)) return instance;
    var root = typeof globalThis !== 'undefined' ? globalThis : null;
    if (root && root.p5 && isP5Instance(root.p5.instance)) return root.p5.instance;
    if (isP5Instance(root)) return root;
    throw new Error('ColorGenerator requires p5. In instance mode, pass the sketch: new ColorGenerator(color, p).');
  }

  function mulberry32(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) | 0;
      var t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng(seed) {
    if (seed === undefined || seed === null) return Math.random;
    if (typeof seed !== 'number' || !Number.isFinite(seed)) {
      throw new TypeError('Seed must be a finite number.');
    }
    return mulberry32(seed);
  }

  function randomBase(rng) {
    return {
      h: rng() * 360,
      s: 40 + rng() * 55,
      b: 35 + rng() * 55,
      a: 1
    };
  }

  function stepsOf(count, includeBase) {
    if (count === 0) return [];
    if (count === 1) return [includeBase ? 0 : 1];
    var out = new Array(count);
    var i;
    if (includeBase) {
      for (i = 0; i < count; i++) out[i] = i / (count - 1);
      return out;
    }
    for (i = 0; i < count; i++) out[i] = (i + 1) / count;
    return out;
  }

  function pairOffsets(step, count) {
    var offsets = [0];
    var ring = 1;
    while (offsets.length < count) {
      offsets.push(-step * ring);
      if (offsets.length < count) offsets.push(step * ring);
      ring++;
    }
    return offsets.slice(0, count);
  }

  function splitOffsets(degree, count) {
    var offsets = [0];
    var ring = 1;
    while (offsets.length < count) {
      offsets.push(180 - degree * ring);
      if (offsets.length < count) offsets.push(180 + degree * ring);
      ring++;
    }
    return offsets.slice(0, count);
  }

  function rampArgs(first, second, defaults) {
    if (isPlainObject(first)) {
      return {
        count: requireCount(numberOr(first.count !== undefined ? first.count : first.nr, defaults.count, 'count')),
        limit: numberOr(first.limit, defaults.limit, 'limit'),
        includeBase: first.includeBase !== undefined ? !!first.includeBase : true
      };
    }
    var options = {
      count: requireCount(first),
      limit: defaults.limit,
      includeBase: true
    };
    if (isPlainObject(second)) {
      options.limit = numberOr(second.limit, defaults.limit, 'limit');
      if (second.includeBase !== undefined) options.includeBase = !!second.includeBase;
      return options;
    }
    if (second !== undefined) options.limit = requireFinite(second, 'limit');
    return options;
  }

  function harmonyArgs(first, second, defaults) {
    if (isPlainObject(first)) {
      return {
        degree: numberOr(
          first.degree !== undefined ? first.degree : first.angle,
          defaults.degree,
          'degree'
        ),
        count: requireCount(numberOr(first.count, defaults.count, 'count'))
      };
    }
    return {
      degree: numberOr(first, defaults.degree, 'degree'),
      count: requireCount(numberOr(second, defaults.count, 'count'))
    };
  }

  function directionOf(value, fallbackIncrease) {
    if (value === true || value === 'increase' || value === 'up') return 1;
    if (value === false || value === 'decrease' || value === 'down') return -1;
    if (value === undefined || value === null) return fallbackIncrease ? 1 : -1;
    throw new TypeError('Direction must be a boolean or "increase" / "decrease".');
  }

  function monoArgs(first, increaseSaturation, increaseBrightness) {
    if (isPlainObject(first)) {
      var sat = first.saturation !== undefined ? first.saturation : first.increaseSaturation;
      var bri = first.brightness !== undefined ? first.brightness : first.increaseBrightness;
      return {
        count: requireCount(numberOr(first.count !== undefined ? first.count : first.nr, 1, 'count')),
        saturation: directionOf(sat, false),
        brightness: directionOf(bri, false)
      };
    }
    return {
      count: requireCount(first),
      saturation: directionOf(increaseSaturation, false),
      brightness: directionOf(increaseBrightness, false)
    };
  }

  function resolveEasing(easing) {
    if (typeof easing === 'function') return easing;
    if (easing === undefined || easing === null) return EASINGS.linear;
    var fn = EASINGS[String(easing).toLowerCase()];
    if (!fn) throw new TypeError('Unknown easing "' + easing + '".');
    return fn;
  }

  function assertColorString(value) {
    var trimmed = value.trim();
    var lower = trimmed.toLowerCase();
    if (HEX_COLOR.test(trimmed) || FUNCTIONAL_COLOR.test(trimmed) || NAMED_COLORS[lower]) {
      return trimmed;
    }
    throw new TypeError('"' + value + '" is not a valid color.');
  }

  function srgbToLinear(channel) {
    return channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(channel) {
    return channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
  }

  function rgbToHsb(r, g, b) {
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var delta = max - min;
    var h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return {
      h: h,
      s: max === 0 ? 0 : (delta / max) * 100,
      b: max * 100
    };
  }

  function hsbToRgb(h, s, b) {
    var hue = wrapHue(h) / 60;
    var sat = clamp(s, 0, 100) / 100;
    var bri = clamp(b, 0, 100) / 100;
    var chroma = bri * sat;
    var x = chroma * (1 - Math.abs(hue % 2 - 1));
    var m = bri - chroma;
    var r = 0;
    var g = 0;
    var bl = 0;
    if (hue < 1) { r = chroma; g = x; }
    else if (hue < 2) { r = x; g = chroma; }
    else if (hue < 3) { g = chroma; bl = x; }
    else if (hue < 4) { g = x; bl = chroma; }
    else if (hue < 5) { r = x; bl = chroma; }
    else { r = chroma; bl = x; }
    return { r: r + m, g: g + m, b: bl + m };
  }

  function rgbToOklab(r, g, b) {
    var lr = srgbToLinear(r);
    var lg = srgbToLinear(g);
    var lb = srgbToLinear(b);
    var l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    var m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    var s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    return {
      L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    };
  }

  function oklabToRgb(L, a, b) {
    var l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    var m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    var s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    return {
      r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)
    };
  }

  function rgbToOklch(r, g, b) {
    var lab = rgbToOklab(r, g, b);
    var c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
    var h = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
    if (h < 0) h += 360;
    return { l: lab.L, c: c, h: h };
  }

  function oklchToRgb(l, c, h) {
    var rad = wrapHue(h) * Math.PI / 180;
    return oklabToRgb(l, c * Math.cos(rad), c * Math.sin(rad));
  }

  function inGamut(rgb) {
    var eps = 1e-4;
    return Number.isFinite(rgb.r) && Number.isFinite(rgb.g) && Number.isFinite(rgb.b) &&
      rgb.r >= -eps && rgb.r <= 1 + eps &&
      rgb.g >= -eps && rgb.g <= 1 + eps &&
      rgb.b >= -eps && rgb.b <= 1 + eps;
  }

  function clamp01(value) {
    return clamp(value, 0, 1);
  }

  function oklchToRgbGamut(l, c, h) {
    var lightness = clamp(l, 0, 1);
    if (lightness <= 0 || lightness >= 1) {
      return { r: lightness, g: lightness, b: lightness };
    }
    var chroma = Math.max(0, c);
    var rgb = oklchToRgb(lightness, chroma, h);
    if (inGamut(rgb)) {
      return { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b) };
    }
    var lo = 0;
    var hi = chroma;
    var best = { r: lightness, g: lightness, b: lightness };
    for (var i = 0; i < 24; i++) {
      var mid = (lo + hi) / 2;
      rgb = oklchToRgb(lightness, mid, h);
      if (inGamut(rgb)) {
        best = rgb;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return { r: clamp01(best.r), g: clamp01(best.g), b: clamp01(best.b) };
  }

  function relativeLuminance(r, g, b) {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  }

  function contrastRatio01(a, b) {
    var l1 = relativeLuminance(a.r, a.g, a.b);
    var l2 = relativeLuminance(b.r, b.g, b.b);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function rgbaOf(color) {
    if (color && color._array && color._array.length >= 3) {
      return {
        r: clamp(Math.round(color._array[0] * 255), 0, 255),
        g: clamp(Math.round(color._array[1] * 255), 0, 255),
        b: clamp(Math.round(color._array[2] * 255), 0, 255),
        a: color._array.length > 3 ? color._array[3] : 1
      };
    }
    if (color && color.levels && color.levels.length >= 3) {
      return {
        r: color.levels[0],
        g: color.levels[1],
        b: color.levels[2],
        a: color.levels.length > 3 ? color.levels[3] / 255 : 1
      };
    }
    throw new TypeError('Expected a p5.Color.');
  }

  function rgba01(rgba) {
    return { r: rgba.r / 255, g: rgba.g / 255, b: rgba.b / 255, a: rgba.a };
  }

  function byteHex(value) {
    var hex = clamp(Math.round(value), 0, 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  function formatHex(rgba) {
    var hex = '#' + byteHex(rgba.r) + byteHex(rgba.g) + byteHex(rgba.b);
    if (rgba.a < 0.999) hex += byteHex(rgba.a * 255);
    return hex;
  }

  function formatCss(rgba) {
    if (rgba.a >= 0.999) {
      return 'rgb(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ')';
    }
    var alpha = Math.round(rgba.a * 1000) / 1000;
    return 'rgba(' + rgba.r + ', ' + rgba.g + ', ' + rgba.b + ', ' + alpha + ')';
  }

  function simulateCvd(kind, r, g, b) {
    var key = String(kind || '').toLowerCase();
    var matrix = CVD_MATRICES[key];
    if (!matrix) {
      throw new TypeError('Color vision kind must be "protanopia", "deuteranopia", or "tritanopia".');
    }
    var lr = srgbToLinear(r);
    var lg = srgbToLinear(g);
    var lb = srgbToLinear(b);
    var channels = [lr, lg, lb];
    var out = [0, 0, 0];
    for (var row = 0; row < 3; row++) {
      out[row] = matrix[row][0] * channels[0] + matrix[row][1] * channels[1] + matrix[row][2] * channels[2];
    }
    return {
      r: clamp01(linearToSrgb(out[0])),
      g: clamp01(linearToSrgb(out[1])),
      b: clamp01(linearToSrgb(out[2]))
    };
  }

  function shortestHueDelta(from, to) {
    var delta = ((to - from) % 360 + 360) % 360;
    if (delta > 180) delta -= 360;
    return delta;
  }

  function readPixels(img, maxSamples) {
    var pixels;
    var width;
    var height;
    if (img && typeof img.loadPixels === 'function') {
      if (!img.pixels || img.pixels.length === 0) img.loadPixels();
      pixels = img.pixels;
      width = img.width;
      height = img.height;
    } else if (img && img.pixels && img.width && img.height) {
      pixels = img.pixels;
      width = img.width;
      height = img.height;
    } else if (typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement) {
      var context = img.getContext('2d');
      if (!context || !context.getImageData) {
        throw new TypeError('Could not read pixels from the canvas.');
      }
      var data = context.getImageData(0, 0, img.width, img.height);
      pixels = data.data;
      width = img.width;
      height = img.height;
    } else {
      throw new TypeError('Expected a p5.Image, canvas, or { pixels, width, height }.');
    }

    var total = width * height;
    if (!total) throw new TypeError('The image has no pixels.');
    var stride = Math.max(1, Math.floor(total / maxSamples));
    var samples = [];
    for (var i = 0; i < total; i += stride) {
      var offset = i * 4;
      if (pixels[offset + 3] === 0) continue;
      samples.push({
        r: pixels[offset],
        g: pixels[offset + 1],
        b: pixels[offset + 2]
      });
    }
    if (!samples.length) throw new Error('The image has no opaque pixels.');
    return samples;
  }

  function medianCut(samples, count) {
    var boxes = [samples.slice()];
    while (boxes.length < count) {
      var bestIndex = -1;
      var bestRange = 0;
      var bestChannel = 'r';
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        if (box.length < 2) continue;
        var channels = ['r', 'g', 'b'];
        for (var c = 0; c < channels.length; c++) {
          var channel = channels[c];
          var min = 255;
          var max = 0;
          for (var p = 0; p < box.length; p++) {
            var value = box[p][channel];
            if (value < min) min = value;
            if (value > max) max = value;
          }
          var range = max - min;
          if (range > bestRange) {
            bestRange = range;
            bestIndex = i;
            bestChannel = channel;
          }
        }
      }
      if (bestIndex === -1) break;
      var chosen = boxes.splice(bestIndex, 1)[0];
      chosen.sort(function (a, b) { return a[bestChannel] - b[bestChannel]; });
      var mid = Math.floor(chosen.length / 2);
      boxes.push(chosen.slice(0, mid), chosen.slice(mid));
    }

    return boxes.map(function (box) {
      var r = 0;
      var g = 0;
      var b = 0;
      for (var i = 0; i < box.length; i++) {
        r += box[i].r;
        g += box[i].g;
        b += box[i].b;
      }
      return {
        r: Math.round(r / box.length),
        g: Math.round(g / box.length),
        b: Math.round(b / box.length),
        count: box.length
      };
    }).sort(function (a, b) { return b.count - a.count; });
  }

  function withColorState(p, mode, maxes, fn) {
    if (!p._colorMaxes || p._colorMode === undefined) {
      throw new Error('This p5 build does not expose color-mode state ColorGenerator can restore.');
    }
    var previousMode = p._colorMode;
    var saved = {};
    var keys = Object.keys(p._colorMaxes);
    for (var i = 0; i < keys.length; i++) {
      saved[keys[i]] = p._colorMaxes[keys[i]].slice();
    }
    try {
      p.colorMode(mode, maxes[0], maxes[1], maxes[2], maxes[3]);
      return fn(p);
    } finally {
      for (var k = 0; k < keys.length; k++) {
        var bucket = p._colorMaxes[keys[k]];
        var values = saved[keys[k]];
        bucket[0] = values[0];
        bucket[1] = values[1];
        bucket[2] = values[2];
        bucket[3] = values[3];
      }
      p._colorMode = previousMode;
    }
  }

  class ColorGenerator {
    /**
     * @param {string|object|Array|number} [colorInput] Hex, CSS color, p5.Color,
     *   `[h, s, b]`, `{ h, s, b, a }`, or omitted for a random base.
     * @param {object|p5} [optionsOrInstance] A p5 instance, or `{ space, seed, instance }`.
     * @param {object|p5} [maybeOptions] The remaining instance or options object.
     */
    constructor(colorInput, optionsOrInstance, maybeOptions) {
      var input = colorInput;
      var instance;
      var options = {};

      if (isP5Instance(colorInput)) {
        instance = colorInput;
        input = undefined;
      } else if (isOptions(colorInput)) {
        options = Object.assign({}, colorInput);
        input = undefined;
      }

      if (isP5Instance(optionsOrInstance)) instance = optionsOrInstance;
      else if (isOptions(optionsOrInstance)) options = Object.assign({}, options, optionsOrInstance);

      if (isP5Instance(maybeOptions)) instance = maybeOptions;
      else if (isPlainObject(maybeOptions)) options = Object.assign({}, options, maybeOptions);

      if (options.instance) instance = options.instance;

      this._p = resolveP5(instance);
      attachToP5(this._p.constructor, ColorGenerator);
      if (isColorSpec(input) && input.space) options.space = input.space;
      this.space = normalizeSpace(options.space);
      this._rng = makeRng(options.seed);

      if (input === undefined) this.setColor(randomBase(this._rng));
      else this.setColor(input);
    }

    /**
     * Replace the base color. Accepts the same color forms as the constructor.
     * @return {ColorGenerator} this
     */
    setColor(colorInput) {
      var parsed = this._parse(colorInput);
      this.color = parsed.color;
      this.h = parsed.h;
      this.s = parsed.s;
      this.b = parsed.b;
      this.a = parsed.a;
      this._oklch = parsed.oklch;
      return this;
    }

    /**
     * Use "hsb" (default) or "oklch" for ramps and hue rotation.
     * @return {ColorGenerator} this
     */
    setSpace(space) {
      this.space = normalizeSpace(space);
      return this;
    }

    getShades(count, limit) {
      var options = rampArgs(count, limit, { count: 1, limit: 0 });
      var self = this;
      return stepsOf(options.count, options.includeBase).map(function (t) {
        return self._shade(t, options.limit);
      });
    }

    getTints(count, limit) {
      var options = rampArgs(count, limit, { count: 1, limit: 100 });
      var self = this;
      return stepsOf(options.count, options.includeBase).map(function (t) {
        return self._tint(t, options.limit);
      });
    }

    getTones(count, limit) {
      var options = rampArgs(count, limit, { count: 1, limit: 0 });
      var self = this;
      return stepsOf(options.count, options.includeBase).map(function (t) {
        return self._tone(t, options.limit);
      });
    }

    getMonochromatic(count, increaseSaturation, increaseBrightness) {
      var options = monoArgs(count, increaseSaturation, increaseBrightness);
      var self = this;
      return stepsOf(options.count, true).map(function (t) {
        return self._monochrome(t, options.saturation, options.brightness);
      });
    }

    getComplementary() {
      return this._scheme([0, 180]);
    }

    complement() {
      return this._scheme([180])[0];
    }

    getTriadic() {
      return this.getEven(3);
    }

    getAnalogous(degree, count) {
      var options = harmonyArgs(degree, count, { degree: 30, count: 3 });
      return this._scheme(pairOffsets(options.degree, options.count));
    }

    getSplitComplementary(degree, count) {
      var options = harmonyArgs(degree, count, { degree: 30, count: 3 });
      return this._scheme(splitOffsets(options.degree, options.count));
    }

    getTetradic(angle) {
      var value = 90;
      if (isPlainObject(angle)) value = numberOr(angle.angle !== undefined ? angle.angle : angle.degree, 90, 'angle');
      else if (angle !== undefined) value = requireFinite(angle, 'angle');
      return this._scheme([0, value, 180, 180 + value]);
    }

    getSquare() {
      return this.getTetradic(90);
    }

    getRectangle(angle) {
      if (angle === undefined) return this.getTetradic(60);
      return this.getTetradic(angle);
    }

    getEven(count) {
      var total = requireCount(count === undefined ? 3 : count);
      if (total < 1) return [];
      var step = 360 / total;
      var offsets = [];
      for (var i = 0; i < total; i++) offsets.push(i * step);
      return this._scheme(offsets);
    }

    /**
     * Shift hue, saturation, and brightness by the given deltas.
     * Offsets are always HSB points, in either color space.
     */
    adjust(deltas) {
      var change = deltas || {};
      var h = this.h + numberOr(change.h !== undefined ? change.h : change.hue, 0, 'h');
      var s = this.s + numberOr(change.s !== undefined ? change.s : change.saturation, 0, 's');
      var b = this.b + numberOr(change.b !== undefined ? change.b : change.brightness, 0, 'b');
      var a = change.a !== undefined ? change.a : (change.alpha !== undefined ? change.alpha : this.a);
      return this._fromHsb(h, s, b, requireFinite(a, 'alpha'));
    }

    lerpColors(other, steps, options) {
      var settings = options || {};
      var count = requireCount(steps === undefined ? 5 : steps);
      var space = settings.space ? normalizeMixSpace(settings.space) : this.space;
      var ease = resolveEasing(settings.easing);
      var from = rgbaOf(this.color);
      var to = rgbaOf(this._coerce(other));
      var ts = stepsOf(count, true);
      var self = this;
      return ts.map(function (t) {
        return self._mixRgba(from, to, ease(clamp(t, 0, 1)), space);
      });
    }

    contrastRatio(other) {
      return ColorGenerator.contrastRatio(this.color, this._coerce(other));
    }

    recommendedText(background) {
      var bg = background === undefined ? this.color : this._coerce(background);
      var blackRatio = ColorGenerator.contrastRatio(this._fromRgb(0, 0, 0, 1), bg);
      var whiteRatio = ColorGenerator.contrastRatio(this._fromRgb(255, 255, 255, 1), bg);
      return whiteRatio > blackRatio ? this._fromRgb(255, 255, 255, 1) : this._fromRgb(0, 0, 0, 1);
    }

    adjustForContrast(background, options) {
      var settings = options || {};
      var minRatio = settings.minRatio === undefined ? 4.5 : requireFinite(settings.minRatio, 'minRatio');
      var direction = settings.direction || 'auto';
      var bg = rgba01(rgbaOf(this._coerce(background)));
      var start = this._oklch;
      var current = ColorGenerator.contrastRatio(this.color, this._coerce(background));
      if (current >= minRatio && direction === 'auto') return this.color;

      var self = this;
      var search = function (dir) {
        var best = null;
        var steps = 40;
        for (var i = 1; i <= steps; i++) {
          var t = i / steps;
          var l = dir > 0 ? lerp(start.l, 1, t) : lerp(start.l, 0, t);
          var c = dir > 0 ? lerp(start.c, 0, t) : start.c * (l / Math.max(start.l, 1e-6));
          var color = self._colorFromOklch(l, c, start.h, self.a);
          var ratio = contrastRatio01(rgba01(rgbaOf(color)), bg);
          best = { color: color, ratio: ratio, t: t };
          if (ratio >= minRatio) return best;
        }
        return best;
      };

      if (direction === 'lighter' || direction === 'lighten') return search(1).color;
      if (direction === 'darker' || direction === 'darken') return search(-1).color;

      var lighter = search(1);
      var darker = search(-1);
      var lighterOk = lighter.ratio >= minRatio;
      var darkerOk = darker.ratio >= minRatio;
      if (lighterOk && darkerOk) return lighter.t <= darker.t ? lighter.color : darker.color;
      if (lighterOk) return lighter.color;
      if (darkerOk) return darker.color;
      return lighter.ratio >= darker.ratio ? lighter.color : darker.color;
    }

    lightenUntilContrast(background, minRatio) {
      return this.adjustForContrast(background, { minRatio: minRatio, direction: 'lighter' });
    }

    darkenUntilContrast(background, minRatio) {
      return this.adjustForContrast(background, { minRatio: minRatio, direction: 'darker' });
    }

    simulate(kind, color) {
      var source = color === undefined ? this.color : this._coerce(color);
      var rgba = rgbaOf(source);
      var simulated = simulateCvd(kind, rgba.r / 255, rgba.g / 255, rgba.b / 255);
      return this._fromRgb(simulated.r * 255, simulated.g * 255, simulated.b * 255, rgba.a);
    }

    /**
     * Role palette. With no argument, returns background, surface, primary,
     * accent, onPrimary, and onBackground. Pass `{ roles: { name: { from, index } } }`
     * to pick swatches. `from` is a scheme name. Negative indexes count from the end.
     * `{ from: 'base' }` uses the base color. `{ from: 'text', on: 'primary' }`
     * or `{ from: 'text', backgroundFrom, backgroundIndex }` picks black or white.
     */
    getPalette(spec) {
      var steps = spec && spec.steps ? requireCount(spec.steps) : 5;
      var shades = this.getShades(steps);
      var complementary = this.getComplementary();
      if (!spec || !spec.roles) {
        var background = shades[shades.length - 1];
        var surface = shades[Math.max(0, shades.length - 2)];
        return {
          background: background,
          surface: surface,
          primary: this.color,
          accent: complementary[1],
          onPrimary: this.recommendedText(this.color),
          onBackground: this.recommendedText(background)
        };
      }

      var sources = {
        shades: shades,
        tints: this.getTints(steps),
        tones: this.getTones(steps),
        monochromatic: this.getMonochromatic(steps),
        complementary: complementary,
        triadic: this.getTriadic(),
        analogous: this.getAnalogous(),
        splitComplementary: this.getSplitComplementary(),
        tetradic: this.getTetradic(),
        square: this.getSquare(),
        rectangle: this.getRectangle(spec.angle)
      };
      var roles = {};
      var names = Object.keys(spec.roles);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var desc = spec.roles[name];
        if (desc === 'primary' || (desc && desc.from === 'base')) {
          roles[name] = this.color;
          continue;
        }
        if (desc && desc.from === 'text') {
          var bgColor = desc.on === 'primary' || desc.on === undefined
            ? this.color
            : this._paletteColor(sources, desc.backgroundFrom, desc.backgroundIndex);
          roles[name] = this.recommendedText(bgColor);
          continue;
        }
        roles[name] = this._paletteColor(sources, desc.from, desc.index);
      }
      return roles;
    }

    toHex(color) {
      return ColorGenerator.toHex(color === undefined ? this.color : this._coerce(color));
    }

    toRgb(color) {
      return ColorGenerator.toRgb(color === undefined ? this.color : this._coerce(color));
    }

    toCss(color) {
      return ColorGenerator.toCss(color === undefined ? this.color : this._coerce(color));
    }

    toHsb(color) {
      return ColorGenerator.toHsb(color === undefined ? this.color : this._coerce(color));
    }

    static toHex(color) {
      return formatHex(rgbaOf(color));
    }

    static toRgb(color) {
      return rgbaOf(color);
    }

    static toCss(color) {
      return formatCss(rgbaOf(color));
    }

    static toHsb(color) {
      var rgba = rgbaOf(color);
      var hsb = rgbToHsb(rgba.r / 255, rgba.g / 255, rgba.b / 255);
      return { h: hsb.h, s: hsb.s, b: hsb.b, a: rgba.a };
    }

    static contrastRatio(c1, c2) {
      return contrastRatio01(rgba01(rgbaOf(c1)), rgba01(rgbaOf(c2)));
    }

    static simulate(kind, color, instance) {
      var gen = new ColorGenerator(color, instance);
      return gen.simulate(kind);
    }

    static mix(c1, c2, t, options) {
      var settings = options || {};
      var amount = t === undefined ? 0.5 : requireFinite(t, 't');
      var gen = new ColorGenerator(c1, settings.instance, { space: settings.space });
      var space = settings.space ? normalizeMixSpace(settings.space) : 'hsb';
      return gen._mixRgba(rgbaOf(gen.color), rgbaOf(gen._coerce(c2)), resolveEasing(settings.easing)(clamp(amount, 0, 1)), space);
    }

    /**
     * Dominant colors from a p5.Image, canvas, or `{ pixels, width, height }`.
     * Opaque pixels are sampled and split with median cut.
     */
    static fromImage(img, count, optionsOrInstance) {
      var total = count === undefined ? 5 : count;
      var instance;
      var samples = 8000;
      if (isP5Instance(optionsOrInstance)) {
        instance = optionsOrInstance;
      } else if (isP5Instance(count)) {
        instance = count;
        total = 5;
      } else if (isPlainObject(optionsOrInstance)) {
        instance = optionsOrInstance.instance;
        if (optionsOrInstance.samples !== undefined) {
          samples = requireCount(optionsOrInstance.samples);
        }
        if (optionsOrInstance.count !== undefined && count === undefined) {
          total = optionsOrInstance.count;
        }
      }
      total = requireCount(total);
      if (total < 1) throw new TypeError('Image palettes need at least one color.');
      var colors = medianCut(readPixels(img, Math.max(1, samples)), total);
      var gen = new ColorGenerator('#000000', instance);
      return colors.map(function (swatch) {
        return gen._fromRgb(swatch.r, swatch.g, swatch.b, 1);
      });
    }

    _paletteColor(sources, from, index) {
      var list = sources[from];
      if (!list) throw new Error('Unknown palette source "' + from + '".');
      var resolvedIndex = index === undefined ? 0 : index;
      var resolved = resolvedIndex < 0 ? list.length + resolvedIndex : resolvedIndex;
      if (!Number.isInteger(resolved) || resolved < 0 || resolved >= list.length) {
        throw new RangeError('Palette index ' + index + ' is outside "' + from + '".');
      }
      return list[resolved];
    }

    _parse(colorInput) {
      if (isColorSpec(colorInput)) {
        var h = colorInput.h !== undefined ? colorInput.h : colorInput.hue;
        var s = colorInput.s !== undefined ? colorInput.s : colorInput.saturation;
        var b = colorInput.b !== undefined ? colorInput.b : colorInput.brightness;
        var a = colorInput.a !== undefined ? colorInput.a : (colorInput.alpha !== undefined ? colorInput.alpha : 1);
        var requested = {
          h: requireFinite(h, 'h'),
          s: clamp(requireFinite(s, 's'), 0, 100),
          b: clamp(requireFinite(b, 'b'), 0, 100),
          a: clamp(requireFinite(a, 'alpha'), 0, 1)
        };
        var color = this._fromHsb(requested.h, requested.s, requested.b, requested.a);
        var rgb = hsbToRgb(requested.h, requested.s, requested.b);
        return {
          color: color,
          h: requested.h,
          s: requested.s,
          b: requested.b,
          a: requested.a,
          oklch: rgbToOklch(rgb.r, rgb.g, rgb.b)
        };
      }

      var source = colorInput;
      if (typeof source === 'string') source = assertColorString(source);
      else if (!isP5Color(source) && !Array.isArray(source) && typeof source !== 'number') {
        throw new TypeError('Expected a color string, p5.Color, [h, s, b], or { h, s, b }.');
      }

      var created = withColorState(this._p, 'hsb', [360, 100, 100, 1], function (p) {
        return p.color(source);
      });
      var rgba = rgbaOf(created);
      var hsb = rgbToHsb(rgba.r / 255, rgba.g / 255, rgba.b / 255);
      return {
        color: created,
        h: hsb.h,
        s: hsb.s,
        b: hsb.b,
        a: rgba.a,
        oklch: rgbToOklch(rgba.r / 255, rgba.g / 255, rgba.b / 255)
      };
    }

    _coerce(input) {
      if (isP5Color(input)) return input;
      return this._parse(input).color;
    }

    _fromHsb(h, s, b, a) {
      var rgb = hsbToRgb(h, s, b);
      return this._fromRgb(rgb.r * 255, rgb.g * 255, rgb.b * 255, a);
    }

    _fromRgb(r, g, b, a) {
      return withColorState(this._p, 'rgb', [255, 255, 255, 1], function (p) {
        return p.color(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), clamp(a, 0, 1));
      });
    }

    _colorFromOklch(l, c, h, a) {
      var rgb = oklchToRgbGamut(l, c, h);
      return this._fromRgb(rgb.r * 255, rgb.g * 255, rgb.b * 255, a);
    }

    _scheme(offsets) {
      var self = this;
      return offsets.map(function (delta) {
        if (delta === 0) return self.color;
        if (self.space === 'oklch') {
          return self._colorFromOklch(self._oklch.l, self._oklch.c, self._oklch.h + delta, self.a);
        }
        return self._fromHsb(self.h + delta, self.s, self.b, self.a);
      });
    }

    _shade(t, limit) {
      if (t === 0) return this.color;
      if (this.space === 'oklch') {
        var endL = clamp(limit / 100, 0, this._oklch.l);
        var l = lerp(this._oklch.l, endL, t);
        var endC = this._oklch.l === 0 ? 0 : this._oklch.c * (endL / this._oklch.l);
        return this._colorFromOklch(l, lerp(this._oklch.c, endC, t), this._oklch.h, this.a);
      }
      var endB = clamp(limit, 0, this.b);
      return this._fromHsb(this.h, this.s, lerp(this.b, endB, t), this.a);
    }

    _tint(t, limit) {
      if (t === 0) return this.color;
      if (this.space === 'oklch') {
        var endL = clamp(limit / 100, this._oklch.l, 1);
        var fraction = this._oklch.l >= 1 ? 1 : (endL - this._oklch.l) / (1 - this._oklch.l);
        var l = lerp(this._oklch.l, endL, t);
        var endC = this._oklch.c * (1 - fraction);
        return this._colorFromOklch(l, lerp(this._oklch.c, endC, t), this._oklch.h, this.a);
      }
      var endB = clamp(limit, this.b, 100);
      var endS = this.b >= 100 ? 0 : this.s * (1 - (endB - this.b) / (100 - this.b));
      return this._fromHsb(this.h, lerp(this.s, endS, t), lerp(this.b, endB, t), this.a);
    }

    _tone(t, limit) {
      if (t === 0) return this.color;
      if (this.space === 'oklch') {
        var endC = this.s <= 0 ? 0 : this._oklch.c * (clamp(limit, 0, this.s) / this.s);
        return this._colorFromOklch(this._oklch.l, lerp(this._oklch.c, endC, t), this._oklch.h, this.a);
      }
      var endS = clamp(limit, 0, this.s);
      return this._fromHsb(this.h, lerp(this.s, endS, t), this.b, this.a);
    }

    _monochrome(t, saturationDir, brightnessDir) {
      if (t === 0) return this.color;
      if (this.space === 'oklch') {
        var endL = brightnessDir > 0 ? 1 : 0;
        var endC = saturationDir > 0 ? Math.max(this._oklch.c, 0.4) : 0;
        return this._colorFromOklch(
          lerp(this._oklch.l, endL, t),
          lerp(this._oklch.c, endC, t),
          this._oklch.h,
          this.a
        );
      }
      var endS = saturationDir > 0 ? 100 : 0;
      var endB = brightnessDir > 0 ? 100 : 0;
      return this._fromHsb(this.h, lerp(this.s, endS, t), lerp(this.b, endB, t), this.a);
    }

    _mixRgba(from, to, t, space) {
      var alpha = lerp(from.a, to.a, t);
      if (space === 'rgb') {
        return this._fromRgb(
          lerp(from.r, to.r, t),
          lerp(from.g, to.g, t),
          lerp(from.b, to.b, t),
          alpha
        );
      }
      if (space === 'oklch') {
        var a = rgbToOklch(from.r / 255, from.g / 255, from.b / 255);
        var b = rgbToOklch(to.r / 255, to.g / 255, to.b / 255);
        return this._colorFromOklch(
          lerp(a.l, b.l, t),
          lerp(a.c, b.c, t),
          a.h + shortestHueDelta(a.h, b.h) * t,
          alpha
        );
      }
      var aHsb = rgbToHsb(from.r / 255, from.g / 255, from.b / 255);
      var bHsb = rgbToHsb(to.r / 255, to.g / 255, to.b / 255);
      return this._fromHsb(
        aHsb.h + shortestHueDelta(aHsb.h, bHsb.h) * t,
        lerp(aHsb.s, bHsb.s, t),
        lerp(aHsb.b, bHsb.b, t),
        alpha
      );
    }
  }

  ColorGenerator.attachToP5 = function (p5Constructor) {
    attachToP5(p5Constructor, ColorGenerator);
  };

  return ColorGenerator;
});
