// Production-ready CORS configuration
// Only allow specific origins in production
const allowedOrigins = [
  'https://quizano.com',
  'https://www.quizano.com',
  'https://app.quizano.com',
  // Add your production domains here
];

// In development, allow all origins
const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';

export function getCorsHeaders(origin?: string): HeadersInit {
  // In development, allow all origins
  if (isDevelopment) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };
  }

  // In production, validate origin
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// Legacy export for backward compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
