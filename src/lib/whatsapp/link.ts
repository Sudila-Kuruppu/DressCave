// WhatsApp link helper
// Placeholder - to be implemented in future stories

const WHATSAPP_BASE_URL = 'https://wa.me';

export function createWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  let url = `${WHATSAPP_BASE_URL}/${cleanNumber}`;
  
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  
  return url;
}

export function createOrderLink(phoneNumber: string, orderMessage: string): string {
  return createWhatsAppLink(phoneNumber, orderMessage);
}
