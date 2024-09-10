class ColorGenerator {
    /**
     * Constructor for ColorGenerator.
     * Initializes the generator with a base color. If no color is provided, it generates a random one.
     * @param {string} colorString - The base color in any valid p5.js color format (e.g., hex or RGB).
     */
    constructor(colorString) {
        // Set color mode to HSB with ranges for hue (360), saturation, brightness (100), and alpha (1)
        colorMode(HSB, 360, 100, 100, 1);

        // If no color is provided, generate a random HSB color
        if (colorString === undefined) {
            let h = random(0, 360);
            let s = random(0, 100);
            let b = random(0, 100);
            colorString = color(h, s, b);
        }

        // Store the color and its HSB components
        this.color = color(colorString);
        this.h = hue(this.color);
        this.s = saturation(this.color);
        this.b = brightness(this.color);
    }

    /**
     * Generates shades of the base color by decreasing brightness.
     * @param {number} nr - The number of shades to generate.
     * @param {number} limit - The minimum brightness value to limit the shades (default: 0).
     * @return {array} An array of colors in HSB format.
     */
    getShades(nr, limit = 0) {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let result = [];
        
        // Ensure the limit is not higher than the current brightness
        limit = constrain(limit, 0, this.b);
        
        // Calculate the step difference for each shade
        let equalDifference = (this.b - limit) / nr;
        for (let i = 0; i < nr; i++) {
            result.push(color(this.h, this.s, this.b - (i * equalDifference)));
        }
        pop();
        return result;
    }

    /**
     * Generates tints of the base color by increasing brightness.
     * @param {number} nr - The number of tints to generate.
     * @param {number} limit - The maximum brightness value to limit the tints (default: 100).
     * @return {array} An array of colors in HSB format.
     */
    getTints(nr, limit = 100) {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let result = [];
        
        // Ensure the limit is not smaller than the current brightness
        limit = constrain(limit, this.b, 100);
        
        // Calculate the step difference for brightness and saturation
        let equalDifferenceBrightness = (limit - this.b) / nr;
        let equalDifferenceSaturation = this.s / nr;

        for (let i = 0; i < nr; i++) {
            result.push(color(this.h, this.s - (i * equalDifferenceSaturation), this.b + (i * equalDifferenceBrightness)));
        }
        pop();
        return result;
    }

    /**
     * Generates a monochromatic palette by adjusting saturation and brightness.
     * @param {number} nr - The number of monochromatic colors to generate.
     * @param {boolean} increaseSaturation - Whether to increase saturation for each color (default: false).
     * @param {boolean} increaseBrightness - Whether to increase brightness for each color (default: false).
     * @return {array} An array of colors in HSB format.
     */
    getMonochromatic(nr, increaseSaturation = false, increaseBrightness = false) {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let result = [];
    
        // Calculate saturation and brightness steps
        let satDifference = this.s / nr;
        let brightDifference = (100 - this.b) / nr;
    
        for (let i = 0; i < nr; i++) {
            let currentSaturation, currentBrightness;
    
            // Adjust saturation based on the direction
            currentSaturation = increaseSaturation
                ? constrain(this.s + (i * satDifference), 0, 100)
                : constrain(this.s - (i * satDifference), 0, 100);
    
            // Adjust brightness based on the direction
            currentBrightness = increaseBrightness
                ? constrain(this.b + (i * brightDifference), 0, 100)
                : constrain(this.b - (i * brightDifference), 0, 100);
    
            result.push(color(this.h, currentSaturation, currentBrightness));
        }
    
        pop();
        return result;
    }

    /**
     * Generates the complementary color of the base color (180 degrees on the color wheel).
     * @return {array} An array with the base color and its complementary color.
     */
    getComplementary() {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let complementaryColor = color((this.h + 180) % 360, this.s, this.b);
        pop();
        return [this.color, complementaryColor];
    }

    /**
     * Generates a triadic color scheme (three colors evenly spaced on the color wheel, 120 degrees apart).
     * @return {array} An array of three colors in HSB format.
     */
    getTriadic() {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let triadicColors = [
            this.color,
            color((this.h + 120) % 360, this.s, this.b),
            color((this.h + 240) % 360, this.s, this.b)
        ];
        pop();
        return triadicColors;
    }

    /**
     * Generates an analogous color scheme (colors next to the base color on the color wheel).
     * @param {number} degree - The degree difference from the base color (default: 30).
     * @return {array} An array of three colors in HSB format.
     */
    getAnalogous(degree = 30) {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let analogousColors = [
            this.color,
            color((this.h - degree + 360) % 360, this.s, this.b),
            color((this.h + degree) % 360, this.s, this.b)
        ];
        pop();
        return analogousColors;
    }

    /**
     * Generates a split complementary color scheme (two colors adjacent to the complementary color).
     * @param {number} degree - The degree difference from the complementary color (default: 30).
     * @return {array} An array of three colors in HSB format.
     */
    getSplitComplementary(degree = 30) {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let splitComplementaryColors = [
            this.color,
            color((this.h + 180 - degree + 360) % 360, this.s, this.b),
            color((this.h + 180 + degree) % 360, this.s, this.b)
        ];
        pop();
        return splitComplementaryColors;
    }

    /**
     * Generates a tetradic color scheme (four colors, two complementary pairs).
     * @return {array} An array of four colors in HSB format.
     */
    getTetradic() {
        push();
        colorMode(HSB, 360, 100, 100, 1);
        let tetradicColors = [
            this.color,
            color((this.h + 90) % 360, this.s, this.b),
            color((this.h + 180) % 360, this.s, this.b),
            color((this.h + 270) % 360, this.s, this.b)
        ];
        pop();
        return tetradicColors;
    }
}