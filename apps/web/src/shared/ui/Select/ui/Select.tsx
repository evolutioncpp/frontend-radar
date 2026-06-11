import clsx from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';
import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';

import s from './Select.module.scss';

import type { FocusEventHandler, KeyboardEvent, ReactNode } from 'react';

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'false' | 'true';
  className?: string;
  disabled?: boolean;
  error?: string;
  hint?: ReactNode;
  name?: string;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onOpen?: () => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptySearchMessage?: string;
  value?: string | readonly string[] | number;
  wrapperClassName?: string;
}

const getEnabledOptionIndex = (options: SelectOption[], value: string) => {
  const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return options.findIndex((option) => !option.disabled);
};

export const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      className,
      disabled = false,
      error,
      hint,
      id,
      label,
      name,
      onBlur,
      onOpen,
      onValueChange,
      options,
      placeholder,
      required,
      emptyMessage,
      searchable = false,
      searchPlaceholder,
      emptySearchMessage,
      value,
      wrapperClassName,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const buttonId = `${selectId}-button`;
    const labelId = `${selectId}-label`;
    const listboxId = `${selectId}-listbox`;
    const hintId = `${selectId}-hint`;
    const errorId = `${selectId}-error`;
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const normalizedValue = typeof value === 'string' ? value : '';
    const selectedOption = options.find((option) => option.value === normalizedValue);
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredOptions = useMemo(
      () =>
        normalizedSearchQuery
          ? options.filter(
              (option) =>
                option.label.toLowerCase().includes(normalizedSearchQuery) ||
                option.value.toLowerCase().includes(normalizedSearchQuery),
            )
          : options,
      [normalizedSearchQuery, options],
    );
    const [activeIndex, setActiveIndex] = useState(() =>
      getEnabledOptionIndex(filteredOptions, normalizedValue),
    );
    const descriptionIds = [ariaDescribedBy, hint ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ');
    const activeOptionId =
      isOpen && activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined;
    const visibleValue = selectedOption?.label ?? placeholder ?? '';
    const isPlaceholderShown = !selectedOption;
    const resolvedSearchPlaceholder = searchPlaceholder ?? label;
    const hasOptions = filteredOptions.length > 0;
    const listboxOptions = useMemo(
      () =>
        hasOptions
          ? filteredOptions
          : [
              {
                disabled: true,
                label: normalizedSearchQuery
                  ? (emptySearchMessage ?? '')
                  : (emptyMessage ?? placeholder ?? ''),
                value: '__empty',
              },
            ],
      [
        emptyMessage,
        emptySearchMessage,
        filteredOptions,
        hasOptions,
        normalizedSearchQuery,
        placeholder,
      ],
    );

    useEffect(() => {
      setActiveIndex(getEnabledOptionIndex(filteredOptions, normalizedValue));
    }, [filteredOptions, normalizedValue]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (!wrapperRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('pointerdown', handlePointerDown);

      return () => {
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen]);

    useEffect(() => {
      if (isOpen && searchable) {
        searchInputRef.current?.focus();
      }
    }, [isOpen, searchable]);

    useEffect(() => {
      if (!isOpen || activeIndex < 0) {
        return;
      }

      optionRefs.current[activeIndex]?.scrollIntoView?.({
        block: 'nearest',
      });
    }, [activeIndex, isOpen]);

    const openList = () => {
      if (disabled) {
        return;
      }

      onOpen?.();
      setIsOpen(true);
    };

    const closeList = () => {
      setIsOpen(false);
      setSearchQuery('');
    };

    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) {
        return;
      }

      onValueChange?.(option.value);
      closeList();
    };

    const moveActiveOption = (direction: 1 | -1) => {
      if (!filteredOptions.some((option) => !option.disabled)) {
        return;
      }

      setActiveIndex((currentIndex) => {
        let nextIndex = currentIndex;

        for (let step = 0; step < filteredOptions.length; step += 1) {
          nextIndex = (nextIndex + direction + filteredOptions.length) % filteredOptions.length;

          if (!filteredOptions[nextIndex]?.disabled) {
            return nextIndex;
          }
        }

        return currentIndex;
      });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();

        if (!isOpen) {
          openList();
          return;
        }

        moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (!isOpen) {
          openList();
          return;
        }

        const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : null;

        if (activeOption) {
          handleOptionSelect(activeOption);
        }

        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeList();
      }
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : null;

        if (activeOption) {
          handleOptionSelect(activeOption);
        }

        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeList();
      }
    };

    return (
      <div className={clsx(s.selectField, wrapperClassName)} ref={wrapperRef}>
        <span className={s.label} id={labelId}>
          {label}
        </span>

        <div className={clsx(s.control, isOpen && s.controlOpen, error && s.controlInvalid)}>
          <input
            aria-hidden="true"
            className={s.nativeInput}
            name={name}
            readOnly
            ref={ref}
            required={required}
            tabIndex={-1}
            value={normalizedValue}
          />
          <button
            aria-activedescendant={activeOptionId}
            aria-controls={isOpen ? listboxId : undefined}
            aria-describedby={descriptionIds || undefined}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={ariaInvalid ?? (error ? true : undefined)}
            aria-labelledby={labelId}
            className={clsx(s.trigger, className)}
            disabled={disabled}
            id={buttonId}
            onBlur={onBlur}
            onClick={() => {
              if (isOpen) {
                closeList();
              } else {
                openList();
              }
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            type="button"
            value={normalizedValue}
          >
            <span className={clsx(s.value, isPlaceholderShown && s.placeholder)}>
              {visibleValue}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={clsx(s.icon, isOpen && s.iconOpen)}
              strokeWidth={2}
            />
          </button>

          {isOpen ? (
            <div className={s.dropdown}>
              {searchable ? (
                <div className={s.search}>
                  <Search aria-hidden="true" className={s.searchIcon} strokeWidth={2} />
                  <input
                    aria-label={resolvedSearchPlaceholder}
                    autoComplete="off"
                    className={s.searchInput}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={resolvedSearchPlaceholder}
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                  />
                </div>
              ) : null}

              <div className={s.optionsList} id={listboxId} role="listbox">
                {listboxOptions.map((option, index) => {
                  const isSelected = option.value === normalizedValue;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      aria-disabled={option.disabled || undefined}
                      aria-selected={isSelected}
                      className={clsx(
                        s.option,
                        isSelected && s.optionSelected,
                        isActive && s.optionActive,
                        option.disabled && s.optionDisabled,
                      )}
                      disabled={option.disabled}
                      id={`${selectId}-option-${index}`}
                      key={option.value}
                      onClick={() => handleOptionSelect(option)}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      role="option"
                      type="button"
                    >
                      <span className={s.optionLabel}>{option.label}</span>
                      {isSelected ? (
                        <Check aria-hidden="true" className={s.optionIcon} strokeWidth={2.5} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
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

Select.displayName = 'Select';
