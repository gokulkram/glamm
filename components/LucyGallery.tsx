'use client'

import Image from 'next/image'
import { Instagram, Heart, MessageCircle, Bookmark } from 'lucide-react'
import { useState } from 'react'

const lucyPhotos = [
  { id: 1, src: '/lucy-photos/_F8A0291-Edit.jpg', likes: 1243, comments: 89 },
  { id: 2, src: '/lucy-photos/_F8A0317-Edit.jpg', likes: 2156, comments: 134 },
  { id: 3, src: '/lucy-photos/_F8A0376-Edit.jpg', likes: 1876, comments: 112 },
  { id: 4, src: '/lucy-photos/_F8A0381-Edit.jpg', likes: 3421, comments: 201 },
  { id: 5, src: '/lucy-photos/_F8A0400-Edit.jpg', likes: 2987, comments: 178 },
  { id: 6, src: '/lucy-photos/_F8A0427-Edit.jpg', likes: 1654, comments: 95 },
  { id: 7, src: '/lucy-photos/_F8A0433-Edit.jpg', likes: 2234, comments: 143 },
  { id: 8, src: '/lucy-photos/_F8A0475-Edit.jpg', likes: 1987, comments: 121 },
]

export function LucyGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section className="section bg-gradient-to-b from-background to-surface">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-accent/10 to-accent-dark/10 border-2 border-accent/20 mb-6">
            <Instagram className="w-5 h-5 text-accent" />
            <span className="font-bold text-accent uppercase tracking-wider">Follow Our Journey</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See The <span className="gradient-text">Glamm Difference</span>
          </h2>
          
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-6">
            Real hair, real transformations, real confidence. Join thousands of women who've discovered their perfect look with Glamm.
          </p>
          
          <a 
            href="https://instagram.com/glammhair" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
          >
            <Instagram className="w-5 h-5" />
            <span>@glammhair</span>
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {lucyPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:z-10"
              onMouseEnter={() => setHoveredId(photo.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <Image
                src={photo.src}
                alt={`Glamm Hair Extensions Showcase ${photo.id}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Hover Content */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                hoveredId === photo.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6 fill-white" />
                    <span className="font-bold text-lg">{photo.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 fill-white" />
                    <span className="font-bold text-lg">{photo.comments}</span>
                  </div>
                </div>
              </div>
              
              {/* Instagram Icon Badge */}
              <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="https://instagram.com/glammhair"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
          >
            <Instagram className="w-6 h-6" />
            <span>Follow Us on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  )
}

