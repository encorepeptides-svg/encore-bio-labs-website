import type { Lead } from '../../types/crm'

function productList(lead: Lead) {
  return lead.interestedProducts.map((product) => product.productName).join(', ') || 'your selected research interests'
}

export function getWhatsAppFollowUp(lead: Lead) {
  return `Hi ${lead.firstName}, this is Encore Bio Labs. Thanks for submitting your research inquiry about ${productList(lead)}. We can share educational product information and answer research-use-only questions. This is not medical advice, diagnosis, dosing guidance, or a promise of outcomes.`
}

export function getInstagramDMFollowUp(lead: Lead) {
  return `Hi ${lead.firstName}, thanks for reaching out to Encore Bio Labs. We received your research interest in ${productList(lead)}. Happy to send educational info for research-use-only review. No medical advice or dosing guidance is provided.`
}

export function getEmailFollowUp(lead: Lead) {
  return `Subject: Encore Bio Labs research inquiry

Hi ${lead.firstName},

Thank you for submitting your Encore Bio Labs inquiry. We received your research interest in ${productList(lead)} and can provide educational information for research-use-only review.

Important: Encore Bio Labs does not provide medical diagnosis, treatment advice, dosing guidance, use instructions, or promised outcomes. Product-specific information is educational and research-use-only.

Best,
Encore Bio Labs`
}
