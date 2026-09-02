import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'sky', 
  badge,
  badgeColor = 'bg-slate-100 text-slate-700',
  onClick 
}) {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top row: Title + Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border shrink-0 ${colorMap[color] || colorMap.sky}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Middle: Big Value + Badge */}
      <div className="space-y-1.5 my-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Subtitle */}
      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 truncate pt-2 border-t border-slate-100">
          {subtitle}
        </p>
      )}
    </div>
  );
}
