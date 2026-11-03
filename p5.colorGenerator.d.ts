export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HsbColor {
  h: number;
  s: number;
  b: number;
  a: number;
}

export interface ColorSpec {
  h?: number;
  hue?: number;
  s?: number;
  saturation?: number;
  b?: number;
  brightness?: number;
  a?: number;
  alpha?: number;
  space?: 'hsb' | 'oklch';
}

export interface ColorGeneratorOptions {
  /** "hsb" keeps the legacy wheel. "oklch" rotates and ramps in a perceptual space. */
  space?: 'hsb' | 'oklch';
  /** Seeds the random base color without touching p5's random sequence. */
  seed?: number;
  /** p5 instance. In instance mode this is the sketch. */
  instance?: object;
}

export interface RampOptions {
  count?: number;
  nr?: number;
  limit?: number;
  /** When false, the base color is left out and the limit is still included. */
  includeBase?: boolean;
}

export interface MonochromaticOptions {
  count?: number;
  nr?: number;
  saturation?: 'increase' | 'decrease' | boolean;
  brightness?: 'increase' | 'decrease' | boolean;
  increaseSaturation?: boolean;
  increaseBrightness?: boolean;
}

export interface HarmonyOptions {
  degree?: number;
  angle?: number;
  count?: number;
}

export type EasingName = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface MixOptions {
  space?: 'hsb' | 'oklch' | 'rgb';
  easing?: EasingName | ((t: number) => number);
  instance?: object;
}

export interface ContrastOptions {
  minRatio?: number;
  direction?: 'auto' | 'lighter' | 'lighten' | 'darker' | 'darken';
}

export type VisionKind = 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface PaletteRole {
  from: string;
  index?: number;
  on?: string;
  backgroundFrom?: string;
  backgroundIndex?: number;
}

export interface PaletteSpec {
  steps?: number;
  angle?: number;
  roles: Record<string, PaletteRole | 'primary'>;
}

export interface RolePalette {
  background: any;
  surface: any;
  primary: any;
  accent: any;
  onPrimary: any;
  onBackground: any;
}

export interface PixelSource {
  pixels: ArrayLike<number>;
  width: number;
  height: number;
}

export interface ImagePaletteOptions {
  count?: number;
  samples?: number;
  instance?: object;
}

export type ColorInput = string | number | number[] | ColorSpec | object;

/**
 * Generates color schemes from a base color.
 * Returned colors are p5.Color objects.
 */
export class ColorGenerator {
  color: any;
  h: number;
  s: number;
  b: number;
  a: number;
  space: 'hsb' | 'oklch';

  constructor(
    colorInput?: ColorInput | object,
    optionsOrInstance?: ColorGeneratorOptions | object,
    maybeOptions?: ColorGeneratorOptions | object
  );

  setColor(colorInput: ColorInput): this;
  setSpace(space: 'hsb' | 'oklch'): this;

  getShades(count?: number | RampOptions, limit?: number | RampOptions): any[];
  getTints(count?: number | RampOptions, limit?: number | RampOptions): any[];
  getTones(count?: number | RampOptions, limit?: number | RampOptions): any[];
  getMonochromatic(
    count?: number | MonochromaticOptions,
    increaseSaturation?: boolean,
    increaseBrightness?: boolean
  ): any[];

  getComplementary(): any[];
  complement(): any;
  getTriadic(): any[];
  getAnalogous(degree?: number | HarmonyOptions, count?: number): any[];
  getSplitComplementary(degree?: number | HarmonyOptions, count?: number): any[];
  getTetradic(angle?: number | { angle?: number; degree?: number }): any[];
  getSquare(): any[];
  getRectangle(angle?: number | { angle?: number; degree?: number }): any[];
  getEven(count?: number): any[];

  adjust(deltas?: { h?: number; s?: number; b?: number; a?: number; hue?: number; saturation?: number; brightness?: number; alpha?: number }): any;
  lerpColors(other: ColorInput, steps?: number, options?: MixOptions): any[];

  contrastRatio(other: ColorInput): number;
  recommendedText(background?: ColorInput): any;
  adjustForContrast(background: ColorInput, options?: ContrastOptions): any;
  lightenUntilContrast(background: ColorInput, minRatio?: number): any;
  darkenUntilContrast(background: ColorInput, minRatio?: number): any;
  simulate(kind: VisionKind, color?: ColorInput): any;
  getPalette(spec?: PaletteSpec): RolePalette | Record<string, any>;

  toHex(color?: ColorInput): string;
  toRgb(color?: ColorInput): RgbColor;
  toCss(color?: ColorInput): string;
  toHsb(color?: ColorInput): HsbColor;

  static toHex(color: object): string;
  static toRgb(color: object): RgbColor;
  static toCss(color: object): string;
  static toHsb(color: object): HsbColor;
  static contrastRatio(c1: object, c2: object): number;
  static simulate(kind: VisionKind, color: ColorInput, instance?: object): any;
  static mix(c1: ColorInput, c2: ColorInput, t?: number, options?: MixOptions): any;
  static fromImage(img: object | PixelSource, count?: number | object, optionsOrInstance?: object | ImagePaletteOptions): any[];
  static attachToP5(p5Constructor: { prototype: object }): void;
}

export default ColorGenerator;

declare global {
  var ColorGenerator: typeof ColorGenerator;
}
