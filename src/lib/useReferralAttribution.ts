import { useEffect, useState } from 'react'
import { readReferralAttribution, REFERRAL_CHANGE_EVENT, type ReferralAttribution } from './referralAttribution'

export function useReferralAttribution() {
  const [attribution, setAttribution] = useState<ReferralAttribution | null>(() => readReferralAttribution())
  useEffect(() => {
    const sync = () => setAttribution(readReferralAttribution())
    window.addEventListener(REFERRAL_CHANGE_EVENT, sync)
    return () => window.removeEventListener(REFERRAL_CHANGE_EVENT, sync)
  }, [])
  return attribution
}
