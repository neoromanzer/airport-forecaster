export default function SliderControl({ label, value, min, max, step = 0.5, unit = '%', onChange, description, color = 'blue' }) {
  const colorMap = {
    blue: 'accent-blue-400',
    green: 'accent-green-400',
    purple: 'accent-purple-400',
    orange: 'accent-orange-400',
  };

  const textColorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400'}`}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      {description && (
        <p className="text-xs text-slate-500 mb-2">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 rounded-lg cursor-pointer bg-slate-700 ${colorMap[color]}`}
      />
      <div className="flex justify-between text-xs text-slate-600 mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
