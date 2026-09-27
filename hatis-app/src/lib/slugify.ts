export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const GRADIENTS: [string, string][] = [
  ["#14213D", "#2A9D8F"],
  ["#D7263D", "#F2B134"],
  ["#2A9D8F", "#14213D"],
  ["#F2B134", "#D7263D"],
];

export function pickGradient(): [string, string] {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
}

export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
