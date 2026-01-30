import crypto from 'crypto';

const HELEKET_API_URL = 'https://api.heleket.com/v1';
const HELEKET_MERCHANT_ID = process.env.HELEKET_MERCHANT_ID || '';
const HELEKET_API_KEY = process.env.HELEKET_API_KEY || '';

export interface CreateInvoiceParams {
  amount: string;
  currency: string;
  orderId: string;
  toCurrency?: string;
  urlCallback?: string;
  urlSuccess?: string;
  urlReturn?: string;
  lifetime?: number;
  additionalData?: string;
}

export interface InvoiceResponse {
  uuid: string;
  orderId: string;
  amount: string;
  payerAmount: string;
  payerCurrency: string;
  currency: string;
  network?: string;
  address?: string;
  paymentStatus: string;
  url: string;
  expiredAt: number;
  isFinal: boolean;
  createdAt: string;
  addressQrCode?: string;
}

export interface PaymentWebhook {
  uuid: string;
  orderId: string;
  amount: string;
  payerAmount: string;
  payerCurrency: string;
  currency: string;
  paymentStatus: string;
  txid?: string;
  network?: string;
  address?: string;
  from?: string;
  sign: string;
}

function generateSignature(data: Record<string, unknown>): string {
  const sortedKeys = Object.keys(data).sort();
  const signString = sortedKeys
    .filter(key => key !== 'sign' && data[key] !== undefined && data[key] !== null)
    .map(key => String(data[key]))
    .join('');
  
  return crypto
    .createHmac('md5', HELEKET_API_KEY)
    .update(signString)
    .digest('hex');
}

export function verifyWebhookSignature(payload: PaymentWebhook): boolean {
  const receivedSign = payload.sign;
  const dataWithoutSign = { ...payload };
  delete (dataWithoutSign as Record<string, unknown>).sign;
  
  const calculatedSign = generateSignature(dataWithoutSign);
  return receivedSign === calculatedSign;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
  const requestBody: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    order_id: params.orderId,
  };

  if (params.toCurrency) {
    requestBody.to_currency = params.toCurrency;
  }
  if (params.urlCallback) {
    requestBody.url_callback = params.urlCallback;
  }
  if (params.urlSuccess) {
    requestBody.url_success = params.urlSuccess;
  }
  if (params.urlReturn) {
    requestBody.url_return = params.urlReturn;
  }
  if (params.lifetime) {
    requestBody.lifetime = params.lifetime;
  }
  if (params.additionalData) {
    requestBody.additional_data = params.additionalData;
  }

  const sign = generateSignature(requestBody);

  const response = await fetch(`${HELEKET_API_URL}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': HELEKET_MERCHANT_ID,
      'sign': sign,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Heleket API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    uuid: data.result.uuid,
    orderId: data.result.order_id,
    amount: data.result.amount,
    payerAmount: data.result.payer_amount,
    payerCurrency: data.result.payer_currency,
    currency: data.result.currency,
    network: data.result.network,
    address: data.result.address,
    paymentStatus: data.result.payment_status,
    url: data.result.url,
    expiredAt: data.result.expired_at,
    isFinal: data.result.is_final,
    createdAt: data.result.created_at,
    addressQrCode: data.result.address_qr_code,
  };
}

export async function getPaymentInfo(uuid: string): Promise<InvoiceResponse> {
  const requestBody = { uuid };
  const sign = generateSignature(requestBody);

  const response = await fetch(`${HELEKET_API_URL}/payment/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': HELEKET_MERCHANT_ID,
      'sign': sign,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Heleket API error: ${error}`);
  }

  const data = await response.json();
  
  return {
    uuid: data.result.uuid,
    orderId: data.result.order_id,
    amount: data.result.amount,
    payerAmount: data.result.payer_amount,
    payerCurrency: data.result.payer_currency,
    currency: data.result.currency,
    network: data.result.network,
    address: data.result.address,
    paymentStatus: data.result.payment_status,
    url: data.result.url,
    expiredAt: data.result.expired_at,
    isFinal: data.result.is_final,
    createdAt: data.result.created_at,
    addressQrCode: data.result.address_qr_code,
  };
}

export async function getAvailableCurrencies(): Promise<Array<{ currency: string; network: string; name: string }>> {
  const response = await fetch(`${HELEKET_API_URL}/payment/services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': HELEKET_MERCHANT_ID,
    },
  });

  if (!response.ok) {
    return [
      { currency: 'BTC', network: 'BTC', name: 'Bitcoin' },
      { currency: 'ETH', network: 'ETH', name: 'Ethereum' },
      { currency: 'USDT', network: 'TRC20', name: 'Tether (TRC20)' },
      { currency: 'USDT', network: 'ERC20', name: 'Tether (ERC20)' },
      { currency: 'LTC', network: 'LTC', name: 'Litecoin' },
      { currency: 'USDC', network: 'ERC20', name: 'USD Coin (ERC20)' },
    ];
  }

  const data = await response.json();
  return data.result || [];
}

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESS: 'process',
  CONFIRM_CHECK: 'confirm_check',
  PAID: 'paid',
  PAID_OVER: 'paid_over',
  FAIL: 'fail',
  WRONG_AMOUNT: 'wrong_amount',
  CANCEL: 'cancel',
  SYSTEM_FAIL: 'system_fail',
  REFUND_PROCESS: 'refund_process',
  REFUND_FAIL: 'refund_fail',
  REFUND_PAID: 'refund_paid',
};

export function isPaymentComplete(status: string): boolean {
  return status === PAYMENT_STATUSES.PAID || status === PAYMENT_STATUSES.PAID_OVER;
}

export function isPaymentFailed(status: string): boolean {
  return [
    PAYMENT_STATUSES.FAIL,
    PAYMENT_STATUSES.WRONG_AMOUNT,
    PAYMENT_STATUSES.CANCEL,
    PAYMENT_STATUSES.SYSTEM_FAIL,
  ].includes(status);
}
