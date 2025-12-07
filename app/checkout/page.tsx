"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { ChevronRight, Copy, Check, Trash2, Home, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { useCheckoutApi } from "@/hooks/useCheckoutApi"
import type { CheckoutFormData } from "@/types/checkout"
import type { CartItem } from "@/types/cart"
import type { LocalOrder, LocalOrderStatus } from "@/types/order"
import type { OrderResponseDto, PaymentIntentResponseDto } from "@/lib/api/generated/models"
import { buildVietQrUrl, generateVietQrImage } from "@/lib/payment-vietqr"

const COLOR_PRIMARY = "#A5C858" 
const COLOR_ACCENT = "#F5B1AC" 
const COLOR_SECONDARY = "#FCEDBE" 
const COLOR_BG = "#FCE8E7" 
const COLOR_SUCCESS = "#4CAF50" 

const FULFILLMENT_TYPE_MAP = {
  delivery: "DELIVERY",
  pickup: "PICKUP_SCHOOL",
} as const

const getBankDisplayName = (bank: PaymentIntentResponseDto["bank"]) => {
  const extra = bank as { name?: string; short_name?: string }
  return extra.name ?? extra.short_name ?? bank.bank_code
}

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
  const [vietQrImage, setVietQrImage] = useState<string | null>(null)
  const [vietQrError, setVietQrError] = useState<string | null>(null)
  const [isGeneratingVietQr, setIsGeneratingVietQr] = useState(false)
  const [vietQrRefreshKey, setVietQrRefreshKey] = useState(0)
  const { cart, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const {
    backendOrder,
    paymentIntent,
    isSubmitting,
    apiError,
    setApiError,
    checkout,
    fetchPaymentIntent,
  } = useCheckoutApi()

  useEffect(() => {
    if (!paymentIntent) {
      setVietQrImage(null)
      setVietQrError(null)
      setIsGeneratingVietQr(false)
      return
    }

    let cancelled = false

    const generateQr = async () => {
      setIsGeneratingVietQr(true)
      setVietQrError(null)
      try {
        const result = await generateVietQrImage(paymentIntent)
        if (cancelled) {
          return
        }
        if (result.qrDataUrl) {
          setVietQrImage(result.qrDataUrl)
          setVietQrError(null)
        } else {
          setVietQrImage(null)
          setVietQrError(result.error ?? "Không tạo được mã VietQR tự động.")
        }
      } catch {
        if (cancelled) {
          return
        }
        setVietQrImage(null)
        setVietQrError("Không thể tạo mã VietQR vào lúc này.")
      } finally {
        if (!cancelled) {
          setIsGeneratingVietQr(false)
        }
      }
    }

    generateQr()

    return () => {
      cancelled = true
    }
  }, [paymentIntent, vietQrRefreshKey])

  const bankDisplayName =
    paymentIntent !== null ? getBankDisplayName(paymentIntent.bank) : null
  const bankDisplayWithCode =
    paymentIntent && bankDisplayName
      ? bankDisplayName === paymentIntent.bank.bank_code
        ? bankDisplayName
        : `${bankDisplayName} (${paymentIntent.bank.bank_code})`
      : null

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
  const formatVnd = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value)

  const validateCheckoutForm = () => {
    const phoneRegex = /^0\d{9}$/ 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 

    setApiError(null)

    if (!formData.name || !formData.phone) {
      setApiError("Vui lòng nhập đầy đủ thông tin bắt buộc (Tên và SĐT)")
      return false
    }

    if (!phoneRegex.test(formData.phone)) {
      setApiError("Số điện thoại không hợp lệ (Phải là 10 số, bắt đầu bằng 0)")
      return false
    }

    // Kiểm tra Email nếu nó được nhập (không bắt buộc)
    if (formData.email && !emailRegex.test(formData.email)) {
      setApiError("Địa chỉ Email không hợp lệ (Vui lòng kiểm tra lại @)")
      return false
    }

    if (formData.deliveryType === "delivery" && !formData.address) {
      setApiError("Vui lòng nhập địa chỉ giao hàng")
      return false
    }

    if (cart.length === 0) {
      setApiError("Giỏ hàng của bạn đang trống.")
      return false
    }

    return true
  }

  const submitCheckout = async (paymentMethodParam: "VIETQR" | "CASH") => {
    if (!validateCheckoutForm()) {
      return
    }

    try {
      const order = await checkout(() => ({
        full_name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        note: formData.notes || undefined,
        fulfillment_type: FULFILLMENT_TYPE_MAP[formData.deliveryType],
        payment_method: paymentMethodParam,
        items: cart.map((item) => ({
          quantity: item.quantity,
          price_version: item.priceVersion ?? 1,
          client_price_vnd: item.clientPriceVnd ?? item.price,
          variant_id: item.variantId,
          combo_id: item.comboId,
        })),
      }))

      if (!order) {
        return
      }

      saveOrderToLocalStorage({
        backendOrder: order,
        cart,
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          note: formData.notes,
          deliveryType: formData.deliveryType,
        },
        paymentMethod: paymentMethodParam === "VIETQR" ? "vietqr" : "cash",
      })

      clearCart()

      setPaymentMethod(paymentMethodParam === "VIETQR" ? "vietqr" : "cash")

      if (paymentMethodParam === "VIETQR") {
        await fetchPaymentIntent(order.code)
        setStep(3)
      } else {
        setShowConfetti(true)
        setStep(4)
      }
    } catch {
      // already handled via hook errors
    }
  }

  const handleSelectPayment = async (method: "VIETQR" | "CASH") => {
    await submitCheckout(method)
  }

  const handleRegenerateVietQr = () => {
    if (!paymentIntent || isGeneratingVietQr) {
      return
    }
    setVietQrRefreshKey((prev) => prev + 1)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCheckoutForm()) {
        // Lỗi đã được set bên trong validateCheckoutForm
        return; 
    }
    
    console.log(" Step 1 validation passed, moving to step 2")
    setApiError(null); 
    setStep(2);
  }

  type SaveOrderParams = {
    backendOrder?: OrderResponseDto
    cart: CartItem[]
    customer: {
      name: string
      phone: string
      email?: string
      address?: string
      note?: string
      deliveryType: "delivery" | "pickup"
    }
    paymentMethod: "vietqr" | "cash"
    status?: LocalOrderStatus
  }

  const saveOrderToLocalStorage = (params: SaveOrderParams) => {
    if (typeof window === "undefined") {
      return null
    }

    const { backendOrder, cart, customer, paymentMethod, status = "pending" } = params
    const existing = window.localStorage.getItem("orders")
    let orders: LocalOrder[] = []

    if (existing) {
      try {
        const parsed = JSON.parse(existing)
        if (Array.isArray(parsed)) {
          orders = parsed
        }
      } catch (error) {
        console.error("[saveOrderToLocalStorage] Failed to parse local orders", error)
      }
    }

    const totalOrder = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const createdAt = new Date().toISOString()
    const localOrder: LocalOrder = {
      id: backendOrder?.code ?? `ORDER_${Date.now()}`,
      backendCode: backendOrder?.code,
      items: cart,
      total: totalOrder,
      customerName: customer.name,
      customerEmail: customer.email ?? "",
      customerPhone: customer.phone,
      customerAddress: customer.address,
      deliveryType: customer.deliveryType,
      status,
      paymentMethod,
      createdAt,
      backendMeta: backendOrder
        ? {
            payment_status: backendOrder.payment_status,
            order_status: backendOrder.order_status,
          }
        : undefined,
    }

    orders.unshift(localOrder)
    window.localStorage.setItem("orders", JSON.stringify(orders))
    window.dispatchEvent(new CustomEvent("order-completed", { detail: localOrder }))
    return localOrder
  }

  const handleCompleteOrder = () => {
    setShowConfetti(true)
    setStep(4)
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
            className={`absolute w-2 h-2 rounded-full animate-confetti bg-gradient-to-br from-[${COLOR_PRIMARY}] to-[${COLOR_ACCENT}]`} 
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
    <main 
      className={`min-h-screen bg-white pt-20`}
    >
      <Navigation />

      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${                    s <= step
                      ? `bg-[${COLOR_PRIMARY}] text-white shadow-medium` 
                      : "bg-gray-200 text-gray-600"
                  }`}                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 rounded-full ${s < step ? `bg-[${COLOR_PRIMARY}]` : "bg-gray-300"
                    }`}/>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className={`transition-all ${step >= 1 ? `text-[${COLOR_PRIMARY}]` : "text-gray-500"}`}>Thông tin</span>
            <span className={`transition-all ${step >= 2 ? `text-[${COLOR_PRIMARY}]` : "text-gray-500"}`}>Phương thức</span>
            <span className={`transition-all ${step >= 3 ? `text-[${COLOR_PRIMARY}]` : "text-gray-500"}`}>Thanh toán</span>
            <span className={`transition-all ${step >= 4 ? `text-[${COLOR_SUCCESS}]` : "text-gray-500"}`}>Hoàn tất</span> 
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: User Information */}
            {step === 1 && (
              <div className="card-premium rounded-2xl shadow-elevated p-8 animate-fadeInUp bg-white">
                <h2 className="text-3xl font-bold text-foreground mb-8">Thông tin người ủng hộ</h2>
                <form onSubmit={handleStep1Submit} className="space-y-6">
                  {/* */}
                  {apiError && (
                    <div className={`p-4 rounded-lg bg-[${COLOR_ACCENT}20] border border-[${COLOR_ACCENT}] text-sm font-medium text-foreground`}>
                      {apiError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Họ tên <span className={`text-[${COLOR_ACCENT}] text-red-500`}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-[${COLOR_PRIMARY}] focus:ring-2 focus:ring-[${COLOR_PRIMARY}]/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm`}
                      placeholder="Nhập họ tên của bạn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Số điện thoại <span className={`text-[${COLOR_ACCENT}] text-red-500`}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-[${COLOR_PRIMARY}] focus:ring-2 focus:ring-[${COLOR_PRIMARY}]/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm`}
                      placeholder="0912345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Email <span className={`text-[${COLOR_ACCENT}] text-red-500`}>*</span></label>
                    <input
                      type="email"
                      value={formData.email}
                      required
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-[${COLOR_PRIMARY}] focus:ring-2 focus:ring-[${COLOR_PRIMARY}]/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm`}
                      placeholder="your@email.com"
                    />
                    {/*  */}
                    <p className="mt-2 text-xs text-muted-foreground/80 font-medium italic">
                      Chúng mình sẽ gửi đến Email các thông điệp ý nghĩa cùng những lời tri ân sâu sắc về hành trình của sự sẻ chia này.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">Hình thức nhận hàng</label>
                    <div className="space-y-3">
                      <label 
                        className={`flex items-center p-4 border-2 border-border rounded-lg cursor-pointer transition-all duration-300                           ${formData.deliveryType === "delivery" ? `border-[${COLOR_PRIMARY}] bg-[${COLOR_PRIMARY}10]` : 'border-gray-200 bg-white'} 
                          hover:border-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}05]`}                      >
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
                      <label 
                        className={`flex items-center p-4 border-2 border-border rounded-lg cursor-pointer transition-all duration-300                           ${formData.deliveryType === "pickup" ? `border-[${COLOR_PRIMARY}] bg-[${COLOR_PRIMARY}10]` : 'border-gray-200 bg-white'} 
                          hover:border-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}05]`}                      >
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
                        Địa chỉ giao hàng <span className={`text-[${COLOR_ACCENT}] text-red-500`}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-[${COLOR_PRIMARY}] focus:ring-2 focus:ring-[${COLOR_PRIMARY}]/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm`}
                        placeholder="Nhập địa chỉ giao hàng"
                      />
                      <p className="mt-2 text-xs text-muted-foreground/80 font-medium italic">
                      <span className="font-bold text-red-600">Lưu ý: Chúng mình chỉ ship tại các khu vực trong địa bàn thành phố Đà Nẵng thôi nha!!! </span>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Ghi chú</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-[${COLOR_PRIMARY}] focus:ring-2 focus:ring-[${COLOR_PRIMARY}]/20 transition-all duration-300 text-foreground bg-white/50 backdrop-blur-sm`}
                      placeholder="Ghi chú thêm (tuỳ chọn)"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated flex items-center justify-center gap-2 group bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}e6]`}
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
                <div className="card-premium rounded-2xl shadow-elevated p-8 bg-white">
                  <h2 className="text-3xl font-bold text-foreground mb-8">Chọn phương thức thanh toán</h2>

                  <button
                    onClick={() => handleSelectPayment("VIETQR")}
                    disabled={isSubmitting}
                    className={`w-full mb-6 p-6 border-2 rounded-xl transition-all duration-300 text-left hover:shadow-medium group                       ${isSubmitting ? "opacity-50 cursor-not-allowed" : `hover:bg-[${COLOR_PRIMARY}05]`} 
                      border-[${COLOR_PRIMARY}]`}                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span 
                            className={`inline-block px-4 py-1 text-white text-xs font-bold rounded-full bg-[${COLOR_PRIMARY}]`}
                          >
                            KHUYẾN NGHỊ
                          </span>
                          <h3 
                            className={`text-xl font-bold text-foreground transition-colors ${isSubmitting ? 'text-gray-500' : `group-hover:text-[${COLOR_PRIMARY}]`}`}
                          >
                            {isSubmitting ? "Đang xử lý..." : "Quét VietQR"}
                          </h3>
                        </div>
                        <p className="text-muted-foreground ml-12">Quét mã, chuyển khoản trong 1 bước</p>
                      </div>
                      <div className="text-4xl group-hover:scale-110 transition-transform">📱</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectPayment("CASH")}
                    disabled={isSubmitting}
                    className={`w-full p-6 border-2 rounded-xl transition-all duration-300 text-left hover:shadow-medium group                       ${isSubmitting ? "opacity-50 cursor-not-allowed" : `hover:bg-muted/50 hover:border-[${COLOR_PRIMARY}40]`}
                      border-gray-200`}                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 
                            className={`text-lg font-bold text-foreground mb-2 transition-colors ${isSubmitting ? 'text-gray-500' : ''}`}
                        >
                          {isSubmitting ? "Đang xử lý..." : "Tiền mặt khi nhận"}
                        </h3>
                        <p className="text-muted-foreground">Dành cho bạn không dùng ngân hàng số</p>
                      </div>
                      <div className="text-3xl group-hover:scale-110 transition-transform">💵</div>
                    </div>
                  </button>

                  {apiError && (
                    <p className={`text-sm mt-4 text-[${COLOR_ACCENT}]`}>
                      {apiError}
                    </p>
                  )}
                </div>

                <Button onClick={() => setStep(1)} variant="outline" className="w-full hover:scale-105 hover:bg-white hover:text-gray-900">
                  Quay lại
                </Button>
              </div>
            )}

            {/* Step 3: VietQR Payment */}
            {step === 3 && (
              <div className="card-premium rounded-2xl shadow-elevated p-8 animate-fadeInUp bg-white">
                <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Quét VietQR để thanh toán</h2>
                {backendOrder && (
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Mã đơn hàng: <span className="font-semibold text-foreground">{backendOrder.code}</span>
                  </p>
                )}

                {!paymentIntent ? (
                  <div className="rounded-2xl border border-border/50 bg-muted/50 p-6 text-center space-y-3">
                    <p className="text-muted-foreground font-semibold">Đang tải thông tin thanh toán...</p>
                    {isSubmitting && <p className="text-sm text-foreground">Đang kết nối đến hệ thống...</p>}
                    {!isSubmitting && !apiError && (
                      <p className="text-sm text-muted-foreground">
                        Không tải được thông tin, vui lòng thử lại hoặc quay lại bước trước.
                      </p>
                    )}
                    {apiError && <p className={`text-sm text-[${COLOR_ACCENT}]`}>{apiError}</p>}
                    {backendOrder && !isSubmitting && (
                      <Button variant="outline" size="sm" onClick={() => fetchPaymentIntent(backendOrder.code)}>
                        Thử lại
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {(() => {
                      const fallbackQrUrl = buildVietQrUrl(paymentIntent)
                      const qrUrl = vietQrImage ?? fallbackQrUrl

                      return (
                        <div 
                            className={`rounded-xl px-8 pb-8 pt-4 mb-6 flex flex-col items-center border-2 bg-white border-[${COLOR_PRIMARY}30]`} 
                        >
                          <div className="w-64 h-64 bg-white rounded-lg p-4 shadow-elevated mb-6 flex items-center justify-center border-2 border-primary/10 overflow-hidden">
                            {qrUrl ? (
                              <img
                                src={qrUrl}
                                alt="Mã QR thanh toán VietQR"
                                className="h-full w-full object-cover rounded-lg"
                                loading="lazy"
                              />
                            ) : (
                              <div className="text-center">
                                <div className="text-7xl mb-2 animate-pulse-glow">📲</div>
                                <p className="text-sm text-muted-foreground font-semibold">QR Code VietQR</p>
                              </div>
                            )}
                          </div>
                          <div 
                            className={`text-5xl font-bold text-center text-gray-900`} 
                          >
                            {formatVnd(paymentIntent.amount_vnd)} <span className="text-3xl">đ</span>
                          </div>
                          {isGeneratingVietQr && (
                            <p className="mt-3 text-sm text-muted-foreground text-center">
                              Đang tạo mã VietQR từ thông tin đơn hàng...
                            </p>
                          )}
                          {vietQrError && (
                            <div className="mt-3 text-center space-y-2">
                              <p className={`text-sm text-[${COLOR_ACCENT}]`}>{vietQrError}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegenerateVietQr}
                                disabled={isGeneratingVietQr}
                              >
                                Thử tạo lại mã QR
                              </Button>
                            </div>
                          )}
                          {!qrUrl && !isGeneratingVietQr && !vietQrError && (
                            <p className={`mt-3 text-sm text-center max-w-sm text-[${COLOR_ACCENT}]`}>
                              Không tạo được mã QR tự động vì thiếu thông tin ngân hàng. Vui lòng nhập theo hướng dẫn
                              bên dưới.
                            </p>
                          )}
                        </div>
                      )
                    })()}

                    <div className="text-left text-sm text-muted-foreground mb-6 space-y-1">
                      <p>Chúng mình xin chân thành cảm ơn sự ủng hộ và tấm lòng sẻ chia vô cùng quý báu của bạn. Mỗi đóng góp của bạn là nguồn động lực lớn lao, giúp chúng mình luôn vững bước trên hành trình lan tỏa giá trị.</p>
                      <p>Chúng mình sẽ gửi email xác nhận đã chuyển khoản thành công về mail cho bạn. Cảm ơn bạn đã đồng hành và tin tưởng ủng hộ!!!</p>
                      {/* <p>
                        Nội dung chuyển khoản:{" "}
                        <span className="font-semibold">{paymentIntent.transfer_content}</span>
                      </p> */}
                    </div>

                    <div className="space-y-4 mb-8">
                      {[
                        {
                          label: "Ngân hàng",
                          value: bankDisplayWithCode ?? paymentIntent.bank.bank_code,
                          key: "bank",
                        },
                        {
                          label: "Số tài khoản",
                          value: paymentIntent.bank.account_no,
                          key: "account",
                          copyable: true,
                        },
                        {
                          label: "Chủ tài khoản",
                          value: paymentIntent.bank.account_name,
                          key: "holder",
                        },
                        {
                          label: "Nội dung chuyển khoản",
                          value: paymentIntent.transfer_content,
                          key: "content",
                          special: true,
                          copyable: true,
                        },
                        {
                          label: "Số tiền",
                          value: `${formatVnd(paymentIntent.amount_vnd)} đ`,
                          key: "amount",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className={`rounded-lg p-4 border-2 transition-all duration-300 border-gray-200                             ${item.special ? `bg-[${COLOR_SECONDARY}50]` : 'bg-gray-100'}`}                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">{item.label}</span>
                            {item.copyable ? (
                              <button
                                onClick={() => handleCopy(item.value, item.key)}
                                className={`font-semibold text-sm flex items-center gap-1 transition-colors text-[${COLOR_PRIMARY}]`}
                              >
                                {copied === item.key ? <Check size={16} /> : <Copy size={16} />}
                              </button>
                            ) : null}
                          </div>
                          <p className="font-semibold text-foreground text-lg break-all">{item.value}</p> 
                        </div>
                      ))}
                    </div>

                    {apiError && <p className={`text-sm mb-4 text-[${COLOR_ACCENT}]`}>{apiError}</p>}

                    <div className={`rounded-lg p-6 mb-8 border-l-4 bg-[${COLOR_SECONDARY}80] border-[${COLOR_PRIMARY}]`}>
                      <h3 className="font-bold text-foreground mb-3">Hướng dẫn chuyển khoản:</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• Mở app ngân hàng → Quét QR hoặc nhập thông tin bên trên</li>
                        <li>• Kiểm tra sẵn Số tiền & Nội dung chuyển đúng như trên</li>
                        <li>• Xác nhận chuyển → Đơn sẽ được xác nhận tự động</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleCompleteOrder}
                        className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}e6]`}
                      >
                        ✓ Mình đã chuyển khoản
                      </Button>
                      {/* <div className="flex gap-3">
                        <button className={`flex-1 font-semibold py-2 rounded-lg transition-all duration-300 text-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}10]`}>
                          Lưu mã QR
                        </button>
                        <button className={`flex-1 font-semibold py-2 rounded-lg transition-all duration-300 text-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}10]`}>
                          Sao chép tất cả
                        </button>
                      </div> */}
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                      <details className="cursor-pointer group">
                        <summary className="font-semibold text-foreground hover:text-[#A5C858] transition-colors">
                          Bạn không quét được? Để chúng mình hướng dẫn nhập tay
                        </summary>
                        <div className="mt-3 text-sm text-muted-foreground space-y-2">
                          <p>Nếu QR không quét được, bạn có thể nhập thông tin thủ công:</p>
                          <ul className="ml-4 space-y-1"> 
                            <li>• Số TK: {paymentIntent.bank.account_no}</li>
                            <li>• Ngân hàng: {bankDisplayName ?? paymentIntent.bank.bank_code}</li>
                            <li>• Số tiền: {formatVnd(paymentIntent.amount_vnd)} đ</li>
                            <li>• Nội dung: {paymentIntent.transfer_content}</li>
                          </ul>
                        </div>
                      </details>
                    </div>
                  </>
                )}

                {/* <Button onClick={() => setStep(2)} variant="outline" className="w-full mt-6 hover:bg-white hover:text-gray-900 hover:scale-105">
                  Quay lại - Chọn phương thức khác
                </Button> */}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="card-premium rounded-2xl shadow-elevated p-8 animate-fadeInUp bg-white">
                <div className="text-center mb-8">
                  <div className="text-7xl mb-4 animate-pulse-glow inline-block">✅</div>
                  <h2 
                    className={`text-4xl font-bold mb-4 text-[${COLOR_PRIMARY}]`} 
                  >
                    Cảm ơn bạn rất nhiều!
                  </h2>
                  {backendOrder && (
                    <p className="text-sm text-muted-foreground mb-2">Mã đơn: {backendOrder.code}</p>
                  )}
                  <p className="text-muted-foreground text-lg mb-4">
                    {paymentMethod === "vietqr"
                      ? "Đơn hàng của bạn đã được ghi nhận. Chúng mình sẽ xác nhận sớm nhất."
                      : "Đơn hàng của bạn đã được tạo. Vui lòng chuẩn bị tiền mặt khi nhận hàng."}
                  </p>
                  <div 
                    className={`inline-block px-6 py-2 text-white font-bold rounded-full text-sm border bg-[${COLOR_PRIMARY}] border-[${COLOR_PRIMARY}]`}
                  >
                    {paymentMethod === "vietqr" ? "Chờ xác nhận" : "Chờ giao hàng"}
                  </div>
                </div>

                <div className={`rounded-lg p-6 mb-8 border bg-[${COLOR_SECONDARY}80] border-[${COLOR_PRIMARY}]`}>
                  <p className="text-foreground text-center">
                    Tín dụng của bạn sẽ được cộng vào tài khoản Xuân Tình Nguyện. Nếu cần bổ sung, chúng mình sẽ liên hệ
                    qua SĐT/Email.
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
                  <h3 className="font-bold text-foreground mb-4">Tóm tắt đơn hàng</h3>
                  <div className="space-y-3 mb-4">
                    {backendOrder && backendOrder.items ? (
                      backendOrder.items.map((item, index) => (
                        <div key={`${item.title}-${index}`} className="flex justify-between text-foreground">
                          <span>
                            {item.title} × {item.quantity}
                          </span>
                          <span className="font-semibold">{formatVnd(item.line_total_vnd)} đ</span>
                        </div>
                      ))
                    ) : cart.length === 0 ? (
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
                    <span className={`text-[${COLOR_PRIMARY}]`}>
                      {backendOrder ? `${formatVnd(backendOrder.grand_total_vnd)} đ` : `${(total / 1000).toFixed(0)}K`}
                    </span>
                  </div>
                </div>

                <div className="space-x-3 flex justify-center">
                  <a href="/#marketplace">
                    <Button 
                      className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-medium hover:shadow-elevated flex items-center justify-center gap-2 bg-[${COLOR_PRIMARY}] hover:bg-[${COLOR_PRIMARY}e6] transform hover:scale-105`}
                    >
                      <ShoppingCart size={20} />
                      Tiếp tục mua sắm
                    </Button>
                  </a>      
                  <a href="/" className="block">
                    <Button
                      variant="outline"
                      className={`pt-2 text-gray-900 w-full border-2 border-border rounded-lg py-3 transition-all duration-300 flex items-center justify-center gap-2 bg-transparent hover:bg-white hover:text-gray-900 transform hover:scale-105`}
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
            <div className="sticky top-24 card-premium rounded-2xl shadow-elevated p-6 bg-white">
              <h3 className="text-2xl font-bold text-foreground mb-6">Đơn hàng</h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {(step === 3 || step === 4) && backendOrder && backendOrder.items ? (
                  backendOrder.items.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex justify-between items-start pb-4 border-b border-border">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {(item.line_total_vnd / 1000 / item.quantity).toFixed(0)}K × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`font-bold text-[${COLOR_PRIMARY}]`}>
                          {formatVnd(item.line_total_vnd)} đ
                        </span>
                      </div>
                    </div>
                  ))
                ) : step <= 2 && cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Giỏ trống</p>
                ) : step <= 2 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start pb-4 border-b border-border">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(item.price / 1000).toFixed(0)}K × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`font-bold text-[${COLOR_PRIMARY}]`}>
                          {((item.price * item.quantity) / 1000).toFixed(0)}K
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-all"
                          >
                            −
                          </button>
                          <span className="px-2 py-1 text-sm text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-all"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className={`p-1 transition-colors text-[${COLOR_ACCENT}] hover:text-[${COLOR_ACCENT}a0]`}
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>

              <div className="border-t-2 border-border pt-4">
                {(step === 3 || step === 4) && backendOrder ? (
                  <>
                    <div className="flex justify-between mb-2 text-muted-foreground">
                      <span>Tạm tính:</span>
                      <span>{formatVnd(backendOrder.grand_total_vnd)} đ</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-foreground mb-6">
                      <span>Tổng cộng:</span>
                      <span className={`text-[${COLOR_PRIMARY}]`}>{formatVnd(backendOrder.grand_total_vnd)} đ</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between mb-2 text-muted-foreground">
                      <span>Tạm tính:</span>
                      <span>{(total / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-foreground mb-6">
                      <span>Tổng cộng:</span>
                      <span className={`text-[${COLOR_PRIMARY}]`}>{(total / 1000).toFixed(0)}K</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}