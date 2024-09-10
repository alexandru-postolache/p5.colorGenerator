let colorGen;
let baseColorInput;
let headerElement;
let waveColors;
let canvas;

function setup() {
    // Set up canvas for the abstract art with waves
    let canvasContainer = select('#canvas-container');
    canvas = createCanvas(window.innerWidth, 400);
    canvas.parent(canvasContainer); // Attach the canvas to the canvas container

    // Get references to the DOM elements
    headerElement = select('#header');
    baseColorInput = select('#baseColor');
    baseColorInput.input(updateColors); // Update colors when the user changes the base color

    // Set up an initial base color
    colorGen = new ColorGenerator(baseColorInput.value());
    updateColors();
}

function updateColors() {
    let baseColorValue = baseColorInput.value();
    colorGen = new ColorGenerator(baseColorValue);

    // Update the header background color
    headerElement.style('background-color', baseColorValue);

    // Update the wave colors with a new tetradic palette
    waveColors = colorGen.getShades(5);

    // Redraw the waves with the new palette
    drawWaves();

    // Update color schemes in the DOM
    drawColorSchemes();
}

function drawWaves() {
    var yScale = 120;
    var xScale = 0.005;
    var xTranslate = 0.2;
    var itemsOffset = 1;
    var lineGap = height / (waveColors.length + 1);
    var numberOfCurves = waveColors.length;
    var startColor = waveColors[0];
    
    colorFill = startColor;
    background(startColor);
    
    currentStartFrom = 0;
    
    currentOffset = itemsOffset;
    
    for (j = 0; j < numberOfCurves; j++) {
        stroke(waveColors[j]);
        
        currentStartFrom += lineGap;
        currentOffset += itemsOffset
        
        for (i = 0; i < width; i++) {
          t = i * xScale + currentOffset;  
          x = i;
          y = sin(t+ xTranslate) * yScale;
          y = map(y, 0, height, 0, yScale) + currentStartFrom;
        
          line(x,height, x, y);
        }
    }
}

function drawColorSchemes() {
    // Get references to left and right columns
    let leftColumn = select('#left-column');
    let rightColumn = select('#right-column');

    // Clear the previous content
    leftColumn.html('');
    rightColumn.html('');

    // Complementary Color (Add base color in front)
    leftColumn.child(createColorBox('Complementary', colorGen.getComplementary()));

    // Triadic Colors (Add base color in front)
    leftColumn.child(createColorBox('Triadic', colorGen.getTriadic()));

    // Analogous Colors (Add base color in front)
    leftColumn.child(createColorBox('Analogous', colorGen.getAnalogous()));

    // Split Complementary Colors (Add base color in front)
    rightColumn.child(createColorBox('Split Complementary', colorGen.getSplitComplementary()));

    // Tetradic Colors (Add base color in front)
    rightColumn.child(createColorBox('Tetradic', colorGen.getTetradic()));

    // Monochromatic Colors
    rightColumn.child(createColorBox('Monochromatic', colorGen.getMonochromatic(5)));
    
    // Shades
    leftColumn.child(createColorBox('Shades', colorGen.getShades(8)));

    // Tints
    rightColumn.child(createColorBox('Tints', colorGen.getTints(8)));
}

function createColorBox(label, colors) {
    let colorBox = createDiv();
    colorBox.class('color-box');

    let title = createElement('h3', label);
    colorBox.child(title);

    colors.forEach((col) => {
        let colorBlock = createDiv();
        colorBlock.class('color-block');
        colorBlock.style('background-color', col);
        colorBox.child(colorBlock);
    });

    return colorBox;
}