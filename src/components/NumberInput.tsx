import { HelpTooltip } from './HelpTooltip';

type Props = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  help?: string;
  allowNegative?: boolean;
};

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  prefix,
  help,
  allowNegative = false,
}: Props) {
  return (
    <div>
      <label className="label-base">
        <span>{label}</span>
        {help && <HelpTooltip text={help} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none font-mono">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(0);
              return;
            }
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            const clampedNeg = !allowNegative && n < 0 ? 0 : n;
            const clampedMin = min !== undefined && clampedNeg < min ? min : clampedNeg;
            const clampedMax = max !== undefined && clampedMin > max ? max : clampedMin;
            onChange(clampedMax);
          }}
          className={`input-base ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none font-mono">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

type SliderProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  help?: string;
};

export function SliderInput({ label, value, onChange, min, max, step = 1, suffix, help }: SliderProps) {
  return (
    <div>
      <label className="label-base justify-between">
        <span className="flex items-center gap-1.5">
          <span>{label}</span>
          {help && <HelpTooltip text={help} />}
        </span>
        <span className="num text-gold-soft text-sm">
          {value}
          {suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full bg-bg-muted appearance-none cursor-pointer accent-gold"
      />
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
