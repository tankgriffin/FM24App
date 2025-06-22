// --- FM24/Squirrel_plays Role Formulas and Attribute Mapping ---

// Attribute abbreviation mapping (FM abbreviations to full names)
export const ATTRIBUTE_ABBREVIATIONS = {
  Agi: 'Agility', Ref: 'Reflexes', Cmd: 'Command of Area', Han: 'Handling', Kic: 'Kicking', Cnt: 'Concentration', Pos: 'Positioning',
  '1v1': '1v1', Thr: 'Throwing', Ant: 'Anticipation', Dec: 'Decisions', Aer: 'Aerial Reach', Fir: 'First Touch', Pas: 'Passing',
  Vis: 'Vision', Acc: 'Acceleration', Sta: 'Stamina', Wor: 'Work Rate', Pac: 'Pace', Fin: 'Finishing', Tec: 'Technique',
  Hea: 'Heading', Mar: 'Marking', Tck: 'Tackling', Str: 'Strength', Jum: 'Jumping Reach', Cmp: 'Composure', Bra: 'Bravery',
  Det: 'Determination', Tea: 'Teamwork', Agg: 'Aggression', Fla: 'Flair', OtB: 'Off the Ball', Dri: 'Dribbling', Cro: 'Crossing',
  Lon: 'Long Shots', LTh: 'Long Throws', Bal: 'Balance', Nat: 'Natural Fitness', TRO: 'Throwing'
};

// Helper to get attribute value from player object, defaulting to 0 if missing
export function getAttr(player, abbr) {
  return Number(player[abbr]) || 0;
}

// FM-style display names for all 85 roles
export const ROLE_NAMES = {
  GKD: 'Goalkeeper (Defend)',
  SKD: 'Sweeper Keeper (Defend)',
  SKS: 'Sweeper Keeper (Support)',
  SKA: 'Sweeper Keeper (Attack)',
  BPDD: 'Ball Playing Defender (Defend)',
  BPDS: 'Ball Playing Defender (Stopper)',
  BPDC: 'Ball Playing Defender (Cover)',
  CDD: 'Central Defender (Defend)',
  CDS: 'Central Defender (Stopper)',
  CDC: 'Central Defender (Cover)',
  CWBS: 'Complete Wing Back (Support)',
  CWBA: 'Complete Wing Back (Attack)',
  FBD: 'Full Back (Defend)',
  FBS: 'Full Back (Support)',
  FBA: 'Full Back (Attack)',
  IFBD: 'Inverted Full Back (Defend)',
  IWBD: 'Inverted Wing Back (Defend)',
  IWBS: 'Inverted Wing Back (Support)',
  IWBA: 'Inverted Wing Back (Attack)',
  LIBD: 'Libero (Defend)',
  LIBS: 'Libero (Support)',
  NCB: 'No-nonsense Centre Back (Defend)',
  NCBS: 'No-nonsense Centre Back (Stopper)',
  NCBC: 'No-nonsense Centre Back (Cover)',
  NFB: 'No-nonsense Full Back (Defend)',
  WCB: 'Wide Centre Back (Defend)',
  WCBS: 'Wide Centre Back (Support)',
  WCBA: 'Wide Centre Back (Attack)',
  WBD: 'Wing Back (Defend)',
  WBS: 'Wing Back (Support)',
  WBA: 'Wing Back (Attack)',
  APM: 'Advanced Playmaker (Support)',
  APMA: 'Advanced Playmaker (Attack)',
  ANC: 'Anchor (Defend)',
  AM: 'Attacking Midfielder (Support)',
  AMA: 'Attacking Midfielder (Attack)',
  BWM: 'Ball Winning Midfielder (Defend)',
  BWMS: 'Ball Winning Midfielder (Support)',
  BBM: 'Box to Box Midfielder (Support)',
  CAR: 'Carrilero (Support)',
  CMD: 'Central Midfielder (Defend)',
  CMS: 'Central Midfielder (Support)',
  CMA: 'Central Midfielder (Attack)',
  DLPD: 'Deep Lying Playmaker (Defend)',
  DLPS: 'Deep Lying Playmaker (Support)',
  DM: 'Defensive Midfielder (Defend)',
  DMS: 'Defensive Midfielder (Support)',
  DW: 'Defensive Winger (Defend)',
  DWS: 'Defensive Winger (Support)',
  ENG: 'Enganche (Support)',
  HB: 'Half Back (Defend)',
  IF: 'Inside Forward (Support)',
  IFA: 'Inside Forward (Attack)',
  IW: 'Inverted Winger (Support)',
  IWA: 'Inverted Winger (Attack)',
  MEZ: 'Mezzala (Support)',
  MEZA: 'Mezzala (Attack)',
  RGA: 'Regista (Support)',
  RPM: 'Roaming Playmaker (Support)',
  SV: 'Segundo Volante (Support)',
  SVA: 'Segundo Volante (Attack)',
  SS: 'Shadow Striker (Attack)',
  WM: 'Wide Midfielder (Defend)',
  WMS: 'Wide Midfielder (Support)',
  WMA: 'Wide Midfielder (Attack)',
  WPM: 'Wide Playmaker (Support)',
  WPMA: 'Wide Playmaker (Attack)',
  WTF: 'Wide Target Forward (Support)',
  WTFA: 'Wide Target Forward (Attack)',
  WNG: 'Winger (Support)',
  WNGA: 'Winger (Attack)',
  AF: 'Advanced Forward (Attack)',
  CF: 'Complete Forward (Support)',
  CFA: 'Complete Forward (Attack)',
  DLF: 'Deep Lying Forward (Support)',
  DLFA: 'Deep Lying Forward (Attack)',
  F9: 'False Nine (Support)',
  PF: 'Pressing Forward (Defend)',
  PFS: 'Pressing Forward (Support)',
  PFA: 'Pressing Forward (Attack)',
  P: 'Poacher (Attack)',
  TF: 'Target Forward (Support)',
  TFA: 'Target Forward (Attack)',
  TQ: 'Trequartista (Attack)',
  RMD: 'Raumdeuter (Attack)',
};

// Squirrel_plays FM24 role formulas for all 85 roles
export const ROLE_FORMULAS = {
  // Goalkeeper - Defend
  GKD: player => (
    ((getAttr(player, 'Agi') + getAttr(player, 'Ref')) * 5 +
     (getAttr(player, 'Aer') + getAttr(player, 'Cmd') + getAttr(player, 'Han') + getAttr(player, 'Kic') + getAttr(player, 'Cnt') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, '1v1') + getAttr(player, 'Thr') + getAttr(player, 'Ant') + getAttr(player, 'Dec')) * 1
    ) / 32
  ),

  // Sweeper Keeper - Defend
  SKD: player => (
    ((getAttr(player, 'Agi') + getAttr(player, 'Ref')) * 5 +
     (getAttr(player, 'Cmd') + getAttr(player, 'Kic') + getAttr(player, '1v1') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Aer') + getAttr(player, 'Fir') + getAttr(player, 'Han') + getAttr(player, 'Pas') + getAttr(player, 'TRO') + getAttr(player, 'Dec') + getAttr(player, 'Vis') + getAttr(player, 'Acc')) * 1
    ) / 36
  ),

  // Sweeper Keeper - Support
  SKS: player => (
    ((getAttr(player, 'Agi') + getAttr(player, 'Ref')) * 5 +
     (getAttr(player, 'Cmd') + getAttr(player, 'Kic') + getAttr(player, '1v1') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Aer') + getAttr(player, 'Fir') + getAttr(player, 'Han') + getAttr(player, 'Pas') + getAttr(player, 'TRO') + getAttr(player, 'Dec') + getAttr(player, 'Vis') + getAttr(player, 'Acc')) * 1
    ) / 36
  ),

  // Sweeper Keeper - Attack
  SKA: player => (
    ((getAttr(player, 'Agi') + getAttr(player, 'Ref')) * 5 +
     (getAttr(player, 'Cmd') + getAttr(player, 'Kic') + getAttr(player, '1v1') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Aer') + getAttr(player, 'Fir') + getAttr(player, 'Han') + getAttr(player, 'Pas') + getAttr(player, 'TRO') + getAttr(player, 'Dec') + getAttr(player, 'Vis') + getAttr(player, 'Acc')) * 1
    ) / 36
  ),

  // Ball Playing Defender - Defend
  BPDD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Vis')) * 1
    ) / 46
  ),

  // Ball Playing Defender - Stopper
  BPDS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str') + getAttr(player, 'Agg') + getAttr(player, 'Bra') + getAttr(player, 'Dec')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Vis') + getAttr(player, 'Mar')) * 1
    ) / 50
  ),

  // Ball Playing Defender - Cover
  BPDC: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Dec')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'Bra') + getAttr(player, 'Vis') + getAttr(player, 'Str') + getAttr(player, 'Hea')) * 1
    ) / 47
  ),

  // Central Defender - Defend
  CDD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Dec')) * 1
    ) / 40
  ),

  // Central Defender - Stopper
  CDS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Tck') + getAttr(player, 'Agg') + getAttr(player, 'Bra') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Mar') + getAttr(player, 'Ant') + getAttr(player, 'Cnt')) * 1
    ) / 44
  ),

  // Central Defender - Cover
  CDC: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Hea') + getAttr(player, 'Bra') + getAttr(player, 'Str')) * 1
    ) / 41
  ),

  // Complete Wing Back - Support
  CWBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Tec') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'Pos') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),

  // Complete Wing Back - Attack
  CWBA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Tec') + getAttr(player, 'Fla') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 47
  ),

  // Full Back - Defend
  FBD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Pas') + getAttr(player, 'Dec') + getAttr(player, 'Tea')) * 1
    ) / 42
  ),

  // Full Back - Support
  FBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Dec')) * 1
    ) / 43
  ),

  // Full Back - Attack
  FBA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Agi')) * 1
    ) / 46
  ),

  // Inverted Full Back - Defend
  IFBD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Agi') + getAttr(player, 'Jum')) * 1
    ) / 47
  ),

  // Inverted Wing Back - Defend
  IWBD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'OtB') + getAttr(player, 'Agi')) * 1
    ) / 45
  ),

  // Inverted Wing Back - Support
  IWBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'OtB') + getAttr(player, 'Pos') + getAttr(player, 'Vis') + getAttr(player, 'Agi')) * 1
    ) / 46
  ),

  // Inverted Wing Back - Attack
  IWBA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Lon') + getAttr(player, 'Mar') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Fla') + getAttr(player, 'Pos') + getAttr(player, 'Agi')) * 1
    ) / 56
  ),

  // Libero - Defend
  LIBD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Tec') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Sta')) * 1
    ) / 54
  ),

  // Libero - Support
  LIBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Tec') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Vis') + getAttr(player, 'Sta')) * 1
    ) / 56
  ),

  // No-nonsense Centre Back - Defend
  NCB: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt')) * 1
    ) / 39
  ),

  // No-nonsense Centre Back - Stopper
  NCBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Tck') + getAttr(player, 'Agg') + getAttr(player, 'Bra') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Mar') + getAttr(player, 'Ant') + getAttr(player, 'Cnt')) * 1
    ) / 41
  ),

  // No-nonsense Centre Back - Cover
  NCBC: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Hea') + getAttr(player, 'Bra') + getAttr(player, 'Str')) * 1
    ) / 38
  ),

  // No-nonsense Full Back - Defend
  NFB: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Hea') + getAttr(player, 'Agg') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Tea')) * 1
    ) / 40
  ),

  // Wide Centre Back - Defend
  WCB: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Wor') + getAttr(player, 'Agi')) * 1
    ) / 46
  ),

  // Wide Centre Back - Support
  WCBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Pos') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Wor') + getAttr(player, 'Agi') + getAttr(player, 'Sta')) * 1
    ) / 51
  ),

  // Wide Centre Back - Attack
  WCBA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Jum') + getAttr(player, 'Cmp')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Hea') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'OtB') + getAttr(player, 'Sta') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Wor') + getAttr(player, 'Agi')) * 1
    ) / 55
  ),

  // Wing Back - Defend
  WBD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),

  // Wing Back - Support
  WBS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 47
  ),

  // Wing Back - Attack
  WBA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Tck') + getAttr(player, 'Tec') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'Pos') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 48
  ),

  // Advanced Playmaker - Support
  APM: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'Agi')) * 1
    ) / 48
  ),

  // Advanced Playmaker - Attack
  APMA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'Agi')) * 1
    ) / 48
  ),

  // Anchor - Defend
  ANC: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Cmp') + getAttr(player, 'Tea') + getAttr(player, 'Str')) * 1
    ) / 41
  ),

  // Attacking Midfielder - Support
  AM: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Cmp') + getAttr(player, 'Vis') + getAttr(player, 'Agi')) * 1
    ) / 48
  ),

  // Attacking Midfielder - Attack
  AMA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Fin') + getAttr(player, 'Cmp') + getAttr(player, 'Vis') + getAttr(player, 'Agi')) * 1
    ) / 51
  ),

  // Ball Winning Midfielder - Defend
  BWM: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Tck') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Mar') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Pos') + getAttr(player, 'Agi') + getAttr(player, 'Str')) * 1
    ) / 38
  ),

  // Ball Winning Midfielder - Support
  BWMS: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Tck') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Bra') + getAttr(player, 'Cnt') + getAttr(player, 'Agi') + getAttr(player, 'Str')) * 1
    ) / 38
  ),

  // Box to Box Midfielder - Support
  BBM: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 44
  ),

  // Carrilero - Support
  CAR: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'OtB') + getAttr(player, 'Vis')) * 1
    ) / 44
  ),

  // Central Midfielder - Defend
  CMD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Tck') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Cmp')) * 1
    ) / 42
  ),

  // Central Midfielder - Support
  CMS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Dec') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'OtB') + getAttr(player, 'Vis')) * 1
    ) / 41
  ),

  // Central Midfielder - Attack
  CMA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Dec') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Lon') + getAttr(player, 'Tck') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 1
    ) / 39
  ),

  // Deep Lying Playmaker - Defend
  DLPD: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Pos') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),

  // Deep Lying Playmaker - Support
  DLPS: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Ant') + getAttr(player, 'OtB') + getAttr(player, 'Pos') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),

  // Defensive Midfielder - Defend
  DM: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Agg') + getAttr(player, 'Cmp') + getAttr(player, 'Str') + getAttr(player, 'Dec')) * 1
    ) / 41
  ),

  // Defensive Midfielder - Support
  DMS: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cnt') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Agg') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Str')) * 1
    ) / 42
  ),

  // Defensive Winger - Defend
  DW: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'OtB') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Agg') + getAttr(player, 'Cnt') + getAttr(player, 'Dec')) * 1
    ) / 43
  ),

  // Defensive Winger - Support
  DWS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos')) * 1
    ) / 46
  ),

  // Enganche - Support
  ENG: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Agi')) * 1
    ) / 44
  ),

  // Half Back - Defend
  HB: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Agg') + getAttr(player, 'Bra') + getAttr(player, 'Jum') + getAttr(player, 'Str')) * 1
    ) / 50
  ),

  // Inside Forward - Support
  IF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'OtB') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Fla') + getAttr(player, 'Vis') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),

  // Inside Forward - Attack
  IFA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'OtB') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Cmp') + getAttr(player, 'Fla') + getAttr(player, 'Bal')) * 1
    ) / 46
  ),

  // Inverted Winger - Support
  IW: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Vis') + getAttr(player, 'Bal')) * 1
    ) / 42
  ),

  // Inverted Winger - Attack
  IWA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'OtB') + getAttr(player, 'Vis') + getAttr(player, 'Bal')) * 1
    ) / 44
  ),

  // Mezzala - Support
  MEZ: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Dec') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Vis') + getAttr(player, 'Bal')) * 1
    ) / 40
  ),

  // Mezzala - Attack
  MEZA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Fla') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),

  // Raumdeuter - Attack
  RMD: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fin') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Bal')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Tec')) * 1
    ) / 43
  ),

  // Regista - Support
  RGA: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Lon') + getAttr(player, 'Ant') + getAttr(player, 'Bal')) * 1
    ) / 51
  ),

  // Roaming Playmaker - Support
  RPM: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Lon') + getAttr(player, 'Cnt') + getAttr(player, 'Pos') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 53
  ),

  // Segundo Volante - Support
  SV: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Mar') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'OtB') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Lon') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 44
  ),

  // Segundo Volante - Attack
  SVA: player => (
    ((getAttr(player, 'Wor') + getAttr(player, 'Sta') + getAttr(player, 'Acc') + getAttr(player, 'Pac')) * 5 +
     (getAttr(player, 'Fin') + getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Ant') + getAttr(player, 'OtB') + getAttr(player, 'Pos')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Bal')) * 1
    ) / 47
  ),

  // Shadow Striker - Attack
  SS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 44
  ),

  // Wide Midfielder - Defend
  WM: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Pos') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Fir') + getAttr(player, 'Mar') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp')) * 1
    ) / 44
  ),

  // Wide Midfielder - Support
  WMS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Pas') + getAttr(player, 'Tck') + getAttr(player, 'Dec') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'OtB') + getAttr(player, 'Pos') + getAttr(player, 'Vis')) * 1
    ) / 41
  ),

  // Wide Midfielder - Attack
  WMA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Dec') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Tck') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'OtB') + getAttr(player, 'Vis')) * 1
    ) / 41
  ),

  // Wide Playmaker - Support
  WPM: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'OtB') + getAttr(player, 'Agi')) * 1
    ) / 44
  ),

  // Wide Playmaker - Attack
  WPMA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'Agi')) * 1
    ) / 50
  ),

  // Wide Target Forward - Support
  WTF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Bra') + getAttr(player, 'Tea') + getAttr(player, 'Jum') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Fir') + getAttr(player, 'Ant') + getAttr(player, 'OtB') + getAttr(player, 'Bal')) * 1
    ) / 40
  ),

  // Wide Target Forward - Attack
  WTFA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Bra') + getAttr(player, 'OtB') + getAttr(player, 'Jum') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Cro') + getAttr(player, 'Fin') + getAttr(player, 'Fir') + getAttr(player, 'Ant') + getAttr(player, 'Tea') + getAttr(player, 'Bal')) * 1
    ) / 41
  ),

  // Winger - Support
  WNG: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Tec') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'OtB') + getAttr(player, 'Bal')) * 1
    ) / 36
  ),

  // Winger - Attack
  WNGA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Sta') + getAttr(player, 'Wor')) * 5 +
     (getAttr(player, 'Cro') + getAttr(player, 'Dri') + getAttr(player, 'Tec') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'OtB') + getAttr(player, 'Bal')) * 1
    ) / 38
  ),

  // Advanced Forward - Attack
  AF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Pas') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Wor') + getAttr(player, 'Agi') + getAttr(player, 'Bal') + getAttr(player, 'Sta')) * 1
    ) / 37
  ),

  // Complete Forward - Support
  CF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Hea') + getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Vis') + getAttr(player, 'Agi') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Tea') + getAttr(player, 'Wor') + getAttr(player, 'Bal') + getAttr(player, 'Jum') + getAttr(player, 'Sta')) * 1
    ) / 59
  ),

  // Complete Forward - Attack
  CFA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Hea') + getAttr(player, 'Tec') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'OtB') + getAttr(player, 'Agi') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Lon') + getAttr(player, 'Pas') + getAttr(player, 'Dec') + getAttr(player, 'Tea') + getAttr(player, 'Vis') + getAttr(player, 'Wor') + getAttr(player, 'Bal') + getAttr(player, 'Jum') + getAttr(player, 'Sta')) * 1
    ) / 51
  ),

  // Deep Lying Forward - Support
  DLF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'Vis') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 41
  ),

  // Deep Lying Forward - Attack
  DLFA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Tea')) * 3 +
     (getAttr(player, 'Dri') + getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'Vis') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 42
  ),

  // False Nine - Support
  F9: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB') + getAttr(player, 'Vis') + getAttr(player, 'Agi')) * 3 +
     (getAttr(player, 'Ant') + getAttr(player, 'Fla') + getAttr(player, 'Tea') + getAttr(player, 'Bal')) * 1
    ) / 46
  ),

  // Poacher - Attack
  P: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'OtB')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Hea') + getAttr(player, 'Tec') + getAttr(player, 'Dec')) * 1
    ) / 28
  ),

  // Pressing Forward - Defend
  PF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Dec') + getAttr(player, 'Tea') + getAttr(player, 'Wor') + getAttr(player, 'Sta')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Agi') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 42
  ),

  // Pressing Forward - Support
  PFS: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'Dec') + getAttr(player, 'Tea') + getAttr(player, 'Wor') + getAttr(player, 'Sta')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'OtB') + getAttr(player, 'Agi') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 44
  ),

  // Pressing Forward - Attack
  PFA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Bra') + getAttr(player, 'OtB') + getAttr(player, 'Tea') + getAttr(player, 'Wor') + getAttr(player, 'Sta')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Cmp') + getAttr(player, 'Cnt') + getAttr(player, 'Dec') + getAttr(player, 'Agi') + getAttr(player, 'Bal') + getAttr(player, 'Str')) * 1
    ) / 43
  ),

  // Target Forward - Support
  TF: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Bra') + getAttr(player, 'Tea') + getAttr(player, 'Bal') + getAttr(player, 'Jum') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'OtB')) * 1
    ) / 39
  ),

  // Target Forward - Attack
  TFA: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Hea') + getAttr(player, 'Bra') + getAttr(player, 'Cmp') + getAttr(player, 'OtB') + getAttr(player, 'Bal') + getAttr(player, 'Jum') + getAttr(player, 'Str')) * 3 +
     (getAttr(player, 'Fir') + getAttr(player, 'Agg') + getAttr(player, 'Ant') + getAttr(player, 'Dec') + getAttr(player, 'Tea')) * 1
    ) / 41
  ),

  // Trequartista - Attack
  TQ: player => (
    ((getAttr(player, 'Acc') + getAttr(player, 'Pac') + getAttr(player, 'Fin')) * 5 +
     (getAttr(player, 'Dri') + getAttr(player, 'Fir') + getAttr(player, 'Pas') + getAttr(player, 'Tec') + getAttr(player, 'Cmp') + getAttr(player, 'Dec') + getAttr(player, 'Fla') + getAttr(player, 'OtB') + getAttr(player, 'Vis')) * 3 +
     (getAttr(player, 'Ant') + getAttr(player, 'Agi') + getAttr(player, 'Bal')) * 1
    ) / 45
  ),
};

// Calculate all role scores for a player
export function calculatePlayerRoleScores(player) {
  const scores = {};
  for (const role in ROLE_FORMULAS) {
    scores[role] = Math.round(ROLE_FORMULAS[role](player) * 10) / 10;
  }
  return scores;
}

// Normalize goalkeeper score to 0-20 scale for display
export const normalizeGoalkeeperScore = (rawScore) => {
  const min = 20;
  const max = 740;
  return Math.round(((rawScore - min) / (max - min)) * 20);
};

// Get the best role for a player, only considering GK if player is a goalkeeper
export const getBestRoleForPlayer = (player) => {
  const roleScores = calculatePlayerRoleScores(player);
  const isGK = (player.Position && player.Position.toUpperCase().includes('GK'));
  
  // Filter out GK roles for non-GK players
  const filteredScores = isGK ? roleScores : 
    Object.fromEntries(Object.entries(roleScores).filter(([role]) => !role.startsWith('GK')));
  
  const bestRole = Object.entries(filteredScores).reduce((best, [role, score]) => 
    score > best.score ? { role, score } : best, { role: 'GKD', score: 0 });
  
  return bestRole;
};

// Get key attributes for a specific role
export const getKeyAttributesForRole = (role) => {
  // Define key attributes for each role based on FM24 requirements
  const roleAttributes = {
    GKD: ['Agi', 'Ref', 'Aer', 'Cmd', 'Han', 'Kic', 'Cnt', 'Pos', '1v1', 'Thr', 'Ant', 'Dec'],
    SKD: ['Agi', 'Ref', 'Cmd', 'Kic', '1v1', 'Ant', 'Cnt', 'Pos', 'Aer', 'Fir', 'Han', 'Pas', 'Dec', 'Vis', 'Acc'],
    SKS: ['Agi', 'Ref', 'Cmd', 'Kic', '1v1', 'Ant', 'Cnt', 'Pos', 'Aer', 'Fir', 'Han', 'Pas', 'Dec', 'Vis', 'Acc'],
    SKA: ['Agi', 'Ref', 'Cmd', 'Kic', '1v1', 'Ant', 'Cnt', 'Pos', 'Aer', 'Fir', 'Han', 'Pas', 'Dec', 'Vis', 'Acc'],
    BPDD: ['Acc', 'Pac', 'Jum', 'Cmp', 'Hea', 'Mar', 'Pas', 'Tck', 'Pos', 'Str', 'Fir', 'Tec', 'Vis', 'Dec'],
    BPDS: ['Acc', 'Pac', 'Jum', 'Cmp', 'Hea', 'Mar', 'Pas', 'Tck', 'Pos', 'Str', 'Fir', 'Tec', 'Vis', 'Dec'],
    BPDC: ['Acc', 'Pac', 'Jum', 'Cmp', 'Hea', 'Mar', 'Pas', 'Tck', 'Pos', 'Str', 'Fir', 'Tec', 'Vis', 'Dec'],
    CDD: ['Acc', 'Pac', 'Jum', 'Cmp', 'Hea', 'Mar', 'Tck', 'Pos', 'Str', 'Fir', 'Tec', 'Dec'],
    CDS: ['Acc', 'Pac', 'Jum', 'Cmp', 'Hea', 'Mar', 'Tck', 'Pos', 'Str', 'Fir', 'Tec', 'Dec'],
    CDC: ['Acc', 'Pac', 'Jum', 'Cmp', 'Hea', 'Mar', 'Tck', 'Pos', 'Str', 'Fir', 'Tec', 'Dec'],
    // Add more roles as needed...
  };
  
  return roleAttributes[role] || ['Acc', 'Pac', 'Fin', 'Tec', 'Hea', 'Mar', 'Pas', 'Tck', 'Pos', 'Str'];
}; 

// When a file is uploaded
const saveFileToLocal = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const files = JSON.parse(localStorage.getItem('fm24_files') || '[]');
    files.push({
      name: file.name,
      content: e.target.result,
      date: new Date().toISOString(),
    });
    localStorage.setItem('fm24_files', JSON.stringify(files));
  };
  reader.readAsText(file); // or readAsDataURL for binary
};

const loadFilesFromLocal = () => {
  return JSON.parse(localStorage.getItem('fm24_files') || '[]');
};

const deleteFileFromLocal = (fileName) => {
  let files = JSON.parse(localStorage.getItem('fm24_files') || '[]');
  files = files.filter(f => f.name !== fileName);
  localStorage.setItem('fm24_files', JSON.stringify(files));
};