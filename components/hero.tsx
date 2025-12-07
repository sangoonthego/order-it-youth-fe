"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useRef } from "react"
import Image from "next/image"
import FallingPetals from "./falling-petals"

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const parentElement = canvas.parentElement as HTMLElement
    if (!parentElement) return

    const setupCanvas = () => {
      canvas.width = parentElement.clientWidth
      canvas.height = parentElement.clientHeight
    }

    setupCanvas()

    const particles: any[] = []
    const particleCount = 50

    class Particle {
      x: number; y: number; vx: number; vy: number; radius: number; opacity: number; life: number;
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 2
        this.vy = (Math.random() - 0.5) * 2
        this.radius = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.3
        this.life = 1
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        this.life -= 0.005
        this.opacity = Math.max(0, this.opacity - 0.01)
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(165, 200, 88, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        if (particle.life <= 0) {
          particles[index] = new Particle()
        }
        particle.update()
        particle.draw(ctx as CanvasRenderingContext2D)
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      setupCanvas()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section 
      className="relative overflow-hidden min-h-screen flex flex-col justify-center items-center px-4"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg3.png"
          alt="Hero Background"
          fill={true}
          priority={true}
          objectFit="cover"
          objectPosition="top"
        />
      </div>
      
      <FallingPetals petalImageSrc="/animations/petal.png" numberOfPetals={40} />
      
      <div className="absolute inset-0 bg-black/20 z-10" />

      <canvas ref={canvasRef} className="absolute inset-0 z-10" /> 
        
      <div className="absolute inset-0 z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#FCE8E7] rounded-full mix-blend-multiply blur-3xl opacity-30 animate-float" />
        <div
          className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#FCEDBE] rounded-full mix-blend-multiply blur-3xl opacity-30"
          style={{ animation: "float 4s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[#D3E281] rounded-full mix-blend-multiply blur-3xl opacity-30"
          style={{ animation: "float 4s ease-in-out infinite 4s" }}
        />
      </div>

      <div className="relative z-20 flex flex-col items-center text-center max-w-3xl space-y-6 py-20"> 
        <Image
          src="/new_title2.svg"
          alt="Xuân 2026 Logo"
          width={580}
          height={420}
          className="mx-auto"
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-0.5 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
          <Link href="#marketplace">
            <Button className="group bg-[#A5C858] hover:bg-[#92B94F] text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
              <span className="flex items-center gap-2">Gửi chút hơi ấm</span>
            </Button>
          </Link>

          <Button className="border-2 border-[#A5C858] hover:bg-[#A5C858]/10 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 bg-white/10 backdrop-blur-sm text-white hover:text-white">
            Tìm hiểu thêm
          </Button>
        </div>
      </div>
    </section>
  )
}
