# p5.ColorGenerator

`ColorGenerator` builds color schemes from one base color for [p5.js](https://p5js.org/) sketches. Give it a color, and it returns `p5.Color` values you can pass to `fill()`, `stroke()`, or `background()`.

It can make shades, tints, tones, and monochromatic ramps, plus the usual hue harmonies. It can also mix two colors, check WCAG contrast, simulate color vision, sample a palette from an image, and assemble a small set of UI roles.

There is a demo at [https://alexandru-postolache.github.io/p5.colorGenerator/demo](https://alexandru-postolache.github.io/p5.colorGenerator/demo).

## Add it to a sketch

Load p5 first, then this file. It works with p5.js 1.4 and later.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/alexandru-postolache/p5.colorGenerator@2.0.0/p5.colorGenerator.js"></script>
```

That adds a global `ColorGenerator`. In a p5 instance sketch it also adds `p.createColorGenerator()`.

In a module:

```js
import ColorGenerator from 'https://cdn.jsdelivr.net/gh/alexandru-postolache/p5.colorGenerator@2.0.0/p5.colorGenerator.mjs';
```

```js
let colorGen;

function setup() {
  createCanvas(600, 200);
  colorGen = new ColorGenerator('#ffba06');

  colorGen.getShades(5).forEach((shade, index) => {
    fill(shade);
    rect(index * 100, 0, 100, 100);
  });
}
```

## How it works

A generator stores one base color. Scheme methods read that base and return new `p5.Color` values, leaving the stored base in place. `setColor()` replaces it.

Every call puts the sketch's `colorMode()` back the way it found it, including the channel ranges. You can stay in `RGB` and still ask for harmonies.

The default space is HSB:

- hue is a wheel, 0–360
- saturation and brightness are 0–100
- shades lower the brightness
- tints move toward white
- tones lower the saturation and hold the brightness
- harmonies rotate the hue and keep saturation and brightness

`setSpace('oklch')` runs ramps and hue rotation in OKLCH instead. Shades move toward black, tints toward white, and tones lose chroma while lightness stays put. A color that would fall outside what a screen can show is pulled back into sRGB. Contrast adjustments always walk OKLCH lightness, whichever space the generator is using.

A count includes both ends. `getShades(5)` on a mid-brightness color is the base, three steps, and black, not a run that stops one step early.

Alpha on the base is copied onto generated colors.

These are all valid color inputs, for the constructor and for any method that takes a color:

- a hex string: `#fc0`, `#fc0a`, `#ffcc00`, `#ffcc0080`
- a CSS color name, such as `tomato`
- `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hsb()`, or `hsba()`
- a `p5.Color`
- `[h, s, b]`, read as hue 0–360 and saturation and brightness 0–100
- `{ h, s, b, a }`, also spelled `hue`, `saturation`, `brightness`, and `alpha`

An unknown color name throws a `TypeError`.

## Create a generator

```js
new ColorGenerator('#ffba06');
new ColorGenerator('tomato');
new ColorGenerator([40, 90, 80]);
new ColorGenerator({ h: 40, s: 90, b: 80, a: 0.8 });
new ColorGenerator();              // random base
new ColorGenerator({ seed: 7 });   // the same random color every run
new ColorGenerator('#ffba06', { space: 'oklch' });
```

A random base uses saturation 40–95 and brightness 35–90. `seed` reproduces that pick. The generator has its own random sequence, so it does not advance p5's `random()`.

In instance mode, pass the sketch:

```js
const sketch = (p) => {
  let colorGen;
  p.setup = () => {
    p.createCanvas(600, 200);
    colorGen = new ColorGenerator('#ffba06', p);
    // or: colorGen = p.createColorGenerator('#ffba06');
  };
};
new p5(sketch);
```

Pass the sketch anywhere a call has to build colors without an existing generator: the constructor, `ColorGenerator.fromImage()`, `ColorGenerator.simulate()`, and `ColorGenerator.mix()`.

### `setColor(color)`

Replaces the base color. Accepts the same inputs as the constructor. Returns the generator, so calls can be chained.

### `setSpace('hsb' | 'oklch')`

Chooses the space used by later ramps and hue rotations. Returns the generator. The default is `'hsb'`.

### Properties

| Property | Meaning |
| --- | --- |
| `color` | Base color as a `p5.Color`. |
| `h`, `s`, `b`, `a` | Base color in HSB. Hue is 0–360, saturation and brightness are 0–100, alpha is 0–1. |
| `space` | `'hsb'` or `'oklch'`. |

## Ramps

`getShades`, `getTints`, and `getTones` share the same arguments. `count` is required. `limit` is optional. You can pass the two numbers, or one options object.

```js
colorGen.getShades(5);
colorGen.getShades(5, 15);
colorGen.getShades({ count: 5, limit: 0, includeBase: false });
```

`includeBase: false` leaves the base out and still includes the limit.

### `getShades(count, limit)`

Brightness moves toward `limit`. The default limit is `0`, and it never goes above the base brightness. In HSB the hue and saturation stay put. Returns an array of `p5.Color`.

### `getTints(count, limit)`

Moves toward white. The default limit is `100`, and it never goes below the base brightness. Saturation drops only in proportion to how far the brightness travels: a tint that stops halfway to white keeps about half its saturation. A color that is already fully bright reaches white by losing saturation. Returns an array of `p5.Color`.

### `getTones(count, limit)`

Saturation moves down toward `limit`. The default limit is `0` (gray). Brightness stays where it is. Returns an array of `p5.Color`.

### `getMonochromatic(count, increaseSaturation, increaseBrightness)`

Hue stays put. Saturation and brightness each travel toward `0` by default, across the distance that remains. Pass `true` to send a channel toward `100` instead.

```js
colorGen.getMonochromatic(5);             // both channels toward 0
colorGen.getMonochromatic(5, true, true); // both toward 100
colorGen.getMonochromatic({
  count: 5,
  saturation: 'increase',
  brightness: 'decrease'
});
```

`saturation` and `brightness` accept `true` / `false`, or `'increase'` / `'decrease'`. Returns an array of `p5.Color`.

In OKLCH, brightness walks lightness toward white or black. A saturation decrease drops chroma to 0. A saturation increase raises chroma toward 0.4 when the color is below that.

## Harmonies

Harmonies rotate the hue and return `p5.Color` values. Degrees wrap around the wheel, so `400` and `-20` stay on it. In OKLCH the rotation keeps lightness and chroma.

The first color is the base, except for `complement()`, which returns only the opposite color.

### `getComplementary()`

`[base, base + 180°]`.

### `complement()`

The opposite color alone.

### `getTriadic()`

Three colors at 120°: the base, +120°, and +240°. Same as `getEven(3)`.

### `getEven(count)`

`count` colors spaced evenly around the wheel, starting at the base. The default count is `3`.

### `getAnalogous(degree, count)`

Neighbors of the base. The default is 30° and 3 colors: `[base, -30°, +30°]`. A larger count continues outward in pairs: `[base, -d, +d, -2d, +2d, ...]`.

```js
colorGen.getAnalogous();
colorGen.getAnalogous(15, 5);
colorGen.getAnalogous({ degree: 15, count: 5 });
```

### `getSplitComplementary(degree, count)`

The base, then colors around the complement. The default is 30° and 3 colors: `[base, 150°, 210°]`. Further colors step farther from 180° the same way analogous colors step away from the base.

### `getTetradic(angle)`

Four colors: the base, `+angle`, `+180°`, and `+180° + angle`. The default angle is 90°, which is a square.

### `getSquare()`

`getTetradic(90)`.

### `getRectangle(angle)`

`getTetradic(angle)`. The default angle is 60°.

```js
colorGen.getTetradic();      // square
colorGen.getRectangle(60);
colorGen.getTetradic({ angle: 60 });
```

### `adjust(deltas)`

Returns a new color shifted by HSB amounts. The base stays the same. This shift is always in HSB, even when the generator space is OKLCH.

```js
colorGen.adjust({ h: 15, s: -10, b: 5 });
colorGen.adjust({ hue: 15, saturation: -10, brightness: 5, alpha: 0.5 });
```

Omitted channels stay as they are. Hue wraps. Saturation, brightness, and alpha are clamped when the color is built.

## Mixing

Hue mixing takes the short way around the wheel.

### `lerpColors(other, steps, options)`

An array of `steps` colors from the base to `other`, including both ends. The default step count is `5`.

```js
colorGen.lerpColors('#0044ff', 7);
colorGen.lerpColors('#0044ff', 7, { space: 'rgb', easing: 'easeInOut' });
```

`options.space` is `'hsb'`, `'oklch'`, or `'rgb'`. When you omit it, the generator's space is used. `options.easing` is `'linear'`, `'easeIn'`, `'easeOut'`, `'easeInOut'`, or a function `(t) => number`. The default easing is linear.

### `ColorGenerator.mix(colorA, colorB, amount, options)`

One color at `amount` from `colorA` to `colorB`. `0` is `colorA`, `1` is `colorB`, and the default is `0.5`. `options` matches `lerpColors`, plus `instance` for the p5 sketch.

```js
ColorGenerator.mix('#ffba06', '#0044ff', 0.5, { space: 'oklch', instance: p });
```

## Contrast

Contrast uses the WCAG relative-luminance ratio. The number runs from 1 (identical) to 21 (black against white). 4.5 is the usual minimum for body text.

### `contrastRatio(other)`

The ratio between the base and `other`.

### `ColorGenerator.contrastRatio(colorA, colorB)`

The ratio between two `p5.Color` values.

### `recommendedText(background)`

Black or white, whichever contrasts more with `background`. When you omit `background`, the base color is used. Returns a `p5.Color`.

### `adjustForContrast(background, options)`

Returns a color that aims for `options.minRatio` against `background`. The default ratio is `4.5`. Lightness moves in OKLCH.

`options.direction` chooses the walk:

- `'auto'` (default) keeps the base when it already clears the ratio, otherwise picks the smaller successful step, lighter or darker
- `'lighter'` or `'lighten'` only lightens
- `'darker'` or `'darken'` only darkens

If the ratio cannot be reached, the method returns the closest color it tried.

### `lightenUntilContrast(background, minRatio)`

`adjustForContrast(background, { minRatio, direction: 'lighter' })`.

### `darkenUntilContrast(background, minRatio)`

`adjustForContrast(background, { minRatio, direction: 'darker' })`.

```js
colorGen.contrastRatio('#ffffff');
colorGen.recommendedText();
colorGen.lightenUntilContrast('#111111', 4.5);
colorGen.darkenUntilContrast('#eeeeee', 4.5);
```

## Color vision

### `simulate(kind, color)`

Returns `color` as it appears under a color-vision deficiency. When you omit `color`, the base is used.

`kind` is `'protanopia'`, `'deuteranopia'`, or `'tritanopia'`. The simulation uses the Machado, Oliveira, and Fernandes (2009) matrices at full severity, applied in linear RGB.

### `ColorGenerator.simulate(kind, color, instance)`

The same simulation without a generator. Pass the sketch in instance mode.

```js
colorGen.simulate('protanopia');
ColorGenerator.simulate('deuteranopia', colorGen.color, p);
```

## Role palettes

### `getPalette(spec)`

With no argument, returns an object of `p5.Color` values:

| Role | Source |
| --- | --- |
| `background` | Last shade (black, with the default ramp). |
| `surface` | The shade just before that. |
| `primary` | The base color. |
| `accent` | The complement. |
| `onPrimary` | Black or white, whichever contrasts more with `primary`. |
| `onBackground` | Black or white, whichever contrasts more with `background`. |

Shades are built with `steps`, which defaults to `5`.

Pass `roles` to name your own. Each role is `'primary'`, `{ from: 'base' }`, `{ from, index }`, or a text role.

`from` is one of `shades`, `tints`, `tones`, `monochromatic`, `complementary`, `triadic`, `analogous`, `splitComplementary`, `tetradic`, `square`, `rectangle`, `base`, or `text`.

`index` picks a color in that scheme. `0` is the first. A negative index counts from the end, so `-1` is the last. `angle` is the rectangle angle when a role reads from `rectangle`.

A text role is black or white. `{ from: 'text', on: 'primary' }` contrasts with the base. `{ from: 'text', backgroundFrom, backgroundIndex }` contrasts with another swatch.

```js
let roles = colorGen.getPalette();
fill(roles.background);
rect(0, 0, width, height);
fill(roles.onBackground);
text('hello', 24, 48);

colorGen.getPalette({
  steps: 5,
  roles: {
    ink: { from: 'shades', index: -1 },
    spot: { from: 'complementary', index: 1 },
    label: { from: 'text', backgroundFrom: 'shades', backgroundIndex: -1 }
  }
});
```

## Colors from an image

### `ColorGenerator.fromImage(image, count, options)`

Returns the `count` dominant colors of a `p5.Image`, a canvas, or `{ pixels, width, height }`. The default count is `5`.

Fully transparent pixels are ignored. The image is sampled (8,000 pixels by default) and split with median cut. Call it after the image has loaded.

```js
let img;

function preload() {
  img = loadImage('photo.jpg');
}

function setup() {
  let colors = ColorGenerator.fromImage(img, 6);
  colorGen.setColor(colors[0]);
}
```

In instance mode, pass the sketch as the third argument, or as `options.instance`. `options.samples` changes how many pixels are considered.

```js
ColorGenerator.fromImage(img, 6, p);
ColorGenerator.fromImage(img, 6, { instance: p, samples: 4000 });
```

## Read a color back

These read the color's stored red, green, blue, and alpha. The sketch's `colorMode()` does not affect them. On a generator, calling one with no argument reads the base. Pass a color to read that color instead. `toHsb()` is always hue 0–360 and saturation and brightness 0–100. Because the stored color is 8-bit, a hue you typed can come back a degree or two away.

| Method | Returns |
| --- | --- |
| `toHex()` | `#ffba06`, or `#ffba0666` when alpha is below 1. |
| `toRgb()` | `{ r, g, b, a }` with channels 0–255 and alpha 0–1. |
| `toCss()` | `rgb(255, 186, 6)` or `rgba(255, 186, 6, 0.4)`. |
| `toHsb()` | `{ h, s, b, a }`. |

```js
colorGen.toHex();
colorGen.toCss(someP5Color);
```

The static forms take a `p5.Color` directly:

```js
ColorGenerator.toHex(color);
ColorGenerator.toRgb(color);
ColorGenerator.toCss(color);
ColorGenerator.toHsb(color);
```

## Coming from version 1

- A ramp count includes the end color. Five shades are the base plus four steps that land on the limit.
- Tints move toward white. Saturation falls only as far as the brightness trip.
- Monochromatic saturation and brightness each cross their own remaining range.
- The constructor leaves your `colorMode()` alone.
- Alpha on the base is kept on generated colors.
- A missing base color uses the generator's own random sequence, not p5's `random()`.

## License

MIT. See [LICENSE](LICENSE).
