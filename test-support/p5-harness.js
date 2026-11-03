const { JSDOM } = require('jsdom');

let sketch = null;
let booting = null;

function fakeContext(canvas) {
  const noop = () => {};
  return new Proxy({ canvas: canvas }, {
    get(target, prop) {
      if (prop === 'canvas') return canvas;
      if (prop in target) return target[prop];
      if (prop === 'measureText') return () => ({ width: 0 });
      if (prop === 'getImageData') {
        return (x, y, w, h) => ({
          data: new Uint8ClampedArray(Math.max(1, (w || 1) * (h || 1) * 4)),
          width: w || 1,
          height: h || 1
        });
      }
      if (prop === 'createImageData') {
        return (w, h) => ({
          data: new Uint8ClampedArray(Math.max(1, (w || 1) * (h || 1) * 4)),
          width: w || 1,
          height: h || 1
        });
      }
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => new Proxy({}, { get: () => noop });
      }
      if (typeof prop === 'symbol') return undefined;
      return noop;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
}

function installDom() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/'
  });
  const window = dom.window;
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
  global.screen = window.screen;
  global.HTMLElement = window.HTMLElement;
  global.HTMLCanvasElement = window.HTMLCanvasElement;
  global.Image = window.Image;
  global.Event = window.Event;
  global.ErrorEvent = window.ErrorEvent || class ErrorEvent extends window.Event {};
  global.MouseEvent = window.MouseEvent;
  global.KeyboardEvent = window.KeyboardEvent;
  global.Node = window.Node;
  window.HTMLCanvasElement.prototype.getContext = function () {
    return fakeContext(this);
  };
}

function boot() {
  if (sketch) return Promise.resolve(sketch);
  if (booting) return booting;
  installDom();
  const p5 = require('../demo/p5.js');
  booting = new Promise((resolve) => {
    new p5((sk) => {
      sk.setup = () => {
        sk.noLoop();
        sketch = sk;
        resolve(sk);
      };
    });
  });
  return booting;
}

function snapshotMode(p) {
  return {
    mode: p._colorMode,
    maxes: {
      rgb: p._colorMaxes.rgb.slice(),
      hsb: p._colorMaxes.hsb.slice(),
      hsl: p._colorMaxes.hsl.slice()
    }
  };
}

module.exports = { boot, snapshotMode };
