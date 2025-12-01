"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { ChevronRight, Copy, Check, Trash2, Home, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { useCheckout } from "@/hooks/useCheckout"
import type { CheckoutFormData } from "@/types/checkout"

export default function Checkout() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    deliveryType: "delivery",
  })
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "cash">("vietqr")
  const [copied, setCopied] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const { cart, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { submitCheckout } = useCheckout()

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId)
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    updateQuantity(productId, newQuantity)
  }

  const total = totalPrice

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc")
      return
    }
    if (formData.deliveryType === "delivery" && !formData.address) {
      alert("Vui lòng nhập địa chỉ giao hàng")
      return
    }
    if (cart.length === 0) {
      alert("Vui lòng chọn sản phẩm trước khi thanh toán")
      return
    }
    console.log("[v0] Step 1 validation passed, moving to step 2")
    setStep(2)
  }

  const saveOrder = (method: "vietqr" | "cash") => {
    const orderId = `ORDER_${Date.now()}`
    const newOrder = {
      id: orderId,
      items: cart,
      total,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      deliveryType: formData.deliveryType,
      status: "pending" as const,
      paymentMethod: method,
      createdAt: new Date().toISOString(),
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const updatedOrders = [newOrder, ...existingOrders]
    localStorage.setItem("orders", JSON.stringify(updatedOrders))

    console.log("[v0] Order saved successfully:", orderId)
    return newOrder
  }

  const handlePaymentSelect = (method: "vietqr" | "cash") => {
    if (method === "vietqr") {
      setPaymentMethod("vietqr")
      setStep(3)
    } else if (method === "cash") {
      const newOrder = saveOrder("cash")
      setPaymentMethod("cash")
      setShowConfetti(true)

      // Clear cart after saving order
      clearCart()
      window.dispatchEvent(new CustomEvent("order-completed", { detail: newOrder }))

      setOrderConfirmed(true)
      setTimeout(() => setStep(4), 800)
    }
  }

  const referenceCode = `ORDER_${Date.now().toString().slice(-6)}`
  const bankAccount = "9704xxxxxxxx1234"
  const bankName = "MB Bank - NAPAS 247"
  const accountHolder = "CLB Tình nguyện CNTT"
  const transferContent = `${referenceCode} - ${formData.name}`

  const handleCompleteOrder = () => {
    const newOrder = saveOrder("vietqr")
    setShowConfetti(true)
    setOrderConfirmed(true)

    // Clear cart after saving order
    clearCart()
    window.dispatchEvent(new CustomEvent("order-completed", { detail: newOrder }))

    setTimeout(() => setStep(4), 800)
  }

  const Confetti = () => {
    const confettiPieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 1,
    }))

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-2 h-2 bg-gradient-to-b from-blue-400 to-pink-400 rounded-full animate-confetti"
            style={{
              left: `${piece.left}%`,
              top: "-10px",
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 font-sans">
      <Navigation />

      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    s <= step
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-medium"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 rounded-full ${
                      s < step ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className={`transition-all ${step >= 1 ? "text-blue-600" : "text-gray-500"}`}>Thông tin</span>
            <span className={`transition-all ${step >= 2 ? "text-blue-600" : "text-gray-500"}`}>Phương thức</span>
            <span className={`transition-all ${step >= 3 ? "text-blue-600" : "text-gray-500"}`}>Thanh toán</span>
            <span className={`transition-all ${step >= 4 ? "text-green-600" : "text-gray-500"}`}>Hoàn tất</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: User Information */}
            {step === 1 && (
              <div className="card-premium rounded-2xl shadow-elevated p-8 animate-fadeInUp">
                <h2 className="text-3xl font-bold text-foreground mb-8">Thông tin người ủng hộ</h2>
                <form onSubmit={handleStep1Submit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Họ tên <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm"
                      placeholder="Nhập họ tên của bạn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Số điện thoại <span className="text-accent">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm"
                      placeholder="0912345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">Hình thức nhận hàng</label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300">
                        <input
                          type="radio"
                          name="delivery"
                          value="delivery"
                          checked={formData.deliveryType === "delivery"}
                          onChange={(e) =>
                            setFormData({ ...formData, deliveryType: e.target.value as "delivery" | "pickup" })
                          }
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-foreground font-medium">Giao tận nơi</span>
                      </label>
                      <label className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300">
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup"
                          checked={formData.deliveryType === "pickup"}
                          onChange={(e) =>
                            setFormData({ ...formData, deliveryType: e.target.value as "delivery" | "pickup" })
                          }
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-foreground font-medium">Lấy tại khoa</span>
                      </label>
                    </div>
                  </div>

                  {formData.deliveryType === "delivery" && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
                        Địa chỉ giao hàng <span className="text-accent">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm"
                        placeholder="Nhập địa chỉ giao hàng"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Ghi chú</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm"
                      placeholder="Ghi chú thêm (tuỳ chọn)"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated flex items-center justify-center gap-2 group"
                  >
                    Tiếp tục – Chọn thanh toán
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment Method Selection */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeInUp">
                <div className="card-premium rounded-2xl shadow-elevated p-8">
                  <h2 className="text-3xl font-bold text-foreground mb-8">Chọn phương thức thanh toán</h2>

                  <button
                    onClick={() => handlePaymentSelect("vietqr")}
                    className="w-full mb-6 p-6 border-2 border-primary/30 rounded-xl hover:bg-primary/5 hover:border-primary/60 transition-all duration-300 text-left hover:shadow-medium group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-4 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full">
                            KHUYẾN NGHỊ
                          </span>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            Quét VietQR
                          </h3>
                        </div>
                        <p className="text-muted-foreground ml-12">Quét mã, chuyển khoản trong 1 bước</p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform">📱</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentSelect("cash")}
                    className="w-full p-6 border-2 border-muted rounded-xl hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 text-left hover:shadow-medium group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          Tiền mặt khi nhận
                        </h3>
                        <p className="text-muted-foreground">Dành cho bạn không dùng ngân hàng số</p>
                      </div>
                      <div className="text-3xl group-hover:scale-110 transition-transform">💵</div>
                    </div>
                  </button>
                </div>

                <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                  Quay lại
                </Button>
              </div>
            )}

            {/* Step 3: VietQR Payment */}
            {step === 3 && (
              <div className="card-premium rounded-2xl shadow-elevated p-8 animate-fadeInUp">
                <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Quét VietQR để ủng hộ</h2>

                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 mb-8 flex flex-col items-center border-2 border-primary/20">
                  <div className="w-48 h-48 bg-white rounded-lg p-4 shadow-elevated mb-6 flex items-center justify-center border-2 border-primary/10">
                    <div className="text-center">
                      <div className="text-7xl mb-2 animate-pulse-glow">📲</div>
                      <p className="text-sm text-muted-foreground font-semibold">QR Code VietQR</p>
                    </div>
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-center">
                    {(total / 1000).toFixed(0)} <span className="text-3xl">đ</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { label: "Ngân hàng", value: bankName, key: "bank" },
                    { label: "Số tài khoản", value: bankAccount, key: "account" },
                    { label: "Chủ tài khoản", value: accountHolder, key: "holder" },
                    { label: "Nội dung chuyển khoản", value: transferContent, key: "content", special: true },
                    { label: "Số tiền", value: `${(total / 1000).toFixed(0)}.000đ`, key: "amount" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`rounded-lg p-4 border-2 transition-all duration-300 ${
                        item.special
                          ? "bg-secondary/20 border-secondary/40 hover:border-secondary/60"
                          : "bg-muted/30 border-muted/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-muted-foreground">{item.label}</span>
                        <button
                          onClick={() => handleCopy(item.value, item.key)}
                          className="text-primary hover:text-accent font-semibold text-sm flex items-center gap-1 transition-colors"
                        >
                          {copied === item.key ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="font-semibold text-foreground text-lg font-mono">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/20 rounded-lg p-6 mb-8 border-l-4 border-secondary">
                  <h3 className="font-bold text-foreground mb-3">Hướng dẫn chuyển khoản:</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Mở app ngân hàng → Quét QR hoặc nhập thông tin bên trên</li>
                    <li>• Kiểm tra sẵn Số tiền & Nội dung chuyển đúng như trên</li>
                    <li>• Xác nhận chuyển → Đơn sẽ được xác nhận ngay</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCompleteOrder}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated"
                  >
                    ✓ Tôi đã chuyển khoản
                  </Button>
                  <div className="flex gap-3">
                    <button className="flex-1 text-primary font-semibold py-2 rounded-lg hover:bg-primary/5 transition-all duration-300">
                      Lưu mã QR
                    </button>
                    <button className="flex-1 text-primary font-semibold py-2 rounded-lg hover:bg-primary/5 transition-all duration-300">
                      Sao chép tất cả
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <details className="cursor-pointer group">
                    <summary className="font-semibold text-foreground hover:text-primary transition-colors">
                      Không quét được? → Hướng dẫn nhập tay
                    </summary>
                    <div className="mt-3 text-sm text-muted-foreground space-y-2">
                      <p>Nếu QR không quét được, bạn có thể nhập thông tin thủ công:</p>
                      <ul className="ml-4 space-y-1 font-mono">
                        <li>• Số TK: {bankAccount}</li>
                        <li>• Ngân hàng: {bankName}</li>
                        <li>• Số tiền: {(total / 1000).toFixed(0)}.000đ</li>
                        <li>• Nội dung: {transferContent}</li>
                      </ul>
                    </div>
                  </details>
                </div>

                <Button onClick={() => setStep(2)} variant="outline" className="w-full mt-6">
                  Quay lại - Chọn phương thức khác
                </Button>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="card-premium rounded-2xl shadow-elevated p-8 animate-fadeInUp">
                <div className="text-center mb-8">
                  <div className="text-7xl mb-4 animate-pulse-glow inline-block">✅</div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    Cảm ơn bạn!
                  </h2>
                  <p className="text-muted-foreground text-lg mb-4">
                    {paymentMethod === "vietqr"
                      ? "Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ xác nhận sớm nhất."
                      : "Đơn hàng của bạn đã được tạo. Vui lòng chuẩn bị tiền mặt khi nhận hàng."}
                  </p>
                  <div className="inline-block px-6 py-2 bg-secondary/30 text-secondary-foreground font-bold rounded-full text-sm border border-secondary/50">
                    {paymentMethod === "vietqr" ? "Chờ xác nhận" : "Chờ giao hàng"}
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-6 mb-8 border border-primary/20">
                  <p className="text-foreground text-center">
                    Tín dụng của bạn sẽ được cộng vào tài khoản Xuân Tình Nguyện. Nếu cần bổ sung, chúng mình sẽ liên hệ
                    qua SĐT/Email.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
                  <h3 className="font-bold text-foreground mb-4">Tóm tắt đơn hàng</h3>
                  <div className="space-y-3 mb-4">
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground">Không có sản phẩm trong đơn này</p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-foreground">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-semibold">{((item.price * item.quantity) / 1000).toFixed(0)}K</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-foreground">
                    <span>Tổng tiền:</span>
                    <span className="text-primary">{(total / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated flex items-center justify-center gap-2">
                    <ShoppingCart size={20} />
                    Tiếp tục mua sắm
                  </Button>
                  <a href="/" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-border rounded-lg py-3 text-foreground hover:bg-primary/5 hover:border-primary/50 bg-transparent transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Home size={20} />
                      Về trang chủ
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 card-premium rounded-2xl shadow-elevated p-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">Đơn hàng</h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Giỏ trống</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b border-border">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(item.price / 1000).toFixed(0)}K × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-primary">
                          {((item.price * item.quantity) / 1000).toFixed(0)}K
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 bg-muted hover:bg-muted/70 rounded text-sm transition-all"
                          >
                            −
                          </button>
                          <span className="px-2 py-1 text-sm text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 bg-muted hover:bg-muted/70 rounded text-sm transition-all"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-accent hover:text-accent/70 p-1 transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t-2 border-border pt-4">
                <div className="flex justify-between mb-2 text-muted-foreground">
                  <span>Tạm tính:</span>
                  <span>{(total / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-foreground mb-6">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{(total / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
