import { DEFAULT_CURRENCY } from '../types/cart'

export function parsePriceToNumber(priceStr: string): number {
  const digits = priceStr.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function formatPriceINR(amount: number): string {
  return `${DEFAULT_CURRENCY}${amount.toLocaleString('en-IN')}`
}
