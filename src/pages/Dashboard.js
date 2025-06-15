import React from 'react';
import { Link } from 'react-router-dom';
import { useSquad } from '../contexts/SquadContext';
import { useTactics } from '../contexts/TacticsContext';
import { 
  Users, 
  Zap, 
  Calendar, 
  MessageCircle, 
  TrendingUp,
  Trophy,
  ArrowRight,
  Upload
} from 'lucide-react';

const Dashboard = () => {
  const { players } = useSquad();
  const { savedBoards, getUpcomingMatches } = useTactics();
  const upcomingMatches = getUpcomingMatches(3);

  const stats = [
    {
      name: 'Squad Players',
      value: players.length,
      icon: Users,
      color: 'bg-blue-500',
      link: '/squad'
    },
    {
      name: 'Saved Tactics',
      value: savedBoards.length,
      icon: Zap,
      color: 'bg-green-500',
      link: '/tactical-board'
    },
    {
      name: 'Upcoming Matches',
      value: upcomingMatches.length,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/match-planner'
    },
    {
      name: 'Best Player Rating',
      value: players.length > 0 ? Math.max(...players.map(p => Math.max(...Object.values(p.roleScores || {})))) : 0,
      icon: Trophy,
      color: 'bg-yellow-500',
      link: '/squad'
    }
  ];

  const quickActions = [
    {
      name: 'Upload Squad Data',
      description: 'Import your FM24 squad export',
      icon: Upload,
      link: '/squad',
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      name: 'Create Tactic',
      description: 'Design a new tactical setup',
      icon: Zap,
      link: '/tactical-board',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'Plan Match',
      description: 'Add upcoming opponent analysis',
      icon: Calendar,
      link: '/match-planner',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'AI Assistant',
      description: 'Get tactical recommendations',
      icon: MessageCircle,
      link: '/assistant',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to your FM24 tactical assistant
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Get started with common tasks
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.link}
                  className={`${action.color} text-white p-4 rounded-lg hover:shadow-md transition-all duration-200 group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-8 h-8" />
                      <div>
                        <h3 className="font-semibold">{action.name}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Matches & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upcoming Matches
              </h2>
              <Link
                to="/match-planner"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        vs {match.opponent}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(match.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {match.competition}
                      </p>
                      {match.tacticId && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Tactic assigned
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No upcoming matches planned
                </p>
                <Link
                  to="/match-planner"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Add your first match
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Squad Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Squad Overview
              </h2>
              <Link
                to="/squad"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View details
              </Link>
            </div>
          </div>
          <div className="p-6">
            {players.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {players.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Players
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {players.filter(p => p.roleScores && Math.max(...Object.values(p.roleScores)) >= 15).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Elite Players
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Recent additions:
                  </p>
                  <div className="space-y-2">
                    {players.slice(0, 3).map((player, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {player.Name || `Player ${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No squad data imported yet
                </p>
                <Link
                  to="/squad"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Import your squad
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 