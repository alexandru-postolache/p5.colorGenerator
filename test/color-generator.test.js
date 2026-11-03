const assert = require('node:assert/strict');
const { before, test } = require('node:test');
const { boot, snapshotMode } = require('../test-support/p5-harness');

let p;
let ColorGenerator;

before(async () => {
  p = await boot();
  ColorGenerator = require('../p5.colorGenerator.js');
  global.p5 = require('../demo/p5.js');
  global.p5.instance = p;
});

function hsbClose(actual, expected, epsilon) {
  const tolerance = epsilon === undefined ? 1.5 : epsilon;
  assert.ok(Math.abs(actual.h - expected.h) <= tolerance, 'h ' + actual.h + ' vs ' + expected.h);
  assert.ok(Math.abs(actual.s - expected.s) <= tolerance, 's ' + actual.s + ' vs ' + expected.s);
  assert.ok(Math.abs(actual.b - expected.b) <= tolerance, 'b ' + actual.b + ' vs ' + expected.b);
}

test('hex, rgb, hsb, and css export do not depend on the sketch color mode', () => {
  p.colorMode(p.HSB, 100, 100, 100, 100);
  const gen = new ColorGenerator('#ffba06', p);
  assert.equal(gen.toHex(), '#ffba06');
  assert.deepEqual(gen.toRgb(), { r: 255, g: 186, b: 6, a: 1 });
  assert.equal(gen.toCss(), 'rgb(255, 186, 6)');
  const hsb = gen.toHsb();
  hsbClose(hsb, { h: 43.37, s: 97.65, b: 100 }, 0.2);
  assert.equal(ColorGenerator.toHex(gen.color), '#ffba06');
});

test('shades include the base and reach the brightness limit', () => {
  const gen = new ColorGenerator({ h: 20, s: 80, b: 40 }, p);
  const shades = gen.getShades(5);
  assert.equal(shades.length, 5);
  assert.equal(gen.toHex(shades[0]), gen.toHex());
  assert.equal(gen.toHex(shades[4]), '#000000');
  hsbClose(gen.toHsb(shades[2]), { h: 20, s: 80, b: 20 });
});

test('shades can exclude the base color', () => {
  const gen = new ColorGenerator({ h: 20, s: 80, b: 40 }, p);
  const shades = gen.getShades({ count: 2, limit: 0, includeBase: false });
  hsbClose(gen.toHsb(shades[0]), { h: 20, s: 80, b: 20 });
  assert.equal(gen.toHex(shades[1]), '#000000');
});

test('tints move toward white in proportion to the brightness range', () => {
  const gen = new ColorGenerator({ h: 20, s: 80, b: 40 }, p);
  const partial = gen.getTints(2, 70);
  hsbClose(gen.toHsb(partial[1]), { h: 20, s: 40, b: 70 });

  const full = gen.getTints(5);
  assert.equal(gen.toHex(full[0]), gen.toHex());
  assert.equal(gen.toHex(full[4]), '#ffffff');
});

test('a fully bright color tints toward white by losing saturation', () => {
  const gen = new ColorGenerator('#ffba06', p);
  const tints = gen.getTints(5);
  assert.equal(gen.toHex(tints[0]), '#ffba06');
  assert.equal(gen.toHex(tints[4]), '#ffffff');
  assert.ok(gen.toHsb(tints[2]).s < gen.toHsb(tints[0]).s);
});

test('tones hold brightness and end at the saturation limit', () => {
  const gen = new ColorGenerator({ h: 20, s: 80, b: 40 }, p);
  const tones = gen.getTones(5);
  hsbClose(gen.toHsb(tones[2]), { h: 20, s: 40, b: 40 });
  const end = gen.toHsb(tones[4]);
  assert.ok(end.s < 2, end.s);
  assert.ok(Math.abs(end.b - 40) < 2, end.b);
});

test('monochromatic steps use the distance to the requested end', () => {
  const gen = new ColorGenerator({ h: 20, s: 80, b: 80 }, p);
  const darker = gen.getMonochromatic(5);
  hsbClose(gen.toHsb(darker[2]), { h: 20, s: 40, b: 40 });
  assert.equal(gen.toHex(darker[4]), '#000000');

  const brighter = gen.getMonochromatic({
    count: 3,
    saturation: 'increase',
    brightness: 'increase'
  });
  hsbClose(gen.toHsb(brighter[2]), { h: 20, s: 100, b: 100 }, 2);
});

test('alpha is kept on generated colors and in hex export', () => {
  const gen = new ColorGenerator({ h: 200, s: 50, b: 50, a: 0.4 }, p);
  const shade = gen.getShades(3)[1];
  const rgb = gen.toRgb(shade);
  assert.ok(Math.abs(rgb.a - 0.4) < 0.02);
  assert.match(gen.toHex(), /^#[0-9a-f]{8}$/);
  assert.match(gen.toCss(), /^rgba\(/);
});

test('hue offsets wrap with a positive modulus', () => {
  const gen = new ColorGenerator({ h: 10, s: 90, b: 80 }, p);
  const wide = gen.getAnalogous(400);
  const wrapped = gen.getAnalogous(40);
  assert.equal(gen.toHex(wide[1]), gen.toHex(wrapped[1]));
  assert.equal(gen.toHex(wide[2]), gen.toHex(wrapped[2]));

  const negative = gen.getAnalogous(-30);
  const positive = gen.getAnalogous(30);
  assert.equal(gen.toHex(negative[1]), gen.toHex(positive[2]));
  assert.equal(gen.toHex(negative[2]), gen.toHex(positive[1]));
});

test('analogous and split complementary accept a count and keep the original three colors first', () => {
  const gen = new ColorGenerator('#3366cc', p);
  const three = gen.getAnalogous(30);
  const five = gen.getAnalogous(30, 5);
  assert.equal(three.length, 3);
  assert.equal(five.length, 5);
  assert.equal(gen.toHex(five[0]), gen.toHex(three[0]));
  assert.equal(gen.toHex(five[1]), gen.toHex(three[1]));
  assert.equal(gen.toHex(five[2]), gen.toHex(three[2]));
  assert.equal(gen.getSplitComplementary({ degree: 20, count: 5 }).length, 5);
});

test('tetradic defaults to a square and accepts a rectangle angle', () => {
  const gen = new ColorGenerator({ h: 10, s: 80, b: 70 }, p);
  const square = gen.getTetradic();
  const hues = square.map((color) => gen.toHsb(color).h);
  assert.equal(square.length, 4);
  [0, 90, 180, 270].forEach((delta, index) => {
    const expected = (10 + delta) % 360;
    assert.ok(Math.abs(hues[index] - expected) < 1.5, hues[index] + ' vs ' + expected);
  });
  assert.equal(gen.toHex(gen.getSquare()[1]), gen.toHex(square[1]));
  assert.notEqual(gen.toHex(gen.getRectangle(60)[1]), gen.toHex(square[1]));
  assert.equal(gen.getTriadic().length, 3);
  assert.equal(gen.getEven(6).length, 6);
  assert.equal(gen.toHex(gen.complement()), gen.toHex(gen.getComplementary()[1]));
});

test('adjust shifts HSB without changing the base color', () => {
  const gen = new ColorGenerator({ h: 10, s: 40, b: 40 }, p);
  const before = gen.toHex();
  const shifted = gen.adjust({ h: 20, s: 10, b: -10 });
  hsbClose(gen.toHsb(shifted), { h: 30, s: 50, b: 30 });
  assert.equal(gen.toHex(), before);
});

test('interpolation takes the short hue path and honors easing', () => {
  const gen = new ColorGenerator({ h: 10, s: 100, b: 100 }, p);
  const mixed = gen.lerpColors({ h: 350, s: 100, b: 100 }, 3);
  hsbClose(gen.toHsb(mixed[1]), { h: 0, s: 100, b: 100 }, 2);
  assert.equal(gen.toHex(mixed[0]), gen.toHex());
  assert.equal(gen.toHex(mixed[2]), gen.toHex({ h: 350, s: 100, b: 100 }));

  const eased = ColorGenerator.mix(
    gen.color,
    gen._coerce({ h: 10, s: 0, b: 100 }),
    0.5,
    { instance: p, easing: 'easeIn', space: 'hsb' }
  );
  const easedSaturation = gen.toHsb(eased).s;
  assert.ok(easedSaturation > 65 && easedSaturation < 85, easedSaturation);
});

test('oklch ramps differ from hsb ramps and still reach black and white', () => {
  const hsb = new ColorGenerator('#ffba06', p);
  const oklch = new ColorGenerator('#ffba06', p, { space: 'oklch' });
  const hsbShades = hsb.getShades(5);
  const oklchShades = oklch.getShades(5);
  assert.equal(oklch.toHex(oklchShades[0]), '#ffba06');
  assert.equal(oklch.toHex(oklchShades[4]), '#000000');
  assert.notEqual(oklch.toHex(oklchShades[2]), hsb.toHex(hsbShades[2]));
  assert.equal(oklch.toHex(oklch.getTints(5)[4]), '#ffffff');
  assert.notEqual(oklch.toHex(oklch.complement()), hsb.toHex(hsb.complement()));
});

test('setColor and setSpace update the generator in place', () => {
  const gen = new ColorGenerator('#000000', p);
  gen.setColor('#ffba06').setSpace('oklch');
  assert.equal(gen.toHex(), '#ffba06');
  assert.equal(gen.space, 'oklch');
  assert.throws(() => gen.setSpace('lab'), /hsb/);
  assert.throws(() => gen.setColor('not a color'), /not a valid color/);
  assert.throws(() => gen.getShades(2.5), /non-negative integer/);
  assert.throws(() => gen.getShades(-1), /non-negative integer/);
});

test('a seed is reproducible and does not consume p5 random()', () => {
  const first = new ColorGenerator({ seed: 42 }, p);
  const second = new ColorGenerator({ seed: 42, space: 'hsb' }, p);
  const third = new ColorGenerator({ seed: 99 }, p);
  assert.equal(first.toHex(), second.toHex());
  assert.notEqual(first.toHex(), third.toHex());

  p.randomSeed(5);
  const before = p.random();
  new ColorGenerator(undefined, p);
  const after = p.random();
  p.randomSeed(5);
  assert.equal(p.random(), before);
  assert.equal(p.random(), after);
});

test('construction and generation restore color mode and channel ranges', () => {
  p.colorMode(p.RGB, 200, 180, 160, 50);
  p.colorMode(p.HSB, 255, 80, 90, 10);
  const before = snapshotMode(p);
  const gen = new ColorGenerator('#336699', p, { space: 'oklch' });
  gen.getShades(4);
  gen.getTints(4);
  gen.getTones(4);
  gen.getMonochromatic(4, true, true);
  gen.getAnalogous(400, 5);
  gen.getSplitComplementary(30, 4);
  gen.getTetradic(50);
  gen.lerpColors('#ff00aa', 4, { space: 'rgb' });
  gen.simulate('protanopia');
  gen.lightenUntilContrast('#000000', 4.5);
  gen.getPalette();
  assert.deepEqual(snapshotMode(p), before);
});

test('instance mode is explicit and global mode can find p5.instance', () => {
  const fromInstance = p.createColorGenerator('#abcdef');
  assert.equal(fromInstance.toHex(), '#abcdef');
  const fromGlobal = new ColorGenerator('tomato');
  assert.equal(fromGlobal.toHex(), '#ff6347');
});

test('contrast helpers follow WCAG and can lighten until a ratio is met', () => {
  const gen = new ColorGenerator('#000000', p);
  const white = gen._fromRgb(255, 255, 255, 1);
  const black = gen._fromRgb(0, 0, 0, 1);
  assert.ok(Math.abs(ColorGenerator.contrastRatio(white, black) - 21) < 0.01);
  assert.ok(Math.abs(gen.contrastRatio(gen.color) - 1) < 0.01);
  assert.equal(gen.toHex(gen.recommendedText(black)), '#ffffff');
  assert.equal(gen.toHex(gen.recommendedText(white)), '#000000');

  const gray = new ColorGenerator('#767676', p);
  const ratio = gray.contrastRatio(white);
  assert.ok(ratio > 4.5 && ratio < 4.8, ratio);

  const dark = new ColorGenerator('#333333', p);
  const lifted = dark.lightenUntilContrast(black, 4.5);
  assert.ok(ColorGenerator.contrastRatio(lifted, black) >= 4.5);
  assert.equal(dark.toHex(dark.adjustForContrast(white, { minRatio: 4.5 })), dark.toHex());
});

test('color vision simulation changes saturated red and rejects unknown kinds', () => {
  const gen = new ColorGenerator('#ff0000', p);
  const simulated = gen.simulate('protanopia');
  assert.notEqual(gen.toHex(simulated), '#ff0000');
  ['deuteranopia', 'tritanopia'].forEach((kind) => {
    assert.match(gen.toHex(gen.simulate(kind)), /^#[0-9a-f]{6}$/);
  });
  assert.equal(gen.toHex(ColorGenerator.simulate('deuteranopia', gen.color, p)), gen.toHex(gen.simulate('deuteranopia')));
  assert.throws(() => gen.simulate('monochromacy'), /protanopia/);
});

test('role palettes expose default roles and custom indexes', () => {
  const gen = new ColorGenerator({ h: 200, s: 70, b: 80 }, p);
  const palette = gen.getPalette();
  assert.equal(gen.toHex(palette.primary), gen.toHex());
  assert.ok(gen.toHsb(palette.background).b < gen.toHsb(palette.primary).b);
  assert.ok(['#000000', '#ffffff'].includes(gen.toHex(palette.onPrimary)));
  const custom = gen.getPalette({
    steps: 5,
    roles: {
      ink: { from: 'shades', index: -1 },
      spot: { from: 'complementary', index: 1 },
      label: { from: 'text', on: 'primary' }
    }
  });
  assert.equal(gen.toHex(custom.ink), '#000000');
  assert.equal(gen.toHex(custom.spot), gen.toHex(gen.complement()));
  assert.equal(gen.toHex(custom.label), gen.toHex(palette.onPrimary));
});

test('fromImage returns the dominant colors of a pixel buffer', () => {
  const pixels = new Uint8ClampedArray(3 * 3 * 4);
  for (let i = 0; i < 9; i++) {
    const offset = i * 4;
    if (i < 4) pixels[offset] = 255;
    else if (i < 8) pixels[offset + 2] = 255;
    else {
      pixels[offset + 1] = 255;
      pixels[offset + 3] = 0;
      continue;
    }
    pixels[offset + 3] = 255;
  }
  const colors = ColorGenerator.fromImage({ pixels: pixels, width: 3, height: 3 }, 2, p);
  const hexes = colors.map((color) => ColorGenerator.toHex(color)).sort();
  assert.deepEqual(hexes, ['#0000ff', '#ff0000']);
});
