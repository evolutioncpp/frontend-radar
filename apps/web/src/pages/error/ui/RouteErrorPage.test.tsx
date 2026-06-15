import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { AppRoutes } from '@/shared/config/routes/appRoutes';

import { RouteErrorPage } from './RouteErrorPage';

import type * as ReactRouterDom from 'react-router-dom';

type TranslationOptions = Record<string, string | number>;

interface RouteResponseError {
  status: number;
  statusText: string;
}

const routerMocks = vi.hoisted(() => ({
  isRouteErrorResponse: vi.fn(),
  useRouteError: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();

  return {
    ...actual,
    isRouteErrorResponse: routerMocks.isRouteErrorResponse,
    useRouteError: routerMocks.useRouteError,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: TranslationOptions) => {
      const translations: Record<string, string> = {
        title: 'Something went wrong',
        titleWithStatus: `Error ${options?.status}`,
        description:
          'The page could not be rendered. Try going back or returning to the home page.',
        descriptionWithStatus: `The route failed with: ${options?.statusText}.`,
        unknownStatus: 'Unknown error',
        goBack: 'Go back',
        goHome: 'Go home',
        details: 'Error details',
      };

      return translations[key] ?? key;
    },
  }),
}));

const renderRouteErrorPage = () => {
  return render(
    <MemoryRouter>
      <RouteErrorPage />
    </MemoryRouter>,
  );
};

describe('RouteErrorPage', () => {
  test('renders route response error', () => {
    const routeError: RouteResponseError = {
      status: 404,
      statusText: 'Not Found',
    };

    routerMocks.useRouteError.mockReturnValue(routeError);
    routerMocks.isRouteErrorResponse.mockReturnValue(true);

    renderRouteErrorPage();

    expect(screen.getByRole('heading', { name: 'Error 404' })).toBeInTheDocument();
    expect(screen.getByText('The route failed with: Not Found.')).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('renders generic route error', () => {
    routerMocks.useRouteError.mockReturnValue(new Error('Unexpected test error'));
    routerMocks.isRouteErrorResponse.mockReturnValue(false);

    renderRouteErrorPage();

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();

    expect(
      screen.getByText(
        'The page could not be rendered. Try going back or returning to the home page.',
      ),
    ).toBeInTheDocument();
  });

  test('renders navigation actions', () => {
    routerMocks.useRouteError.mockReturnValue(new Error('Unexpected test error'));
    routerMocks.isRouteErrorResponse.mockReturnValue(false);

    renderRouteErrorPage();

    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute(
      'href',
      AppRoutes.DASHBOARD,
    );
  });

  test('renders error details in dev mode', () => {
    routerMocks.useRouteError.mockReturnValue(new Error('Unexpected test error'));
    routerMocks.isRouteErrorResponse.mockReturnValue(false);

    renderRouteErrorPage();

    expect(screen.getByText('Error details')).toBeInTheDocument();
    expect(screen.getByText(/Unexpected test error/i)).toBeInTheDocument();
  });
});
