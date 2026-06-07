import { useTranslation } from 'react-i18next';

import { Card } from '@/shared/ui/Card';

import { analysisInfoSteps } from '../../model/analysisInfoSteps';
import s from '../DashboardPage.module.scss';

export const DashboardAnalysisInfo = () => {
  const { t } = useTranslation('dashboard');

  return (
    <Card className={s.analysisInfoCard}>
      <div className={s.analysisInfoHeader}>
        <h2 className={s.analysisInfoTitle}>{t('page.analysisInfo.title')}</h2>
        <p className={s.analysisInfoDescription}>{t('page.analysisInfo.description')}</p>
      </div>

      <ol className={s.analysisSteps}>
        {analysisInfoSteps.map((item, index) => (
          <li className={s.analysisStep} key={item.titleKey}>
            <span className={s.analysisStepNumber}>{String(index + 1).padStart(2, '0')}</span>

            <div className={s.analysisStepText}>
              <h3 className={s.analysisStepTitle}>{t(item.titleKey)}</h3>
              <p className={s.analysisStepDescription}>{t(item.descriptionKey)}</p>
            </div>

            <div className={s.analysisStepDetails}>
              <p className={s.analysisStepDetailsTitle}>{t(item.detailTitleKey)}</p>

              <ul className={s.analysisStepDetailsList}>
                {item.detailItemKeys.map((detailItemKey) => (
                  <li className={s.analysisStepDetailsItem} key={detailItemKey}>
                    {t(detailItemKey)}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
};
