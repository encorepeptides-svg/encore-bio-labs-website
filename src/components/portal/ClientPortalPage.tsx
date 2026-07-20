import { useTranslation } from '../../i18n/LocaleContext'
import { PortalShell } from './PortalShell'
import { NotificationsSection, ProfileSection, SecuritySection } from './sections/AccountSections'
import { CalculatorsSection } from './sections/CalculatorsSection'
import { CheckInsSection } from './sections/CheckInsSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { IntakeResultsSection } from './sections/IntakeResultsSection'
import { OrdersSection } from './sections/OrdersSection'
import { OverviewSection } from './sections/OverviewSection'
import { ProgressSection } from './sections/ProgressSection'
import { ProtocolsSection } from './sections/ProtocolsSection'
import { SupportSection } from './sections/SupportSection'

export function ClientPortalPage({ section = 'overview' }: { section?: string }) {
  const content = (() => {
    switch (section) {
      case 'overview': return <OverviewSection />
      case 'orders': return <OrdersSection />
      case 'intake': return <IntakeResultsSection />
      case 'protocols': return <ProtocolsSection />
      case 'progress': return <ProgressSection />
      case 'check-ins': return <CheckInsSection />
      case 'calculators': return <CalculatorsSection />
      case 'documents': return <DocumentsSection />
      case 'support': return <SupportSection />
      case 'notifications': return <NotificationsSection />
      case 'profile': return <ProfileSection />
      case 'security': return <SecuritySection />
      default: return <SectionUnknown />
    }
  })()
  return <PortalShell>{content}</PortalShell>
}

function SectionUnknown() {
  const { t } = useTranslation('portal')
  return <>
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('clientPortalLabel')}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em]">{t('sectionNotFoundTitle')}</h1>
    <p className="mt-4 max-w-xl leading-7 text-slate-600">{t('sectionNotFoundCopy')}</p>
  </>
}
