import { Link as LinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { demoReport } from '@/entities/report';
import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';
import { CopyButton } from '@/shared/ui/CopyButton';
import { ChecksList } from '@/widgets/checks-list';
import { HealthScorePanel } from '@/widgets/health-score-panel';
import { MetricsGrid } from '@/widgets/metrics-grid';
import { RecommendationsPanel } from '@/widgets/recommendations-panel';
import { RepositorySummary } from '@/widgets/repository-summary';

import s from './DashboardPage.module.scss';

const dashboardSectionLabels: Record<string, string> = {
  [DashboardSectionIds.REPOSITORY]: 'Repository summary',
  [DashboardSectionIds.HEALTH_SCORE]: 'Health score',
  [DashboardSectionIds.METRICS]: 'Quality metrics',
  [DashboardSectionIds.CHECKS]: 'Project checks',
  [DashboardSectionIds.RECOMMENDATIONS]: 'Recommendations',
};

const dashboardSectionIds = Object.values(DashboardSectionIds);

const getSectionIdFromHash = (hash: string) => {
  return decodeURIComponent(hash.replace('#', ''));
};

const getSectionUrl = (sectionId: string) => {
  return `${window.location.origin}${window.location.pathname}${window.location.search}#${sectionId}`;
};

const replaceSectionHash = (sectionId: string) => {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#${sectionId}`,
  );
};

export const DashboardPage = () => {
  const { hash } = useLocation();

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

  const renderSectionLinkButton = (sectionId: string) => {
    const sectionLabel = dashboardSectionLabels[sectionId];

    return (
      <CopyButton
        ariaLabel={`Copy link to ${sectionLabel} section`}
        copiedTitle="Copied"
        icon={LinkIcon}
        onCopied={() => replaceSectionHash(sectionId)}
        title="Copy section link"
        value={() => getSectionUrl(sectionId)}
      />
    );
  };

  return (
    <div className={s.dashboardPage}>
      <section className={s.header}>
        <p className={s.label}>Demo report</p>

        <h1 className={s.title}>Frontend project health overview</h1>

        <p className={s.description}>
          Analyze repository quality, tooling, testing, documentation and delivery readiness in a
          single dashboard.
        </p>
      </section>

      <section aria-label="Dashboard report" className={s.content}>
        <section
          aria-label="Repository summary"
          className={s.section}
          id={DashboardSectionIds.REPOSITORY}
        >
          <RepositorySummary
            headerAction={renderSectionLinkButton(DashboardSectionIds.REPOSITORY)}
            repository={demoReport.repository}
          />
        </section>

        <section
          aria-label="Health score"
          className={s.section}
          id={DashboardSectionIds.HEALTH_SCORE}
        >
          <HealthScorePanel
            headerAction={renderSectionLinkButton(DashboardSectionIds.HEALTH_SCORE)}
            score={demoReport.totalScore}
          />
        </section>

        <section
          aria-label="Quality metrics"
          className={s.section}
          id={DashboardSectionIds.METRICS}
        >
          <MetricsGrid
            headerAction={renderSectionLinkButton(DashboardSectionIds.METRICS)}
            metrics={demoReport.scoreBreakdown}
          />
        </section>

        <div className={s.detailsGrid}>
          <section
            aria-label="Project checks"
            className={`${s.section} ${s.detailsSection}`}
            id={DashboardSectionIds.CHECKS}
          >
            <ChecksList
              checks={demoReport.checks}
              className={s.detailsCard}
              headerAction={renderSectionLinkButton(DashboardSectionIds.CHECKS)}
            />
          </section>

          <section
            aria-label="Recommendations"
            className={`${s.section} ${s.detailsSection}`}
            id={DashboardSectionIds.RECOMMENDATIONS}
          >
            <RecommendationsPanel
              className={s.detailsCard}
              headerAction={renderSectionLinkButton(DashboardSectionIds.RECOMMENDATIONS)}
              recommendations={demoReport.recommendations}
            />
          </section>
        </div>
      </section>
    </div>
  );
};
