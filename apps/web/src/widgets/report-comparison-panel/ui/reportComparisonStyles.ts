import s from './ReportComparisonPanel.module.scss';

import type { Tone } from '../model/reportComparisonViewModel';

export const toneClassNames = {
  mixed: s.toneMixed,
  negative: s.toneNegative,
  neutral: s.toneNeutral,
  positive: s.tonePositive,
} as const satisfies Record<Tone, string>;

export const deltaToneClassNames = {
  mixed: s.deltaNeutral,
  negative: s.deltaNegative,
  neutral: s.deltaNeutral,
  positive: s.deltaPositive,
} as const satisfies Record<Tone, string>;
