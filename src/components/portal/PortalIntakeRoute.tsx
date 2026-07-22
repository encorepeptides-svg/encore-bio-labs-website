import { usePortalAuth } from '../../context/usePortalAuth'
import { ClientPortalPage } from './ClientPortalPage'
import { OnboardingPage } from './OnboardingPage'

export function PortalIntakeRoute() {
  const { identity } = usePortalAuth()

  if (identity?.status === 'onboarding_incomplete') return <OnboardingPage />
  return <ClientPortalPage section="intake" />
}
