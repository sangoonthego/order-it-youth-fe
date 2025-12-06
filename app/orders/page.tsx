"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  items: CartItem[]
  total: number
  customerName: string
  customerEmail: string
  customerPhone: string
  status: "pending" | "confirmed" | "shipped" | "delivered"
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
}

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đã gửi",
  delivered: "Đã nhận",
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("orders")
    if (saved) {
      setOrders(JSON.parse(saved))
    }
  }, [])

  return (
    <main className="min-h-screen from-blue-50 via-white to-pink-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Đơn hàng của bạn</h1>
          <p className="text-gray-600">Theo dõi và quản lý các đơn hàng ủng hộ của bạn</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
            <p className="text-gray-600 mb-6">Bạn chưa đặt hàng nào. Hãy ghé thăm cửa hàng của chúng tôi!</p>
            <Link href="/order-checkout">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">Đi đến cửa hàng</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-blue-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{order.id}</h3>
                        <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-gray-500">Người đặt</p>
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ngày đặt</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Tổng tiền</p>
                      <p className="text-2xl font-bold text-blue-600">{(order.total / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedOrder && (
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  </div>

                  <div className="mb-6 pb-6 border-b">
                    <div className="mb-4">
                      <p className="text-gray-500 text-sm">Mã đơn</p>
                      <p className="font-bold text-gray-900">{selectedOrder.id}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-500 text-sm">Trạng thái</p>
                      <Badge className={statusColors[selectedOrder.status]}>{statusLabels[selectedOrder.status]}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Ngày tạo</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">Sản phẩm</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-600">x{item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {((item.price * item.quantity) / 1000).toFixed(0)}K
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold text-gray-900">Tổng tiền</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(selectedOrder.total / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm">
                      <p className="text-gray-700">
                        <strong>Cảm ơn</strong> bạn đã ủng hộ Xuân Tình Nguyện 2026. Mỗi đơn hàng của bạn sẽ giúp chúng
                        tôi hoàn thành sứ mệnh tình nguyện.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
