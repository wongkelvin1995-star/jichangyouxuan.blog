// 番剧星球式「海报」配色：确定性分配，保证每次构建一致
export const palettes = [
  'linear-gradient(160deg,#ffb21a 0%,#ff6a1a 55%,#b3341e 100%)',
  'linear-gradient(160deg,#1b1838 0%,#2e2461 55%,#6b3a9e 100%)',
  'linear-gradient(160deg,#163a8a 0%,#2d7ff9 55%,#8ec2ff 100%)',
  'linear-gradient(160deg,#7a1f1f 0%,#e23b2e 55%,#ff9d6a 100%)',
  'linear-gradient(160deg,#0e5a4e 0%,#1aa98f 55%,#8fe3c8 100%)',
  'linear-gradient(160deg,#5a3200 0%,#b8650a 55%,#ffd34d 100%)',
];
export const paletteOf = (i: number) => palettes[((i % palettes.length) + palettes.length) % palettes.length];
export const initial = (n: string) => n.replace(/[^一-鿿A-Za-z0-9]/g, '').slice(0, 1);
