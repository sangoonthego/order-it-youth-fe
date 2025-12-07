"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { productsControllerListProducts } from "@/lib/api/generated/endpoints/orderITYouthAdminAPI"
import type { ProductResponseDto, ProductVariantDto } from "@/lib/api/generated/models"

export type MarketplaceProduct = {
  id: string
  productId: string
  name: string
  description?: string
  price: number
  priceVersion: number
  stock: number
  badge?: string
  imageId: string 
  raw: {
    product: ProductResponseDto
    variant: ProductVariantDto
  }
}

const resolveDescription = (description: ProductResponseDto["description"]) => {
  if (!description) return undefined
  if (typeof description === "string") return description
  if (typeof description === "object") {
    const maybeText = (description as Record<string, unknown>).text ?? (description as Record<string, unknown>).content
    if (typeof maybeText === "string") {
      return maybeText
    }
    return JSON.stringify(description)
  }
  return undefined
}

const buildDisplayName = (product: ProductResponseDto, variant: ProductVariantDto) => {
  const extras = [variant.option1, variant.option2].filter(Boolean)
  if (extras.length === 0) {
    return product.name
  }
  return `${product.name} (${extras.join(" / ")})`
}

export function useProducts() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeProducts = useCallback((list: ProductResponseDto[]) => {
    const normalized: MarketplaceProduct[] = []
    
    list.forEach((product) => {
      if (!product.variants || product.variants.length === 0) {
        return
      }
      
      const productName = product.name.trim()
      let customImageId = product.id; // Giá trị mặc định là product.id

      
      if (productName.includes("Nui chiên")) {
          customImageId = "nui-chien"; 
      } else if (productName.includes("Su kem")) {
          customImageId = "su-kem"; 
      }

      product.variants.forEach((variant) => {
        normalized.push({
          id: variant.id,
          productId: product.id,
          name: buildDisplayName(product, variant),
          description: resolveDescription(product.description),
          price: variant.price_vnd,
          priceVersion: variant.price_version,
          stock: variant.stock,
          badge: variant.sku,
          imageId: customImageId, 
          raw: {
            product,
            variant,
          },
        })
      })
    })
    return normalized
  }, [])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await productsControllerListProducts()
      const data = Array.isArray(response?.data) ? (response.data as ProductResponseDto[]) : []
      setProducts(normalizeProducts(data))
    } catch (err: any) {
      console.error("[useProducts] Failed to load products", err)
      setError(err?.response?.data?.message ?? "Không tải được danh sách sản phẩm.")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [normalizeProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const groupedProducts = useMemo(() => products, [products])

  return {
    products: groupedProducts,
    isLoading,
    error,
    reload: fetchProducts,
  }
}