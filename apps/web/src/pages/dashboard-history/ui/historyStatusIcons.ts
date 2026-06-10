import { CircleCheck, CircleX, Clock3, LoaderCircle, type LucideIcon } from 'lucide-react';

import type { ReportAnalysisStatus } from '@/entities/report';

export const historyStatusIconMap = {
  completed: CircleCheck,
  failed: CircleX,
  queued: Clock3,
  running: LoaderCircle,
} as const satisfies Record<ReportAnalysisStatus, LucideIcon>;
