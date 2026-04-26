import { describe, it, expect } from 'vitest';
import { HSLColor } from '../../../components/color-highlight/HSLColor';

describe('HSLColor', () => {
  it('constructor sets hue, sat, and lum properties', () => {
    const color = new HSLColor(120, 50, 70);
    expect(color.hue).toBe(120);
    expect(color.sat).toBe(50);
    expect(color.lum).toBe(70);
  });

  it('toString() returns an HSL string', () => {
    const color = new HSLColor(120, 50, 70);
    expect(color.toString()).toBe('hsl(120, 50%, 70%)');
  });

  it('generateColor() returns an HSLColor instance', async () => {
    const color = await HSLColor.generateColor('test');
    expect(color).toBeInstanceOf(HSLColor);
    expect(typeof color.hue).toBe('number');
    expect(typeof color.sat).toBe('number');
    expect(typeof color.lum).toBe('number');
  });

  it('generateColor() is deterministic (same input produces same color)', async () => {
    const color1 = await HSLColor.generateColor('deterministic-test');
    const color2 = await HSLColor.generateColor('deterministic-test');
    expect(color1.hue).toBe(color2.hue);
    expect(color1.sat).toBe(color2.sat);
    expect(color1.lum).toBe(color2.lum);
  });
});
