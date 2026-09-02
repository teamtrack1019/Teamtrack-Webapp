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
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div>
        {/* Header: Title and Icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight">
            {title}
          </span>
          {Icon && (
            <div className={`p-2 rounded-xl border shrink-0 ${colorMap[color] || colorMap.sky}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </div>

        {/* Badge */}
        {badge && (
          <div className="mt-1.5">
            <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}
