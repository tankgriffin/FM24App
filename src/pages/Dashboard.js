import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSquad } from '../contexts/SquadContext';
import { useTactics, FORMATIONS } from '../contexts/TacticsContext';
import {
  Users, Zap, Calendar, MessageCircle, TrendingUp, Trophy,
  ArrowRight, Upload, CheckCircle2, Layers
} from 'lucide-react';
import { ROLE_NAMES } from '../utils/roleCalculations';

// Maps each formation position id → display info
const POSITION_INFO = {
  gk:  { label: 'GK',  full: 'Goalkeeper',       group: 'GK'  },
  lb:  { label: 'LB',  full: 'Left Back',         group: 'DEF' },
  lcb: { label: 'LCB', full: 'Left CB',           group: 'DEF' },
  cb:  { label: 'CB',  full: 'Centre-Back',       group: 'DEF' },
  rcb: { label: 'RCB', full: 'Right CB',          group: 'DEF' },
  rb:  { label: 'RB',  full: 'Right Back',        group: 'DEF' },
  lwb: { label: 'LWB', full: 'Left Wing-Back',    group: 'DEF' },
  rwb: { label: 'RWB', full: 'Right Wing-Back',   group: 'DEF' },
  ldm: { label: 'LDM', full: 'Left DM',           group: 'MID' },
  dm:  { label: 'DM',  full: 'Defensive Mid',     group: 'MID' },
  rdm: { label: 'RDM', full: 'Right DM',          group: 'MID' },
  lm:  { label: 'LM',  full: 'Left Mid',          group: 'MID' },
  lcm: { label: 'LCM', full: 'Left CM',           group: 'MID' },
  cm:  { label: 'CM',  full: 'Central Mid',       group: 'MID' },
  rcm: { label: 'RCM', full: 'Right CM',          group: 'MID' },
  rm:  { label: 'RM',  full: 'Right Mid',         group: 'MID' },
  lam: { label: 'LAM', full: 'Left AM',           group: 'MID' },
  cam: { label: 'CAM', full: 'Central AM',        group: 'MID' },
  ram: { label: 'RAM', full: 'Right AM',          group: 'MID' },
  lw:  { label: 'LW',  full: 'Left Wing',         group: 'FWD' },
  rw:  { label: 'RW',  full: 'Right Wing',        group: 'FWD' },
  lst: { label: 'LST', full: 'Left Striker',      group: 'FWD' },
  rst: { label: 'RST', full: 'Right Striker',     group: 'FWD' },
  st:  { label: 'ST',  full: 'Striker',           group: 'FWD' },
};

// Default FM24 role for each generic role type in FORMATIONS
const DEFAULT_ROLE = {
  GK: 'GKD', FB: 'FBD', WB: 'WBD', CD: 'CDD',
  DLP: 'DLPD', CM: 'CMD', AM: 'AMA', WM: 'WMD', W: 'IFA', CF: 'CFA',
};

// Generic position type → role category for optgroup filtering
const GENERIC_TO_GROUP = {
  GK: 'GK',
  FB: 'DEF', WB: 'DEF', CD: 'DEF', SW: 'DEF',
  DLP: 'MID', CM: 'MID', AM: 'MID', WM: 'MID', W: 'MID',
  CF: 'FWD',
};

const ROLES_BY_GROUP = {
  GK:  ['GKD', 'SKD', 'SKS', 'SKA'],
  DEF: ['BPDD','BPDS','BPDC','CDD','CDS','CDC','CWBS','CWBA','FBD','FBS','FBA',
        'IWBD','IWBS','IWBA','LIBD','LIBS','NCB','NCBS','NCBC','NFB','WCB','WCBS','WCBA','WBD','WBS','WBA'],
  MID: ['APM','APMA','ANC','AM','AMA','BWM','BWMS','BBM','CAR','CMD','CMS','CMA',
        'DLPD','DLPS','DM','DMS','DW','DWS','ENG','HB','IF','IFA','IW','IWA',
        'MEZ','MEZA','RGA','RPM','SV','SVA','SS','WM','WMS','WMA','WPM','WPMA'],
  FWD: ['WTF','WTFA','WNG','WNGA','AF','CF','CFA','DLF','DLFA','F9','PF','PFS','PFA','P','TF','TFA','TQ','RMD'],
};

const GROUP_LABELS = { GK: 'Goalkeeper Roles', DEF: 'Defender Roles', MID: 'Midfielder Roles', FWD: 'Forward Roles' };

// Build slots array from a formation
const buildSlots = (formationKey) => {
  const formation = FORMATIONS[formationKey];
  if (!formation) return [];
  return formation.positions.map(pos => {
    const info = POSITION_INFO[pos.id] || { label: pos.id.toUpperCase(), full: pos.id, group: 'MID' };
    return {
      id: pos.id,
      positionLabel: info.label,
      fullLabel: info.full,
      group: info.group,
      genericRole: pos.role,
      roleKey: DEFAULT_ROLE[pos.role] || 'CMD',
    };
  });
};

// Role select for a single position slot
const RoleSelect = ({ slot, onChange }) => {
  const primaryGroup = GENERIC_TO_GROUP[slot.genericRole] || 'MID';
  const otherGroups = Object.keys(ROLES_BY_GROUP).filter(g => g !== primaryGroup);

  return (
    <select
      value={slot.roleKey}
      onChange={e => onChange(slot.id, e.target.value)}
      className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      <optgroup label={`▶ ${GROUP_LABELS[primaryGroup]}`}>
        {ROLES_BY_GROUP[primaryGroup].map(r => (
          <option key={r} value={r}>{ROLE_NAMES[r] || r} ({r})</option>
        ))}
      </optgroup>
      {otherGroups.map(g => (
        <optgroup key={g} label={GROUP_LABELS[g]}>
          {ROLES_BY_GROUP[g].map(r => (
            <option key={r} value={r}>{ROLE_NAMES[r] || r} ({r})</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

const Dashboard = () => {
  const { players } = useSquad();
  const { savedBoards, getUpcomingMatches, tacticSetup, setTacticSetup } = useTactics();
  const upcomingMatches = getUpcomingMatches(3);

  // Local draft state for the tactic setup editor
  const [draftFormation, setDraftFormation] = useState(tacticSetup?.formation || '4-4-2');
  const [draftSlots, setDraftSlots] = useState(() =>
    tacticSetup?.slots || buildSlots('4-4-2')
  );
  const [saved, setSaved] = useState(!!tacticSetup);

  const handleFormationChange = (formation) => {
    setDraftFormation(formation);
    setDraftSlots(buildSlots(formation));
    setSaved(false);
  };

  const handleRoleChange = (posId, roleKey) => {
    setDraftSlots(prev => prev.map(s => s.id === posId ? { ...s, roleKey } : s));
    setSaved(false);
  };

  const handleSave = () => {
    setTacticSetup({ formation: draftFormation, slots: draftSlots });
    setSaved(true);
  };

  const stats = [
    { name: 'Squad Players',   value: players.length, icon: Users,   color: 'bg-blue-500',   link: '/squad' },
    { name: 'Saved Tactics',   value: savedBoards.length, icon: Zap, color: 'bg-green-500',  link: '/tactical-board' },
    { name: 'Upcoming Matches',value: upcomingMatches.length, icon: Calendar, color: 'bg-purple-500', link: '/match-planner' },
    { name: 'Best Player Rating',
      value: players.length > 0
        ? Math.max(...players.map(p => Math.max(...Object.values(p.roleScores || {0:0})))).toFixed(1)
        : 0,
      icon: Trophy, color: 'bg-yellow-500', link: '/squad' },
  ];

  const quickActions = [
    { name: 'Upload Squad Data',       description: 'Import your FM24 squad export',    icon: Upload,      link: '/squad',          color: 'bg-primary-600 hover:bg-primary-700' },
    { name: 'Create Tactic',           description: 'Design a new tactical setup',       icon: Zap,         link: '/tactical-board', color: 'bg-green-600 hover:bg-green-700' },
    { name: 'Squad Planning',          description: 'Build depth charts for your tactic',icon: Layers,      link: '/squad-planning', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { name: 'AI Assistant',            description: 'Get tactical recommendations',      icon: MessageCircle, link: '/assistant',    color: 'bg-orange-600 hover:bg-orange-700' },
  ];

  // Group draft slots for display
  const slotsByGroup = draftSlots.reduce((acc, slot) => {
    (acc[slot.group] = acc[slot.group] || []).push(slot);
    return acc;
  }, {});
  const groupOrder = ['GK', 'DEF', 'MID', 'FWD'];
  const groupColors = {
    GK:  'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    DEF: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    MID: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    FWD: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  };
  const groupNames = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to your FM24 tactical assistant</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.link}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.name} to={action.link}
                  className={`${action.color} text-white p-4 rounded-lg hover:shadow-md transition-all group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-8 h-8" />
                      <div>
                        <h3 className="font-semibold">{action.name}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tactic Setup */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tactic Setup</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Pick your formation and assign a role to each position — this drives the Squad Planning depth charts
            </p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
        <div className="p-6 space-y-6">
          {/* Formation picker */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Formation</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(FORMATIONS).map(f => (
                <button
                  key={f}
                  onClick={() => handleFormationChange(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    draftFormation === f
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Position role selectors, grouped */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Roles per Position</p>
            <div className="space-y-4">
              {groupOrder.filter(g => slotsByGroup[g]).map(group => (
                <div key={group}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-2 px-2 py-0.5 rounded inline-block ${groupColors[group]}`}>
                    {groupNames[group]}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slotsByGroup[group].map(slot => (
                      <div key={slot.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                        <span className={`flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${groupColors[group]}`}>
                          {slot.positionLabel}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-0.5">{slot.fullLabel}</p>
                          <RoleSelect slot={slot} onChange={handleRoleChange} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                saved
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {saved ? 'Saved ✓' : 'Save Tactic Setup'}
            </button>
            <Link to="/squad-planning" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Go to Squad Planning →
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Matches & Squad Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Matches</h2>
            <Link to="/match-planner" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View all</Link>
          </div>
          <div className="p-6">
            {upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">vs {match.opponent}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(match.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{match.competition}</p>
                      {match.tacticId && <p className="text-xs text-green-600 dark:text-green-400">Tactic assigned</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No upcoming matches planned</p>
                <Link to="/match-planner" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Add your first match</Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Squad Overview</h2>
            <Link to="/squad" className="text-primary-600 hover:text-primary-700 text-sm font-medium">View details</Link>
          </div>
          <div className="p-6">
            {players.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{players.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Players</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {players.filter(p => p.roleScores && Math.max(...Object.values(p.roleScores)) >= 15).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Elite Players</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent additions:</p>
                  <div className="space-y-2">
                    {players.slice(0, 3).map((player, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-900 dark:text-white">{player.Name || `Player ${i + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No squad data imported yet</p>
                <Link to="/squad" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Import your squad</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
