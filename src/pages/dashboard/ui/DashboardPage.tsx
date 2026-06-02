import { demoReport } from '@/entities/report';
import { ChecksList } from '@/widgets/checks-list';
import { HealthScorePanel } from '@/widgets/health-score-panel';
import { MetricsGrid } from '@/widgets/metrics-grid';
import { RecommendationsPanel } from '@/widgets/recommendations-panel';
import { RepositorySummary } from '@/widgets/repository-summary';

import s from './DashboardPage.module.scss';

export const DashboardPage = () => {
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

      <section className={s.content} aria-label="Dashboard report">
        <RepositorySummary repository={demoReport.repository} />

        <HealthScorePanel score={demoReport.totalScore} />

        <MetricsGrid metrics={demoReport.scoreBreakdown} />

        <div className={s.detailsGrid}>
          <ChecksList checks={demoReport.checks} />

          <RecommendationsPanel recommendations={demoReport.recommendations} />
        </div>
      </section>
    </div>
  );
};
