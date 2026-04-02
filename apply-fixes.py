#!/usr/bin/env python3
"""Apply Space Hunter web fixes: sprite basePath, 10x XP, stim kit."""

# Fix 1: next.config.ts
with open('next.config.ts', 'w') as f:
    f.write("""import type { NextConfig } from "next";

const isProd = process.env.PAGES === '1';
const basePath = isProd ? '/space-hunter-web' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isProd ? '/space-hunter-web/' : undefined,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
""")

# Fix 2: constants.ts - 10x XP
c = open('src/game/constants.ts').read()
c = c.replace(
    'export const XP_PER_LEVEL = [0, 20, 20, 20, 20, 20, 35, 35, 35, 35, 35, 55, 55];',
    'export const XP_PER_LEVEL = [0, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6];'
)
open('src/game/constants.ts', 'w').write(c)

# Fix 3: Game.ts - sprite basePath + stim kit
g = open('src/game/Game.ts').read()

# Add BASE constant
g = g.replace(
    "import { CREATURE_DEFS } from '../data/creatures';",
    "import { CREATURE_DEFS } from '../data/creatures';\n\nconst BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';"
)

# Prefix sprite URLs
g = g.replace("url: `/sprites/", "url: `${BASE}/sprites/")

# Add kit cooldown tracking
g = g.replace(
    '  // State\n  elapsed = 0;',
    '  // Kit state\n  kitCooldowns: Record<string, number> = {};\n\n  // State\n  elapsed = 0;'
)

# Add Q key handler
g = g.replace(
    "    window.addEventListener('keydown', (e) => onKey(e, true));",
    "    window.addEventListener('keydown', (e) => {\n      if (e.key === 'q' || e.key === 'Q') this.activateKit('stim_pack');\n      onKey(e, true);\n    });"
)

# Add kit cooldown decrement
g = g.replace(
    '    // Camera\n    this.camera.follow',
    '    // Kit cooldowns\n    for (const k of Object.keys(this.kitCooldowns)) {\n      if (this.kitCooldowns[k] > 0) this.kitCooldowns[k] -= dt;\n    }\n\n    // Camera\n    this.camera.follow'
)

# Add activateKit method
g = g.replace(
    '  finishHunt(status:',
    """  activateKit(kitId: string) {
    if (!this.equippedKits.includes(kitId)) return;
    if ((this.kitCooldowns[kitId] || 0) > 0) return;
    if (kitId === 'stim_pack') {
      this.player.heal(4);
      this.player.corruption = Math.min(100, this.player.corruption + 15);
      this.kitCooldowns[kitId] = 8;
      this.hud.showMessage('STIM USED', 1.5);
    }
  }

  finishHunt(status:"""
)

open('src/game/Game.ts', 'w').write(g)
print('All fixes applied!')
