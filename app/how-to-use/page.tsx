import Image from 'next/image'
import { Play, Droplet, Wind, Flame, Package } from 'lucide-react'

const steps = [
  { number: 1, title: 'Prepare Your Hair', description: 'Wash and dry your natural hair completely. Brush through to remove any tangles.' },
  { number: 2, title: 'Section Your Hair', description: 'Create a horizontal part where you want to attach the extensions. Clip the top section away.' },
  { number: 3, title: 'Attach the Extensions', description: 'Open the clips and attach them close to the roots. Snap the clips closed securely.' },
  { number: 4, title: 'Blend and Style', description: 'Release the top section and blend with your natural hair. Style as desired.' }
]

const careTips = [
  { icon: Droplet, title: 'Washing', desc: 'Use sulfate-free products and wash gently' },
  { icon: Wind, title: 'Drying', desc: 'Air dry or use low heat settings' },
  { icon: Flame, title: 'Styling', desc: 'Always use heat protectant spray' },
  { icon: Package, title: 'Storage', desc: 'Store in a cool, dry place when not in use' }
]

export default function HowToUsePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/lucy-photos/_F8A0317-Edit.jpg"
            alt="How To Use Hair Extensions"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container-max relative h-full flex items-center">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <span className="text-sm font-medium">Installation Guide</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              How To Use<br />
              <span className="text-accent">Your Extensions</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Learn how to apply, style, and care for your Glamm Hair extensions with our comprehensive guides.
            </p>
          </div>
        </div>
      </section>

      <div className="section">
        <div className="container-max">
          {/* Video Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-large bg-gradient-to-br from-accent/20 to-accent/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-white shadow-large flex items-center justify-center hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-accent ml-1" fill="currentColor" />
                </button>
              </div>
            </div>
            <p className="text-center text-text-muted mt-4">Watch our complete installation guide</p>
          </div>

          {/* Step-by-Step Guide */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Step-by-Step Guide</h2>
            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-text-muted leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care Tips */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Care Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {careTips.map((tip, index) => (
                <div key={index} className="card p-6 hover:shadow-large transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <tip.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                  <p className="text-text-muted text-sm">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

