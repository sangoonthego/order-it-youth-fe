"use client"

import { useCallback, useState } from "react"
import {
  ordersControllerCheckout,
  ordersControllerGetPaymentIntent,
} from "@/lib/api/generated/endpoints/orderITYouthAdminAPI"
import type {
  CheckoutOrderDto,
  ErrorResponseDto,
  OrderResponseDto,
  PaymentIntentResponseDto,
} from "@/lib/api/generated/models"

const generateIdemKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isErrorResponse = (data: unknown): data is ErrorResponseDto => {
  return !!data && typeof data === "object" && "error_code" in data
}

type CheckoutPayloadInput = Omit<CheckoutOrderDto, "idem_scope" | "idem_key">

export function useCheckoutApi() {
  const [backendOrder, setBackendOrder] = useState<OrderResponseDto | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponseDto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const checkout = useCallback(
    async (buildPayload: () => CheckoutPayloadInput) => {
      setIsSubmitting(true)
      setApiError(null)
      setPaymentIntent(null)

      try {
        const basePayload = buildPayload()
        const payload: CheckoutOrderDto = {
          ...basePayload,
          idem_scope: "checkout",
          idem_key: generateIdemKey(),
        }

        const response = await ordersControllerCheckout(payload)
        const data = response.data

        if (isErrorResponse(data)) {
          const message =
            data.message ?? "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại."
          setApiError(message)
          throw new Error(message)
        }

        setBackendOrder(data)
        return data
      } catch (err) {
        console.error("Checkout error", err)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [],
  )

  const fetchPaymentIntent = useCallback(async (orderCode: string) => {
    try {
      const response = await ordersControllerGetPaymentIntent(orderCode)
      const data = response.data

      if (isErrorResponse(data)) {
        const message =
          data.message ?? "Không lấy được thông tin thanh toán. Vui lòng thử lại."
        setApiError(message)
        throw new Error(message)
      }

      setPaymentIntent(data)
      return data
    } catch (err) {
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
