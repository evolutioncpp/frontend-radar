import { CheckCircle2, HelpCircle, KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import GithubIcon from '@/shared/assets/icons/GitHub_Invertocat_Black.svg?react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { TextInput } from '@/shared/ui/TextInput';

import s from './GithubTokenSettingsSection.module.scss';
import { useGithubTokenSettings } from '../../model/useGithubTokenSettings';
import { GithubTokenHelpModal } from '../github-token-help-modal/GithubTokenHelpModal';

export const GithubTokenSettingsSection = () => {
  const { t } = useTranslation('settings');
  const [isGithubTokenHelpOpen, setIsGithubTokenHelpOpen] = useState(false);
  const {
    clearSavedGithubToken,
    githubTokenInput,
    isTokenSaved,
    isTokenValidationLoading,
    maskedGithubToken,
    setGithubTokenValue,
    validateAndSaveGithubToken,
    validationError,
    validationState,
  } = useGithubTokenSettings();

  return (
    <>
      <Card className={s.section} variant="flat">
        <div className={s.sectionHeader}>
          <div className={s.sectionHeaderMain}>
            <span className={s.sectionIcon} aria-hidden="true">
              <GithubIcon />
            </span>
            <div>
              <h2 className={s.sectionTitle}>{t('githubAccess.title')}</h2>
              <p className={s.sectionDescription}>{t('githubAccess.description')}</p>
            </div>
          </div>

          <Button
            className={s.helpButton}
            onClick={() => setIsGithubTokenHelpOpen(true)}
            type="button"
            variant="secondary"
          >
            <HelpCircle aria-hidden="true" />
            {t('githubAccess.actions.help')}
          </Button>
        </div>

        <div className={s.tokenStatus} data-state={isTokenSaved ? 'saved' : 'empty'}>
          <span className={s.tokenStatusIcon} aria-hidden="true">
            <CheckCircle2 />
          </span>
          <div>
            <p className={s.tokenStatusTitle}>
              {isTokenSaved ? t('githubAccess.saved.title') : t('githubAccess.empty.title')}
            </p>
            <p className={s.tokenStatusDescription}>
              {isTokenSaved
                ? t('githubAccess.saved.description', { token: maskedGithubToken })
                : t('githubAccess.empty.description')}
            </p>
          </div>
        </div>

        <form
          className={s.form}
          onSubmit={(event) => {
            event.preventDefault();
            void validateAndSaveGithubToken();
          }}
        >
          <TextInput
            autoComplete="off"
            error={validationState === 'invalid' ? (validationError ?? undefined) : undefined}
            hint={t('githubAccess.token.hint')}
            label={t('githubAccess.token.label')}
            leftIcon={<KeyRound aria-hidden="true" />}
            onChange={(event) => setGithubTokenValue(event.target.value)}
            placeholder={t('githubAccess.token.placeholder')}
            type="password"
            value={githubTokenInput}
          />

          <div className={s.actions}>
            <Button disabled={isTokenValidationLoading} type="submit">
              {isTokenValidationLoading
                ? t('githubAccess.actions.checking')
                : t('githubAccess.actions.validateAndSave')}
            </Button>
            <Button
              disabled={!isTokenSaved}
              onClick={clearSavedGithubToken}
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" />
              {t('githubAccess.actions.remove')}
            </Button>
          </div>

          {validationState === 'success' ? (
            <p className={s.validationSuccess}>{t('githubAccess.validation.success')}</p>
          ) : validationState === 'error' && validationError ? (
            <p className={s.validationError}>{validationError}</p>
          ) : null}
        </form>
      </Card>

      <GithubTokenHelpModal
        isOpen={isGithubTokenHelpOpen}
        onClose={() => setIsGithubTokenHelpOpen(false)}
      />
    </>
  );
};
