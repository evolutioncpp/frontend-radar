import { useCallback, useMemo, useState } from 'react';

import {
  createSelectListboxOptions,
  filterSelectOptions,
  getEnabledOptionIndex,
  getNextEnabledOptionIndex,
} from './selectOptions';

import type { SelectOption } from './selectTypes';

interface UseSelectDropdownParams {
  disabled: boolean;
  emptyMessage?: string;
  emptySearchMessage?: string;
  onOpen?: () => void;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value: string;
}

export const useSelectDropdown = ({
  disabled,
  emptyMessage,
  emptySearchMessage,
  onOpen,
  onValueChange,
  options,
  placeholder,
  value,
}: UseSelectDropdownParams) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredOptions = useMemo(
    () => filterSelectOptions(options, searchQuery),
    [options, searchQuery],
  );
  const [activeIndex, setActiveIndex] = useState(() =>
    getEnabledOptionIndex(filteredOptions, value),
  );
  const listboxOptions = useMemo(
    () =>
      createSelectListboxOptions({
        emptyMessage,
        emptySearchMessage,
        filteredOptions,
        placeholder,
        searchQuery,
      }),
    [emptyMessage, emptySearchMessage, filteredOptions, placeholder, searchQuery],
  );
  const defaultActiveIndex = useMemo(
    () => getEnabledOptionIndex(filteredOptions, value),
    [filteredOptions, value],
  );
  const isActiveIndexValid = Boolean(
    activeIndex >= 0 && filteredOptions[activeIndex] && !filteredOptions[activeIndex]?.disabled,
  );
  const resolvedActiveIndex = isActiveIndexValid ? activeIndex : defaultActiveIndex;

  const openList = useCallback(() => {
    if (disabled) {
      return;
    }

    onOpen?.();
    setActiveIndex(defaultActiveIndex);
    setIsOpen(true);
  }, [defaultActiveIndex, disabled, onOpen]);

  const closeList = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const selectOption = useCallback(
    (option: SelectOption | null | undefined) => {
      if (!option || option.disabled) {
        return;
      }

      onValueChange?.(option.value);
      closeList();
    },
    [closeList, onValueChange],
  );

  const moveActiveOption = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((currentIndex) =>
        getNextEnabledOptionIndex(
          filteredOptions,
          currentIndex >= 0 ? currentIndex : resolvedActiveIndex,
          direction,
        ),
      );
    },
    [filteredOptions, resolvedActiveIndex],
  );

  return {
    activeIndex: resolvedActiveIndex,
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
  };
};
