export const draftReviewPreviewPath = '/review-preview'

/** The draft-review preview is deliberately unavailable in production builds. */
export function isDraftReviewPreviewPath(logicalPath: string, isDevelopment: boolean) {
  if (!isDevelopment) return false
  return logicalPath === draftReviewPreviewPath || logicalPath === `${draftReviewPreviewPath}/`
}
