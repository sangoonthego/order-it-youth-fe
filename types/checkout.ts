export interface CheckoutFormData {
  name: string
  phone: string
  email: string
  address: string
  notes: string
  deliveryType: "delivery" | "pickup"
}
