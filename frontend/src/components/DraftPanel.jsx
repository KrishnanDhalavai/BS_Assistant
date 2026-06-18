import React from 'react';
import BrawlerDropdown from './BrawlerDropdown';

export default function DraftPanel({
  title,
  subtitle,
  brawlers,
  picks,
  onChangePick,
  disabledOptions,
  accentColor = 'cyan',
  icon
}) {
  return (
    <div className={`flex flex-col p-5 rounded-2xl glass-panel relative transition-all duration-300 ${
      accentColor === 'cyan' ? 'neon-cyan border-cyan-500/10' :
      accentColor === 'red' ? 'neon-red border-red-500/10' :
      'neon-purple border-amber-500/10'
    }`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`p-2.5 rounded-xl bg-gray-900/90 border transition-all duration-300 flex items-center justify-center ${
          accentColor === 'cyan' ? 'border-cyan-500/35 bg-cyan-950/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]' :
          accentColor === 'red' ? 'border-red-500/35 bg-red-950/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]' :
          'border-amber-500/35 bg-amber-950/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
        }`}>
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-gray-100">{title}</h2>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {picks.map((pick, index) => (
          <div key={index} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Slot {index + 1}
            </span>
            <BrawlerDropdown
              brawlers={brawlers}
              selected={pick}
              disabledOptions={disabledOptions}
              onChange={(name) => onChangePick(index, name)}
              accentColor={accentColor}
              placeholder={`Choose Brawler...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
