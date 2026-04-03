
# === WEAPON_LEVEL_PERKS ===
const WEAPON_LEVEL_PERKS: Dictionary = {
	"sidearm": {
		2: {icon="⚡", name="Hair Trigger", desc="Fire rate +25%", effect="fire_rate", value=-0.09},
		3: {icon="🎯", name="Hollow Point", desc="+2 damage per shot", effect="damage", value=2},
		4: {icon="💥", name="Overpressure", desc="Bullets pierce 1 enemy", effect="piercing", value=true},
		5: {icon="🌀", name="Rapid Fire", desc="Fire rate +40%, mag +6", effect="fire_rate_mag", value=0.0},
	},
	"scatter": {
		2: {icon="↔", name="Wide Bore", desc="Cone spread +30%, 1 extra pellet", effect="pellets", value=1},
		3: {icon="💥", name="Buckshot", desc="+1 damage per pellet", effect="damage", value=1},
		4: {icon="🔥", name="Incendiary", desc="Pellets slow enemies 20% for 1s", effect="slow", value=true},
		5: {icon="🌪", name="Salvo", desc="Fire rate +30%, 2 extra pellets", effect="pellets_rate", value=0.0},
	},
	"lance": {
		2: {icon="⚡", name="Charged Shot", desc="Projectile speed +30%", effect="bullet_speed", value=84.0},
		3: {icon="💎", name="Void Core", desc="+3 damage", effect="damage", value=3},
		4: {icon="🌀", name="Overload", desc="On kill: fires a 2nd lance automatically", effect="on_kill_lance", value=true},
		5: {icon="💥", name="Singularity", desc="Explosion on impact, 60px AOE", effect="explode", value=true},
	},
	"baton": {
		2: {icon="↔", name="Extended Arc", desc="AOE radius +30px", effect="radius", value=30.0},
		3: {icon="💥", name="Shockwave", desc="+2 damage, knocks enemies back", effect="damage_knockback", value=2},
		4: {icon="❤", name="Life Leech", desc="Each enemy hit restores 0.5 HP", effect="leech", value=true},
		5: {icon="⚡", name="Chain Lightning", desc="Damage arcs to 2 additional enemies", effect="chain", value=true},
	},
	"dart": {
		2: {icon="🎯", name="Lock-On", desc="Tracking speed +50%", effect="tracking", value=1.5},
		3: {icon="💥", name="Detonator", desc="Explodes on hit, 40px AOE", effect="explode", value=true},
		4: {icon="🐍", name="Swarm", desc="Fires 2 darts simultaneously", effect="dual", value=true},
		5: {icon="💀", name="Voidseeker", desc="On kill: splits into 2 new darts", effect="split_on_kill", value=true},
	},
	"flamethrower": {
		2: {icon="F", name="Fuel Tank", desc="Range +30px", effect="range_bonus", value=30.0},
		3: {icon="N", name="Napalm", desc="Burning: +1 dmg/s for 3s on hit", effect="burning", value=true},
		4: {icon="P", name="Pressurized", desc="Fire rate +30%", effect="fire_rate", value=-0.036},
		5: {icon="T", name="Fork", desc="Clean: Cryo Flamer (freeze, no dmg, 2s stun) | Void: Corruption Spray (+5 corr/s, 3x dmg)", effect="flamer_fork", value=true},
	},
	"grenade_launcher": {
		2: {icon="H", name="Heavy Ordinance", desc="+3 AOE damage", effect="damage", value=3},
		3: {icon="C", name="Cluster Bomb", desc="Explosion spawns 3 mini grenades", effect="cluster", value=true},
		4: {icon="S", name="Stagger", desc="Explosion knocks enemies back 80px", effect="grenade_knockback", value=true},
		5: {icon="A", name="Fork", desc="Clean: Airburst (explodes at max range, hits all) | Void: Void Grenade (corruption zone 5s)", effect="grenade_fork", value=true},
	},
	"entropy_cannon": {
		2: {icon="D", name="Overcharge", desc="+1 base damage", effect="damage", value=1},
		3: {icon="R", name="Rapid Decay", desc="Rate of fire +20%", effect="fire_rate", value=-0.4},
		4: {icon="P", name="Penetrating", desc="Penetrating rounds (pierce 1)", effect="piercing", value=true},
		5: {icon="F", name="Fork", desc="Clean: Stabilized (damage ignores corruption, stays at 3x) | Void: Resonance (corruption gain +50%, triple scaling)", effect="entropy_fork", value=true},
	},
	"pulse_cannon": {
		2: {icon="B", name="Extra Bounce", desc="+1 bounce (5 total)", effect="bounce_extra", value=1},
		3: {icon="D", name="Impact", desc="+1 damage", effect="damage", value=1},
		4: {icon="R", name="Wide Bounce", desc="Bounce radius +60px", effect="bounce_radius", value=60.0},
		5: {icon="F", name="Fork", desc="Clean: Overclock (fire rate +50%, 3 bounces) | Void: Void Chain (each bounce adds +2 corruption to enemy)", effect="pulse_fork", value=true},
	},
	"sniper_carbine": {
		2: {icon="D", name="High Caliber", desc="+3 damage", effect="damage", value=3},
		3: {icon="R", name="Long Barrel", desc="Range +100px, speed +100", effect="sniper_range", value=true},
		4: {icon="P", name="AP Rounds", desc="Penetrates 2 enemies", effect="piercing", value=true},
		5: {icon="F", name="Fork", desc="Clean: Killshot (one-shots under 20% HP) | Void: Void Slug (leaves corruption trail)", effect="sniper_fork", value=true},
	},
	"chain_rifle": {
		2: {icon="D", name="Hardened Rounds", desc="+1 damage", effect="damage", value=1},
		3: {icon="S", name="Suppression", desc="Slow +20%, stacks higher", effect="chain_slow_boost", value=true},
		4: {icon="C", name="Auto-Crit", desc="Every 10th bullet auto-crits (3x)", effect="chain_autocrit", value=true},
		5: {icon="F", name="Fork", desc="Clean: Precision Mode (rate halved, 4x dmg, no slow) | Void: Suppressor (slowed +30% from all, +50% corruption)", effect="chain_fork", value=true},
	},
}

# === WEAPON_MUTATIONS ===
const WEAPON_MUTATIONS: Dictionary = {
	"sidearm": {
		"clean": {icon="G", name="Marksman Rifle", desc="Fire rate halved, damage x3, +50% range. First shot after reload: instant."},
		"void":  {icon="V", name="Entropy Gun",    desc="Each bullet splits into 3 fragments on hit. Fragments bounce off walls once."},
	},
	"scatter": {
		"clean": {icon="G", name="Flechette",      desc="Tighter cone, pellets pierce 2 enemies."},
		"void":  {icon="V", name="Chaos Spray",    desc="270 degree cone, pellets home slightly. Chip dmg to self if enemies in 40px."},
	},
	"lance": {
		"clean": {icon="G", name="Null Spear",     desc="Fire rate x2, leaves a 3s slow field where it lands."},
		"void":  {icon="V", name="Singularity",    desc="On hit: 2s gravity vortex. Your bullets deal +50% to pulled enemies."},
	},
	"baton": {
		"clean": {icon="G", name="Arc Blade",      desc="Melee leaves 3s slow fields on the ground."},
		"void":  {icon="V", name="Consuming Vortex", desc="AOE expands 1.5s. Drains HP from enemies, heals you."},
	},
	"dart": {
		"clean": {icon="G", name="Smart Missile",  desc="Single large slow missile. Massive damage, perfect tracking."},
		"void":  {icon="V", name="Parasite Swarm", desc="Darts latch on, drain HP 4s. Spreads to 1 nearby enemy on death."},
	},
	"flamethrower": {
		"clean": {icon="C", name="Cryo Flamer",      desc="Freezes enemies. No damage, 2s stun per hit."},
		"void":  {icon="V", name="Corruption Spray",  desc="+5 corruption/s to player while firing, triple damage."},
	},
	"grenade_launcher": {
		"clean": {icon="A", name="Airburst",        desc="Explodes at max range regardless. Hits everything in 80px."},
		"void":  {icon="V", name="Void Grenade",     desc="Explosion leaves a corruption zone for 5s."},
	},
	"entropy_cannon": {
		"clean": {icon="S", name="Stabilized",      desc="Damage ignores corruption state, stays at 3x multiplier."},
		"void":  {icon="R", name="Resonance",        desc="Corruption gain from kills +50%, triple scaling."},
	},
	"pulse_cannon": {
		"clean": {icon="O", name="Overclock",       desc="Fire rate +50%, limited to 3 bounces."},
		"void":  {icon="V", name="Void Chain",       desc="Each bounce adds +2 corruption to enemy, no self damage."},
	},
	"sniper_carbine": {
		"clean": {icon="K", name="Killshot",         desc="One-shots enemies under 20% HP."},
		"void":  {icon="V", name="Void Slug",        desc="Leaves corruption trail along bullet path."},
	},
	"chain_rifle": {
		"clean": {icon="P", name="Precision Mode",   desc="Fire rate halved, each bullet does 4x damage, no slow."},
		"void":  {icon="S", name="Suppressor",        desc="Slowed enemies take +30% from all sources, +50% corruption on hit."},
	},
}

# === WEAPON_MASTERY ===
const WEAPON_MASTERY: Dictionary = {
	"sidearm": {
		"clean": [
			{id="killcam", icon="K", name="Killcam", desc="After a kill: next shot fires instantly (no cooldown)."},
			{id="headhunter", icon="H", name="Headhunter", desc="+50% damage vs elites."},
			{id="suppressor", icon="S", name="Suppressor", desc="Shots do not aggro nearby undetected enemies."},
			{id="armor_pierce", icon="A", name="Armor Pierce", desc="Ignore corrupted-path armor on hit."},
			{id="marksman_reload", icon="R", name="Quick Draw", desc="Reload time -50% for Marksman Rifle."},
		],
		"void": [
			{id="fragment_magnet", icon="M", name="Fragment Magnet", desc="Fragments home slightly toward nearest enemy."},
			{id="cascade", icon="C", name="Cascade", desc="Fragments can fragment once more on hit."},
			{id="entropy_field", icon="E", name="Entropy Field", desc="Each fragment leaves a 0.5s damage patch."},
			{id="overheat", icon="V", name="Overheat", desc="Every 10th shot fires 2x fragments automatically."},
		],
	},
	"scatter": {
		"clean": [
			{id="tight_spread", icon="T", name="Tight Spread", desc="Cone narrows further, +1 pellet."},
			{id="stagger", icon="S", name="Stagger", desc="Each pellet has 15% chance to stun 0.5s."},
			{id="glass_cannon", icon="G", name="Glass Cannon", desc="+3 pellet damage, -2 max HP."},
			{id="penetrator", icon="P", name="Penetrator", desc="Pellets pierce 1 additional enemy."},
		],
		"void": [
			{id="feedback", icon="F", name="Feedback", desc="Self-chip damage heals at 2x rate."},
			{id="swarm_chaos", icon="W", name="Swarm Chaos", desc="Pellets bounce off walls once."},
			{id="contagion", icon="C", name="Contagion", desc="Enemies hit by chaos spread 5 corruption to nearby."},
			{id="frenzy", icon="V", name="Frenzy", desc="Each enemy in 40px increases fire rate 10%."},
		],
	},
	"lance": {
		"clean": [
			{id="slow_field_persist", icon="P", name="Persistent Field", desc="Slow fields last 5s (was 3s)."},
			{id="chain_null", icon="C", name="Chain Null", desc="Null Spear pierces 2 enemies."},
			{id="aimed_shot", icon="A", name="Aimed Shot", desc="Lance damage +50% if player is standing still."},
			{id="field_expand", icon="E", name="Field Expand", desc="Slow field radius +40px."},
		],
		"void": [
			{id="nested_vortex", icon="N", name="Nested Vortex", desc="Gravity vortex pulls enemies 50% faster."},
			{id="vortex_damage", icon="D", name="Vortex Damage", desc="+50% damage to pulled enemies (stacks)."},
			{id="chain_vortex", icon="C", name="Chain Vortex", desc="Killing a pulled enemy spawns mini vortex."},
			{id="void_attractor", icon="V", name="Void Attractor", desc="Vortex lasts 1s longer."},
		],
	},
	"baton": {
		"clean": [
			{id="field_chain", icon="C", name="Field Chain", desc="Arc fields chain to nearest enemy (jump dmg)."},
			{id="field_persist", icon="P", name="Field Persist", desc="Arc fields last 5s (was 3s)."},
			{id="wide_arc", icon="W", name="Wide Arc", desc="AOE radius +40px."},
			{id="static_charge", icon="S", name="Static Charge", desc="3rd baton hit in 3s: free AOE pulse."},
		],
		"void": [
			{id="vortex_speed", icon="V", name="Vortex Speed", desc="Vortex expansion 50% faster."},
			{id="deep_drain", icon="D", name="Deep Drain", desc="Drain heals +1 HP per 2 enemies."},
			{id="overload_void", icon="O", name="Overload", desc="Full vortex expansion fires a shockwave."},
			{id="hunger_field", icon="H", name="Hunger Field", desc="Vortex zone pulls enemies inward."},
		],
	},
	"dart": {
		"clean": [
			{id="missile_burst", icon="B", name="Missile Burst", desc="On elite kill: fire 2 smart missiles instantly."},
			{id="tracking_plus", icon="T", name="Tracking Plus", desc="Missile tracking speed +50%."},
			{id="payload", icon="P", name="Payload", desc="Missile explodes on impact 50px AOE."},
			{id="multi_lock", icon="M", name="Multi-Lock", desc="Every 3rd missile fires 2 simultaneously."},
		],
		"void": [
			{id="rapid_spread", icon="R", name="Rapid Spread", desc="Parasite spreads to 2 enemies on death."},
			{id="toxic_cloud", icon="C", name="Toxic Cloud", desc="Parasite death leaves a 3s poison cloud."},
			{id="deep_parasite", icon="D", name="Deep Parasite", desc="Parasite duration 6s (was 4s)."},
			{id="void_latch", icon="V", name="Void Latch", desc="Parasitized enemies deal 20% less damage."},
		],
	},
	"flamethrower": {
		"clean": [
			{id="cryo_range", icon="R", name="Cryo Range", desc="Freeze cone range +40px."},
			{id="deep_freeze", icon="D", name="Deep Freeze", desc="Stun duration 3s (was 2s)."},
			{id="shatter", icon="S", name="Shatter", desc="Frozen enemies take +50% damage from other sources."},
			{id="cryo_aura", icon="A", name="Cryo Aura", desc="Enemies near frozen targets are slowed 30%."},
		],
		"void": [
			{id="corr_efficiency", icon="E", name="Corruption Efficiency", desc="Corruption cost reduced to +3/s."},
			{id="void_flames", icon="V", name="Void Flames", desc="Flame projectiles pierce 1 enemy."},
			{id="corruption_burst", icon="B", name="Corruption Burst", desc="At 80 corruption: next flame burst deals 5x."},
			{id="siphon", icon="S", name="Siphon", desc="Kill with flames restores 1 HP."},
		],
	},
	"grenade_launcher": {
		"clean": [
			{id="wide_burst", icon="W", name="Wide Burst", desc="Airburst radius +30px."},
			{id="carpet_bomb", icon="C", name="Carpet Bomb", desc="Fire 2 grenades side-by-side."},
			{id="concussion", icon="X", name="Concussion", desc="Airburst stuns 1s."},
			{id="barrage", icon="B", name="Barrage", desc="Fire rate +25%."},
		],
		"void": [
			{id="corr_zone_expand", icon="E", name="Zone Expand", desc="Corruption zone radius +40px."},
			{id="zone_damage", icon="D", name="Zone Damage", desc="Corruption zone deals 2 dmg/s."},
			{id="void_pull", icon="P", name="Void Pull", desc="Corruption zone pulls enemies inward."},
			{id="cascade_void", icon="V", name="Cascade", desc="Enemies killed in zone spawn mini zone."},
		],
	},
	"entropy_cannon": {
		"clean": [
			{id="stable_focus", icon="F", name="Stable Focus", desc="Fire rate +15%."},
			{id="stable_pierce", icon="P", name="Stable Pierce", desc="Pierce 2 enemies."},
			{id="stable_range", icon="R", name="Stable Range", desc="Range +60px."},
			{id="stable_crit", icon="C", name="Stable Crit", desc="Every 5th shot crits (2x)."},
		],
		"void": [
			{id="res_scaling", icon="S", name="Deep Resonance", desc="Corruption scaling x4 instead of x3."},
			{id="res_aura", icon="A", name="Corruption Aura", desc="Kills spread +5 corruption to nearby enemies."},
			{id="res_leech", icon="L", name="Void Leech", desc="Kills at 60+ corruption heal 1 HP."},
			{id="res_burst", icon="B", name="Entropy Burst", desc="At 80+ corruption, shots explode 40px AOE."},
		],
	},
	"pulse_cannon": {
		"clean": [
			{id="oc_speed", icon="S", name="Quick Pulse", desc="Bullet speed +25%."},
			{id="oc_damage", icon="D", name="Heavy Pulse", desc="+2 damage per bounce."},
			{id="oc_range", icon="R", name="Extended Reach", desc="Range +80px."},
			{id="oc_chain", icon="C", name="Chain Reaction", desc="Final bounce explodes 40px AOE."},
		],
		"void": [
			{id="vc_corrupt", icon="C", name="Deep Chain", desc="Bounce corruption +3 (5 total)."},
			{id="vc_slow", icon="S", name="Chain Slow", desc="Each bounce slows enemy 20% for 1s."},
			{id="vc_extra", icon="E", name="Extra Bounce", desc="+2 bounces."},
			{id="vc_drain", icon="D", name="Void Drain", desc="Each bounce heals 0.5 HP."},
		],
	},
	"sniper_carbine": {
		"clean": [
			{id="ks_execute", icon="E", name="Execute", desc="Killshot threshold raised to 30% HP."},
			{id="ks_reload", icon="R", name="Quick Scope", desc="Reload time -40%."},
			{id="ks_crit", icon="C", name="Vital Shot", desc="Headshot zone +15px radius."},
			{id="ks_chain", icon="X", name="Chain Kill", desc="Killshot resets fire cooldown."},
		],
		"void": [
			{id="vs_trail", icon="T", name="Lingering Trail", desc="Corruption trail lasts 4s."},
			{id="vs_damage", icon="D", name="Void Penetration", desc="+4 damage to corrupted enemies."},
			{id="vs_slow", icon="S", name="Entropic Slug", desc="Trail slows enemies 30%."},
			{id="vs_burst", icon="B", name="Void Impact", desc="Headshots on elites create 60px corruption burst."},
		],
	},
	"chain_rifle": {
		"clean": [
			{id="pm_damage", icon="D", name="Heavy Rounds", desc="+2 damage in precision mode."},
			{id="pm_pierce", icon="P", name="AP Rounds", desc="Precision shots pierce 1 enemy."},
			{id="pm_range", icon="R", name="Extended Barrel", desc="Range +60px."},
			{id="pm_crit", icon="C", name="Focused Fire", desc="Every 5th shot crits (2x)."},
		],
		"void": [
			{id="sp_slow", icon="S", name="Deep Suppression", desc="Slow cap raised to 70%."},
			{id="sp_damage", icon="D", name="Void Rounds", desc="+1 damage to slowed enemies."},
			{id="sp_corrupt", icon="C", name="Corruption Feed", desc="Slowed enemies gain +3 corruption/s."},
			{id="sp_burst", icon="B", name="Suppression Wave", desc="Every 20th bullet: AOE slow 100px."},
		],
	},
}

# === KIT_PERKS ===
const KIT_PERKS: Dictionary = {
	"stim_pack": [
		{id="withdrawal", icon="W", name="Withdrawal", rarity="common", desc="After stim wears off: next hit absorbed (0 dmg)."},
		{id="adrenaline_spike", icon="A", name="Adrenaline Spike", rarity="rare", desc="Stim causes nearby enemies to scatter 80px."},
	],
	"flash_trap": [
		{id="trap_magnetism", icon="M", name="Trap Magnetism", rarity="rare", desc="Stunned enemy pulls 2 nearby enemies toward it."},
		{id="fragile_state", icon="F", name="Fragile State", rarity="common", desc="Enemies emerging from stun take 2x dmg for 1s."},
	],
	"smoke_kit": [
		{id="afterburn", icon="A", name="Afterburn", rarity="common", desc="Enemies exiting smoke are slowed 40% for 2s."},
		{id="lure", icon="L", name="Lure", rarity="rare", desc="Multiple enemies inside smoke ignore player and attack each other."},
	],
	"familiar_kit": [
		{id="spotter", icon="S", name="Spotter", rarity="common", desc="Familiar marks highest-HP enemy — your bullets +30% to marked target."},
		{id="leash_break", icon="X", name="Leash Break", rarity="rare", desc="If familiar is hit, it explodes once (5 dmg, 80px AOE)."},
	],
	"blink_kit": [
		{id="arrival_strike", icon="A", name="Arrival Strike", rarity="common", desc="Blink arrival pushes nearby enemies away 100px."},
		{id="swap", icon="S", name="Swap", rarity="rare", desc="Blink teleports to nearest enemy instead of direction."},
	],
	"chain_kit": [
		{id="conductor", icon="C", name="Conductor", rarity="rare", desc="While enemy is tethered, your bullets ricochet off them once."},
		{id="drag", icon="D", name="Drag", rarity="common", desc="Tethered enemy is slowly pulled toward you 20px/s."},
	],
	"charge_kit": [
		{id="aftershock", icon="A", name="Aftershock", rarity="common", desc="Charge impact leaves a 3s slow field at landing point."},
		{id="redirect", icon="R", name="Redirect", rarity="rare", desc="Hitting a wall during charge bounces you perpendicular."},
	],
	"mirage_kit": [
		{id="magnet_decoy", icon="M", name="Magnet Decoy", rarity="common", desc="Decoy pulls enemies within 120px toward it."},
		{id="copycat", icon="X", name="Copycat", rarity="rare", desc="Decoy fires your last weapon shot every 3s."},
	],
	"turret_kit": [
		{id="target_priority", icon="T", name="Target Priority", rarity="common", desc="Turret only fires at enemies you have hit in the last 2s."},
		{id="overheat", icon="O", name="Overheat", rarity="rare", desc="Turret explodes on death (70px AOE, 4 dmg) instead of disappearing."},
	],
	"drone_kit": [
		{id="intercept_link", icon="I", name="Intercept Link", rarity="rare", desc="Drone-intercepted bullets explode (20px AOE) damaging the shooter."},
		{id="shepherd", icon="H", name="Shepherd", rarity="common", desc="Drone slowly herds pickups toward player."},
	],
	"pack_kit": [
		{id="sacrifice", icon="S", name="Sacrifice", rarity="rare", desc="When an ally dies, you gain 2s invincibility."},
		{id="frenzy_aura", icon="F", name="Frenzy Aura", rarity="common", desc="Each nearby ally increases your fire rate 8% (max 3)."},
	],
	"void_surge": [
		{id="void_trail", icon="V", name="Void Trail", rarity="common", desc="Surge leaves a corruption zone along your path (3s, +3 corr/s to enemies)."},
		{id="phase_burst", icon="P", name="Phase Burst", rarity="rare", desc="At surge end: shockwave pushes all enemies 80px."},
	],
	"anchor_kit": [
		{id="crush_zone", icon="C", name="Crush Zone", rarity="common", desc="Enemies inside anchor pull zone take 2x dmg from all sources."},
		{id="chain_reaction", icon="X", name="Chain Reaction", rarity="rare", desc="Enemies killed inside anchor explosion each spawn a mini void pool."},
	],
	"rupture_kit": [
		{id="scatter_field", icon="S", name="Scatter", rarity="common", desc="Rupture launches shrapnel in 8 directions (3 dmg each)."},
		{id="drain_aura", icon="D", name="Drain Aura", rarity="rare", desc="While inside rupture field, player regenerates 1 HP per 2s."},
	],
}

# === RESONANCE_POOL ===
const RESONANCE_POOL: Array = [
	{id="linked_fuse", kits=["flash_trap","blink_kit"], icon="L", name="Linked Fuse", desc="Blink teleports you to nearest triggered trap."},
	{id="sympathetic_fire", kits=["drone_kit","blink_kit"], icon="S", name="Sympathetic Fire", desc="Drone fires when you fire, not on timer."},
	{id="overcharge_drone", kits=["drone_kit","anchor_kit"], icon="O", name="Overcharge", desc="Drone fires 2x faster after anchor well expires."},
	{id="trap_aggro", kits=["flash_trap","mirage_kit"], icon="T", name="Trap Aggro", desc="Decoy automatically moves toward nearest trap."},
	{id="void_feedback", kits=["void_surge","rupture_kit"], icon="V", name="Void Feedback", desc="Rupture recharges void surge instantly."},
	{id="familiar_bond", kits=["familiar_kit","pack_kit"], icon="F", name="Familiar Bond", desc="Familiar buffs your summoned allies (+30% speed)."},
	{id="smoke_blink", kits=["smoke_kit","blink_kit"], icon="B", name="Smoke Step", desc="Blink always lands in a smoke cloud."},
	{id="turret_familiar", kits=["turret_kit","familiar_kit"], icon="U", name="Familiar Link", desc="Turret gains familiar healing aura (1 HP regen/5s to player while turret active)."},
	{id="chain_anchor", kits=["chain_kit","anchor_kit"], icon="C", name="Gravity Chain", desc="Tethered enemies are also pulled by anchor wells."},
	{id="surge_charge", kits=["void_surge","charge_kit"], icon="X", name="Surge Charge", desc="Void surge resets charge kit cooldown instantly."},
]

# === RUN_MODIFIERS ===
const RUN_MODIFIERS: Array = [
	{id="adrenaline",   rarity="rare",   icon="E", name="Adrenaline",    desc="3 kills in 3s: +5% speed stacking (resets on hit)"},
	{id="void_hunger",  rarity="common", icon="V", name="Void Hunger",   desc="Killing void-type enemies restores 1 HP"},
	{id="stalker",      rarity="rare",   icon="S", name="Stalker",       desc="+40% damage to enemies not targeting you"},
	{id="momentum",     rarity="rare",   icon="M", name="Momentum",      desc="+15% bullet speed per consecutive hit, resets on miss"},
	{id="scavenger",    rarity="common", icon="$", name="Scavenger",     desc="Ingredients also drop 1 essence"},
	{id="last_stand",   rarity="rare",   icon="L", name="Last Stand",    desc="Below 3 HP: +50% damage and +30% speed"},
	{id="pack_hunter",  rarity="common", icon="P", name="Pack Hunter",   desc="+8% damage per enemy within 200px"},
	{id="biome_bond",   rarity="rare",   icon="B", name="Biome Bond",    desc="+20% damage while in your starting biome"},
	{id="precision",    rarity="rare",   icon="X", name="Precision",     desc="First shot after reload always crits (2x damage)"},
	{id="void_drain",   rarity="common", icon="D", name="Void Drain",    desc="Killing void enemies reduces corruption by 3"},
	{id="dodge",        rarity="rare",   icon="G", name="Phase Shift",   desc="10% chance to dodge a hit"},
	{id="vamp",         rarity="rare",   icon="H", name="Blood Harvest", desc="1 in 5 kills restores 1 HP"},
	{id="elite_dmg",    rarity="rare",   icon="K", name="Hunters Mark",  desc="+30% damage vs elites"},
	{id="corruption_resist", rarity="rare", icon="C", name="Void Skin", desc="Corruption gain -25%"},
]

# === _generate_upgrades() ===
func _generate_upgrades() -> Array:
	var options: Array = []
	var rng := RandomNumberGenerator.new()
	rng.randomize()

	# --- Slot 1: WEAPON ---
	var w: Dictionary = main_weapon
	if w.level >= 5 and not w.mutated and WEAPON_MUTATIONS.has(w.id):
		# Offer mutation cards based on corruption
		if corruption < 35.0:
			var mut: Dictionary = WEAPON_MUTATIONS[w.id]["clean"]
			options.append({type="mutation", mutation_type="clean", rarity="legendary", icon=mut.icon, label=mut.name, desc=mut.desc, perk={}})
		if corruption > 20.0:
			var mut_v: Dictionary = WEAPON_MUTATIONS[w.id]["void"]
			options.append({type="mutation", mutation_type="void", rarity="legendary", icon=mut_v.icon, label=mut_v.name, desc=mut_v.desc, perk={}})
		# If only 1 mutation card, pad slot 1 with it
		if options.size() == 0:
			# No mutations available, offer mastery
			var wdef_m: Dictionary = WEAPON_DEFS[w.id]
			options.append({type="modifier", id="mastery_dmg", rarity="common", icon="W", label="Mastery: " + wdef_m.name, desc="+2 damage", perk={}})
	elif w.level < 5:
		var next_level: int = w.level + 1
		if WEAPON_LEVEL_PERKS.has(w.id) and WEAPON_LEVEL_PERKS[w.id].has(next_level):
			var perk: Dictionary = WEAPON_LEVEL_PERKS[w.id][next_level]
			var wdef: Dictionary = WEAPON_DEFS[w.id]
			options.append({
				type = "weapon_upgrade",
				weapon_id = w.id,
				rarity = "rare" if next_level >= 4 else "common",
				icon = perk.icon,
				label = wdef.name + " -- " + perk.name,
				desc = perk.desc,
				perk = perk,
			})
		else:
			var wdef2: Dictionary = WEAPON_DEFS[w.id]
			options.append({
				type = "weapon_upgrade", weapon_id = w.id,
				rarity = "common", icon = "W",
				label = wdef2.name + " Lv" + str(w.level + 1),
				desc = "+1 damage",
				perk = {effect = "damage", value = 1},
			})
	else:
		# Mutated, offer mastery perk
		if WEAPON_MASTERY.has(w.id) and WEAPON_MASTERY[w.id].has(w.mutation_type):
			var mastery_pool: Array = WEAPON_MASTERY[w.id][w.mutation_type]
			var available_m: Array = []
			for mp in mastery_pool:
				if not mastery_taken.has(mp.id):
					available_m.append(mp)
			if available_m.size() > 0:
				available_m.shuffle()
				var perk_m: Dictionary = available_m[0]
				options.append({type="mastery", id=perk_m.id, rarity="rare", icon=perk_m.icon, label=perk_m.name, desc=perk_m.desc, perk={}})
			else:
				var wdef_m2: Dictionary = WEAPON_DEFS[w.id]
				options.append({type="modifier", id="mastery_dmg", rarity="common", icon="W", label="Mastery: " + wdef_m2.name, desc="+2 damage", perk={}})
		else:
			var wdef_m2: Dictionary = WEAPON_DEFS[w.id]
			options.append({type="modifier", id="mastery_dmg", rarity="common", icon="W", label="Mastery: " + wdef_m2.name, desc="+2 damage", perk={}})

	# --- Slot 2: KIT TIER, RESONANCE, OR MODIFIER ---
	var slot2_done := false
	# Check if both kits have T3 — offer resonance
	var both_t3: bool = equipped_kits.size() >= 2 and kit_tiers.get(equipped_kits[0], 1) >= 3 and kit_tiers.get(equipped_kits[1], 1) >= 3
	if both_t3:
		var avail_res: Array = []
		for rp in RESONANCE_POOL:
			if resonance_taken.has(rp.id):
				continue
			var has_both: bool = true
			for rk in rp.kits:
				if not equipped_kits.has(rk):
					has_both = false
					break
			if has_both:
				avail_res.append(rp)
		if avail_res.size() > 0:
			avail_res.shuffle()
			var rp2: Dictionary = avail_res[0]
			options.append({type="resonance", id=rp2.id, rarity="legendary", icon=rp2.icon, label=rp2.name, desc=rp2.desc, perk={}})
			slot2_done = true
	if not slot2_done:
		# Collect all kits eligible for tier upgrade
		var t3_eligible: Array = []
		var t2_eligible: Array = []
		for kid in equipped_kits:
			var kt: int = kit_tiers.get(kid, 1)
			if kt == 2:
				t3_eligible.append(kid)
			elif kt < 2:
				t2_eligible.append(kid)
		# T3 — queue all eligible, pick one randomly to show path choice panel
		if t3_eligible.size() > 0:
			t3_eligible.shuffle()
			# Queue any beyond the first for later level-ups
			for i in range(t3_eligible.size()):
				if not kit_t3_pending.has(t3_eligible[i]):
					kit_t3_pending.append(t3_eligible[i])
			slot2_done = true  # suppress normal card; path choice fires after panel closes
		elif t2_eligible.size() > 0:
			var kid: String = t2_eligible[0]
			var kdef: Dictionary = KIT_DEFS.get(kid, {})
			options.append({
				type = "kit_tier",
				kit_id = kid,
				new_tier = 2,
				rarity = "rare",
				icon = kdef.get("icon", "K"),
				label = kdef.get("name", kid) + " Tier 2",
				desc = "+1 max HP (tier upgrade)",
				perk = {},
			})
			slot2_done = true
	if not slot2_done:
		var avail2: Array = []
		for m in RUN_MODIFIERS:
			if not modifiers_taken.has(m.id):
				avail2.append(m)
		avail2.shuffle()
		if avail2.size() > 0:
			var m2: Dictionary = avail2[0]
			options.append({type="modifier", id=m2.id, rarity=m2.rarity, icon=m2.icon, label=m2.name, desc=m2.desc, perk={}})

	# --- Slot 3: MODIFIER ---
	var used_mod_ids: Array = modifiers_taken.duplicate()
	for o in options:
		if o.type == "modifier":
			used_mod_ids.append(o.get("id", ""))
	var avail3: Array = []
	for m in RUN_MODIFIERS:
		if not used_mod_ids.has(m.id):
			avail3.append(m)
	avail3.shuffle()
	if avail3.size() > 0:
		var m3: Dictionary = avail3[0]
		options.append({type="modifier", id=m3.id, rarity=m3.rarity, icon=m3.icon, label=m3.name, desc=m3.desc, perk={}})

	# --- Kit Perk injection (max 1 per screen) ---
	var best_kit_perk: Dictionary = {}
	var best_kit_perk_is_rare: bool = false
	for kid in equipped_kits:
		var perks_for_kit: Array = KIT_PERKS.get(kid, [])
		for kp in perks_for_kit:
			if kit_perks_taken.has(kp.id):
				continue
			var is_rare: bool = kp.rarity == "rare"
			if best_kit_perk.is_empty() or (is_rare and not best_kit_perk_is_rare):
				best_kit_perk = {type="kit_perk", kit_id=kid, id=kp.id, rarity=kp.rarity, icon=kp.icon, label=kp.name, desc=kp.desc, perk={}}
				best_kit_perk_is_rare = is_rare
			elif is_rare == best_kit_perk_is_rare and rng.randi() % 2 == 0:
				best_kit_perk = {type="kit_perk", kit_id=kid, id=kp.id, rarity=kp.rarity, icon=kp.icon, label=kp.name, desc=kp.desc, perk={}}
	if not best_kit_perk.is_empty():
		options.append(best_kit_perk)

	# --- Guaranteed fallbacks so panel is never empty ---
	if options.size() < 3:
		var fallbacks: Array = [
			{type="fallback", id="hp_restore",   rarity="common", icon="H", label="Field Medkit",      desc="Restore 3 HP immediately",            perk={}},
			{type="fallback", id="void_drain_f",  rarity="common", icon="D", label="Void Drain",    desc="Killing void enemies reduces corruption by 3",           perk={}},
			{type="fallback", id="pack_hunter_f", rarity="common", icon="P", label="Pack Awareness", desc="+8% damage per enemy within 200px",                       perk={}},
			{type="fallback", id="corr_purge",   rarity="rare",   icon="P", label="Void Purge",         desc="Reduce corruption by 20",             perk={}},
		]
		var existing_ids: Array = []
		for o in options:
			existing_ids.append(o.get("id", o.get("weapon_id", "")))
		fallbacks.shuffle()
		for fb in fallbacks:
			if options.size() >= 3:
				break
			if not existing_ids.has(fb.id):
				options.append(fb)

	if options.size() > 3:
		options = options.slice(0, 3)
	return options


# === _level_up() ===
func _level_up() -> void:
	paused = true
	_show_message("Level Up!")

	upgrade_choices = _generate_upgrades()

	# Create upgrade panel using call_deferred
	call_deferred("_create_upgrade_panel")
