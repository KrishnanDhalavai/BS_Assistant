import React from 'react';

export default function Recommendations({ recommendations = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl glass-panel border border-indigo-500/10 min-h-[280px]">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-bold tracking-wider uppercase">Calculating Counter Picks...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl glass-panel border border-gray-850 text-center min-h-[280px]">
        <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 mb-4 shadow-inner">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-300 mb-1">No Recommendations Generated</h3>
        <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed font-medium">
          Select enemy/ally brawlers or configure bans and click <strong className="text-gray-400 font-semibold">Generate Recommendations</strong>.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(...recommendations.map(r => r.score), 1);

  return (
    <div className="flex flex-col p-6 rounded-2xl glass-panel border border-indigo-500/10 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5 border-b border-gray-850 pb-4">
        <div>
          <h2 className="text-base font-extrabold uppercase tracking-wider text-gray-100 glow-text-purple">Recommended Picks</h2>
          <p className="text-[11px] text-gray-400 font-medium">Optimal counters adjusted for bans and synergies</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_8px_rgba(99,102,241,0.1)]">
          Draft Choices
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((item, index) => {
          const rank = index + 1;
          const scorePercent = Math.min((item.score / maxScore) * 100, 100);
          
          // Podiums styling
          const rankStyles = {
            1: 'from-amber-400 to-amber-500 text-amber-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.25)]',
            2: 'from-slate-300 to-slate-400 text-slate-950 font-black shadow-[0_0_12px_rgba(148,163,184,0.2)]',
            3: 'from-amber-600 to-amber-700 text-amber-50 font-black shadow-[0_0_12px_rgba(180,83,9,0.15)]'
          };

          const rankBadge = rankStyles[rank] || 'bg-gray-800 border border-gray-750 text-gray-300';

          return (
            <div 
              key={item.name} 
              className="flex items-start gap-4 p-3.5 rounded-xl bg-gray-900/20 border border-gray-850 hover:border-gray-800 transition-all duration-200 group"
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-7.5 h-7.5 rounded-lg text-xs bg-gradient-to-br ${rankBadge}`}>
                {rank}
              </div>

              {/* Data */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <h3 className="font-bold text-sm text-gray-200 group-hover:text-indigo-300 transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score:</span>
                    <span className="text-xs font-black text-indigo-400">{item.score}</span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full h-1 bg-gray-950 rounded-full overflow-hidden mb-2.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 rounded-full transition-all duration-355 ease-out"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                {/* Reasons List */}
                <div className="flex flex-wrap gap-1">
                  {item.reasons.map((reason, idx) => {
                    const isSynergy = reason.toLowerCase().includes('synergy');
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                          isSynergy 
                            ? 'bg-cyan-500/5 border-cyan-500/15 text-cyan-400' 
                            : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {reason}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
