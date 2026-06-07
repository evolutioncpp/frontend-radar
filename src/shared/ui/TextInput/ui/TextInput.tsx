import clsx from 'clsx';
import { X } from 'lucide-react';
import { forwardRef, useId } from 'react';

import s from './TextInput.module.scss';

import type { InputHTMLAttributes, ReactNode } from 'react';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  id?: string;
  error?: string;
  hint?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  clearButtonLabel?: string;
  inputRowClassName?: string;
  wrapperClassName?: string;
  onClear?: () => void;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      clearButtonLabel = 'Clear',
      error,
      hint,
      id,
      inputRowClassName,
      label,
      leftIcon,
      onClear,
      rightIcon,
      value,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const descriptionIds = [ariaDescribedBy, hint ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ');
    const hasValue = typeof value === 'string' ? value.length > 0 : Boolean(value);
    const isClearButtonVisible = Boolean(onClear) && hasValue && !props.disabled && !props.readOnly;

    return (
      <div className={clsx(s.textInput, wrapperClassName)}>
        <label className={s.label} htmlFor={inputId}>
          {label}
        </label>

        <div
          className={clsx(
            s.control,
            leftIcon && s.controlWithLeftIcon,
            (rightIcon || isClearButtonVisible) && s.controlWithRightAction,
            error && s.controlInvalid,
            inputRowClassName,
          )}
        >
          {leftIcon ? <span className={clsx(s.icon, s.leftIcon)}>{leftIcon}</span> : null}

          <input
            aria-describedby={descriptionIds || undefined}
            aria-invalid={error ? true : undefined}
            className={clsx(s.input, className)}
            id={inputId}
            ref={ref}
            value={value}
            {...props}
          />

          {isClearButtonVisible ? (
            <button
              aria-label={clearButtonLabel}
              className={s.clearButton}
              onClick={onClear}
              type="button"
            >
              <X aria-hidden="true" className={s.clearIcon} strokeWidth={2} />
            </button>
          ) : rightIcon ? (
            <span className={clsx(s.icon, s.rightIcon)}>{rightIcon}</span>
          ) : null}
        </div>

        {hint ? (
          <p className={s.hint} id={hintId}>
            {hint}
          </p>
        ) : null}

        {error ? (
          <p className={s.error} id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';
