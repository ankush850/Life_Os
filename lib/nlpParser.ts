export interface ParsedNLPTask {
  title: string;
  duration?: string;
  startDate: string;
  endDate: string;
  repeatType: 'Daily' | 'Weekdays' | 'Weekends' | 'Custom';
  customDays?: number[];
  startTime?: string;
}

export function parseNLPRecurringTasks(text: string): ParsedNLPTask[] {
  let startDate = new Date();
  let endDate = new Date();
  
  // Default end date to the end of the current month
  endDate.setDate(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate());

  const monthNames = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const shortMonthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  // Helper to parse a date string like "June 1" or "Jun 1" or "June 1, 2026"
  const parseDateWord = (monthWord: string, dayWord: string, yearWord?: string): Date | null => {
    let mIdx = monthNames.indexOf(monthWord.toLowerCase());
    if (mIdx === -1) {
      mIdx = shortMonthNames.indexOf(monthWord.toLowerCase());
    }
    if (mIdx === -1) return null;
    const day = parseInt(dayWord);
    const year = yearWord ? parseInt(yearWord) : new Date().getFullYear();
    return new Date(year, mIdx, day);
  };

  let cleanedText = text;

  // Regex 1: "from June 1 to June 30" / "between June 1 and June 30" / "June 1 - June 30"
  const wordDateRangeRegex = /(?:from\s+|between\s+)?([a-zA-Z]+)\s+(\d+)(?:\s*,\s*(\d{4}))?\s*(?:to|and|-)\s*([a-zA-Z]+)\s+(\d+)(?:\s*,\s*(\d{4}))?/i;
  const matchWordRange = text.match(wordDateRangeRegex);

  // Regex 2: "from 2026-06-01 to 2026-06-30" / "06-01 to 06-30"
  const numericDateRangeRegex = /(?:from\s+|between\s+)?(?:(\d{4})[-/])?(\d{1,2})[-/](\d{1,2})\s*(?:to|and|-)\s*(?:(\d{4})[-/])?(\d{1,2})[-/](\d{1,2})/i;
  const matchNumericRange = text.match(numericDateRangeRegex);

  if (matchWordRange) {
    const sDate = parseDateWord(matchWordRange[1], matchWordRange[2], matchWordRange[3]);
    const eDate = parseDateWord(matchWordRange[4], matchWordRange[5], matchWordRange[6]);
    if (sDate) startDate = sDate;
    if (eDate) endDate = eDate;
    cleanedText = text.replace(matchWordRange[0], "");
  } else if (matchNumericRange) {
    const sYear = matchNumericRange[1] ? parseInt(matchNumericRange[1]) : new Date().getFullYear();
    const sMonth = parseInt(matchNumericRange[2]) - 1;
    const sDay = parseInt(matchNumericRange[3]);
    const eYear = matchNumericRange[4] ? parseInt(matchNumericRange[4]) : sYear;
    const eMonth = parseInt(matchNumericRange[5]) - 1;
    const eDay = parseInt(matchNumericRange[6]);
    
    startDate = new Date(sYear, sMonth, sDay);
    endDate = new Date(eYear, eMonth, eDay);
    cleanedText = text.replace(matchNumericRange[0], "");
  }

  // Formatting dates to YYYY-MM-DD
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Clean text, split by "and" or "," but not inside duration (like "3 hours, 30 minutes")
  // Replace "and" or "," with a delimiter "|"
  const normalized = cleanedText.replace(/\s+and\s+/gi, " | ").replace(/,/g, " | ");
  const parts = normalized.split("|").map(p => p.trim()).filter(Boolean);

  const tasks: ParsedNLPTask[] = [];

  // Determine global recurrence from the text if any
  let globalRepeatType: 'Daily' | 'Weekdays' | 'Weekends' | 'Custom' = 'Daily';
  if (/weekdays/i.test(text)) globalRepeatType = 'Weekdays';
  else if (/weekends/i.test(text)) globalRepeatType = 'Weekends';

  for (const part of parts) {
    let title = part;
    let duration: string | undefined = undefined;
    let startTime: string | undefined = undefined;
    let repeatType = globalRepeatType;

    // Check specific repeat type for this part
    if (/daily|every\s*day/i.test(part)) repeatType = 'Daily';
    else if (/weekdays/i.test(part)) repeatType = 'Weekdays';
    else if (/weekends/i.test(part)) repeatType = 'Weekends';

    // Clean repeat keywords from title
    title = title.replace(/daily|every\s*day|weekdays|weekends/gi, "").trim();

    // Extract startTime
    // Matches "at 08:00 AM", "at 2:00 PM", "at 14:00", "at 8 PM", "at 8:00pm", "at 10:00"
    const startTimeRegex = /(?:at\s+)(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i;
    const timeMatch = title.match(startTimeRegex);
    if (timeMatch) {
      startTime = timeMatch[1].toUpperCase();
      // If parsed as single digit hour with PM like "8 PM", standardise it to "08:00 PM"
      if (!startTime.includes(":")) {
        const hourPart = startTime.match(/^(\d+)\s*(AM|PM)?/);
        if (hourPart) {
          const hour = String(parseInt(hourPart[1])).padStart(2, "0");
          const suffix = hourPart[2] || "";
          startTime = `${hour}:00 ${suffix}`.trim();
        }
      } else {
        // Ensure format is hh:mm AM/PM
        const timeParts = startTime.match(/^(\d+):(\d+)\s*(AM|PM)?/);
        if (timeParts) {
          const hour = String(parseInt(timeParts[1])).padStart(2, "0");
          const min = String(parseInt(timeParts[2])).padStart(2, "0");
          const suffix = timeParts[3] ? ` ${timeParts[3]}` : "";
          startTime = `${hour}:${min}${suffix}`;
        }
      }
      title = title.replace(timeMatch[0], "").trim();
    }

    // Extract duration
    // e.g., "for 3 hours", "for 30 minutes", "for 30 mins", "for 1.5 hours", "3 hours", "30 minutes"
    const durationRegex = /(?:for\s+)?(\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?))/i;
    const durationMatch = title.match(durationRegex);
    if (durationMatch) {
      duration = durationMatch[1];
      title = title.replace(durationMatch[0], "").trim();
    }

    // Clean up title (remove trailing/leading punctuation, filler words)
    title = title.replace(/^(and|to|with|on)\s+/i, "").trim();
    title = title.replace(/\s+(on|at|with)$/i, "").trim();
    title = title.replace(/[.,:;]$/, "").trim(); // Remove trailing commas or periods

    if (title) {
      // Capitalize first letter of title
      title = title.charAt(0).toUpperCase() + title.slice(1);
      tasks.push({
        title,
        duration,
        startDate: startDateStr,
        endDate: endDateStr,
        repeatType,
        startTime,
      });
    }
  }

  return tasks;
}
