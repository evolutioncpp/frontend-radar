export type FormatDateOptions = Intl.DateTimeFormatOptions;

const defaultFormatDateOptions: FormatDateOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

const defaultFormatDateTimeOptions: FormatDateOptions = {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
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

export const formatDateTime = (
  value: string | number | Date,
  locale: string | string[],
  options: FormatDateOptions = defaultFormatDateTimeOptions,
) => {
  return formatDate(value, locale, options);
};
