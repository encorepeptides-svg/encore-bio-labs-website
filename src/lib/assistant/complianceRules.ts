/**
 * Encore AI Assistant is a customer-service and sales assistant, not a
 * medical chatbot. Any message that reads as a request for medical advice,
 * protocols, dosages, treatment recommendations, diagnoses, or effectiveness
 * claims must be intercepted before it reaches product/pricing logic.
 */
const restrictedPatterns: RegExp[] = [
  /\bdos(e|es|ed|ing|age|ages)\b/i,
  /\b\d+\s?(mg|mcg|iu|ml)\b/i,
  /\bprotocols?\b/i,
  /\bhow (much|many) (should|do|can) i\b/i,
  /\bside\s?effects?\b/i,
  /\btreat(s|ed|ing|ment|ments)?\b/i,
  /\bcure[sd]?\b/i,
  /\bdiagnos(e|is|ed|ing)\b/i,
  /\bshould i (take|use|inject|apply)\b/i,
  /\bis (it|this) safe (for|to)\b/i,
  /\bwill (it|this) (help|cure|treat|fix)\b/i,
  /\bhealth (condition|issue|problem)\b/i,
  /\bprescri(be|ption|ptions)\b/i,
  /\bmedical advice\b/i,
  /\beffective(ness)? for\b/i,
  /\bcontraindicat/i,
  /\bsymptoms?\b/i,
]

export const COMPLIANCE_RESPONSE =
  'Encore Bio Labs provides products for research-use information only. I can help with availability, pricing, shipping, delivery, and ordering.'

export function isRestrictedQuery(text: string) {
  return restrictedPatterns.some((pattern) => pattern.test(text))
}
