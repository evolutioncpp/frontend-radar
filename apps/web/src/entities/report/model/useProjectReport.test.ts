import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { DEMO_REPORT_ID } from '@/shared/config/routes/appRoutes';

import { useProjectReport } from './useProjectReport';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useProjectReport', () => {
  test('returns demo report for demo id', () => {
    const { result } = renderHook(() => useProjectReport(DEMO_REPORT_ID));

    expect(result.current.status).toBe('ready');

    if (result.current.status === 'ready') {
      expect(result.current.report.repository.owner).toBe('evolutioncpp');
      expect(result.current.report.repository.name).toBe('frontend-radar');
    }
  });

  test.each([undefined, '', 'unknown'])('returns notFound for %s report id', (reportId) => {
    const { result } = renderHook(() => useProjectReport(reportId));

    expect(result.current).toEqual({
      status: 'notFound',
    });
  });
});
