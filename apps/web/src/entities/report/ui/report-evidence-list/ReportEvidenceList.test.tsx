import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ReportEvidenceList } from './ReportEvidenceList';

import type { ReportEvidence } from '../../model/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'evidence.title': 'Evidence',
        'evidence.statuses.found': 'Found',
        'evidence.statuses.missing': 'Missing',
        'evidence.statuses.warning': 'Warning',
      };

      if (key === 'evidence.source') {
        return `Source: ${options?.source}`;
      }

      return translations[key] ?? key;
    },
  }),
}));

const evidence: ReportEvidence[] = [
  {
    id: 'readme',
    label: 'README',
    status: 'found',
    description: 'README file was found.',
    source: 'README',
  },
  {
    id: 'env-example',
    label: 'Environment example',
    status: 'missing',
    description: 'No environment example file was found.',
    source: '.env.example',
  },
  {
    id: 'storybook',
    label: 'Storybook',
    status: 'warning',
    description: 'Storybook is only partially configured.',
    source: '.storybook/main.ts',
  },
];

describe('ReportEvidenceList', () => {
  test('renders nothing for empty evidence', () => {
    const { container } = render(<ReportEvidenceList evidence={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('renders evidence disclosure with statuses and sources', () => {
    render(<ReportEvidenceList evidence={evidence} />);

    expect(screen.getByText('Evidence')).toBeInTheDocument();
    expect(screen.getByText('Found')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('README')).toBeInTheDocument();
    expect(screen.getByText('No environment example file was found.')).toBeInTheDocument();
    expect(screen.getByText('Source: .env.example')).toBeInTheDocument();
  });

  test('sorts evidence by missing, warning and found statuses', () => {
    render(<ReportEvidenceList evidence={evidence} />);

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Environment example');
    expect(items[1]).toHaveTextContent('Storybook');
    expect(items[2]).toHaveTextContent('README');
  });

  test('toggles evidence disclosure state', async () => {
    const user = userEvent.setup();

    render(<ReportEvidenceList evidence={evidence} />);

    const summary = screen.getByText('Evidence');
    const details = summary.closest('details');

    expect(details).not.toHaveAttribute('open');

    await user.click(summary);

    expect(details).toHaveAttribute('open');

    await user.click(summary);

    expect(details).not.toHaveAttribute('open');
  });
});
