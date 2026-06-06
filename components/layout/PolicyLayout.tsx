import { ReactNode } from 'react'

interface PolicyLayoutProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
}

export default function PolicyLayout({ eyebrow = 'Glamm Hair Extensions', title, subtitle, children }: PolicyLayoutProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[320px] flex items-center overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="text-sm font-medium text-accent">{eyebrow}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{title}</h1>
            {subtitle && <p className="text-lg text-text-muted">{subtitle}</p>}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section container-max">
        <div className="max-w-4xl mx-auto policy-content space-y-6 text-text-muted leading-relaxed">
          {children}
        </div>
      </section>
    </>
  )
}
