import { Link as LinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useDemoReport } from '@/entities/report';
import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';
import { CopyButton } from '@/shared/ui/CopyButton';
import { ChecksList } from '@/widgets/checks-list';
import { HealthScorePanel } from '@/widgets/health-score-panel';
import { MetricsGrid } from '@/widgets/metrics-grid';
import { RecommendationsPanel } from '@/widgets/recommendations-panel';
import { RepositorySummary } from '@/widgets/repository-summary';

import s from './DashboardPage.module.scss';

const dashboardSectionIds = Object.values(DashboardSectionIds);
type DashboardSectionId = (typeof DashboardSectionIds)[keyof typeof DashboardSectionIds];

const sectionLabelKeys = {
  [DashboardSectionIds.REPOSITORY]: 'page.sections.repository',
  [DashboardSectionIds.HEALTH_SCORE]: 'page.sections.healthScore',
  [DashboardSectionIds.METRICS]: 'page.sections.metrics',
  [DashboardSectionIds.CHECKS]: 'page.sections.checks',
  [DashboardSectionIds.RECOMMENDATIONS]: 'page.sections.recommendations',
} as const satisfies Record<DashboardSectionId, string>;

const getSectionIdFromHash = (hash: string) => {
  return decodeURIComponent(hash.replace('#', ''));
};

const getSectionUrl = (sectionId: string) => {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#${sectionId}`;
};

export const DashboardPage = () => {
  const { hash } = useLocation();
  const { t } = useTranslation('dashboard');

  const report = useDemoReport();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const sectionId = getSectionIdFromHash(hash);

    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    });
  }, [hash]);

  useEffect(() => {
    let animationFrameId = 0;

    const getSectionElements = () => {
      return dashboardSectionIds
        .map((sectionId) => document.getElementById(sectionId))
        .filter((section): section is HTMLElement => Boolean(section));
    };

    const isSectionVisible = (section: HTMLElement) => {
      const rect = section.getBoundingClientRect();

      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const getActiveSectionHash = () => {
      const sections = getSectionElements();

      if (sections.length === 0) {
        return '';
      }

      if (window.scrollY <= 24) {
        return '';
      }

      const isPageBottom =
        Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;

      if (isPageBottom) {
        const visibleSections = sections.filter(isSectionVisible);
        const lastVisibleSection = visibleSections[visibleSections.length - 1];

        return lastVisibleSection ? `#${lastVisibleSection.id}` : '';
      }

      const activationOffset = 160;

      const crossedSections = sections.filter((section) => {
        const rect = section.getBoundingClientRect();

        return rect.top <= activationOffset;
      });

      const activeSection = crossedSections[crossedSections.length - 1];

      return activeSection ? `#${activeSection.id}` : '';
    };

    const updateHashFromScroll = () => {
      cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const nextHash = getActiveSectionHash();

        if (window.location.hash === nextHash) {
          return;
        }

        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}${nextHash}`,
        );
      });
    };

    const timeoutId = window.setTimeout(updateHashFromScroll, 150);

    window.addEventListener('scroll', updateHashFromScroll, { passive: true });
    window.addEventListener('resize', updateHashFromScroll);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', updateHashFromScroll);
      window.removeEventListener('resize', updateHashFromScroll);
    };
  }, []);

  const getCopySectionLabel = (sectionName: string) => {
    return t('page.copySectionLink', {
      section: sectionName,
    });
  };

  const renderSectionLinkButton = (sectionId: DashboardSectionId) => {
    const sectionName = t(sectionLabelKeys[sectionId]);

    return (
      <CopyButton
        ariaLabel={getCopySectionLabel(sectionName)}
        copiedTitle={t('page.copied')}
        icon={LinkIcon}
        title={t('page.copySectionTitle')}
        value={() => getSectionUrl(sectionId)}
      />
    );
  };

  return (
    <div className={s.dashboardPage}>
      <section className={s.header}>
        <p className={s.label}>{t('page.label')}</p>

        <h1 className={s.title}>{t('page.title')}</h1>

        <p className={s.description}>{t('page.description')}</p>
      </section>

      <section className={s.content} aria-label={t('page.reportAria')}>
        <section
          aria-label="Repository summary"
          className={s.section}
          id={DashboardSectionIds.REPOSITORY}
        >
          <RepositorySummary
            headerAction={renderSectionLinkButton(DashboardSectionIds.REPOSITORY)}
            repository={report.repository}
          />
        </section>

        <section
          aria-label={t('page.sections.healthScore')}
          className={s.section}
          id={DashboardSectionIds.HEALTH_SCORE}
        >
          <HealthScorePanel
            headerAction={renderSectionLinkButton(DashboardSectionIds.HEALTH_SCORE)}
            score={report.totalScore}
          />
        </section>

        <section
          aria-label={t('page.sections.metrics')}
          className={s.section}
          id={DashboardSectionIds.METRICS}
        >
          <MetricsGrid
            headerAction={renderSectionLinkButton(DashboardSectionIds.METRICS)}
            metrics={report.scoreBreakdown}
          />
        </section>

        <div className={s.detailsGrid}>
          <section
            aria-label={t('page.sections.checks')}
            className={`${s.section} ${s.detailsSection}`}
            id={DashboardSectionIds.CHECKS}
          >
            <ChecksList
              checks={report.checks}
              className={s.detailsCard}
              headerAction={renderSectionLinkButton(DashboardSectionIds.CHECKS)}
            />
          </section>

          <section
            aria-label={t('page.sections.recommendations')}
            className={`${s.section} ${s.detailsSection}`}
            id={DashboardSectionIds.RECOMMENDATIONS}
          >
            <RecommendationsPanel
              className={s.detailsCard}
              headerAction={renderSectionLinkButton(DashboardSectionIds.RECOMMENDATIONS)}
              recommendations={report.recommendations}
            />
          </section>
        </div>
      </section>
    </div>
  );
};
