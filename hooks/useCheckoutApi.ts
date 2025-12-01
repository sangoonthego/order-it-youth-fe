"use client"

import { useCallback, useState } from "react"
import {
  ordersControllerCheckout,
  ordersControllerGetPaymentIntent,
} from "@/lib/api/generated/endpoints/orderITYouthAdminAPI"
import type {
  CheckoutOrderDto,
  OrderResponseDto,
  PaymentIntentResponseDto,
} from "@/lib/api/generated/models"

const generateIdemKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useCheckoutApi() {
  const [backendOrder, setBackendOrder] = useState<OrderResponseDto | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponseDto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const checkout = useCallback(async (buildPayload: () => CheckoutOrderDto) => {
    setIsSubmitting(true)
    setApiError(null)
    setPaymentIntent(null)

    try {
      const basePayload = buildPayload()
      const payload: CheckoutOrderDto = {
        ...basePayload,
        idem_scope: basePayload.idem_scope ?? "checkout",
        idem_key: basePayload.idem_key ?? generateIdemKey(),
      }

      const response = await ordersControllerCheckout(payload)
      const order = response.data
      setBackendOrder(order)
      return order
    } catch (err: any) {
      const errorData = err?.response?.data
      const message =
        errorData?.message ??
        "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại."
      setApiError(message)
      console.error("Checkout error", err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const fetchPaymentIntent = useCallback(async (orderCode: string) => {
    try {
      const response = await ordersControllerGetPaymentIntent(orderCode)
      const intent = response.data
      setPaymentIntent(intent)
      return intent
    } catch (err: any) {
      const errorData = err?.response?.data
      const message =
        errorData?.message ??
        "Không lấy được thông tin thanh toán. Vui lòng thử lại."
      setApiError(message)
      console.error("Payment-intent error", err)
      throw err
    }
  }, [])

  return {
    backendOrder,
    paymentIntent,
    isSubmitting,
    apiError,
    setApiError,
    checkout,
    fetchPaymentIntent,
  }
}
