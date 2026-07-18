import { describe, expect, it } from 'vitest';
import { cToF, formatFraction, formatMass, gramsToVolume } from '../units';

const densities = [
  { key: 'flour:wheat-white', gramsPerCup: 120, gramsPerTbsp: 7.5, gramsPerTsp: 2.5 },
  { key: 'water', gramsPerCup: 237, gramsPerTbsp: 14.8, gramsPerTsp: 4.9 },
  { key: 'salt', gramsPerCup: 288, gramsPerTbsp: 18, gramsPerTsp: 6 },
];

describe('formatMass', () => {
  it('formats metric', () => {
    expect(formatMass(500, 'metric')).toBe('500 g');
    expect(formatMass(1240, 'metric')).toBe('1.24 kg');
    expect(formatMass(6.4, 'metric')).toBe('6.4 g');
  });
  it('formats US ounces and pounds', () => {
    expect(formatMass(28.35, 'us')).toBe('1 oz');
    expect(formatMass(453.6, 'us')).toBe('1 lb');
    expect(formatMass(907.2, 'us')).toBe('2 lb');
  });
});

describe('gramsToVolume', () => {
  it('converts flour to cups', () => {
    const v = gramsToVolume('flour:wheat-white', 500, densities);
    expect(v).toEqual({ qty: '4 ⅛', unit: 'cup' });
  });
  it('converts salt to teaspoons', () => {
    const v = gramsToVolume('salt', 10, densities);
    expect(v?.unit).toBe('tsp');
    expect(v?.qty).toBe('1 ¾');
  });
  it('falls back to white wheat for unknown flours', () => {
    const v = gramsToVolume('flour:khorasan', 120, densities);
    expect(v).toEqual({ qty: '1', unit: 'cup' });
  });
  it('returns null for unknown non-flour ingredients', () => {
    expect(gramsToVolume('mystery', 100, densities)).toBeNull();
  });
});

describe('formatFraction', () => {
  it('renders unicode fractions', () => {
    expect(formatFraction(0.5)).toBe('½');
    expect(formatFraction(1.25)).toBe('1 ¼');
    expect(formatFraction(2)).toBe('2');
    expect(formatFraction(0.33)).toBe('⅓');
  });
});

describe('cToF', () => {
  it('converts oven temperatures', () => {
    expect(cToF(230)).toBe(446);
    expect(cToF(0)).toBe(32);
  });
});
