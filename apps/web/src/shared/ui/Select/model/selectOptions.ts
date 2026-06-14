import type { SelectOption } from './selectTypes';

export const emptySelectOptionValue = '__empty';

export const getEnabledOptionIndex = (options: SelectOption[], value: string) => {
  const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return options.findIndex((option) => !option.disabled);
};

export const getNextEnabledOptionIndex = (
  options: SelectOption[],
  currentIndex: number,
  direction: 1 | -1,
) => {
  if (!options.some((option) => !option.disabled)) {
    return currentIndex;
  }

  let nextIndex = currentIndex;

  for (let step = 0; step < options.length; step += 1) {
    nextIndex = (nextIndex + direction + options.length) % options.length;

    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return currentIndex;
};

export const filterSelectOptions = (options: SelectOption[], searchQuery: string) => {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return options;
  }

  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(normalizedSearchQuery) ||
      option.value.toLowerCase().includes(normalizedSearchQuery),
  );
};

export const createSelectListboxOptions = ({
  emptyMessage,
  emptySearchMessage,
  filteredOptions,
  placeholder,
  searchQuery,
}: {
  emptyMessage?: string;
  emptySearchMessage?: string;
  filteredOptions: SelectOption[];
  placeholder?: string;
  searchQuery: string;
}): SelectOption[] => {
  if (filteredOptions.length > 0) {
    return filteredOptions;
  }

  return [
    {
      disabled: true,
      label: searchQuery.trim() ? (emptySearchMessage ?? '') : (emptyMessage ?? placeholder ?? ''),
      value: emptySelectOptionValue,
    },
  ];
};
