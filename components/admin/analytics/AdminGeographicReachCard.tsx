'use client';

import React, { useState, useEffect } from 'react';
import { Globe2, RefreshCw, Loader2 } from 'lucide-react';
import { getAdminAnalyticsGeographic } from '@/lib/api/admin';

export const AdminGeographicReachCard: React.FC = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGeographic = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminAnalyticsGeographic();
      setCountries(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load geographic reach:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGeographic();
  }, []);

  return (
    <div className="rounded-[28px] border border-borderLight bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-brand" />
          <div>
            <h3 className="text-base font-black text-textPrimary">6. Global Geographic Reach & Visitor Traffic</h3>
            <p className="text-xs text-textMuted">Student registration footprint across international markets</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-textMuted bg-bgSoft px-2.5 py-1 rounded-xl border border-borderLight">
            {countries.length} Countries
          </span>
          <button
            onClick={() => fetchGeographic(true)}
            disabled={refreshing || loading}
            className="p-2 rounded-xl border border-borderLight hover:bg-bgSoft text-textMuted hover:text-brand transition cursor-pointer disabled:opacity-50"
            title="Refresh Geographic Reach"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-textMuted">
          <Loader2 className="h-6 w-6 animate-spin text-brand mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading global reach...</span>
        </div>
      ) : countries.length === 0 ? (
        <div className="p-8 text-center text-textMuted text-xs font-bold">
          No international student registrations recorded yet.
        </div>
      ) : (
        /* Scrollable container showing 6 items before scrolling */
        <div className="space-y-3 pt-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {countries.map((geo: any, idx: number) => {
            const cleanPct = Math.min(100, Math.max(0, Number(geo.sharePct) || 0));
            return (
              <div key={idx} className="space-y-1.5 p-2 rounded-xl hover:bg-bgSoft/50 transition">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-textPrimary flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-bgSoft px-1.5 py-0.5 rounded border border-borderLight font-extrabold text-brand">
                      {geo.isoCode || 'GL'}
                    </span>
                    <span>{geo.countryName}</span>
                  </span>
                  <span className="text-textMuted font-bold">
                    {geo.studentCount} students ({cleanPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-bgSoft overflow-hidden border border-borderLight/60">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(cleanPct, cleanPct > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
