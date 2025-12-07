"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  customerName: string
  customerPhone: string
  createdAt: string
  status: string
}

export default function OrdersLog() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = () => {
      const saved = localStorage.getItem("orders")
      if (saved) {
        const allOrders = JSON.parse(saved)
        setOrders(allOrders.slice(0, 6))
      }
      setLoading(false)
    }

    loadOrders()

    const handleOrderCompleted = () => {
      loadOrders()
    }
    
    window.addEventListener("order-completed", handleOrderCompleted)
    return () => window.removeEventListener("order-completed", handleOrderCompleted)
  }, [])

  if (loading || orders.length === 0) {
    return null
  }

  const formatVnd = (value: number) =>
      new Intl.NumberFormat("vi-VN").format(value)

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          {/* <div className="inline-block px-4 py-2 from-blue-100 to-pink-100 text-blue-900 font-semibold rounded-full text-sm mb-4 animate-fade-in">
            Ghi nhận ủng hộ
          </div> */}
          <h2 className="text-4xl md:text-5xl font-bold text-[#a5c858] mb-4 text-balance">Những ủng hộ gần đây</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Xin chân thành cảm ơn những trái tim nhân ái đã hưởng ứng lời kêu gọi. Sự ủng hộ của các bạn đã trở thành động lực to lớn cho Xuân Tình Nguyện. Dưới đây là những minh chứng đẹp đẽ của sự sẻ chia.
          </p>
        </div>

        {/* Orders Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="group bg-[#fcedbe] rounded-2xl shadow-lg hover:shadow-2xl border-gray-100 hover:border-blue-300 transition-all duration-300 overflow-hidden animate-fade-in hover:scale-105"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Card Header */}
              <div className="from-blue-50 to-pink-50 p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Mã đơn</p>
                    <p className="font-mono font-bold text-gray-900">{order.id}</p>
                  </div>
                  <div className="text-2xl">💝</div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <div className="mb-4">
                  {/* <p className="text-sm font-medium text-gray-600 mb-1">Người ủng hộ</p> */}
                  {/* <p className="font-bold text-gray-900">{order.customerName}</p> */}
                </div>

                {/* Items Summary */}
                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">SẢN PHẨM</p>
                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-2">
                        <span className="text-sm text-gray-700 font-medium truncate flex-1">{item.name}</span>
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">+{order.items.length - 2} sản phẩm khác</p>
                    )}
                  </div>
                </div>

                {/* Total and Time */}
                <div className="flex items-end justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tổng tiền</p>
                    <p className="text-2xl font-bold bg-clip-text">
                      {formatVnd(order.total)}đ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Link */}
        <div className="text-center pt-10">
          {/* <Link
            href="/my-orders"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#a5c858] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Xem tất cả đơn hàng
            <ArrowRight size={20} />
          </Link> */}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
