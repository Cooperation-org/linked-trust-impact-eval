import { DateTime } from "luxon";

export const getUnixTime = (timeString) => {
  let effectiveDateAsUnixTime;
  const effectiveDateAsLuxonDate = DateTime.fromISO(timeString);

  if (effectiveDateAsLuxonDate.isValid) {
    effectiveDateAsUnixTime = effectiveDateAsLuxonDate.toUnixInteger();
  } else {
    effectiveDateAsUnixTime = DateTime.now().toUnixInteger();
  }

  return effectiveDateAsUnixTime;
};
