export const formatCurrency = (amount: number | string | null | undefined, currency = 'GHS'): string => {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numeric === null || numeric === undefined || isNaN(numeric)) return '0.00';

  const symbolMap: Record<string, string> = {
    GHS: 'GH₵',
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    CAD: 'CA$',
  };

  const symbol = symbolMap[currency.toUpperCase()] || currency;
  const formattedNumber = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${formattedNumber}`;
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'No deadline';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
};

export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const calculateProgress = (completed: number, total: number): number => {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
};

export const isOverdue = (dateString?: string | null, status?: string): boolean => {
  if (!dateString || status === 'Completed') return false;
  const due = new Date(dateString);
  const now = new Date();
  // Set to end of due date
  due.setHours(23, 59, 59, 999);
  return due < now;
};

export const formatBytes = (bytes?: number | null, decimals = 1): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

