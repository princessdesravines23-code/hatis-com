// Builds a stable pair of gradient colors from a seed string (the username),
// so every person gets their own look and it never changes between visits.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) =>
    lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function gradientFor(seed: string): [string, string] {
  const h = hash(seed.toLowerCase());
  const hue = h % 360;
  const shift = 35 + ((h >>> 9) % 50);
  const sat = 55 + ((h >>> 17) % 20);
  const c1 = hslToHex(hue, sat, 42);
  const c2 = hslToHex((hue + shift) % 360, sat, 30);
  return [c1, c2];
}