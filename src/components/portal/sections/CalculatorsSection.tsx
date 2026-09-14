import { AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { GuidedAliquotCalculator } from '../../calculators/GuidedAliquotCalculator'
import { SectionIntro } from './shared'

/**
 * Bench preparation math only.
 *
 * The BMI and weight-change calculators that used to sit here were removed by
 * the owner. On a research-use-only catalog, a tool that computes a person's
 * BMI — or their percent body-weight change, which is the exact endpoint the
 * GLP-1 trials report — is human-outcome tracking, not laboratory work.
 *
 * Do not add body-composition tooling back to the portal.
 */
export function CalculatorsSection() {
  const { t } = useTranslation('portal')
  return <>
    <SectionIntro title={t('calculatorsTitle')} copy={t('calculatorsIntro')} />
    <div className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <AlertTriangle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p><strong>{t('labCalculatorBoundaryTitle')}</strong> {t('labCalculatorBoundaryCopy')}</p>
    </div>
    <GuidedAliquotCalculator className="mt-6" />
    <p className="mt-6 text-xs leading-5 text-slate-500">{t('calculatorsDisclaimer')}</p>
  </>
}
