import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "h:mm a")}`;
  }
  
  return format(dateObj, "MMM d, yyyy, h:mm a");
}

export function formatTimeRange(startTime: Date | string, endTime: Date | string): string {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  
  if (isToday(start)) {
    return `Today, ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  }
  
  if (isTomorrow(start)) {
    return `Tomorrow, ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  }
  
  return `${format(start, "MMM d, yyyy")}, ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

export function formatTimeRangeShort(startTime: Date | string, endTime: Date | string): string {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  
  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  const isInPast = dateObj < new Date();
  if (isInPast) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
  
  if (isToday(dateObj)) {
    if (formatDistanceToNow(dateObj, { addSuffix: true }) === "in less than a minute") {
      return "Now";
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
  
  if (isTomorrow(dateObj)) {
    return "Tomorrow";
  }
  
  return format(dateObj, "MMM d, yyyy");
}

export function getDurationInHours(startTime: Date | string, endTime: Date | string): string {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  if (durationHours < 1) {
    const durationMinutes = Math.round(durationHours * 60);
    return `${durationMinutes} minutes`;
  }
  
  if (Number.isInteger(durationHours)) {
    return `${durationHours} hours`;
  }
  
  return `${durationHours.toFixed(1)} hours`;
}
