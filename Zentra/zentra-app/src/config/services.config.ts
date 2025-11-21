

// ============================================================================

export const SUPABASE_TABLES = {
  PERFIL_USUARIO: 'perfil_usuario',
  ENDERECO_USUARIO: 'endereco_usuario', 
  CATEGORIAS: 'categorias',
  PRODUTOS: 'produtos',
  CARRINHO: 'carrinho',
  PEDIDOS: 'pedidos',
  ITENS_PEDIDO: 'itens_pedido',
  PAGAMENTOS: 'pagamentos',
  METODOS_PAGAMENTO_USUARIO: 'metodos_pagamento_usuario',
  WEBHOOK_LOG: 'webhook_log',
} as const;



export const PERFORMANCE_CONFIG = {

  ENABLE_CACHE: false,               
  CACHE_TTL_SECONDS: 300,           
  

  DEFAULT_PAGE_SIZE: 20,            
  MAX_PAGE_SIZE: 100,               
  
 
  REQUEST_TIMEOUT_MS: 10000,        
  CONNECTION_RETRY_COUNT: 3,          

  MAX_IMAGE_SIZE_MB: 5,             
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'webp'],
} as const;


export const SECURITY_CONFIG = {
  // Validação
  ENABLE_INPUT_VALIDATION: true,    
  ENABLE_SQL_INJECTION_PROTECTION: true, 
  // Logs de segurança
  LOG_FAILED_ATTEMPTS: true,        
  LOG_SENSITIVE_OPERATIONS: true,   
  
  // Rate limiting (futuro)
  ENABLE_RATE_LIMITING: false,    
  MAX_REQUESTS_PER_MINUTE: 60,      
} as const;


export default {
  TABLES: SUPABASE_TABLES,
  PERFORMANCE: PERFORMANCE_CONFIG,
  SECURITY: SECURITY_CONFIG,
} as const;