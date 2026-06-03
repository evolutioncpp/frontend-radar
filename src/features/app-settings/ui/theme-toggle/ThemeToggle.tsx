import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';

import { selectAppTheme, toggleTheme } from '@/features/app-settings';
import { useAppDispatch, useAppSelector } from '@/shared/lib/redux/hooks';

import s from './ThemeToggle.module.scss';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectAppTheme);

  const isDarkTheme = theme === 'dark';
  const Icon = isDarkTheme ? Sun : Moon;

  const handleClick = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      className={clsx(s.themeToggle, className)}
      onClick={handleClick}
      title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      type="button"
    >
      <Icon aria-hidden="true" className={s.icon} strokeWidth={2} />
    </button>
  );
};
