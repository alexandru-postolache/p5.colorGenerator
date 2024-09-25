let colorGen;
let waves;
let currentColorScheme;
let colorFormat = 'hex'; // Default format

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('waves-container');
    colorMode(HSB, 360, 100, 100, 1);
    
    waves = new Waves();
    
    colorGen = new ColorGenerator(color('#ffba06'));
    updateColorSchemes();

    let colorPicker = select('#colorPicker');
    colorPicker.input(() => {
        colorGen = new ColorGenerator(color(colorPicker.value()));
        updateColorSchemes();
    });

    // Add event listener for color format selection
    select('#colorFormat').changed(function() {
        colorFormat = this.value();
        updateColorSchemes(); // Update all color displays with new format
    });
}

function draw() {
    clear();
    waves.draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function updateColorSchemes() {
    updateColorDisplay('shades', colorGen.getShades(5));
    updateColorDisplay('tints', colorGen.getTints(5));
    updateColorDisplay('monochromatic', colorGen.getMonochromatic(5));
    updateColorDisplay('complementary', colorGen.getComplementary());
    updateColorDisplay('triadic', colorGen.getTriadic());
    updateColorDisplay('analogous', colorGen.getAnalogous());
    updateColorDisplay('splitComplementary', colorGen.getSplitComplementary());
    updateColorDisplay('tetradic', colorGen.getTetradic());
    
    // Update waves colors
    let tints = colorGen.getTints(5);
    waves.updateColors(tints);
}

function updateColorDisplay(id, colors) {
    let container = select(`#${id}`);
    container.html('');
    
    let schemeHeader = createDiv();
    schemeHeader.class('scheme-header');
    
    let schemeTitle = createElement('h2', id.charAt(0).toUpperCase() + id.slice(1));
    schemeHeader.child(schemeTitle);
    
    let buttonContainer = createDiv();
    buttonContainer.class('scheme-buttons');
    
    let copyButton = createButton('<i class="fas fa-copy"></i>');
    copyButton.class('icon-button');
    copyButton.attribute('data-tooltip', 'Copy to Clipboard');
    copyButton.mousePressed(() => {
        copyToClipboard(colors);
        copyButton.attribute('data-tooltip', 'Copied!');
        setTimeout(() => {
            copyButton.attribute('data-tooltip', 'Copy to Clipboard');
        }, 2000);
    });
    buttonContainer.child(copyButton);
    
    let useButton = createButton('<i class="fas fa-paint-brush"></i>');
    useButton.class('icon-button');
    useButton.attribute('data-tooltip', 'Use Scheme');
    useButton.mousePressed(() => {
        applyScheme(colors);
    });
    buttonContainer.child(useButton);
    
    schemeHeader.child(buttonContainer);
    container.child(schemeHeader);
    
    let colorDisplay = createDiv();
    colorDisplay.class('color-display');
    colors.forEach(c => {
        let swatch = createDiv();
        swatch.class('color-swatch');
        swatch.style('background-color', c);
        
        let colorValue = getColorValue(c);
        
        swatch.attribute('data-color', colorValue);
        swatch.mousePressed(() => {
            navigator.clipboard.writeText(colorValue).then(() => {
                swatch.attribute('data-tooltip', 'Copied!');
                setTimeout(() => {
                    swatch.attribute('data-tooltip', colorValue);
                }, 1000);
            });
        });
        swatch.attribute('data-tooltip', colorValue);
        colorDisplay.child(swatch);
    });
    container.child(colorDisplay);
}

function copyToClipboard(colors) {
    let colorValues = colors.map(getColorValue);
    let text = colorValues.join(', ');
    navigator.clipboard.writeText(text);
}

function applyScheme(colors) {
    waves.updateColors(colors);
}

class Waves {
    constructor() {
        this.colors = [];
        this.yScale = 120;
        this.xScale = 0.005;
        this.xTranslate = 0.2;
        this.itemsOffset = 1;
        this.speed = 0.02;
        this.startHeight = 1/5; 
    }

    updateColors(newColors) {
        this.colors = newColors;
    }

    draw() {
        let waveHeight = height * (1 - this.startHeight); // Height of the wave area
        let lineGap = waveHeight / (this.colors.length + 1);
        let numberOfCurves = this.colors.length;
        let startColor = this.colors[0];
        
        let currentStartFrom = height * this.startHeight; // Start from 2/3 of the page height
        let currentOffset = this.itemsOffset;
        
        for (let j = 0; j < numberOfCurves; j++) {
            stroke(this.colors[j]);
            
            currentStartFrom += lineGap;
            currentOffset += this.itemsOffset;
            
            for (let i = 0; i < width; i++) {
                let t = i * this.xScale + currentOffset + frameCount * this.speed;
                let x = i;
                let y = sin(t + this.xTranslate) * this.yScale;
                y = map(y, 0, height, 0, this.yScale) + currentStartFrom;
                
                // Ensure the line doesn't go above the start height
                let topY = max(y, height * this.startHeight);
                
                line(x, height, x, topY);
            }
        }
    }
}

// Helper function to convert p5.js color to hex
function colorToHex(c) {
    let rgbColor = color(c.toString());
    return '#' + hex(red(rgbColor), 2) + hex(green(rgbColor), 2) + hex(blue(rgbColor), 2);
}

function getColorValue(c) {
    // Temporarily switch to RGB mode to get correct values
    push();
    colorMode(RGB, 255);
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    pop();

    switch (colorFormat) {
        case 'rgb':
            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        case 'hsb':
            // Convert RGB to HSB
            let h = hue(color(r, g, b));
            let s = saturation(color(r, g, b));
            let br = brightness(color(r, g, b));
            return `hsb(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(br)}%)`;
        default: // hex
            return '#' + hex(r, 2) + hex(g, 2) + hex(b, 2);
    }
}