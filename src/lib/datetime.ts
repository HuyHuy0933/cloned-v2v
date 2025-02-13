import { tMessages } from "@/locales/messages";
import { format, intlFormat } from "date-fns";
import { JAPANESE_DATE_FORMAT, JAPANESE_DATETIME_FORMAT } from "./constaints";
import { ja } from "date-fns/locale";
import { t } from "i18next";

export const timeAgo = (lastReplyTimeMilis: number) => {
  const now = new Date().getTime();
  const diffInSeconds = Math.floor((now - lastReplyTimeMilis) / 1000);
  const years = Math.floor(diffInSeconds / (365 * 24 * 60 * 60));
  const months = Math.floor(diffInSeconds / (30 * 24 * 60 * 60));
  const days = Math.floor(diffInSeconds / (24 * 60 * 60));
  const hours = Math.floor(diffInSeconds / (60 * 60));
  const minutes = Math.floor(diffInSeconds / 60);

  if (years > 0) {
    return t(tMessages.common.yearsAgo(), { count: years });
  } else if (months > 0) {
    return t(tMessages.common.monthsAgo(), { count: months });
  } else if (days > 0) {
    return t(tMessages.common.daysAgo(), { count: days });
  } else if (hours > 0) {
    return t(tMessages.common.hoursAgo(), { count: hours });
  } else if (minutes > 0) {
    return t(tMessages.common.minutesAgo(), { count: minutes });
  } else if (diffInSeconds > 0) {
    return t(tMessages.common.secondsAgo(), { count: diffInSeconds });
  } else {
    return t(tMessages.common.justNow());
  }
};

export const formatDateJapanese = (date: Date) => {
  return format(date, JAPANESE_DATE_FORMAT, { locale: ja });
};

export const formatDatetimeJapanese = (date: Date) => {
  return format(date, JAPANESE_DATETIME_FORMAT, { locale: ja });
};

export const formatLongDateTimeLocale = (
  date: Date,
  locale: string = navigator.language,
) => {
  if (locale.toLowerCase().includes("ja")) {
    return intlFormat(
      date,
      {
        year: "numeric",
        month: "long",
        weekday: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
      { locale: locale },
    );
  }

  return intlFormat(
    date,
    {
      year: "numeric",
      month: "2-digit",
      weekday: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    },
    { locale: locale },
  );
};

export const formatDateTimeLocale = (
  date: Date,
  locale: string = navigator.language,
) => {
  if (locale.toLowerCase().includes("ja")) {
    return intlFormat(
      date,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
      { locale: locale },
    );
  }

  return intlFormat(
    date,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    },
    { locale: locale },
  );
};

export const formatDateLocale = (
  date: Date,
  locale: string = navigator.language,
) => {
  if (locale.toLowerCase().includes("ja")) {
    return intlFormat(
      date,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
      { locale: locale },
    );
  }

  return intlFormat(
    date,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    { locale: locale },
  );
};

export const secondsToDurationFormatLocale = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours}${t(tMessages.common.hrs())}`;
  }

  if (minutes > 0 || hours > 0) {
    result += `${minutes}${t(tMessages.common.mins())}`;
  }

  result += `${remainingSeconds}${t(tMessages.common.secs())}`;
  return result;
};

export const milisToDurationFormatLocale = (milis: number) => {
  return secondsToDurationFormatLocale(Math.round(milis / 1000));
};
