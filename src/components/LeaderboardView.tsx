import React, { useMemo, useState } from 'react';
import { Award, Search, Trophy } from 'lucide-react';
import {
  NOVATEK_REGIONS,
  type LeaderboardEntry,
  type ProductModule,
} from '../types/models';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  products: ProductModule[];
  currentUserId: string;
  initialProductFilter?: string;
}

interface AggregatedColleagueRow {
  userId: string;
  userName: string;
  userRegion: string;
  userDesignation: string;
  userEmployeeId?: string;
  userTerritory?: string;
  userArea?: string;
  modulesAssessed: number;
  modulesCertified: number;
  totalPoints: number;
  totalMaxPoints: number;
  avgPercentage: number;
  totalDurationSeconds: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  products,
  currentUserId,
  initialProductFilter = 'overall',
}) => {
  const [selectedScope, setSelectedScope] = useState<string>(initialProductFilter);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const overallRows = useMemo<AggregatedColleagueRow[]>(() => {
    const map = new Map<string, AggregatedColleagueRow>();
    for (const e of entries) {
      if (regionFilter !== 'ALL' && e.userRegion !== regionFilter) continue;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches =
          e.userName.toLowerCase().includes(q) ||
          e.userRegion.toLowerCase().includes(q) ||
          (e.userEmployeeId || '').toLowerCase().includes(q) ||
          (e.userTerritory || '').toLowerCase().includes(q) ||
          (e.userArea || '').toLowerCase().includes(q);
        if (!matches) continue;
      }
      const existing = map.get(e.userId);
      if (!existing) {
        map.set(e.userId, {
          userId: e.userId,
          userName: e.userName,
          userRegion: e.userRegion,
          userDesignation: e.userDesignation,
          userEmployeeId: e.userEmployeeId,
          userTerritory: e.userTerritory,
          userArea: e.userArea,
          modulesAssessed: 1,
          modulesCertified: e.passed ? 1 : 0,
          totalPoints: e.score,
          totalMaxPoints: e.maxScore,
          avgPercentage: e.percentage,
          totalDurationSeconds: e.durationSeconds,
        });
      } else {
        existing.modulesAssessed += 1;
        if (e.passed) existing.modulesCertified += 1;
        if (e.userEmployeeId) existing.userEmployeeId = e.userEmployeeId;
        if (e.userTerritory) existing.userTerritory = e.userTerritory;
        if (e.userArea) existing.userArea = e.userArea;
        existing.totalPoints += e.score;
        existing.totalMaxPoints += e.maxScore;
        existing.totalDurationSeconds += e.durationSeconds;
        existing.avgPercentage = Math.round(
          (existing.totalPoints / Math.max(1, existing.totalMaxPoints)) * 100
        );
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.avgPercentage !== a.avgPercentage) return b.avgPercentage - a.avgPercentage;
      return a.totalDurationSeconds - b.totalDurationSeconds;
    });
  }, [entries, regionFilter, searchQuery]);

  const productRows = useMemo<LeaderboardEntry[]>(() => {
    if (selectedScope === 'overall') return [];
    return entries
      .filter((e) => {
        if (e.productId !== selectedScope) return false;
        if (regionFilter !== 'ALL' && e.userRegion !== regionFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matches =
            e.userName.toLowerCase().includes(q) ||
            e.userRegion.toLowerCase().includes(q) ||
            (e.userEmployeeId || '').toLowerCase().includes(q) ||
            (e.userTerritory || '').toLowerCase().includes(q) ||
            (e.userArea || '').toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return a.durationSeconds - b.durationSeconds;
      });
  }, [entries, selectedScope, regionFilter, searchQuery]);

  const certifiedCount = entries.filter((e) => e.passed).length;
  const uniqueColleagues = new Set(entries.map((e) => e.userId)).size;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Summary */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Novatek Pharmaceutical Limited · Field Certification Standings
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Regional Colleague Leaderboard
          </h1>
        </div>

        <div className="flex items-center gap-8 text-sm">
          <div>
            <p className="text-xs text-slate-500">Ranked Colleagues</p>
            <p className="text-xl font-mono font-bold text-slate-900 tabular-nums">
              {uniqueColleagues}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Certifications Earned</p>
            <p className="text-xl font-mono font-bold text-teal-700 tabular-nums">
              {certifiedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Scope Tabs + Territory Filter + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedScope('overall')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedScope === 'overall'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overall Portfolio
          </button>
          {products.map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => setSelectedScope(prod.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedScope === prod.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {prod.brandName}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleague or region..."
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 w-52"
            />
          </div>

          <select
            value={regionFilter}
            aria-label="Filter leaderboard by region"
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-700 cursor-pointer"
          >
            <option value="ALL">All Sales Regions</option>
            {NOVATEK_REGIONS.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* High-Density Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {selectedScope === 'overall' ? (
          overallRows.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">
                No exam standings match the selected filter yet.
              </p>
              <p className="text-xs text-slate-500">
                Once colleagues complete a product study module and submit its exam, live rankings
                appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                    <th className="py-3 px-5 w-20">Rank</th>
                    <th className="py-3 px-5">Colleague</th>
                    <th className="py-3 px-5">Sales Region</th>
                    <th className="py-3 px-5 text-right">Certified Modules</th>
                    <th className="py-3 px-5 text-right">Total Points</th>
                    <th className="py-3 px-5 text-right">Avg Accuracy</th>
                    <th className="py-3 px-5 text-right">Total Exam Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {overallRows.map((row, idx) => {
                    const isSelf = row.userId === currentUserId;
                    return (
                      <tr
                        key={row.userId}
                        className={`transition-colors ${
                          isSelf ? 'bg-teal-50/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                          #{String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">
                            {row.userName}{' '}
                            {isSelf && (
                              <span className="text-xs font-normal text-teal-700">(You)</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.userEmployeeId ? (
                              <>
                                <span className="font-mono">{row.userEmployeeId}</span> ·{' '}
                                {row.userDesignation}
                              </>
                            ) : (
                              row.userDesignation
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 text-xs">
                          <div>{row.userRegion}</div>
                          {(row.userTerritory || row.userArea) && (
                            <div className="text-[11px] text-slate-500">
                              {[row.userTerritory, row.userArea].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-700 tabular-nums">
                          {row.modulesCertified} / {row.modulesAssessed}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {row.totalPoints} pts
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-semibold text-teal-700 tabular-nums">
                          {row.avgPercentage}%
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-500 tabular-nums">
                          {formatDuration(row.totalDurationSeconds)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : productRows.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 mb-1">
              No colleagues have completed this product exam yet.
            </p>
            <p className="text-xs text-slate-500">
              Be the first in your region to complete all study resources and set the benchmark
              score.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="py-3 px-5 w-20">Rank</th>
                  <th className="py-3 px-5">Colleague</th>
                  <th className="py-3 px-5">Sales Region</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Points</th>
                  <th className="py-3 px-5 text-right">Percentage</th>
                  <th className="py-3 px-5 text-right">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {productRows.map((entry, idx) => {
                  const isSelf = entry.userId === currentUserId;
                  return (
                    <tr
                      key={`${entry.userId}_${entry.productId}`}
                      className={`transition-colors ${
                        isSelf ? 'bg-teal-50/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                        #{String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">
                          {entry.userName}{' '}
                          {isSelf && (
                            <span className="text-xs font-normal text-teal-700">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.userEmployeeId ? (
                            <>
                              <span className="font-mono">{entry.userEmployeeId}</span> ·{' '}
                              {entry.userDesignation}
                            </>
                          ) : (
                            entry.userDesignation
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600">
                        <div>{entry.userRegion}</div>
                        {(entry.userTerritory || entry.userArea) && (
                          <div className="text-[11px] text-slate-500">
                            {[entry.userTerritory, entry.userArea].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-xs">
                        {entry.passed ? (
                          <span className="text-emerald-700 font-medium">
                            ✓ Certified
                            {entry.gradingStatus === 'pending_review' ? ' · Provisional' : ''}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">▲ Retake Eligible</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-700 tabular-nums">
                        {entry.score} / {entry.maxScore}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-teal-700 tabular-nums">
                        {entry.percentage}%
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-500 tabular-nums">
                        {formatDuration(entry.durationSeconds)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
