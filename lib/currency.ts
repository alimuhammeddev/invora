const fallbackCurrencyCodes = [
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "NGN",
  "NZD",
  "USD",
  "ZAR",
];

const currencyCodes =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : fallbackCurrencyCodes;

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

export const currencyOptions = currencyCodes
  .map((code) => ({
    code,
    name: currencyNames.of(code) ?? code,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

export function formatCurrencyAmount(
  amount: number,
  currency = "NGN",
  currencyDisplay: Intl.NumberFormatOptions["currencyDisplay"] = "symbol",
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    currencyDisplay,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function currencyFractionDigits(currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits;
}