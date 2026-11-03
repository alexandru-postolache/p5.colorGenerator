let colorGen;
let waves;
let currentColorScheme;
let colorFormat = 'hex';
let sourceImage = null;
let imageMessage = 'Choose a photo to build a palette from its main colors.';

const SCHEME_LABELS = {
    shades: 'Shades',
    tints: 'Tints',
    tones: 'Tones',
    monochromatic: 'Monochromatic',
    complementary: 'Complementary',
    triadic: 'Triadic',
    analogous: 'Analogous',
    splitComplementary: 'Split complementary',
    tetradic: 'Tetradic',
    rectangle: 'Rectangle',
    even: 'Even',
    roles: 'Roles',
    vision: 'Color vision',
    mix: 'Mix',
    image: 'Image'
};

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('waves-container');
    colorMode(HSB, 360, 100, 100, 1);

    waves = new Waves();
    colorGen = new ColorGenerator('#e39b14');

    select('#colorPicker').input(() => {
        colorGen.setColor(select('#colorPicker').value());
        updateColorSchemes();
    });

    select('#colorFormat').changed(function() {
        colorFormat = this.value();
        updateColorSchemes();
    });

    select('#colorSpace').changed(function() {
        colorGen.setSpace(this.value());
        updateColorSchemes();
    });

    select('#swatchCount').input(() => updateColorSchemes());
    select('#includeBase').changed(() => updateColorSchemes());
    select('#mixColor').input(() => updateColorSchemes());

    select('#harmonyDegree').input(() => {
        select('#degreeReadout').html(select('#harmonyDegree').value() + '°');
        updateColorSchemes();
    });

    select('#rectangleAngle').input(() => {
        select('#angleReadout').html(select('#rectangleAngle').value() + '°');
        updateColorSchemes();
    });

    select('#randomColor').mousePressed(() => {
        adoptColor(new ColorGenerator({ space: colorGen.space }));
    });

    select('#applySeed').mousePressed(() => {
        const raw = select('#colorSeed').value();
        if (raw === '') return;
        const seed = Number(raw);
        if (!Number.isFinite(seed)) return;
        adoptColor(new ColorGenerator({ seed: seed, space: colorGen.space }));
    });

    select('#imageFile').changed(function() {
        const file = this.elt.files && this.elt.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        loadImage(url, (img) => {
            sourceImage = img;
            imageMessage = '';
            URL.revokeObjectURL(url);
            updateColorSchemes();
        }, () => {
            sourceImage = null;
            imageMessage = 'Could not read that image.';
            URL.revokeObjectURL(url);
            updateColorSchemes();
        });
    });

    updateColorSchemes();
}

function draw() {
    clear();
    waves.draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function adoptColor(next) {
    colorGen.setColor(next.color);
    const hex = colorGen.toHex();
    select('#colorPicker').value(hex.slice(0, 7));
    updateColorSchemes();
}

function readCount() {
    const value = parseInt(select('#swatchCount').value(), 10);
    if (!Number.isFinite(value)) return 5;
    return Math.min(8, Math.max(2, value));
}

function readDegree() {
    const value = parseInt(select('#harmonyDegree').value(), 10);
    return Number.isFinite(value) ? value : 30;
}

function readAngle() {
    const value = parseInt(select('#rectangleAngle').value(), 10);
    return Number.isFinite(value) ? value : 60;
}

function includeBase() {
    return select('#includeBase').checked();
}

function updateColorSchemes() {
    const count = readCount();
    const degree = readDegree();
    const angle = readAngle();
    const ramp = { count: count, includeBase: includeBase() };

    updateColorDisplay('shades', colorGen.getShades(ramp));
    updateColorDisplay('tints', colorGen.getTints(ramp));
    updateColorDisplay('tones', colorGen.getTones(ramp));
    updateColorDisplay('monochromatic', colorGen.getMonochromatic(count));
    updateColorDisplay('complementary', colorGen.getComplementary());
    updateColorDisplay('triadic', colorGen.getTriadic());
    updateColorDisplay('analogous', colorGen.getAnalogous(degree, count));
    updateColorDisplay('splitComplementary', colorGen.getSplitComplementary(degree, count));
    updateColorDisplay('tetradic', colorGen.getTetradic());
    updateColorDisplay('rectangle', colorGen.getRectangle(angle));
    updateColorDisplay('even', colorGen.getEven(count));
    updateColorDisplay('mix', colorGen.lerpColors(select('#mixColor').value(), count));

    const roles = colorGen.getPalette({ steps: count });
    updateColorDisplay(
        'roles',
        [roles.background, roles.surface, roles.primary, roles.accent, roles.onPrimary, roles.onBackground],
        ['background', 'surface', 'primary', 'accent', 'on primary', 'on background']
    );

    updateColorDisplay(
        'vision',
        [
            colorGen.color,
            colorGen.simulate('protanopia'),
            colorGen.simulate('deuteranopia'),
            colorGen.simulate('tritanopia')
        ],
        ['original', 'protanopia', 'deuteranopia', 'tritanopia']
    );

    updateContrastCard();
    updateImageCard(count);
    waves.updateColors(colorGen.getShades(count));
}

function updateContrastCard() {
    const container = select('#contrast');
    container.html('');

    const black = colorGen.adjust({ s: -100, b: -100 });
    const white = colorGen.adjust({ s: -100, b: 100 });
    const text = colorGen.recommendedText();
    const lifted = colorGen.lightenUntilContrast(black, 4.5);
    const dropped = colorGen.darkenUntilContrast(white, 4.5);
    const samples = [text, lifted, dropped];

    container.child(schemeHeader('Contrast', samples));

    const preview = createDiv('The quick brown fox');
    preview.class('contrast-preview');
    preview.style('background-color', colorGen.toCss());
    preview.style('color', colorGen.toCss(text));
    container.child(preview);

    const stats = createP(
        'vs black ' + colorGen.contrastRatio(black).toFixed(2) +
        ' · vs white ' + colorGen.contrastRatio(white).toFixed(2) +
        ' · the line above uses the higher contrast'
    );
    stats.class('contrast-stats');
    container.child(stats);

    const pair = createDiv();
    pair.class('contrast-pair');
    pair.child(contrastSample('On black', lifted, '#000000', ColorGenerator.contrastRatio(lifted, black)));
    pair.child(contrastSample('On white', dropped, '#ffffff', ColorGenerator.contrastRatio(dropped, white)));
    container.child(pair);
}

function contrastSample(label, ink, background, ratio) {
    const sample = createDiv();
    sample.class('contrast-sample');
    sample.style('background-color', background);
    sample.style('color', colorGen.toCss(ink));
    if (background === '#ffffff') {
        sample.style('box-shadow', 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)');
    }
    const title = createDiv(label);
    const score = createDiv(ratio.toFixed(2) + ' contrast');
    score.class('contrast-score');
    sample.child(title);
    sample.child(score);
    return sample;
}

function updateImageCard(count) {
    const container = select('#image');
    container.html('');
    if (!sourceImage) {
        container.child(schemeHeader('Image'));
        const note = createP(imageMessage);
        note.class('note');
        container.child(note);
        return;
    }
    try {
        updateColorDisplay('image', ColorGenerator.fromImage(sourceImage, count));
    } catch (error) {
        container.child(schemeHeader('Image'));
        const note = createP(error.message);
        note.class('note');
        container.child(note);
    }
}

function updateColorDisplay(id, colors, labels) {
    const container = select('#' + id);
    container.html('');
    container.child(schemeHeader(SCHEME_LABELS[id] || id, colors));

    const colorDisplay = createDiv();
    colorDisplay.class('color-display');
    colors.forEach((c, index) => {
        colorDisplay.child(colorSwatch(c, labels ? labels[index] : ''));
    });
    container.child(colorDisplay);
}

function schemeHeader(title, colors) {
    const header = createDiv();
    header.class('scheme-header');
    header.child(createElement('h2', title));
    if (colors && colors.length) {
        const buttons = createDiv();
        buttons.class('scheme-buttons');
        buttons.child(iconButton('fa-copy', 'Copy to Clipboard', () => copyToClipboard(colors), true));
        buttons.child(iconButton('fa-paint-brush', 'Use Scheme', () => applyScheme(colors), false));
        header.child(buttons);
    }
    return header;
}

function iconButton(icon, tooltip, onPress, confirmCopy) {
    const button = createButton('<i class="fas ' + icon + '"></i>');
    button.class('icon-button');
    button.attribute('data-tooltip', tooltip);
    button.mousePressed(() => {
        onPress();
        if (!confirmCopy) return;
        button.attribute('data-tooltip', 'Copied!');
        setTimeout(() => button.attribute('data-tooltip', tooltip), 2000);
    });
    return button;
}

function colorSwatch(c, label) {
    const swatch = createDiv();
    swatch.class('color-swatch');
    swatch.style('background-color', colorGen.toCss(c));
    const value = getColorValue(c);
    swatch.attribute('data-color', value);
    swatch.attribute('data-tooltip', label ? label + ': ' + value : value);
    swatch.mousePressed(() => {
        navigator.clipboard.writeText(value).then(() => {
            swatch.attribute('data-tooltip', 'Copied!');
            setTimeout(() => {
                swatch.attribute('data-tooltip', label ? label + ': ' + value : value);
            }, 1000);
        });
    });
    if (!label) return swatch;

    const wrap = createDiv();
    wrap.class('swatch-wrap');
    wrap.child(swatch);
    const caption = createDiv(label);
    caption.class('swatch-caption');
    wrap.child(caption);
    return wrap;
}

function copyToClipboard(colors) {
    navigator.clipboard.writeText(colors.map(getColorValue).join(', '));
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
        this.startHeight = 1 / 5;
    }

    updateColors(newColors) {
        this.colors = newColors;
    }

    draw() {
        let waveHeight = height * (1 - this.startHeight);
        let lineGap = waveHeight / (this.colors.length + 1);
        let numberOfCurves = this.colors.length;
        let currentStartFrom = height * this.startHeight;
        let currentOffset = this.itemsOffset;

        for (let j = 0; j < numberOfCurves; j++) {
            stroke(this.colors[j]);
            currentStartFrom += lineGap;
            currentOffset += this.itemsOffset;

            for (let i = 0; i < width; i++) {
                let t = i * this.xScale + currentOffset + frameCount * this.speed;
                let y = sin(t + this.xTranslate) * this.yScale;
                y = map(y, 0, height, 0, this.yScale) + currentStartFrom;
                let topY = max(y, height * this.startHeight);
                line(i, height, i, topY);
            }
        }
    }
}

function getColorValue(c) {
    switch (colorFormat) {
        case 'rgb':
            return colorGen.toCss(c);
        case 'hsb': {
            let hsb = colorGen.toHsb(c);
            return 'hsb(' + Math.round(hsb.h) + ', ' + Math.round(hsb.s) + '%, ' + Math.round(hsb.b) + '%)';
        }
        default:
            return colorGen.toHex(c);
    }
}
