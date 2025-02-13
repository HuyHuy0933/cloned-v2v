import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const splitWordIntlSentence = (sentence: string): string[] => {
  //@ts-ignore
  const segmenter = new Intl.Segmenter([], { granularity: "word" });
  const segments = segmenter.segment(sentence);
  // Extract the segments into an array of words
  const words = [...segments].map((s) => s.segment);
  return words;
};

export const decodeHtmlEntities = (str: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
};

export const splitSentenceByPunctuation = (sentence: string) => {
  const decodedSentence = decodeHtmlEntities(sentence);
  // Regular expression to match punctuation marks (excluding spaces)
  const regex = /[,.!?;:、。？！：；「」『』（）\[\]{}]/;
  // Split the sentence by the punctuation marks
  const segments = decodedSentence.split(regex);
  // Filter out empty strings (which can occur if there are consecutive punctuation marks)
  const processed = segments.filter(
    (segment: any) => segment.trim().length > 0,
  );
  return processed;
};

export const secondsToTimer = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const milisToTimer = (milis: number) => {
  return secondsToTimer(Math.round(milis / 1000));
};

export const secondsToTimerWithSpace = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(remainingSeconds).padStart(2, "0"),
  ].join("  :  ");
};

export const milisToTimerWhiteSpace = (milis: number) => {
  return secondsToTimerWithSpace(Math.round(milis / 1000));
};

export const timerToSeconds = (time: string) => {
  const [hours, minutes, seconds] = time.split(":");

  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

export const secondsToDurationFormat = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours}h`;
  }

  if (minutes > 0 || hours > 0) {
    result += `${minutes}m`;
  }

  result += `${remainingSeconds}s`;
  return result;
};

export const milisToDurationFormat = (milis: number) => {
  return secondsToDurationFormat(Math.round(milis / 1000));
};

export const milisDiffFromStartToCurrent = (
  startAt: number = new Date().getTime(),
) => {
  return new Date().getTime() - (startAt || new Date().getTime());
};

export const getTop3SummaryTags = (tags: string[]) => {
  return tags.slice(0, 3).map((x) => x.trim());
};

export const getInitialsFromUsername = (username: string) => {
  // Initialize initials with the first character of the username
  let initials = username.charAt(0).toUpperCase();

  // Find the first underscore in the username
  const underscoreIndex = username.indexOf("_");

  // If an underscore is found and there is a character after it, add it to initials
  if (underscoreIndex !== -1 && underscoreIndex + 1 < username.length) {
    initials += username.charAt(underscoreIndex + 1).toUpperCase();
  }

  // Ensure the result is only 2 characters
  return initials.slice(0, 2);
};

export const stringToBrightHexColor = (str: string) => {
  str = str.trim();

  // Compute a hash code from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Ensure the hash is a positive integer
  hash = Math.abs(hash);

  // Introduce more variation by using a combination of shifts, primes, and XOR
  hash = (hash << 3) ^ (hash * 53) ^ (str.length * 31);

  // Generate RGB components with high brightness
  let r = ((hash >> 16) & 0x7f) + 0x80; // 128 to 255
  let g = ((hash >> 8) & 0x7f) + 0x80; // 128 to 255
  let b = (hash & 0x7f) + 0x80; // 128 to 255

  // Calculate the relative luminance of the color (0 to 255 scale)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // If the luminance is too high (too close to white), darken the color
  if (luminance > 200) {
    // Reduce the brightness by scaling down the RGB components
    r = Math.floor(r * 0.8);
    g = Math.floor(g * 0.8);
    b = Math.floor(b * 0.8);
  }

  // Convert RGB components to hexadecimal string
  let color =
    "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2);

  return color;
};

export const getFileExtensionFromUrl = (url: string) => {
  url = url.split("?")[0];
  // Extract the part after the last `/` to get the filename
  const filename = url.substring(url.lastIndexOf("/") + 1);
  // Now get the extension from the filename
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const downloadMediaFileURL = (
  fileUrl: string,
  filename: string,
  element?: any,
  onProgress?: (value: number) => void,
) => {
  element = element || document.body;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", fileUrl, true);
  xhr.responseType = "blob";

  xhr.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      onProgress && onProgress(Math.round(percentComplete));
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      const blob = new Blob([xhr.response], { type: "audio/mp3" });
      const link = document.createElement("a");
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = window.URL.createObjectURL(blob);
      link.target = "_blank";
      const extension = getFileExtensionFromUrl(fileUrl);
      link.download = `${filename}`; // Specify the custom filename

      // Trigger the download
      element.appendChild(link);
      link.click();
      element.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }
  };

  xhr.onerror = (err) => {
    console.log(err);
  };

  xhr.send();
};

export const getAudioDurationFromURL = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;

    audio.onloadedmetadata = function () {
      resolve(audio.duration);
    };

    audio.onerror = function () {
      resolve(0);
    };
  });
};

export const remCalc = (px: number | string, base: number = 16) => {
  const tempPx = `${px}`.replace("px", "");

  return (1 / base) * parseInt(tempPx) + "rem";
};

export const base64ToInt16Array = (base64: string): Int16Array => {
  const binary = window.atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const uint8Array = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return new Int16Array(buffer);
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = window.atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const uint8Array = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return uint8Array;
};

export const base64ToBlobUrl = (base64: string): string => {
  const uint8Array = base64ToUint8Array(base64);
  const blob = new Blob([uint8Array], { type: "audio/mp3" });
  return URL.createObjectURL(blob);
};

// Function to convert today's date to formatted milliseconds
export const convertDateToMilliseconds = () => {
  const today = new Date();
  const formattedDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
  );

  // Convert to milliseconds
  const milliseconds = formattedDate.getTime();
  return milliseconds;
};

export const delay = (milis: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), milis));

export const mapDataObjWithDefault = <T extends Record<string, any>>(
  data: T,
  defaultData: T,
): T => {
  // given data object and default data object, write a function to map default data to data if default data's prop is not exist in data obj
  // for example, given data = {a: 1, b: 2} and defaultData = {a: 0, c: 3}, the result should be {a: 1, b: 2, c: 3}
  const result: T = { ...data }; // Clone the data object to avoid mutating it

  for (const key in defaultData) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = defaultData[key];
      continue;
    }

    if (
      typeof defaultData[key] === "object" &&
      !Array.isArray(defaultData[key])
    ) {
      result[key] = mapDataObjWithDefault(data[key], defaultData[key]);
    }
  }

  return result;
};

export const formatFileSize = (bytes: number) => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let index = 0;

  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }

  return `${bytes.toFixed(1)} ${units[index]}`;
};

export const isPresignUrlValid = (presignUrl: string) => {
  const queryParam = qs.parse(presignUrl);
  const expired = Number(queryParam["Expires"]) * 1000;

  return new Date().getTime() - expired < 0;
}; 