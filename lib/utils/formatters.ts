export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? "▲" : "▼";
  return `${sign} ${Math.abs(delta).toFixed(1)}%`;
}

export function calculateDurationMins(inTime: Date, outTime: Date): number {
  let end = new Date(outTime);

  if (end <= inTime) {
    end = new Date(end);
    end.setDate(end.getDate() + 1);
  }

  return Math.round((end.getTime() - inTime.getTime()) / 60_000);
}

export function formatDurationMins(mins: number): string {
  if (mins <= 0) return "0 min";
  if (mins < 60) return `${mins} min`;

  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatRevenueLakhs(amount: number, decimals = 2): string {
  const lakhs = amount / 100_000;
  return `₹${lakhs.toFixed(decimals)}L`;
}

export function formatGrowthLabel(growthPercent: number): string {
  const sign = growthPercent >= 0 ? "+" : "";
  return `${sign}${growthPercent}%`;
}
