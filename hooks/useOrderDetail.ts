"use client"

import { useCallback, useEffect, useState } from "react"
import { adminOrdersControllerGet } from "@/lib/api/generated/endpoints/orderITYouthAdminAPI"
import type { OrderResponseDto } from "@/lib/api/generated/models"

export function useOrderDetail(orderCode: string | undefined) {
  const [order, setOrder] = useState<OrderResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderCode) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminOrdersControllerGet(orderCode)
      const data = response?.data
      if (data) {
        setOrder(data as OrderResponseDto)
      } else {
        setOrder(null)
        setError("Không tìm thấy đơn hàng này.")
      }
    } catch (err: any) {
      console.error("[useOrderDetail] Failed to fetch order detail", err)
      const msg =
        err?.response?.data?.message ?? "Không tải được chi tiết đơn hàng. Vui lòng thử lại."
      setError(msg)
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }, [orderCode])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return {
    order,
    isLoading,
    error,
    reload: fetchOrder,
  }
}
