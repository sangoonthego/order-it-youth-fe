"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useRef } from "react"

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight / 2

    const particles = []
    const particleCount = 50

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      life: number

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
        ctx.fillStyle = `rgba(74, 144, 226, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        if (particle.life <= 0) {
          particles[index] = new Particle()
        }
        particle.update()
        particle.draw(ctx)
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight / 2
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 md:pb-32 px-4">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 z-1">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ animation: "float 4s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ animation: "float 4s ease-in-out infinite 4s" }}
        />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <div className="inline-block bg-gradient-to-r from-blue-100 to-pink-100 text-primary px-4 py-2 rounded-full text-sm font-semibold animate-fadeInUp shadow-soft border border-blue-200/50">
            ✨ Xuân Tình nguyện 2026 - Tình nguyện vì cộng đồng
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight text-balance animate-fadeInUp"
            style={{ animationDelay: "0.1s" }}
          >
            Xuân Tình Nguyện 2026
          </h1>

          <p
            className="text-xl text-muted-foreground leading-relaxed text-balance animate-fadeInUp font-light"
            style={{ animationDelay: "0.2s" }}
          >
            Cùng nhau tạo nên một mùa xuân ý nghĩa. Tham gia hoạt động tình nguyện và ủng hộ các dự án cộng đồng với sức
            mạnh chung từ Liên chi Đoàn khoa CNTT.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            <Link href="#marketplace">
              <Button className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 shadow-elevated hover:shadow-glow-blue transform hover:scale-105">
                <span className="flex items-center gap-2">
                  Mua sắm hỗ trợ
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Button>
            </Link>
            <Button className="border-2 border-primary/40 hover:bg-primary/5 hover:border-primary/60 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 bg-white/40 backdrop-blur-sm text-foreground hover:text-primary">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>

        <div className="relative h-96 md:h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-pink-400 rounded-3xl opacity-15 blur-3xl animate-float" />
          <div
            className="absolute inset-0 bg-gradient-to-tl from-yellow-300 to-pink-300 rounded-3xl opacity-10 blur-3xl"
            style={{ animation: "float 4s ease-in-out infinite 1s" }}
          />

          <div className="relative h-96 w-full max-w-sm card-premium rounded-3xl flex items-center justify-center shadow-elevated hover:shadow-glow-blue transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
            <div className="text-center space-y-4 p-8 animate-slideInUp" style={{ animationDelay: "0.4s" }}>
              <div
                className="text-7xl animate-pulse-glow inline-block"
                style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
              >
                🌸
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mùa Xuân
              </p>
              <p className="text-muted-foreground font-medium text-lg">Ý nghĩa cộng đồng</p>
              <div className="pt-4 text-sm text-muted-foreground">Hơn 500+ tình nguyện viên</div>
            </div>
          </div>

          <div className="absolute top-12 -left-8 w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-60 blur-lg animate-float" />
          <div
            className="absolute bottom-12 -right-8 w-24 h-24 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full opacity-60 blur-lg"
            style={{ animation: "float 4s ease-in-out infinite 2s" }}
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
    </section>
  )
}
