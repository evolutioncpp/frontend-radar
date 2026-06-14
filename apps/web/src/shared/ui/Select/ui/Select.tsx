import clsx from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';
import { forwardRef, useEffect, useId, useRef } from 'react';

import s from './Select.module.scss';
import { useActiveOptionScroll } from '../model/useActiveOptionScroll';
import { useSelectDropdown } from '../model/useSelectDropdown';

import type { SelectOption } from '../model/selectTypes';
import type { FocusEvent, FocusEventHandler, KeyboardEvent, ReactNode } from 'react';

export type { SelectOption };

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
    const optionRefs = useRef<Array<HTMLElement | null>>([]);
    const normalizedValue = typeof value === 'string' ? value : '';
    const selectedOption = options.find((option) => option.value === normalizedValue);
    const {
      activeIndex,
      closeList,
      filteredOptions,
      isOpen,
      listboxOptions,
      moveActiveOption,
      openList,
      searchQuery,
      selectOption,
      setIsOpen,
      setSearchQuery,
    } = useSelectDropdown({
      disabled,
      emptyMessage,
      emptySearchMessage,
      onOpen,
      onValueChange,
      options,
      placeholder,
      value: normalizedValue,
    });
    const descriptionIds = [ariaDescribedBy, hint ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ');
    const activeOptionId =
      isOpen && activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined;
    const visibleValue = selectedOption?.label ?? placeholder ?? '';
    const isPlaceholderShown = !selectedOption;
    const resolvedSearchPlaceholder = searchPlaceholder ?? label;

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
    }, [isOpen, setIsOpen]);

    useEffect(() => {
      if (isOpen && searchable) {
        searchInputRef.current?.focus();
      }
    }, [isOpen, searchable]);

    useActiveOptionScroll({ activeIndex, isOpen, optionRefs });

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Tab') {
        closeList();
        return;
      }

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

        selectOption(activeIndex >= 0 ? filteredOptions[activeIndex] : null);

        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeList();
      }
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Tab') {
        closeList();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        selectOption(activeIndex >= 0 ? filteredOptions[activeIndex] : null);

        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeList();
      }
    };

    const handleFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        closeList();
      }
    };

    return (
      <div
        className={clsx(s.selectField, wrapperClassName)}
        onBlur={handleFieldBlur}
        ref={wrapperRef}
      >
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
                    <div
                      aria-disabled={option.disabled || undefined}
                      aria-selected={isSelected}
                      className={clsx(
                        s.option,
                        isSelected && s.optionSelected,
                        isActive && s.optionActive,
                        option.disabled && s.optionDisabled,
                      )}
                      id={`${selectId}-option-${index}`}
                      key={option.value}
                      onClick={() => {
                        if (!option.disabled) {
                          selectOption(option);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (option.disabled || (event.key !== 'Enter' && event.key !== ' ')) {
                          return;
                        }

                        event.preventDefault();
                        selectOption(option);
                      }}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      role="option"
                      tabIndex={-1}
                    >
                      <span className={s.optionLabel}>{option.label}</span>
                      {isSelected ? (
                        <Check aria-hidden="true" className={s.optionIcon} strokeWidth={2.5} />
                      ) : null}
                    </div>
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
