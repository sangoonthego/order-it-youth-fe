"use client"

import type { PaymentIntentResponseDto } from "@/lib/api/generated/models"

const VIETQR_ENDPOINT = "https://api.vietqr.io/v2/generate"
const DEFAULT_TEMPLATE = "compact"

export type VietQrTemplate = "compact" | "qr_only"

export interface VietQrPayload {
  acqId: string
  accountNo: string
  accountName: string
  amount: number
  addInfo: string
  format: "text"
  template: VietQrTemplate
}

type VietQrApiResponse = {
  code?: string
  desc?: string
  data?: {
    qrDataURL?: string
    qrCode?: string
  }
}

export interface VietQrGenerationResult {
  qrDataUrl: string | null
  payload: VietQrPayload | null
  error: string | null
  raw?: VietQrApiResponse | null
}

export function buildVietQrPayload(intent?: PaymentIntentResponseDto | null): VietQrPayload | null {
  if (!intent) {
    return null
  }

  const bankCode = intent.bank?.bank_code
  const accountNumber = intent.bank?.account_no
  const accountName = intent.bank?.account_name
  const amount = intent.amount_vnd
  const addInfo = intent.transfer_content

  if (!bankCode || !accountNumber || !accountName || !amount || !addInfo) {
    return null
  }

  return {
    acqId: bankCode,
    accountNo: accountNumber,
    accountName,
    amount,
    addInfo,
    format: "text",
    template: DEFAULT_TEMPLATE,
  }
}

export async function generateVietQrImage(
  intent?: PaymentIntentResponseDto | null,
): Promise<VietQrGenerationResult> {
  const payload = buildVietQrPayload(intent)

  if (!payload) {
    return {
      qrDataUrl: null,
      payload: null,
      error: "Thiếu thông tin để tạo mã VietQR.",
    }
  }

  try {
    const response = await fetch(VIETQR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const message = `VietQR trả về lỗi ${response.status}`
      return { qrDataUrl: null, payload, error: message }
    }

    const data = (await response.json()) as VietQrApiResponse
    const qrDataUrl = data?.data?.qrDataURL ?? null
    const error =
      qrDataUrl === null
        ? data?.desc ?? "Không nhận được dữ liệu mã QR từ VietQR."
        : null

    return {
      qrDataUrl,
      payload,
      error,
      raw: data,
    }
  } catch (error) {
    console.error("[generateVietQrImage] Failed to call VietQR", error)
    return {
      qrDataUrl: null,
      payload,
      error: "Không thể kết nối đến VietQR. Vui lòng thử lại.",
    }
  }
}

export function buildVietQrUrl(intent?: PaymentIntentResponseDto | null): string | null {
  const payload = buildVietQrPayload(intent)
  if (!payload) {
    return null
  }

  const base = "https://img.vietqr.io/image"
  const params = new URLSearchParams()
  params.set("amount", String(payload.amount))
  params.set("addInfo", payload.addInfo)
  params.set("accountName", payload.accountName)

  const encodedBank = encodeURIComponent(payload.acqId)
  const encodedAccount = encodeURIComponent(payload.accountNo)
  const template = payload.template === "qr_only" ? "qr_only" : "compact"

  return `${base}/${encodedBank}-${encodedAccount}-${template}.png?${params.toString()}`
}
