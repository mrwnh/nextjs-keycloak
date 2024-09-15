export function formatDate(date: Date | string): string {
    const now = new Date();
    const inputDate = new Date(date);
    
    const isToday = now.toDateString() === inputDate.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === inputDate.toDateString();
    
    const timeString = inputDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    
    if (isToday) {
      return `Today ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday ${timeString}`;
    } else {
      return inputDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    }
  }