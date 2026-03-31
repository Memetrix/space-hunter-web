import { Graphics, Text, TextStyle } from 'pixi.js';
import type { Player } from './Player';
import { WEAPON_DEFS } from '../data/weapons';
import { KIT_DEFS } from '../data/kits';
import { MAX_LEVEL, XP_PER_LEVEL, CORR_CLEAN, CORR_VALLEY, CORR_CORRUPT } from './constants';

// HAL 9000 terminal font styles
const FONT_HAL  = new TextStyle({ fontFamily: 'PixelOperator, monospace', fontSize: 22, fill: 0xff3300, letterSpacing: 1 });
const FONT_DATA = new TextStyle({ fontFamily: 'PixelOperator, monospace', fontSize: 18, fill: 0xcc4422 });
const FONT_DIM  = new TextStyle({ fontFamily: 'PixelOperator, monospace', fontSize: 16, fill: 0x886644 });
const FONT_MSG  = new TextStyle({ fontFamily: 'PixelOperator, monospace', fontSize: 28, fill: 0xff2200, align: 'center', letterSpacing: 3 });
const FONT_HAL_STRIP = new TextStyle({ fontFamily: 'PixelOperator, monospace', fontSize: 15, fill: 0xcc4422, letterSpacing: 1 });

export class HUD {
  gfx: Graphics;
  hpText: Text;
  ammoText: Text;
  weaponText: Text;
  corrText: Text;
  killsText: Text;
  timerText: Text;
  levelText: Text;
  messageText: Text;
  halStripText: Text;     // HAL commentary strip — bottom center
  messageDuration = 0;
  halStripDuration = 0;
  viewW: number;
  viewH: number;

  constructor(viewW: number, viewH: number) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.gfx = new Graphics();
    this.hpText    = new Text({ text: '', style: FONT_HAL });
    this.ammoText  = new Text({ text: '', style: FONT_DATA });
    this.weaponText = new Text({ text: '', style: FONT_DIM });
    this.corrText  = new Text({ text: '', style: FONT_DATA });
    this.killsText = new Text({ text: '', style: FONT_DATA });
    this.timerText = new Text({ text: '', style: FONT_DATA });
    this.levelText = new Text({ text: '', style: FONT_DATA });
    this.messageText = new Text({ text: '', style: FONT_MSG });
    this.messageText.anchor.set(0.5, 0.5);
    this.halStripText = new Text({ text: '', style: FONT_HAL_STRIP });
    this.halStripText.anchor.set(0.5, 1);
  }

  showMessage(msg: string, duration = 2) {
    this.messageText.text = msg;
    this.messageDuration = duration;
  }

  showHalMessage(msg: string, duration = 4) {
    this.halStripText.text = `HAL: ${msg}`;
    this.halStripDuration = duration;
  }

  draw(player: Player, dt: number, kills: number, elapsed: number, kits: string[]) {
    const g = this.gfx;
    g.clear();
    const L = 16;
    const R = this.viewW - 16;

    // ── TOP-LEFT: VITAL SIGNS ──
    let y = 16;

    // HP bar
    const hpFrac = Math.max(0, player.hp / player.maxHp);
    const hpW = 180;
    const hpH = 16;
    g.rect(L, y, hpW, hpH).fill({ color: 0x110000, alpha: 0.85 });
    const hpColor = hpFrac < 0.3 ? 0xff0000 : 0xcc2200;
    g.rect(L, y, hpW * hpFrac, hpH).fill({ color: hpColor, alpha: 0.9 });
    for (let i = 1; i < player.maxHp; i++) {
      const sx = L + (hpW * i) / player.maxHp;
      g.moveTo(sx, y).lineTo(sx, y + hpH).stroke({ color: 0x220000, width: 1, alpha: 0.8 });
    }
    g.rect(L, y, hpW, hpH).stroke({ color: 0x882200, width: 1, alpha: 0.8 });
    this.hpText.text = `HP ${player.hp}/${player.maxHp}`;
    this.hpText.x = L + hpW + 10;
    this.hpText.y = y - 2;
    y += 28;

    // Ammo readout
    const wdef = WEAPON_DEFS[player.weaponId];
    const reloading = player.reloadTimer > 0;
    if (wdef && wdef.magSize < 999) {
      this.ammoText.text = reloading ? '>>> RELOAD <<<' : `AMMO  ${player.magAmmo}/${player.magSize}`;
      this.ammoText.style.fill = reloading ? 0xff6600 : 0xcc4422;
    } else {
      this.ammoText.text = `${(wdef?.name ?? '').toUpperCase()}  ONLINE`;
      this.ammoText.style.fill = 0xcc4422;
    }
    this.ammoText.x = L;
    this.ammoText.y = y;
    y += 24;

    // Weapon info
    const mut = player.mutated ? ` [${player.mutated.toUpperCase()}]` : '';
    this.weaponText.text = `SYS: ${(wdef?.name ?? '?').toUpperCase()} LV${player.weaponLevel}${mut}`;
    this.weaponText.x = L;
    this.weaponText.y = y;

    // ── TOP-RIGHT: CORRUPTION + STATS ──
    y = 16;
    const corrW = 130;
    const corrH = 16;
    const corrX = R - corrW;
    const corrFrac = Math.min(player.corruption / 100, 1);
    let corrColor = 0x226622;
    let corrLabel = 'CLEAN';
    if (player.corruption >= CORR_CORRUPT)      { corrColor = 0xcc2200; corrLabel = 'CORRUPT'; }
    else if (player.corruption >= CORR_VALLEY)  { corrColor = 0xcc8800; corrLabel = 'VALLEY'; }
    else if (player.corruption >= CORR_CLEAN)   { corrColor = 0xcc8800; corrLabel = 'VALLEY'; }

    g.rect(corrX, y, corrW, corrH).fill({ color: 0x110000, alpha: 0.85 });
    g.rect(corrX, y, corrW * corrFrac, corrH).fill({ color: corrColor, alpha: 0.9 });
    g.rect(corrX, y, corrW, corrH).stroke({ color: 0x882200, width: 1, alpha: 0.8 });
    this.corrText.text = `${corrLabel}  ${Math.floor(player.corruption)}%`;
    this.corrText.x = corrX;
    this.corrText.y = y + corrH + 6;
    y += 44;

    // Kills counter
    this.killsText.text = `KILLS: ${kills}`;
    this.killsText.x = corrX;
    this.killsText.y = y;
    y += 26;

    // Timer
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    this.timerText.text = `T+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.timerText.x = corrX;
    this.timerText.y = y;

    // ── BOTTOM: XP BAR ──
    const xpH = 8;
    const xpY = this.viewH - xpH;
    const xpThreshold = player.level < MAX_LEVEL ? (XP_PER_LEVEL[player.level] ?? 999) : 210;
    const xpFrac = Math.min(player.essenceCollected / xpThreshold, 1);
    g.rect(0, xpY, this.viewW, xpH).fill({ color: 0x0a0008, alpha: 0.85 });
    g.rect(0, xpY, this.viewW * xpFrac, xpH).fill({ color: 0xff2200, alpha: 0.8 });

    // Level label
    this.levelText.text = `LV ${player.level}`;
    this.levelText.x = L;
    this.levelText.y = this.viewH - 30;

    // ── KIT BUTTONS — bottom right ──
    const kitBtnW = 72;
    const kitBtnH = 52;
    for (let i = 0; i < kits.length; i++) {
      const kdef = KIT_DEFS[kits[i]];
      if (!kdef) continue;
      const kx = R - (kits.length - i) * (kitBtnW + 8);
      const ky = this.viewH - 70;
      g.rect(kx, ky, kitBtnW, kitBtnH).fill({ color: 0x110800, alpha: 0.88 });
      g.rect(kx, ky, kitBtnW, kitBtnH).stroke({ color: 0x993300, width: 1.5, alpha: 0.8 });
      g.circle(kx + kitBtnW / 2, ky + kitBtnH / 2, 10).stroke({ color: 0xff4400, width: 1.5, alpha: 0.6 });
    }

    // ── SCAN LINES ──
    for (let sl = 0; sl < this.viewH; sl += 4) {
      g.rect(0, sl, this.viewW, 1).fill({ color: 0x000000, alpha: 0.04 });
    }

    // ── CORNER BRACKETS ──
    const bs = 28;
    const bc = 0xff2200;
    const ba = 0.25;
    g.moveTo(0, bs).lineTo(0, 0).lineTo(bs, 0).stroke({ color: bc, width: 1.5, alpha: ba });
    g.moveTo(this.viewW - bs, 0).lineTo(this.viewW, 0).lineTo(this.viewW, bs).stroke({ color: bc, width: 1.5, alpha: ba });
    g.moveTo(0, this.viewH - bs).lineTo(0, this.viewH).lineTo(bs, this.viewH).stroke({ color: bc, width: 1.5, alpha: ba });
    g.moveTo(this.viewW - bs, this.viewH).lineTo(this.viewW, this.viewH).lineTo(this.viewW, this.viewH - bs).stroke({ color: bc, width: 1.5, alpha: ba });

    // ── JOYSTICK ──
    if (player.joyActive) {
      g.circle(player.joyBase.x, player.joyBase.y, 70).stroke({ color: 0xff2200, alpha: 0.18, width: 1.5 });
      g.circle(player.joyBase.x, player.joyBase.y, 45).stroke({ color: 0xff2200, alpha: 0.12, width: 1 });
      g.moveTo(player.joyBase.x - 70, player.joyBase.y).lineTo(player.joyBase.x + 70, player.joyBase.y).stroke({ color: 0xff2200, width: 0.5, alpha: 0.08 });
      g.moveTo(player.joyBase.x, player.joyBase.y - 70).lineTo(player.joyBase.x, player.joyBase.y + 70).stroke({ color: 0xff2200, width: 0.5, alpha: 0.08 });
      g.circle(player.joyKnob.x, player.joyKnob.y, 18).fill({ color: 0xff2200, alpha: 0.22 });
      g.circle(player.joyKnob.x, player.joyKnob.y, 18).stroke({ color: 0xff4400, alpha: 0.55, width: 2.5 });
    }

    // ── CENTER MESSAGE ──
    if (this.messageDuration > 0) {
      this.messageDuration -= dt;
      this.messageText.x = this.viewW / 2;
      this.messageText.y = this.viewH / 2 - 60;
      this.messageText.alpha = Math.min(this.messageDuration, 1);
    } else {
      this.messageText.alpha = 0;
    }

    // ── HAL COMMENTARY STRIP — bottom center, above XP bar ──
    if (this.halStripDuration > 0) {
      this.halStripDuration -= dt;
      const alpha = Math.min(this.halStripDuration, 1);
      // Background pill
      const tw = Math.min(this.halStripText.width + 24, this.viewW - 40);
      const th = 22;
      const tx = this.viewW / 2 - tw / 2;
      const ty = this.viewH - 46;
      g.rect(tx, ty, tw, th).fill({ color: 0x050508, alpha: alpha * 0.88 });
      g.rect(tx, ty, tw, th).stroke({ color: 0x661100, width: 1, alpha: alpha * 0.6 });
      this.halStripText.x = this.viewW / 2;
      this.halStripText.y = this.viewH - 28;
      this.halStripText.alpha = alpha;
    } else {
      this.halStripText.alpha = 0;
    }
  }
}
