"use client"

import type React from "react"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Copy, Check, Download, Eye } from "lucide-react"
import { useMyOrders } from "@/hooks/useMyOrders"
import type { LocalOrder } from "@/types/order"
import { mapOrderStatusToBadge, mapPaymentStatusToBadge } from "@/lib/order-status"
import Image from "next/image"

// Định nghĩa màu chủ đạo (Tương tự Checkout.tsx)
const COLOR_PRIMARY = "#A5C858" 
const COLOR_ACCENT = "#F5B1AC" 
const COLOR_SECONDARY = "#FCEDBE" 
const COLOR_BG = "#FCE8E7" 
const COLOR_SUCCESS = "#4CAF50" 
const COLOR_ERROR = "#DC2626" // Dùng màu đỏ chuẩn cho lỗi

// Vẫn giữ statusConfig vì nó sử dụng màu cố định, nhưng tôi sẽ chỉnh màu nền cảnh báo (pending)
const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  pending: { color: "bg-amber-100 text-amber-900", label: "Chờ xác nhận", icon: "⏳" },
  confirmed: { color: "bg-blue-100 text-blue-900", label: "Đã xác nhận", icon: "✅" },
  shipped: { color: "bg-purple-100 text-purple-900", label: "Đang giao", icon: "📦" },
  delivered: { color: "bg-green-100 text-green-900", label: "Đã nhận", icon: "🎉" },
  cancelled: { color: "bg-red-100 text-red-900", label: "Đã huỷ", icon: "❌" },
}

export default function MyOrders() {
  const [searchMode, setSearchMode] = useState<"list" | "search">("search")
  const { orders, setOrders, isLoading, error, reload } = useMyOrders()
  const [searchPhone, setSearchPhone] = useState("")
  const [searchOrderId, setSearchOrderId] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "FULFILLING" | "FULFILLED" | "CANCELLED">(
    "ALL",
  )
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const resolveOrderStatus = (order: LocalOrder) =>
    order.backendMeta?.order_status?.toUpperCase() ?? order.status?.toUpperCase() ?? "UNKNOWN"

  const resolvePaymentStatus = (order: LocalOrder) => {
    if (order.backendMeta?.payment_status) {
      return order.backendMeta.payment_status
    }
    if (order.paymentMethod === "cash") {
      return "CASH"
    }
    if (order.status === "delivered" || order.status === "confirmed") {
      return "SUCCESS"
    }
    return "PENDING"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // NOTE: Cần thay thế alert() bằng UI modal tùy chỉnh
    if (!searchPhone && !searchOrderId) {
      alert("Vui lòng nhập số điện thoại hoặc mã đơn")
      return
    }

    const found = orders.find(
      (o) => (searchPhone && o.customerPhone.includes(searchPhone)) || (searchOrderId && o.id.includes(searchOrderId)),
    )

    if (found) {
      setSelectedOrder(found)
    } else {
      alert("Không tìm thấy đơn hàng")
      setSelectedOrder(null)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCancelOrder = () => {
    if (!selectedOrder) return

    const updatedOrders = orders.map((o) => (o.id === selectedOrder.id ? { ...o, status: "cancelled" as const } : o))

    setOrders(updatedOrders)

    const cancelledOrder = { ...selectedOrder, status: "cancelled" as const }
    setSelectedOrder(cancelledOrder)
    setShowCancelConfirm(false)

    console.log("[v0] Order cancelled:", selectedOrder.id)
  }

  const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value)

  const handlePrintOrder = (order: LocalOrder) => {
    const content = `
HOÀN ĐƠN HÀNG - XUÂN TÌNH NGUYỆN 2026
=====================================

MÃ ĐƠN: ${order.id}
Ngày tạo: ${new Date(order.createdAt).toLocaleString("vi-VN")}
Trạng thái: ${statusConfig[order.status].label}

THÔNG TIN NGƯỜI ỦNG HỘ:
- Họ tên: ${order.customerName}
- Số điện thoại: ${order.customerPhone}
- Email: ${order.customerEmail || "Không có"}
- Địa chỉ: ${order.customerAddress || "Lấy tại khoa"}

DANH SÁCH SẢN PHẨM:
${order.items.map((item) => `- ${item.name} x${item.quantity}: ${formatVnd(item.price * item.quantity)} đ`).join("\n")}

TỔNG TIỀN: ${formatVnd(order.total)} đ

PHƯƠNG THỨC THANH TOÁN: ${order.paymentMethod === "vietqr" ? "VietQR" : "Tiền mặt"}

=====================================
Cảm ơn bạn đã ủng hộ Xuân Tình Nguyện 2026!
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${order.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") {
      return true
    }
    return resolveOrderStatus(o) === statusFilter
  })

  return (
    <main 
        className={`min-h-screen bg-white pt-20`}
    >
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#a5c858] mb-3 text-balance">Đơn hàng của bạn</h1>
          {/* <p className="text-lg text-gray-600">Theo dõi và quản lý các đơn hàng ủng hộ của bạn</p> */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {isLoading && <span className="text-sm text-gray-500">Đang tải đơn hàng...</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
            <Button variant="outline" size="sm" className="hover:bg-[#a5c858]" onClick={reload}>
              Làm mới
            </Button>
          </div>
        </div>

        {/* Search Form */}
        <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-[${COLOR_PRIMARY}20] mb-12 animate-fade-in`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tìm đơn hàng</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[${COLOR_PRIMARY}] transition-all duration-300 text-gray-900`}
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Mã đơn hàng</label>
                <input
                  type="text"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[${COLOR_PRIMARY}] transition-all duration-300 text-gray-900`}
                  placeholder="ORD-..."
                />
              </div>
            </div>
            <Button
              type="submit"
              className={`w-full bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}e6] text-white font-semibold py-3 rounded-xl transform hover:scale-102 transition-all duration-300 shadow-lg`}
            >
              Tìm kiếm
            </Button>
          </form>
        </div>

        {/* Selected Order Detail */}
        {selectedOrder && (
          <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-[${COLOR_PRIMARY}20] mb-12 animate-fade-in`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h2>
                <p className="text-gray-600">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-all duration-300"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Status and Info */}
              <div className="md:col-span-2">
                <div className="mb-6 flex flex-wrap gap-2">
                  {(() => {
                    const paymentBadge = mapPaymentStatusToBadge(resolvePaymentStatus(selectedOrder))
                    const orderBadge = mapOrderStatusToBadge(resolveOrderStatus(selectedOrder))
                    return (
                      <>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.colorClass}`}>
                          {paymentBadge.label}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${orderBadge.colorClass}`}>
                          {orderBadge.label}
                        </span>
                      </>
                    )
                  })()}
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Người ủng hộ</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedOrder.customerName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Số điện thoại</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900 text-lg">{selectedOrder.customerPhone}</p>
                      <button
                        onClick={() => handleCopy(selectedOrder.customerPhone, "phone")}
                        className={`text-[${COLOR_PRIMARY}] hover:text-[${COLOR_PRIMARY}a0]`}
                      >
                        {copied === "phone" ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerEmail || "Không có"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-1">Ngày đặt</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                  <h3 className="font-bold text-xl text-gray-900 mb-4">Danh sách sản phẩm</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 bg-[${COLOR_BG}50] rounded-xl border border-gray-200`}
                      >
                        <div className="flex items-center gap-4">
                          
                          {/* */}
                          <div className="w-12 h-12 relative flex-shrink-0">
                            <Image
                              src={`/products/${item.image}.png`} 
                              alt={item.name}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-full"
                            />
                          </div>
                          
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatVnd(item.price)} đ × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold text-gray-900 text-lg`}>
                          {formatVnd(item.price * item.quantity)} đ
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className={`bg-[${COLOR_SECONDARY}] rounded-2xl p-6 border-2 border-[${COLOR_PRIMARY}30] h-fit`}>
                <h3 className="font-bold text-xl text-gray-900 mb-6">Tóm tắt</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-semibold text-gray-900">{formatVnd(selectedOrder.total)} đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí ship:</span>
                    <span className="font-semibold text-gray-900">0đ</span>
                  </div>
                </div>
                <div className="border-t-2 border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Tổng tiền:</span>
                    <span className={`text-3xl font-bold text-gray-900`}>
                      {formatVnd(selectedOrder.total)} đ
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-6 flex">
                  <p className="font-medium mb-2">Phương thức:</p>
                  <p className="font-bold text-gray-900 ml-1.5">
                    {selectedOrder.paymentMethod === "vietqr" ? "VietQR" : "Tiền mặt"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className={`w-full bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}e6] hover:scale-105 text-white font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2`}
                  >
                    <Download size={18} />
                    In đơn hàng
                  </Button>

                  {selectedOrder.status === "pending" && (
                    <Button
                      onClick={() => setShowCancelConfirm(true)}
                      className={`w-full bg-white hover:bg-white hover:scale-105 text-gray-900 font-semibold py-2 rounded-lg transition-all duration-300`}
                    >
                      Huỷ đơn hàng
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Xác nhận huỷ đơn?</h3>
                  <p className="text-gray-600 mb-8">
                    Bạn chắc chắn muốn huỷ đơn hàng <span className="font-bold text-gray-900">{selectedOrder.id}</span>?
                    Hành động này không thể hoàn tác.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 hover:scale-105 font-semibold py-2 rounded-lg transition-all duration-300"
                    >
                      Không
                    </Button>
                    <Button
                      onClick={handleCancelOrder}
                      className={`flex-1 bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_ACCENT}e6] hover:scale-105 text-white font-semibold py-2 rounded-lg transition-all duration-300`}
                    >
                      Huỷ đơn
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedOrder.status === "pending" && !showCancelConfirm && (
              <div className={`bg-[${COLOR_SECONDARY}50] border-l-4 border-[${COLOR_PRIMARY}] p-4 rounded text-gray-900`}>
                <p className="font-semibold">💡 Lưu ý:</p>
                <p>
                  Nếu vẫn chờ xác nhận, bạn có thể sao chép nội dung chuyển khoản và chuyển lại để đảm bảo. Hoặc huỷ đơn
                  nếu không muốn tiếp tục.
                </p>
              </div>
            )}
          </div>
        )}

        {/* All Orders List */}
        {!selectedOrder && orders.length > 0 && (
          <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-[${COLOR_PRIMARY}20] animate-fade-in`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h2>

            {/* Status Filter */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {[
                { value: "ALL", label: "Tất cả" },
                { value: "PENDING", label: "Chờ xử lý" },
                { value: "PAID", label: "Đã thanh toán" },
                { value: "FULFILLING", label: "Đang giao" },
                { value: "FULFILLED", label: "Hoàn tất" },
                { value: "CANCELLED", label: "Đã huỷ" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value as any)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    statusFilter === f.value
                      ? `bg-[${COLOR_PRIMARY}] text-white shadow-lg`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-600 text-lg">Không có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-6 bg-[${COLOR_BG}50] rounded-xl border-2 border-gray-200 hover:border-[${COLOR_PRIMARY}40] hover:shadow-lg transition-all duration-300 hover:scale-102`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg text-gray-900">{order.id}</p>
                          {(() => {
                            const paymentBadge = mapPaymentStatusToBadge(resolvePaymentStatus(order))
                            const orderBadge = mapOrderStatusToBadge(resolveOrderStatus(order))
                            return (
                              <div className="flex gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${paymentBadge.colorClass}`}
                                >
                                  {paymentBadge.label}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${orderBadge.colorClass}`}
                                >
                                  {orderBadge.label}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
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
                          <div>
                            <p className="text-gray-500">Số sản phẩm</p>
                            <p className="font-semibold text-gray-900">{order.items.length} mục</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex flex-col items-end gap-2">
                        <p className="text-gray-500 text-sm">Tổng tiền</p>
                        <p className={`text-2xl font-bold text-[${COLOR_PRIMARY}]`}>
                          {formatVnd(order.total)} đ
                        </p>
                        <Link
                          href={`/my-orders/${order.backendCode ?? order.id}`}
                          className={`text-sm text-[${COLOR_PRIMARY}] hover:underline inline-flex items-center gap-1`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye size={16} />
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {orders.length === 0 && !selectedOrder && (
          <div className={`bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-[${COLOR_PRIMARY}20] animate-fade-in`}>
            <p className="text-6xl mb-4">📦</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Chưa có đơn hàng</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Bạn chưa đặt hàng nào. Hãy ghé thăm cửa hàng để ủng hộ chiến dịch!
            </p>
            <Link href="/checkout">
              <Button className={`bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}e6] text-white px-8 py-3 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg`}>
                Đi đến cửa hàng
              </Button>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </main>
  )
}