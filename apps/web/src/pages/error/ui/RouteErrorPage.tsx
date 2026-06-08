import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router-dom';

import { AppRoutes } from '@/shared/config/routes/appRoutes';

import s from './RouteErrorPage.module.scss';

const getErrorDetails = (error: unknown) => {
  if (error == null) {
    return '';
  }

  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    const details = JSON.stringify(error, null, 2);

    return details === 'null' || details === 'undefined' ? '' : details;
  } catch {
    return '';
  }
};

export const RouteErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation('route-error');

  const isRouteError = isRouteErrorResponse(error);

  const statusCode = isRouteError ? error.status : undefined;

  const title = isRouteError ? t('titleWithStatus', { status: error.status }) : t('title');

  const description = isRouteError
    ? t('descriptionWithStatus', {
        statusText: error.statusText || t('unknownStatus'),
      })
    : t('description');

  const details = import.meta.env.DEV ? getErrorDetails(error) : '';

  const handleGoBack = () => {
    void navigate(-1);
  };

  return (
    <main className={s.routeErrorPage}>
      <section className={s.content} role="alert">
        <div className={s.hero}>
          <div className={s.iconWrapper}>
            <AlertTriangle aria-hidden="true" className={s.icon} strokeWidth={2} />
          </div>

          <div className={s.heroText}>
            <p className={s.eyebrow}>{t('eyebrow')}</p>

            {statusCode ? <p className={s.statusCode}>{statusCode}</p> : null}
          </div>
        </div>

        <div className={s.body}>
          <h1 className={s.title}>{title}</h1>
          <p className={s.description}>{description}</p>
        </div>

        <div className={s.actions}>
          <button className={s.primaryAction} onClick={handleGoBack} type="button">
            <ArrowLeft aria-hidden="true" className={s.actionIcon} strokeWidth={2} />
            {t('goBack')}
          </button>

          <Link className={s.secondaryAction} to={AppRoutes.HOME}>
            <Home aria-hidden="true" className={s.actionIcon} strokeWidth={2} />
            {t('goHome')}
          </Link>
        </div>

        {details ? (
          <details className={s.details}>
            <summary className={s.detailsSummary}>{t('details')}</summary>
            <pre className={s.detailsContent}>{details}</pre>
          </details>
        ) : null}
      </section>
    </main>
  );
};
