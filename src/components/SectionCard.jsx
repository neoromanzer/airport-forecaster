export default function SectionCard({ title, subtitle, icon, children, accentColor = 'blue' }) {
  const borderMap = {
    blue: 'border-blue-500/30',
    green: 'border-green-500/30',
    purple: 'border-purple-500/30',
    orange: 'border-orange-500/30',
  };

  const bgMap = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    purple: 'bg-purple-500/10',
    orange: 'bg-orange-500/10',
  };

  const textMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  return (
    <div className={`rounded-xl border ${borderMap[accentColor]} bg-slate-900/60 p-5`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg ${bgMap[accentColor]} flex items-center justify-center text-base`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${textMap[accentColor]} uppercase tracking-wider`}>{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
