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
    sky: 'bg-sky-50 text-sky-600 border-sky-200/80',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/80',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/80',
    rose: 'bg-rose-50 text-rose-600 border-rose-200/80',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between min-h-[140px] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top row: Title + Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border shrink-0 ${colorMap[color] || colorMap.sky}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Middle: Big Value + Badge on separate clear line */}
      <div className="space-y-1 my-1">
        <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </div>
        {badge && (
          <div className="pt-1">
            <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Subtitle */}
      {subtitle && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
}
