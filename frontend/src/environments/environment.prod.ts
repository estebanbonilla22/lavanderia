declare const window: any;

const runtime = (typeof window !== 'undefined' && window.__env) ? window.__env : {};

export const environment = {
  production: true,
  authApiUrl: runtime.AUTH_API_URL || 'http://localhost:8081',
  laundryApiUrl: runtime.LAUNDRY_API_URL || 'http://localhost:8082',
  orderApiUrl: runtime.ORDER_API_URL || 'http://localhost:8083'
};
