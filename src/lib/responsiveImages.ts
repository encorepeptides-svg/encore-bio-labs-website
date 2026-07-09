/**
 * Builds a srcSet string from a Vite import.meta.glob record for a family of
 * width-suffixed image variants, e.g. "category-metabolic-1254.webp" living
 * alongside "category-metabolic.png".
 */
export function buildSrcSet(
  record: Record<string, string>,
  basePath: string,
  stem: string,
  ext: 'webp' | 'avif',
  widths: number[],
) {
  return widths
    .map((width) => {
      const url = record[`${basePath}${stem}-${width}.${ext}`]
      return url ? `${url} ${width}w` : null
    })
    .filter((entry): entry is string => Boolean(entry))
    .join(', ')
}

export function stemOf(fileName: string) {
  return fileName.replace(/\.(png|jpe?g|webp)$/i, '')
}
