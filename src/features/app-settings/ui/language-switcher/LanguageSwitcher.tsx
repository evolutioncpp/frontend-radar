import clsx from 'clsx';
import { Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { selectAppLanguage, setLanguage } from '@/features/app-settings';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';
import { Dropdown } from '@/shared/ui/Dropdown';

import s from './LanguageSwitcher.module.scss';

import type { AppLanguage } from '@/features/app-settings';

type LanguageSwitcherVariant = 'sidebar' | 'icon';

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
  isCollapsed?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const languageOptions: AppLanguage[] = ['en', 'ru'];

const languageLabelKeys = {
  en: 'common.languages.en',
  ru: 'common.languages.ru',
} as const satisfies Record<AppLanguage, 'common.languages.en' | 'common.languages.ru'>;

export const LanguageSwitcher = ({
  align = 'center',
  className,
  isCollapsed = false,
  side = 'right',
  variant = 'sidebar',
}: LanguageSwitcherProps) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectAppLanguage);

  const selectLanguage = (nextLanguage: AppLanguage) => {
    dispatch(setLanguage(nextLanguage));
  };

  const isSidebarVariant = variant === 'sidebar';

  return (
    <Dropdown
      align={align}
      className={clsx(
        s.languageSwitcher,
        isSidebarVariant && s.languageSwitcherSidebar,
        isCollapsed && s.languageSwitcherCollapsed,
        className,
      )}
      contentClassName={s.dropdown}
      side={side}
      trigger={
        <>
          <Globe aria-hidden="true" className={s.icon} strokeWidth={2} />

          {isSidebarVariant ? (
            <span aria-hidden="true" className={s.text}>
              {t('common.language')}
            </span>
          ) : null}

          <span className={s.screenReaderText}>{t('actions.switchLanguage')}</span>
        </>
      }
      triggerClassName={clsx(
        s.trigger,
        isSidebarVariant ? s.triggerSidebar : s.triggerIcon,
        isCollapsed && s.triggerCollapsed,
      )}
    >
      {({ close }) => (
        <div className={s.options}>
          {languageOptions.map((option) => {
            const isSelected = option === language;

            return (
              <button
                aria-checked={isSelected}
                className={clsx(s.option, isSelected && s.optionSelected)}
                key={option}
                onClick={() => {
                  selectLanguage(option);
                  close();
                }}
                role="menuitemradio"
                type="button"
              >
                <span>{t(languageLabelKeys[option])}</span>

                {isSelected ? (
                  <Check aria-hidden="true" className={s.optionIcon} strokeWidth={2} />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </Dropdown>
  );
};
