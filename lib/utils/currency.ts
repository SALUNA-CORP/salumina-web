/**
 * Formatea un número como moneda USD con separadores de miles y decimales
 * @param amount - Número a formatear
 * @param showCurrency - Si debe mostrar "USD" al final (default: true)
 * @returns String formateado como "USD 1,234.56" o "$1,234.56"
 */
export function formatUSD(amount: number, showCurrency: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (showCurrency) {
    return `USD ${formatted}`;
  }

  return `$${formatted}`;
}

/**
 * Formatea compacto para números grandes (ej: 1.2K, 1.5M)
 */
export function formatCompactUSD(amount: number): string {
  if (amount >= 1_000_000) {
    return `USD ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `USD ${(amount / 1_000).toFixed(1)}K`;
  }
  return formatUSD(amount);
}

/**
 * Parsea un string de USD a número
 */
export function parseUSD(value: string): number {
  // Remover todo excepto números, puntos y guiones
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
