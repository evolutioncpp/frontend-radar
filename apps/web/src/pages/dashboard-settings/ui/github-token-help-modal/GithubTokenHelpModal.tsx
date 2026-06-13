import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

import s from './GithubTokenHelpModal.module.scss';
import {
  githubTokenHelpPermissionTranslationKeys,
  githubTokenHelpStepTranslationKeys,
  githubTokenSettingsUrl,
} from '../../model/githubTokenSettings';

interface GithubTokenHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubTokenHelpModal = ({ isOpen, onClose }: GithubTokenHelpModalProps) => {
  const { t } = useTranslation('settings');

  return (
    <Modal
      closeLabel={t('githubAccess.help.close')}
      description={t('githubAccess.help.description')}
      footer={
        <>
          <a
            className={s.externalLink}
            href={githubTokenSettingsUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" />
            {t('githubAccess.help.openGithub')}
          </a>
          <Button onClick={onClose} type="button" variant="secondary">
            {t('githubAccess.help.close')}
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      title={t('githubAccess.help.title')}
    >
      <div className={s.content}>
        <section className={s.section}>
          <h3 className={s.sectionTitle}>{t('githubAccess.help.steps.title')}</h3>
          <ol className={s.steps}>
            {githubTokenHelpStepTranslationKeys.map((stepKey) => (
              <li key={stepKey}>{t(`githubAccess.help.steps.${stepKey}`)}</li>
            ))}
          </ol>
        </section>

        <section className={s.section}>
          <h3 className={s.sectionTitle}>{t('githubAccess.help.permissions.title')}</h3>
          <ul className={s.permissionList}>
            {githubTokenHelpPermissionTranslationKeys.map((permissionKey) => (
              <li key={permissionKey}>
                <strong>{t(`githubAccess.help.permissions.${permissionKey}.title`)}</strong>
                <span>{t(`githubAccess.help.permissions.${permissionKey}.description`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <h3 className={s.sectionTitle}>{t('githubAccess.help.storage.title')}</h3>
          <p className={s.text}>{t('githubAccess.help.storage.description')}</p>
        </section>
      </div>
    </Modal>
  );
};
