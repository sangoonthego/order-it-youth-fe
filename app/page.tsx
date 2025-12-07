import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import CharitySupport from "@/components/charity-support"
import Activities from "@/components/activities"
import Transparency from "@/components/transparency"
import OrdersLog from "@/components/orders-log"
import Marketplace from "@/components/marketplace"
import Gallery from "@/components/gallery"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen from-blue-50 via-white to-pink-50">
      <Navigation />
      <Hero />
      <CharitySupport/>
      <Activities />
      {/* <Transparency /> */}
      <OrdersLog />
      <Marketplace />
      {/* <Gallery /> */}
      <Footer />
    </main>
  )
}
