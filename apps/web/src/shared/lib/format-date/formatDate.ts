export type FormatDateOptions = Intl.DateTimeFormatOptions;

const defaultFormatDateOptions: FormatDateOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export const formatDate = (
  value: string | number | Date,
  locale: string | string[],
  options: FormatDateOptions = defaultFormatDateOptions,
) => {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
};
