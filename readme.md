# p5.ColorGenerator Library

`ColorGenerator` is a p5.js-based library that allows you to generate various color schemes (shades, tints, monochromatic, complementary, triadic, etc.) from a base color. The library works in HSB (Hue, Saturation, Brightness) color mode and provides easy methods to generate and manipulate color schemes.

## Features

- Generate random base colors or use predefined ones.
- Create multiple color schemes: complementary, triadic, tetradic, analogous, split complementary, and more.
- Generate shades, tints, and monochromatic palettes.
- Designed for use with p5.js, utilizing its color management features.

## Installation

You can include the library in your p5.js project in two ways:

1. Download the `p5.colorGenerator.js` file and include it locally:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
<script src="path/to/p5.colorGenerator.js"></script>
```

2. Use the CDN link to include the library directly:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
<script src="https://cdn.jsdelivr.net/gh/alexandru-postolache/p5.colorGenerator@latest/p5.colorGenerator.js"></script>
```

## Getting Started

### Create a `ColorGenerator` instance

To start generating color schemes, instantiate a `ColorGenerator` object. You can either pass a base color or let the generator create a random one.

```javascript
let colorGen = new ColorGenerator(); // Random base color
let colorGen = new ColorGenerator('#ff5733'); // Base color in hex
```

### Available Methods

---

### `getShades(nr, limit = 0)`

Generates an array of shades by decreasing brightness. The base color is darkened to produce `nr` number of shades. The optional `limit` parameter specifies the minimum brightness.

```javascript
let shades = colorGen.getShades(5); // Generate 5 shades
```

Example usage in a p5.js sketch:

```javascript
let colorGen = new ColorGenerator('#ff5733');
let shades = colorGen.getShades(5);

shades.forEach((shade, index) => {
    fill(shade);
    rect(index * 100, 0, 100, 100); // Draw squares with the shades
});
```

---

### `getTints(nr, limit = 100)`

Generates an array of tints by increasing brightness. The base color is lightened to produce `nr` number of tints. The optional `limit` parameter specifies the maximum brightness.

```javascript
let tints = colorGen.getTints(5); // Generate 5 tints
```

Example:

```javascript
let tints = colorGen.getTints(5);

tints.forEach((tint, index) => {
    fill(tint);
    rect(index * 100, 0, 100, 100);
});
```

---

### `getMonochromatic(nr, increaseSaturation = false, increaseBrightness = false)`

Generates a monochromatic palette by adjusting both saturation and brightness. The number of colors is controlled by `nr`, and you can optionally increase saturation and/or brightness.

```javascript
let mono = colorGen.getMonochromatic(5, true, false); // Generate 5 monochromatic colors with increasing saturation
```

Example:

```javascript
let mono = colorGen.getMonochromatic(5, true, false);

mono.forEach((color, index) => {
    fill(color);
    rect(index * 100, 0, 100, 100);
});
```

---

### `getComplementary()`

Returns an array with the base color and its complementary color (opposite on the color wheel).

```javascript
let complementary = colorGen.getComplementary();
```

Example:

```javascript
let complementary = colorGen.getComplementary();

complementary.forEach((color, index) => {
    fill(color);
    rect(index * 100, 0, 100, 100);
});
```

---

### `getTriadic()`

Generates a triadic color scheme (three colors evenly spaced 120 degrees apart on the color wheel).

```javascript
let triadic = colorGen.getTriadic();
```

Example:

```javascript
let triadic = colorGen.getTriadic();

triadic.forEach((color, index) => {
    fill(color);
    rect(index * 100, 0, 100, 100);
});
```

---

### `getAnalogous(degree = 30)`

Generates an analogous color scheme by producing colors next to the base color on the color wheel. The optional `degree` parameter defines the distance between the colors (default is 30 degrees).

```javascript
let analogous = colorGen.getAnalogous();
```

Example:

```javascript
let analogous = colorGen.getAnalogous(30);

analogous.forEach((color, index) => {
    fill(color);
    rect(index * 100, 0, 100, 100);
});
```

---

### `getSplitComplementary(degree = 30)`

Generates a split complementary color scheme (two colors adjacent to the complementary color). The `degree` parameter defines how far the colors are from the base complementary color.

```javascript
let splitComp = colorGen.getSplitComplementary();
```

Example:

```javascript
let splitComp = colorGen.getSplitComplementary();

splitComp.forEach((color, index) => {
    fill(color);
    rect(index * 100, 0, 100, 100);
});
```

---

### `getTetradic()`

Generates a tetradic color scheme (four colors, two complementary pairs). The result is four evenly spaced colors on the color wheel.

```javascript
let tetradic = colorGen.getTetradic();
```

Example:

```javascript
let tetradic = colorGen.getTetradic();

tetradic.forEach((color, index) => {
    fill(color);
    rect(index * 100, 0, 100, 100);
});
```

## Example Usage in p5.js

```javascript
let colorGen;

function setup() {
    createCanvas(600, 200);
    colorGen = new ColorGenerator('#ff5733'); // Initialize with base color

    let shades = colorGen.getShades(5);
    
    shades.forEach((shade, index) => {
        fill(shade);
        rect(index * 100, 0, 100, 100); // Draw shades
    });
}
```

---
## License

This project is licensed under the MIT License.

---
