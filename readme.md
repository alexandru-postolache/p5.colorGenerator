# p5.ColorGenerator

There is a demo at [https://alexandru-postolache.github.io/p5.colorGenerator/demo](https://alexandru-postolache.github.io/p5.colorGenerator/demo).

`ColorGenerator` builds color schemes from one base color for p5.js sketches: shades, tints, tones, monochromatic ramps, and the usual hue harmonies. Ramps can stay in HSB or run in OKLCH. The library also exports colors, checks WCAG contrast, simulates color vision, samples an image, and assembles a small role palette.

Version 2 restores the sketch color mode after every call, including channel ranges. In instance mode, pass the sketch as the second argument.

## Install

jsDelivr’s `@2.0.0` URL reads a git tag. It returns 404 until GitHub has a tag named `2.0.0` or `v2.0.0` on the commit that contains this file. `@latest` is the default branch, which does not include these changes until they are merged.

After the 2.0 commit is on `main`:

```bash
git checkout main
git pull
git tag 2.0.0
git push origin 2.0.0
```

jsDelivr usually picks up a new tag within a few minutes. If the URL still 404s, request a fresh copy:

`https://purge.jsdelivr.net/gh/alexandru-postolache/p5.colorGenerator@2.0.0/p5.colorGenerator.js`

Publishing to npm (`npm publish`) is separate. That is what makes `https://cdn.jsdelivr.net/npm/p5.colorgenerator@2.0.0/p5.colorGenerator.js` work.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/alexandru-postolache/p5.colorGenerator@2.0.0/p5.colorGenerator.js"></script>
```

```js
import ColorGenerator from 'p5.colorgenerator';
```

Targets p5.js 1.4 and later. Load p5 before this file when using the script tag.

## Create a generator

```js
let colorGen;

function setup() {
  createCanvas(600, 200);
  colorGen = new ColorGenerator('#ffba06');
  // colorGen = new ColorGenerator();            // random base
  // colorGen = new ColorGenerator({ seed: 7 }); // same random color every run
  // colorGen = new ColorGenerator({ h: 40, s: 90, b: 80, a: 0.8 });

  let shades = colorGen.getShades(5);
  shades.forEach((shade, index) => {
    fill(shade);
    rect(index * 100, 0, 100, 100);
  });
}
```

In instance mode:

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

`setColor()` replaces the base color. `setSpace('oklch')` switches later ramps and hue rotations to OKLCH. The default space is HSB, which matches previous versions.

A random base uses saturation 40–95 and brightness 35–90. Pass `seed` to reproduce it. The generator uses its own random sequence, so it does not advance p5's `random()`.

## Ramps

Counts include both ends. `getShades(5)` on a brightness-40 color is the base, three steps, and the limit (black by default), not a run that stops one step early.

```js
colorGen.getShades(5);                 // brightness down to 0
colorGen.getShades(5, 15);             // stop at brightness 15
colorGen.getShades({ count: 5, limit: 0, includeBase: false });

colorGen.getTints(5);                  // toward white (brightness up, saturation down)
colorGen.getTints(2, 70);              // only as far as brightness 70
colorGen.getTones(5);                  // saturation down, brightness held

colorGen.getMonochromatic(5);          // saturation and brightness toward 0
colorGen.getMonochromatic(5, true, true);
colorGen.getMonochromatic({
  count: 5,
  saturation: 'increase',
  brightness: 'decrease'
});
```

In OKLCH, shades move toward black, tints toward white, and tones lose chroma while lightness stays put.

## Harmonies

Hue degrees wrap with a positive modulus, so values above 360 stay on the wheel. Analogous and split complementary still return the original three colors first when you ask for more.

```js
colorGen.getComplementary();           // [base, opposite]
colorGen.complement();                 // just the opposite
colorGen.getTriadic();                 // 120°
colorGen.getEven(6);
colorGen.getAnalogous();               // ±30°, three colors
colorGen.getAnalogous(15, 5);
colorGen.getSplitComplementary(30);
colorGen.getTetradic();                // square, 90°
colorGen.getSquare();
colorGen.getRectangle(60);             // rectangle / tetrad
colorGen.getTetradic(60);
colorGen.adjust({ h: 15, s: -10, b: 5 });
```

`getTetradic()` with no argument is the same square as before.

## Mixing

```js
colorGen.lerpColors('#0044ff', 7);                         // short hue path in the current space
colorGen.lerpColors('#0044ff', 7, { space: 'rgb', easing: 'easeInOut' });
ColorGenerator.mix('#ffba06', '#0044ff', 0.5, { instance: p, space: 'oklch' });
```

Easing names are `linear`, `easeIn`, `easeOut`, and `easeInOut`. You can also pass a function.

## Contrast, vision, and palettes

```js
colorGen.contrastRatio('#ffffff');          // WCAG ratio
colorGen.recommendedText();                 // black or white, whichever contrasts more
colorGen.lightenUntilContrast('#111111', 4.5);
colorGen.darkenUntilContrast('#eeeeee', 4.5);

colorGen.simulate('protanopia');            // also deuteranopia, tritanopia
ColorGenerator.simulate('deuteranopia', colorGen.color, p);

let roles = colorGen.getPalette();
// roles.background, surface, primary, accent, onPrimary, onBackground

colorGen.getPalette({
  steps: 5,
  roles: {
    ink: { from: 'shades', index: -1 },
    spot: { from: 'complementary', index: 1 }
  }
});
```

Vision simulation uses the Machado, Oliveira, and Fernandes (2009) severity-1 matrices in linear RGB.

```js
let img = loadImage('photo.jpg', () => {
  let colors = ColorGenerator.fromImage(img, 6);
  colorGen.setColor(colors[0]);
});
```

`fromImage` also accepts a canvas or `{ pixels, width, height }`. Fully transparent pixels are ignored.

## Export

`toHex`, `toRgb`, `toCss`, and `toHsb` read the color's stored RGBA, so the sketch's `colorMode()` does not affect them. `toHsb` is always hue 0–360 and saturation and brightness 0–100. Alpha below 1 is included in the hex string.

```js
colorGen.toHex();   // #ffba06 or #ffba0666
colorGen.toRgb();   // { r, g, b, a }
colorGen.toCss();   // rgb(...) or rgba(...)
colorGen.toHsb();   // { h, s, b, a }
```

The static forms `ColorGenerator.toHex(color)` and `ColorGenerator.contrastRatio(c1, c2)` take p5 colors directly.

## Behavior changes in 2.0

- Shade, tint, and monochromatic ramps include the limit. A count of 5 is the base plus four steps that land on the end color.
- Tints move toward white. Saturation drops in proportion to how far brightness travels, instead of falling toward 0 on every call.
- Monochromatic saturation and brightness each step across their own remaining range.
- The constructor no longer leaves the sketch in HSB.
- Alpha on the base color is copied onto generated colors.
- Passing no color no longer draws from p5's `random()`.

## License

MIT. See [LICENSE](LICENSE).
