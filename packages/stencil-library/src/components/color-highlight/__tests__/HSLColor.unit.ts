import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HSLColor } from '../../../components/color-highlight/HSLColor';

describe('HSLColor', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      crypto: {
        subtle: {
          digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        },
      },
    });
  });

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

  it('generateColor() falls back to text-based hashing when crypto.subtle is not available', async () => {
    vi.stubGlobal('window', {
      crypto: {
        subtle: undefined,
      },
    });

    const color = await HSLColor.generateColor('fallback-test');
    expect(color).toBeInstanceOf(HSLColor);
    expect(typeof color.hue).toBe('number');
    expect(typeof color.sat).toBe('number');
    expect(typeof color.lum).toBe('number');
  });

  it('generateColor() handles empty string with fallback', async () => {
    vi.stubGlobal('window', {
      crypto: {
        subtle: undefined,
      },
    });

    const color = await HSLColor.generateColor('');
    expect(color).toBeInstanceOf(HSLColor);
  });
});
