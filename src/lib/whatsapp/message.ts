// WhatsApp message helper
// Placeholder - to be implemented in future stories

export interface OrderMessage {
  productName: string;
  productPrice: number;
  quantity: number;
  customMeasurements?: Record<string, string>;
  customerName: string;
  customerPhone: string;
}

export function formatOrderMessage(order: OrderMessage): string {
  // Format message for WhatsApp order
  const lines = [
    `*New Order*`,
    `Product: ${order.productName}`,
    `Price: $${order.productPrice}`,
    `Quantity: ${order.quantity}`,
  ];

  if (order.customMeasurements) {
    lines.push('Measurements:');
    Object.entries(order.customMeasurements).forEach(([key, value]) => {
      lines.push(`- ${key}: ${value}`);
    });
  }

  lines.push(`Customer: ${order.customerName}`);
  lines.push(`Phone: ${order.customerPhone}`);

  return lines.join('\n');
}

export function encodeMessage(message: string): string {
  return encodeURIComponent(message);
}
