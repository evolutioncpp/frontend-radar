import clsx from 'clsx';
import { Check } from 'lucide-react';
import { forwardRef, useId } from 'react';

import s from './Checkbox.module.scss';

import type { InputHTMLAttributes, ReactNode } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: ReactNode;
  id?: string;
  hint?: ReactNode;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      hint,
      id,
      label,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const hintId = `${inputId}-hint`;
    const descriptionIds = [ariaDescribedBy, hint ? hintId : null].filter(Boolean).join(' ');
    const labelledByIds = [ariaLabelledBy, labelId].filter(Boolean).join(' ');

    return (
      <label className={clsx(s.checkbox, wrapperClassName)} htmlFor={inputId}>
        <input
          aria-describedby={descriptionIds || undefined}
          aria-labelledby={labelledByIds || undefined}
          className={clsx(s.input, className)}
          id={inputId}
          ref={ref}
          type="checkbox"
          {...props}
        />
        <Check aria-hidden="true" className={s.icon} strokeWidth={3} />
        <span className={s.content}>
          <span className={s.label} id={labelId}>
            {label}
          </span>
          {hint ? (
            <span className={s.hint} id={hintId}>
              {hint}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
