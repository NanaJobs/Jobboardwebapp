import React from 'react';
import { Check, X } from 'lucide-react';

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePassword(password: string): {
  score: number;
  label: string;
  color: string;
  barColor: string;
  criteria: PasswordCriteria;
} {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
  };

  let score = 0;
  if (criteria.minLength) score += 1;
  if (criteria.hasUpper && criteria.hasLower) score += 1;
  if (criteria.hasNumber) score += 1;
  if (criteria.hasSpecial) score += 1;

  if (score <= 1) {
    return { score, label: 'Weak', color: 'text-rose-600', barColor: 'bg-rose-500', criteria };
  } else if (score === 2) {
    return { score, label: 'Fair', color: 'text-amber-600', barColor: 'bg-amber-500', criteria };
  } else if (score === 3) {
    return { score, label: 'Good', color: 'text-blue-600', barColor: 'bg-blue-500', criteria };
  } else {
    return { score, label: 'Strong', color: 'text-emerald-600', barColor: 'bg-emerald-500', criteria };
  }
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, color, barColor, criteria } = evaluatePassword(password);

  return (
    <div className="mt-2.5 space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
      {/* Strength Level Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Password Strength
        </span>
        <span className={`text-xs font-bold ${color}`}>{label}</span>
      </div>

      <div className="flex gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 rounded-full transition-all duration-300 ${
              score >= step ? barColor : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Live Requirement Checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px] text-slate-500">
        <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-700 font-semibold' : ''}`}>
          {criteria.minLength ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasUpper && criteria.hasLower ? 'text-emerald-700 font-semibold' : ''}`}>
          {criteria.hasUpper && criteria.hasLower ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
          <span>Upper & lowercase</span>
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
          {criteria.hasNumber ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
          <span>At least 1 number</span>
        </div>
        <div className={`flex items-center gap-1.5 ${criteria.hasSpecial ? 'text-emerald-700 font-semibold' : ''}`}>
          {criteria.hasSpecial ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-slate-400" />}
          <span>1 symbol (!@#$...)</span>
        </div>
      </div>
    </div>
  );
}
