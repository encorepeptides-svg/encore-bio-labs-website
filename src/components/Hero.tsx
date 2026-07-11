import { ClipboardCheck, FileText, PackageCheck, Sparkles, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from '../assets/images/logo/encore-logo.png'
import heroVideoPoster from '../assets/images/hero/hero-video-poster.jpg'
import heroVideo from '../assets/videos/encore-hero.mp4'
import { brandText } from '../../config/brandText'

const heroStats = [
  'Enterprise sourcing',
  'Documentation workflows',
  'Bulk quote support',
  'Institution-ready supply',
]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const proofArtifacts = [
  {
    icon: FileText,
    label: 'COA review',
    value: 'Lot-level documentation',
  },
  {
    icon: ClipboardCheck,
    label: 'Batch label',
    value: 'Organized product records',
  },
  {
    icon: PackageCheck,
    label: 'Kit insert',
    value: 'Packaging and handling context',
  },
]

export function Hero() {
  return (
    <section className="px-5 pb-12 pt-5 sm:px-8 lg:pb-16">
      <div className="mx-auto max-w-[88rem]">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#dfe5e5] shadow-[0_34px_110px_rgba(7,23,36,0.14)] ring-1 ring-slate-900/10 sm:rounded-[1.75rem]">
          <div className="molecule-field opacity-50" aria-hidden="true" />
          <div
            className="absolute left-[-8rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-white/80 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[-12rem] right-[-8rem] h-[36rem] w-[36rem] rounded-full bg-teal-300/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="hero-particle left-[9%] top-[24%]" aria-hidden="true" />
          <div className="hero-particle hero-particle-delay left-[48%] top-[14%]" aria-hidden="true" />
          <div className="hero-particle hero-particle-slow right-[10%] top-[36%]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#071724]/12 to-transparent" />

          <div className="relative z-10 grid gap-9 p-5 sm:p-8 md:p-10 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:p-12 xl:p-14">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.11 }}
              className="min-w-0 pt-5 lg:pt-0"
            >
              <motion.img
                src={logo}
                alt="Encore Bio Labs"
                width="900"
                height="264"
                variants={fadeUp}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="mb-6 h-12 w-auto sm:h-14"
              />

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/55 px-3 py-2 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl"
              >
                <Sparkles size={16} aria-hidden="true" className="text-teal-700" />
                Enterprise biotech reagent supply
              </motion.div>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-7 max-w-4xl text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#071724] sm:text-6xl sm:tracking-[-0.055em] lg:text-5xl xl:text-6xl 2xl:text-7xl"
              >
                Research-Grade &amp; GMP Reagents on Demand
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-6 max-w-xl text-base leading-7 text-slate-700 sm:text-lg"
              >
                Answer a few questions and we'll recommend the most appropriate research products for your goals.
              </motion.p>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-4 max-w-xl text-sm leading-6 text-slate-500"
              >
                {brandText.brandPromise}
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-8 grid grid-cols-2 gap-3"
              >
                <a
                  href="/intake"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 sm:px-6 sm:text-base"
                >
                  Find My Match
                </a>
                <a
                  href="/catalog"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#071724]/20 bg-white/35 px-4 py-3 text-center text-sm font-semibold text-[#071724] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl transition hover:border-teal-300 hover:bg-white/70 hover:text-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 sm:px-6 sm:text-base"
                >
                  Browse Catalog
                </a>
              </motion.div>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-3 text-sm font-medium text-slate-600"
              >
                {brandText.complianceDisclaimer}
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-8 grid gap-2 rounded-[1.25rem] border border-white/60 bg-white/38 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:grid-cols-4"
              >
                {heroStats.map((stat) => (
                  <div
                    key={stat}
                    className="rounded-2xl border border-white/60 bg-white/50 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-700"
                  >
                    {stat}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative mx-auto w-full max-w-xl lg:max-w-none lg:pl-4"
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="absolute inset-[-1.5rem] rounded-full bg-teal-300/20 blur-3xl" />
              <div className="absolute right-2 top-8 hidden rounded-full border border-white/40 bg-white/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#071724] shadow-[0_18px_44px_rgba(7,23,36,0.1)] backdrop-blur-xl sm:block">
                Motion catalog preview
              </div>
              <div className="relative mx-auto overflow-hidden rounded-[1.75rem] border border-white/20 bg-[#071724]/92 p-3 shadow-[0_34px_110px_rgba(7,23,36,0.28)] backdrop-blur-2xl sm:p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(118,228,211,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.12),transparent_42%)]" />
                <div className="relative overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#0d2231]">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={heroVideoPoster}
                    aria-hidden="true"
                    className="aspect-square h-full w-full rounded-[inherit] object-cover"
                    onCanPlay={(event) => {
                      void event.currentTarget.play().catch(() => undefined)
                    }}
                  >
                    <source src={heroVideo} type="video/mp4" />
                  </video>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071724]/38 via-transparent to-white/8" />
                  <div className="pointer-events-none absolute inset-4 rounded-[1rem] border border-white/10" />
                </div>

                <div className="relative z-10 mt-4 grid gap-3 sm:absolute sm:inset-x-4 sm:bottom-4 sm:mt-0 sm:grid-cols-3">
                  {proofArtifacts.map((artifact) => (
                    <div
                      key={artifact.label}
                      className="rounded-2xl border border-white/10 bg-white/8 p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
                    >
                      <div className="mb-3 flex size-8 items-center justify-center rounded-xl bg-teal-300/14 text-teal-200">
                        <artifact.icon size={16} aria-hidden="true" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {artifact.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-5">{artifact.value}</p>
                    </div>
                  ))}
                </div>
                <div className="relative mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 sm:hidden">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-300 shadow-[0_0_18px_rgba(118,228,211,0.9)]" />
                    Catalog motion
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Truck size={14} aria-hidden="true" className="text-teal-200" />
                    U.S. / Mexico
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
