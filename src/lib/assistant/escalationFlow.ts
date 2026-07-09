export type EscalationField = 'product' | 'strength' | 'quantity' | 'city' | 'deliveryPreference'

export type EscalationData = Record<EscalationField, string>

export const emptyEscalationData: EscalationData = {
  product: '',
  strength: '',
  quantity: '',
  city: '',
  deliveryPreference: '',
}

export const escalationSteps: Array<{ field: EscalationField; prompt: string }> = [
  { field: 'product', prompt: 'Which product are you interested in?' },
  { field: 'strength', prompt: 'What strength or format would you like?' },
  { field: 'quantity', prompt: 'How many would you like?' },
  { field: 'city', prompt: "What city are you located in? (Helps us flag local El Paso delivery.)" },
  {
    field: 'deliveryPreference',
    prompt: 'Do you prefer local El Paso delivery, nationwide U.S. shipping, or Mexico shipping?',
  },
]
