// Role calculation formulas as defined in the PRD
export const ROLE_FORMULAS = {
  // Forward roles
  'AF': ['Acceleration', 'Pace', 'Finishing', 'Off The Ball', 'Technique', 'Work Rate', 'Dribbling'],
  'CF': ['Strength', 'Heading', 'Finishing', 'Technique', 'Work Rate', 'Off The Ball', 'Balance', 'Passing', 'Dribbling'],
  'DLF': ['Passing', 'Technique', 'Composure', 'First Touch', 'Vision', 'Finishing', 'Off The Ball', 'Work Rate'],
  'P': ['Finishing', 'Acceleration', 'Pace', 'Off The Ball', 'Anticipation'],
  'TF': ['Strength', 'Heading', 'Bravery', 'Finishing', 'Jumping Reach', 'Balance'],
  'F9': ['Dribbling', 'Passing', 'Technique', 'Vision', 'Work Rate', 'Off The Ball', 'Composure'],

  // Attacking Midfielder roles
  'AM': ['Technique', 'Passing', 'Vision', 'Composure', 'Flair', 'Off The Ball', 'Dribbling'],
  'SS': ['Finishing', 'Technique', 'Off The Ball', 'Anticipation', 'Acceleration', 'Dribbling', 'Work Rate'],
  'AP': ['Passing', 'Technique', 'Vision', 'Flair', 'Composure', 'First Touch', 'Decisions'],
  'ENG': ['Technique', 'Passing', 'Vision', 'Composure', 'Flair', 'First Touch'],
  'TREQ': ['Dribbling', 'Passing', 'Technique', 'Vision', 'Flair', 'Off The Ball'],

  // Central Midfielder roles
  'CM': ['First Touch', 'Passing', 'Technique', 'Work Rate', 'Stamina', 'Decisions', 'Anticipation', 'Positioning'],
  'BBM': ['Stamina', 'Work Rate', 'Acceleration', 'Passing', 'Technique', 'Anticipation', 'Decisions'],
  'BWM': ['Tackling', 'Work Rate', 'Anticipation', 'Stamina', 'Aggression', 'Positioning'],
  'DLP': ['Passing', 'Vision', 'Technique', 'Decisions', 'Anticipation', 'First Touch', 'Composure', 'Positioning'],
  'RPM': ['Passing', 'Vision', 'Technique', 'Stamina', 'Work Rate', 'Decisions', 'Dribbling', 'Anticipation'],
  'CAR': ['Work Rate', 'Stamina', 'Positioning', 'Passing', 'Acceleration', 'Decisions'],
  'MEZ': ['Technique', 'Passing', 'Acceleration', 'Dribbling', 'Flair', 'Work Rate', 'Stamina'],
  'SV': ['First Touch', 'Passing', 'Work Rate', 'Stamina', 'Tackling', 'Decisions', 'Acceleration'],

  // Wide Midfielder roles
  'WM': ['Crossing', 'Work Rate', 'Technique', 'Acceleration', 'Stamina', 'Decisions'],
  'W': ['Acceleration', 'Pace', 'Crossing', 'Dribbling', 'Technique', 'Flair'],
  'IW': ['Dribbling', 'Technique', 'Acceleration', 'Agility', 'Flair', 'Crossing', 'First Touch'],
  'WP': ['Passing', 'Technique', 'Vision', 'Composure', 'Crossing'],
  'IF': ['Finishing', 'Acceleration', 'Dribbling', 'Technique', 'Flair', 'Off The Ball'],
  'DW': ['Tackling', 'Work Rate', 'Stamina', 'Acceleration', 'Crossing', 'Positioning'],

  // Fullback roles
  'FB': ['Tackling', 'Stamina', 'Work Rate', 'Acceleration', 'Crossing', 'Positioning'],
  'WB': ['Stamina', 'Acceleration', 'Work Rate', 'Crossing', 'Dribbling', 'Tackling', 'Positioning'],
  'CWB': ['Crossing', 'Dribbling', 'Acceleration', 'Stamina', 'Work Rate', 'Off The Ball', 'Technique'],
  'IWB': ['Tackling', 'Passing', 'Positioning', 'Technique', 'Acceleration', 'Work Rate'],
  'NFB': ['Tackling', 'Positioning', 'Work Rate', 'Stamina', 'Acceleration', 'Aggression'],

  // Centre-back roles
  'CD': ['Tackling', 'Marking', 'Bravery', 'Jumping Reach', 'Strength', 'Positioning', 'Heading'],
  'BPD': ['Tackling', 'Marking', 'Passing', 'Vision', 'Technique', 'Composure', 'Decisions', 'Positioning'],
  'NCB': ['Tackling', 'Heading', 'Jumping Reach', 'Strength', 'Aggression', 'Positioning', 'Bravery'],
  'LIB': ['Tackling', 'Passing', 'Technique', 'Vision', 'Anticipation', 'Decisions', 'Acceleration', 'Composure'],
  'SW': ['Tackling', 'Marking', 'Positioning', 'Anticipation', 'Decisions', 'Heading', 'Acceleration'],
};

// Attribute name mappings for common variations
const ATTRIBUTE_MAPPINGS = {
  'Acc': 'Acceleration',
  'Pac': 'Pace',
  'Fin': 'Finishing',
  'Off': 'Off The Ball',
  'Tec': 'Technique',
  'Wor': 'Work Rate',
  'Dri': 'Dribbling',
  'Str': 'Strength',
  'Hea': 'Heading',
  'Bal': 'Balance',
  'Pas': 'Passing',
  'Com': 'Composure',
  'Fir': 'First Touch',
  'Vis': 'Vision',
  'Ant': 'Anticipation',
  'Brv': 'Bravery',
  'Jmp': 'Jumping Reach',
  'Fla': 'Flair',
  'Dec': 'Decisions',
  'Sta': 'Stamina',
  'Pos': 'Positioning',
  'Tck': 'Tackling',
  'Agg': 'Aggression',
  'Mar': 'Marking',
  'Cro': 'Crossing',
  'Agi': 'Agility',
  'Cmp': 'Composure',
};

// Helper function to get attribute value with fallback
const getAttributeValue = (player, attributeName) => {
  // Try direct match first
  if (player[attributeName] !== undefined) {
    return parseInt(player[attributeName]) || 0;
  }
  
  // Try mapped name
  const mappedName = ATTRIBUTE_MAPPINGS[attributeName];
  if (mappedName && player[mappedName] !== undefined) {
    return parseInt(player[mappedName]) || 0;
  }
  
  // Try reverse mapping
  const reverseMapping = Object.entries(ATTRIBUTE_MAPPINGS).find(([key, value]) => value === attributeName);
  if (reverseMapping && player[reverseMapping[0]] !== undefined) {
    return parseInt(player[reverseMapping[0]]) || 0;
  }
  
  return 0;
};

// Calculate role score for a specific role
export const calculateRoleScore = (player, role) => {
  const formula = ROLE_FORMULAS[role];
  if (!formula) {
    return 0;
  }

  const attributeValues = formula.map(attr => getAttributeValue(player, attr));
  const sum = attributeValues.reduce((total, value) => total + value, 0);
  return Math.round(sum / formula.length);
};

// Calculate goalkeeper score
export const calculateGoalkeeperScore = (player) => {
  const agility = getAttributeValue(player, 'Agility');
  const reflexes = getAttributeValue(player, 'Reflexes');
  const oneVOne = getAttributeValue(player, '1v1');
  const anticipation = getAttributeValue(player, 'Anticipation');
  const command = getAttributeValue(player, 'Command of Area');
  const concentration = getAttributeValue(player, 'Concentration');
  const kicking = getAttributeValue(player, 'Kicking');
  const positioning = getAttributeValue(player, 'Positioning');
  const acceleration = getAttributeValue(player, 'Acceleration');
  const aerialReach = getAttributeValue(player, 'Aerial Reach');
  const composure = getAttributeValue(player, 'Composure');
  const decisions = getAttributeValue(player, 'Decisions');
  const firstTouch = getAttributeValue(player, 'First Touch');
  const handling = getAttributeValue(player, 'Handling');
  const passing = getAttributeValue(player, 'Passing');
  const throwing = getAttributeValue(player, 'Throwing');
  const vision = getAttributeValue(player, 'Vision');

  const gkEssential = (agility + reflexes) * 5;
  const gkCore = (oneVOne + anticipation + command + concentration + kicking + positioning) * 3;
  const gkSecondary = (acceleration + aerialReach + composure + decisions + firstTouch + handling + passing + throwing + vision) * 1;

  return gkEssential + gkCore + gkSecondary;
};

// Calculate all role scores for a player
export const calculatePlayerRoleScores = (player) => {
  const roleScores = {};
  
  // Calculate outfield role scores
  Object.keys(ROLE_FORMULAS).forEach(role => {
    roleScores[role] = calculateRoleScore(player, role);
  });
  
  // Calculate goalkeeper score
  roleScores['GK'] = calculateGoalkeeperScore(player);
  
  return roleScores;
};

// Get the best role for a player
export const getBestRoleForPlayer = (player) => {
  const roleScores = calculatePlayerRoleScores(player);
  const bestRole = Object.entries(roleScores).reduce((best, [role, score]) => {
    return score > best.score ? { role, score } : best;
  }, { role: null, score: 0 });
  
  return bestRole;
};

// Role categories for organization
export const ROLE_CATEGORIES = {
  'Forwards': ['AF', 'CF', 'DLF', 'P', 'TF', 'F9'],
  'Attacking Midfielders': ['AM', 'SS', 'AP', 'ENG', 'TREQ'],
  'Central Midfielders': ['CM', 'BBM', 'BWM', 'DLP', 'RPM', 'CAR', 'MEZ', 'SV'],
  'Wide Midfielders': ['WM', 'W', 'IW', 'WP', 'IF', 'DW'],
  'Fullbacks': ['FB', 'WB', 'CWB', 'IWB', 'NFB'],
  'Centre-backs': ['CD', 'BPD', 'NCB', 'LIB', 'SW'],
  'Goalkeeper': ['GK']
};

// Role full names for display
export const ROLE_NAMES = {
  'AF': 'Advanced Forward',
  'CF': 'Complete Forward',
  'DLF': 'Deep-Lying Forward',
  'P': 'Poacher',
  'TF': 'Target Forward',
  'F9': 'False Nine',
  'AM': 'Attacking Midfielder',
  'SS': 'Shadow Striker',
  'AP': 'Advanced Playmaker',
  'ENG': 'Enganche',
  'TREQ': 'Trequartista',
  'CM': 'Central Midfielder',
  'BBM': 'Box-to-Box Midfielder',
  'BWM': 'Ball-Winning Midfielder',
  'DLP': 'Deep-Lying Playmaker',
  'RPM': 'Roaming Playmaker',
  'CAR': 'Carrilero',
  'MEZ': 'Mezzala',
  'SV': 'Segundo Volante',
  'WM': 'Wide Midfielder',
  'W': 'Winger',
  'IW': 'Inverted Winger',
  'WP': 'Wide Playmaker',
  'IF': 'Inside Forward',
  'DW': 'Defensive Winger',
  'FB': 'Full-Back',
  'WB': 'Wing-Back',
  'CWB': 'Complete Wing-Back',
  'IWB': 'Inverted Wing-Back',
  'NFB': 'No-Nonsense Full-Back',
  'CD': 'Central Defender',
  'BPD': 'Ball Playing Defender',
  'NCB': 'No-Nonsense Centre-Back',
  'LIB': 'Libero',
  'SW': 'Sweeper',
  'GK': 'Goalkeeper'
}; 