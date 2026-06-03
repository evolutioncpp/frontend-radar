import clsx from 'clsx';
import { Check, Copy, type LucideIcon } from 'lucide-react';

import { useClipboard } from '@/shared/lib/use-clipboard';

import s from './CopyButton.module.scss';

import type { ButtonHTMLAttributes } from 'react';

type CopyButtonValue = string | (() => string);

interface CopyButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children' | 'onClick' | 'value'
> {
  ariaLabel: string;
  value: CopyButtonValue;
  copiedTitle?: string;
  icon?: LucideIcon;
  copiedIcon?: LucideIcon;
  resetDelay?: number;
  title?: string;
  onCopied?: (value: string) => void;
  onCopyError?: (value: string) => void;
}

export const CopyButton = ({
  ariaLabel,
  className,
  copiedIcon: CopiedIcon = Check,
  copiedTitle = 'Copied',
  icon: Icon = Copy,
  onCopied,
  onCopyError,
  resetDelay,
  title = 'Copy',
  value,
  ...props
}: CopyButtonProps) => {
  const { copy, isCopied } = useClipboard({ resetDelay });
  const CurrentIcon = isCopied ? CopiedIcon : Icon;

  const handleClick = async () => {
    const valueToCopy = typeof value === 'function' ? value() : value;
    const isSuccess = await copy(valueToCopy);

    if (isSuccess) {
      onCopied?.(valueToCopy);
      return;
    }

    onCopyError?.(valueToCopy);
  };

  return (
    <button
      {...props}
      aria-label={ariaLabel}
      className={clsx(s.copyButton, isCopied && s.copyButtonCopied, className)}
      onClick={() => void handleClick()}
      title={isCopied ? copiedTitle : title}
      type="button"
    >
      <CurrentIcon aria-hidden="true" className={s.icon} strokeWidth={2} />
    </button>
  );
};
