'use client';

import type { ModifierDef } from '../data/modifiers';
import type { UpgradeCard, UpgradeRarity } from '../data/upgrades';

// Legacy interface for backwards compat
interface LegacyProps {
  choices: ModifierDef[];
  onPick: (mod: ModifierDef) => void;
}

export function ModifierPicker({ choices, onPick }: LegacyProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="flex flex-col items-center gap-4 p-6 max-w-md w-full">
        <h2 className="text-sm tracking-[4px] text-[#cc4400] uppercase font-bold">Choose Modifier</h2>
        <div className="flex flex-col gap-3 w-full">
          {choices.map(mod => (
            <button
              key={mod.id}
              onClick={() => onPick(mod)}
              className="w-full text-left p-3 border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                borderColor: mod.rarity === 'rare' ? '#aa44ff' : '#44cc44',
                background: mod.rarity === 'rare' ? 'rgba(170,68,255,0.08)' : 'rgba(68,204,68,0.06)',
                color: '#cc8866',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-[2px] uppercase"
                  style={{ color: mod.rarity === 'rare' ? '#aa44ff' : '#44cc44' }}>
                  {mod.name}
                </span>
                {mod.rarity === 'rare' && (
                  <span className="text-[9px] px-1 py-0.5 tracking-[1px]"
                    style={{ border: '1px solid #aa44ff', color: '#aa44ff' }}>
                    RARE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#886644] leading-relaxed">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── New Upgrade Picker ──

const RARITY_COLORS: Record<UpgradeRarity, { border: string; bg: string; text: string; badge: string }> = {
  common:    { border: '#44cc44', bg: 'rgba(68,204,68,0.06)',    text: '#44cc44', badge: '' },
  rare:      { border: '#aa44ff', bg: 'rgba(170,68,255,0.08)',  text: '#aa44ff', badge: 'RARE' },
  legendary: { border: '#ffaa00', bg: 'rgba(255,170,0,0.10)',   text: '#ffaa00', badge: 'LEGENDARY' },
};

const TYPE_LABELS: Record<string, string> = {
  weapon_upgrade: 'WEAPON',
  mutation: 'MUTATION',
  mastery: 'MASTERY',
  kit_tier: 'KIT',
  kit_perk: 'KIT PERK',
  resonance: 'RESONANCE',
  modifier: 'MODIFIER',
  fallback: 'SUPPLY',
};

interface UpgradePickerProps {
  choices: UpgradeCard[];
  onPick: (card: UpgradeCard) => void;
}

export function UpgradePicker({ choices, onPick }: UpgradePickerProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5,5,8,0.88)', backdropFilter: 'blur(6px)' }}>
      <div className="flex flex-col items-center gap-4 p-6 max-w-lg w-full">
        <h2 className="text-sm tracking-[4px] text-[#ff8800] uppercase font-bold">Level Up</h2>
        <div className="flex flex-col gap-3 w-full">
          {choices.map(card => {
            const colors = RARITY_COLORS[card.rarity];
            const typeLabel = TYPE_LABELS[card.type] ?? card.type.toUpperCase();
            const isMutation = card.type === 'mutation';
            return (
              <button
                key={card.id}
                onClick={() => onPick(card)}
                className="w-full text-left p-3 border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: colors.border,
                  background: colors.bg,
                  color: '#cc8866',
                  borderWidth: isMutation ? 2 : 1,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1 py-0.5 tracking-[1px] opacity-60"
                    style={{ border: `1px solid ${colors.border}40`, color: colors.text }}>
                    {typeLabel}
                  </span>
                  <span className="text-xs font-bold tracking-[2px] uppercase"
                    style={{ color: colors.text }}>
                    {card.icon} {card.label}
                  </span>
                  {colors.badge && (
                    <span className="text-[9px] px-1 py-0.5 tracking-[1px]"
                      style={{ border: `1px solid ${colors.border}`, color: colors.text }}>
                      {colors.badge}
                    </span>
                  )}
                  {isMutation && card.mutationType && (
                    <span className="text-[9px] px-1 py-0.5 tracking-[1px] ml-auto"
                      style={{
                        border: `1px solid ${card.mutationType === 'clean' ? '#44cccc' : '#cc44ff'}`,
                        color: card.mutationType === 'clean' ? '#44cccc' : '#cc44ff',
                      }}>
                      {card.mutationType === 'clean' ? 'CLEAN' : 'VOID'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#886644] leading-relaxed">{card.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Kit T3 Path Choice Panel ──

interface KitT3ChoiceProps {
  kitName: string;
  onPick: (path: 'clean' | 'void') => void;
}

export function KitT3Choice({ kitName, onPick }: KitT3ChoiceProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5,5,8,0.90)', backdropFilter: 'blur(6px)' }}>
      <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full">
        <h2 className="text-sm tracking-[4px] text-[#ffaa00] uppercase font-bold">{kitName} — Tier 3</h2>
        <p className="text-[11px] text-[#886644] text-center">Choose your path. This cannot be undone.</p>
        <div className="flex gap-4 w-full">
          <button
            onClick={() => onPick('clean')}
            className="flex-1 text-center p-4 border-2 transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ borderColor: '#44cccc', background: 'rgba(68,204,204,0.08)', color: '#44cccc' }}
          >
            <div className="text-lg font-bold mb-1">CLEAN</div>
            <p className="text-[10px] text-[#668888]">Precision & control</p>
          </button>
          <button
            onClick={() => onPick('void')}
            className="flex-1 text-center p-4 border-2 transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ borderColor: '#cc44ff', background: 'rgba(204,68,255,0.08)', color: '#cc44ff' }}
          >
            <div className="text-lg font-bold mb-1">VOID</div>
            <p className="text-[10px] text-[#886688]">Power & corruption</p>
          </button>
        </div>
      </div>
    </div>
  );
}
