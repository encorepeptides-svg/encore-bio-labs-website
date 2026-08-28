/**
 * One QR renderer for the whole site, so a code scanned from a partner link and
 * a code scanned from the cart look like they came from the same company.
 *
 * `qrcode` is loaded dynamically: it is only ever needed after a deliberate
 * interaction, and it is large enough to be worth keeping out of the initial
 * bundle.
 *
 * `errorCorrectionLevel` is worth choosing per use. `M` survives a printed code
 * getting scuffed, which is why it is the default. A code that only ever
 * appears on a screen has nothing to survive, and dropping to `L` fits the same
 * payload into a lower QR version — fewer, larger modules, which is the
 * difference between a long URL scanning on the first try and not at all.
 */
export async function makeQrDataUrl(
  url: string,
  { width = 640, errorCorrectionLevel = 'M' }: { width?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' } = {},
) {
  const { default: QRCode } = await import('qrcode')
  return QRCode.toDataURL(url, { width, margin: 2, errorCorrectionLevel, color: { dark: '#071724', light: '#FFFFFF' } })
}
