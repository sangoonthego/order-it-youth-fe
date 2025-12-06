"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/useProducts"
import type { CartItem } from "@/types/cart"

const leaf = "#A5C858"
const peach = "#F5B1AC"
const softlime = "#D3E281"
const rose = "#FCE8E7"
const sand = "#FCEDBE"

export default function Marketplace() {
  const { products, isLoading, error, reload } = useProducts()
  const [addedProduct, setAddedProduct] = useState<string | null>(null)
  const { cart, addItem, updateQuantity } = useCart()

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existing = cart.find((item) => item.id === product.id)

    if (existing) {
      updateQuantity(product.id, existing.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.imageId, 
        variantId: product.id,
        priceVersion: product.priceVersion,
        clientPriceVnd: product.price,
      }
      addItem(newItem)
    }

    setAddedProduct(productId)
    setTimeout(() => setAddedProduct(null), 2000)
  }

  return (
    <section
      id="marketplace"
      className="py-20 md:py-28 px-4 bg-white relative overflow-hidden"
    >
      {/* background soft tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${rose}40, transparent, ${sand}40)`
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-[#A5C858] mb-4">
            Cửa hàng IT Youth
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Mua sắm những sản phẩm ý nghĩa và ủng hộ cộng đồng tình nguyện cùng chúng mình nhé!
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {error && <span className="text-sm text-red-500">{error}</span>}
            <Button variant="outline" size="sm" className="hover:bg-[#A5C858]" onClick={reload} disabled={isLoading}>
              Làm mới
            </Button>
          </div>
        </div>

        {/* loading skeleton */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border-2 border-muted animate-pulse p-6 h-[320px]"
                style={{
                  background: `linear-gradient(135deg, ${leaf}10, transparent)`
                }}
              >
                <div className="h-32 bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="mt-6 h-10 rounded" style={{ background: `${peach}40` }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-12 text-center mb-12"
            style={{ borderColor: `${leaf}50` }}
          >
            <p className="text-4xl mb-4">🛒</p>
            <p className="text-lg text-muted-foreground">
              Chưa có sản phẩm nào khả dụng.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-elevated animate-fadeInUp"
                style={{
                  borderColor: `${leaf}30`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* product image area */}
                <div
                  className="h-48 flex items-center justify-center relative overflow-hidden" 
                  style={{
                    background: sand
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" />
                  {/*  */}
                  <img 
                      src={`/products/${product.imageId}.png`} 
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                  
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description ?? "Sản phẩm gây quỹ IT Youth"}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-3xl font-bold bg-clip-text text-transparent"
                      style={{
                        backgroundImage: leaf
                      }}
                    >
                      {(product.price / 1000).toFixed(0)}K
                    </span>
                    {/* <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: sand,
                        // color: "#333"
                      }}
                    >
                      Còn: {product.stock}
                    </span> */}
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    className={`w-full font-semibold py-2 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated flex items-center justify-center gap-2 ${
                      addedProduct === product.id
                        ? "bg-green-500 hover:bg-green-600 text-white animate-pulse-glow"
                        : "text-white transform hover:scale-105"
                    }`}
                    style={
                      addedProduct === product.id
                        ? {}
                        : {
                            background: leaf
                          }
                    }
                  >
                    {addedProduct === product.id ? (
                      <>
                        <Check size={18} />
                        Đã thêm!
                      </>
                    ) : (
                      <>
                        {/* <ShoppingCart size={18} /> */}
                        Gửi chút hơi ấm tại đây!!!
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* footer buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout" className="flex-1 sm:flex-none">
            <Button
              className="w-full px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 shadow-elevated hover:shadow-glow-blue flex items-center justify-center gap-2 h-12 transform hover:scale-105 text-white"
              style={{
                background: leaf
              }}
            >
              <ShoppingCart size={20} />
              Đi đến thanh toán
            </Button>
          </Link>

          <Link href="/my-orders" className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 shadow-elevated hover:shadow-glow-blue flex items-center justify-center gap-2 h-12 transform hover:scale-105 text-white"
              style={{
                background: leaf
              }}
            >
              Xem đơn của bạn
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}