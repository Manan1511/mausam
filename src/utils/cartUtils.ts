export function formatMoney(amount: string | number, currencyCode: string): string {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount)) return `${amount} ${currencyCode}`

  try {
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
    })
    const fractionDigits = currencyFormatter.resolvedOptions().maximumFractionDigits
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: Number.isInteger(numericAmount) ? 0 : fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
    return formatter.format(numericAmount)
  } catch {
    return `${currencyCode} ${numericAmount.toLocaleString('en-IN')}`
  }
}
