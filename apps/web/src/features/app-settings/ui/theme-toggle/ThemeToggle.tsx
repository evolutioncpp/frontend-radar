import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { selectAppTheme, toggleTheme } from '@/features/app-settings';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';

import s from './ThemeToggle.module.scss';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectAppTheme);

  const isDarkTheme = theme === 'dark';
  const Icon = isDarkTheme ? Sun : Moon;
  const label = isDarkTheme ? t('actions.switchToLightTheme') : t('actions.switchToDarkTheme');

  const handleClick = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      aria-label={label}
      className={clsx(s.themeToggle, className)}
      onClick={handleClick}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" className={s.icon} strokeWidth={2} />
    </button>
  );
};
