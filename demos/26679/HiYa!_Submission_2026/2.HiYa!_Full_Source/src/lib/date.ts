export const formatLocalDate = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date(dateStr);
  }

  return new Date(year, month - 1, day);
};

export const startOfLocalDay = (date: Date = new Date()) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

export const formatLocalDateForZh = (
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
) => {
  return parseLocalDate(dateStr).toLocaleDateString('zh-CN', options);
};
