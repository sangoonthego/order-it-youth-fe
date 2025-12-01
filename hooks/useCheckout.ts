"use client"

import { useCallback, useState } from "react"
import { ordersControllerCheckout } from "@/lib/api/generated/endpoints/orderITYouthAdminAPI"
import type { CheckoutFormData } from "@/types/checkout"
import type { CartItem } from "@/types/cart"
import type { CheckoutOrderDto, ErrorResponseDto, OrderResponseDto } from "@/lib/api/generated/models"

const FULFILLMENT_TYPE_MAP = {
  delivery: "DELIVERY",
  pickup: "PICKUP_SCHOOL",
} as const

const generateIdemKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const validateCheckoutForm = (formData: CheckoutFormData, cart: CartItem[]) => {
  if (!formData.name || !formData.phone) {
    return "Vui lòng nhập đầy đủ thông tin bắt buộc"
  }

  if (formData.deliveryType === "delivery" && !formData.address) {
    return "Vui lòng nhập địa chỉ giao hàng"
  }

  if (cart.length === 0) {
    return "Giỏ hàng của bạn đang trống."
  }

  return null
}

type SubmitCheckoutOptions = {
  formData: CheckoutFormData
  cart: CartItem[]
  paymentMethod: "VIETQR" | "CASH"
}

export function useCheckout() {
  const [backendOrder, setBackendOrder] = useState<OrderResponseDto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const submitCheckout = useCallback(async ({ formData, cart, paymentMethod }: SubmitCheckoutOptions) => {
    const validationError = validateCheckoutForm(formData, cart)
    if (validationError) {
      setApiError(validationError)
      return null
    }

    setIsSubmitting(true)
    setApiError(null)

    try {
      const payload: CheckoutOrderDto = {
        full_name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        note: formData.notes || undefined,
        fulfillment_type: FULFILLMENT_TYPE_MAP[formData.deliveryType],
        payment_method: paymentMethod,
        idem_scope: "checkout",
        idem_key: generateIdemKey(),
        items: cart.map((item) => ({
          quantity: item.quantity,
          price_version: item.priceVersion ?? 1,
          client_price_vnd: item.clientPriceVnd ?? item.price,
          variant_id: item.variantId,
          combo_id: item.comboId,
        })),
      }

      const response = await ordersControllerCheckout(payload)
      if (response.status >= 400) {
        const errorPayload = response.data as ErrorResponseDto
        setApiError(errorPayload?.message ?? "Có lỗi xảy ra khi tạo đơn hàng.")
        return null
      }

      const order = response.data as OrderResponseDto
      setBackendOrder(order)
      console.log("[useCheckout] Checkout success", order)
      return order
    } catch (error) {
      setApiError("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.")
      console.error("[useCheckout] Checkout error", error)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return {
    submitCheckout,
    backendOrder,
    isSubmitting,
    apiError,
  }
}
