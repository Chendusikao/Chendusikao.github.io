export function createDemoSeries(total = 252) {
  return Array.from({ length: total }, (_, index) => {
    const wave = Math.sin(index / 8) * 2.4 + Math.cos(index / 17) * 1.6;
    const trend = index * 0.055;
    const close = Number((24 + trend + wave).toFixed(2));
    const open = Number((close - Math.sin(index * 1.7) * 0.9).toFixed(2));
    const high = Number(
      (Math.max(open, close) + 0.45 + (index % 4) * 0.12).toFixed(2),
    );
    const low = Number(
      (Math.min(open, close) - 0.4 - (index % 3) * 0.11).toFixed(2),
    );

    return {
      date: `示例日 ${String(index + 1).padStart(3, "0")}`,
      open,
      high,
      low,
      close,
      volume: 1200000 + (index % 11) * 95000,
    };
  });
}
