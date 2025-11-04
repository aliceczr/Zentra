// ============================================================================
// ⚙️ CONFIGURAÇÕES GLOBAIS DOS SERVIÇOS - ZENTRA APP
// ============================================================================
// Este arquivo centraliza as configurações de todos os serviços
// Para alternar entre mock e Supabase, basta mudar as flags aqui

// ============================================================================
// 🗄️ CONFIGURAÇÕES DO BANCO DE DADOS
// ============================================================================

/**
 * Status da migração para Supabase
 * true = Usar Supabase | false = Usar dados mock
 */
export const DATABASE_CONFIG = {
  // Serviços principais
  USER_SERVICE_USE_SUPABASE: true,      // ✅ Perfil de usuário
  ENDERECO_SERVICE_USE_SUPABASE: true,  // ✅ Sistema de endereços  
  PRODUTO_SERVICE_USE_SUPABASE: true,   // ✅ Catálogo de produtos
  CARRINHO_SERVICE_USE_SUPABASE: true,  // ✅ Carrinho de compras
  PEDIDO_SERVICE_USE_SUPABASE: false,   // ⏳ Sistema de pedidos (em desenvolvimento)
  PAGAMENTO_SERVICE_USE_SUPABASE: false, // ⏳ Sistema de pagamentos (em desenvolvimento)
  
  // Configurações avançadas
  ENABLE_LOGGING: true,                 // Habilitar logs detalhados
  ENABLE_ERROR_TRACKING: true,          // Habilitar rastreamento de erros
  MOCK_DELAY_MS: 300,                   // Delay simulado para mocks (ms)
} as const;

// ============================================================================
// 🔧 FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Verificar se todos os serviços estão usando Supabase
 */
export function isFullyMigrated(): boolean {
  return Object.values(DATABASE_CONFIG).every(value => 
    typeof value === 'boolean' ? value : true
  );
}

/**
 * Obter status da migração por serviço
 */
export function getMigrationStatus() {
  return {
    userService: DATABASE_CONFIG.USER_SERVICE_USE_SUPABASE ? 'Supabase' : 'Mock',
    enderecoService: DATABASE_CONFIG.ENDERECO_SERVICE_USE_SUPABASE ? 'Supabase' : 'Mock',
    produtoService: DATABASE_CONFIG.PRODUTO_SERVICE_USE_SUPABASE ? 'Supabase' : 'Mock',
    carrinhoService: DATABASE_CONFIG.CARRINHO_SERVICE_USE_SUPABASE ? 'Supabase' : 'Mock',
    pedidoService: DATABASE_CONFIG.PEDIDO_SERVICE_USE_SUPABASE ? 'Supabase' : 'Mock',
    pagamentoService: DATABASE_CONFIG.PAGAMENTO_SERVICE_USE_SUPABASE ? 'Supabase' : 'Mock',
    fullyMigrated: isFullyMigrated(),
  };
}

/**
 * Log do status atual da migração
 */
export function logMigrationStatus() {
  const status = getMigrationStatus();
  
  console.log('🗄️ ===== STATUS DA MIGRAÇÃO PARA SUPABASE =====');
  console.log(`👤 User Service: ${status.userService}`);
  console.log(`🏠 Endereço Service: ${status.enderecoService}`);
  console.log(`💊 Produto Service: ${status.produtoService}`);
  console.log(`🛒 Carrinho Service: ${status.carrinhoService}`);
  console.log(`📦 Pedido Service: ${status.pedidoService}`);
  console.log(`💳 Pagamento Service: ${status.pagamentoService}`);
  console.log(`✅ Migração Completa: ${status.fullyMigrated ? 'SIM' : 'NÃO'}`);
  console.log('==============================================');
}

// ============================================================================
// 🎯 CONSTANTES DE TABELAS
// ============================================================================

/**
 * Nomes das tabelas no Supabase
 * Centralizados para evitar erros de digitação
 */
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

// ============================================================================
// 🚀 CONFIGURAÇÕES DE PERFORMANCE
// ============================================================================

export const PERFORMANCE_CONFIG = {
  // Cache
  ENABLE_CACHE: false,               // Habilitar cache local (futuro)
  CACHE_TTL_SECONDS: 300,           // Tempo de vida do cache (5 min)
  
  // Paginação
  DEFAULT_PAGE_SIZE: 20,            // Tamanho padrão da página
  MAX_PAGE_SIZE: 100,               // Tamanho máximo da página
  
  // Timeouts
  REQUEST_TIMEOUT_MS: 10000,        // Timeout para requests (10s)
  CONNECTION_RETRY_COUNT: 3,        // Tentativas de reconexão
  
  // Upload de imagens
  MAX_IMAGE_SIZE_MB: 5,             // Tamanho máximo de imagem (5MB)
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'webp'],
} as const;

// ============================================================================
// 🔐 CONFIGURAÇÕES DE SEGURANÇA
// ============================================================================

export const SECURITY_CONFIG = {
  // Validação
  ENABLE_INPUT_VALIDATION: true,    // Validar inputs rigorosamente
  ENABLE_SQL_INJECTION_PROTECTION: true, // Proteção contra SQL injection
  
  // Logs de segurança
  LOG_FAILED_ATTEMPTS: true,        // Logar tentativas falhas
  LOG_SENSITIVE_OPERATIONS: true,   // Logar operações sensíveis
  
  // Rate limiting (futuro)
  ENABLE_RATE_LIMITING: false,      // Habilitar rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,      // Máximo de requests por minuto
} as const;

// ============================================================================
// 📱 CONFIGURAÇÕES DE DESENVOLVIMENTO
// ============================================================================

export const DEV_CONFIG = {
  // Ambiente
  IS_DEVELOPMENT: __DEV__,          // Detecta automaticamente se é dev
  SHOW_DEBUG_LOGS: __DEV__,         // Mostrar logs de debug apenas em dev
  
  // Mock específico para desenvolvimento
  USE_MOCK_IMAGES: true,            // Usar imagens placeholder em dev
  SIMULATE_SLOW_NETWORK: false,     // Simular rede lenta para testes
  
  // Testes
  ENABLE_TEST_USERS: __DEV__,       // Habilitar usuários de teste
  ENABLE_ADMIN_FEATURES: __DEV__,   // Habilitar recursos de admin em dev
} as const;

// ============================================================================
// 📊 CONFIGURAÇÕES DE ANALYTICS (FUTURO)
// ============================================================================

export const ANALYTICS_CONFIG = {
  ENABLE_ANALYTICS: false,          // Habilitar analytics
  TRACK_USER_BEHAVIOR: false,       // Rastrear comportamento do usuário
  TRACK_PERFORMANCE: false,         // Rastrear performance
  TRACK_ERRORS: true,               // Rastrear erros sempre
} as const;

// ============================================================================
// 🎉 EXPORT DEFAULT CONFIG
// ============================================================================

export default {
  DATABASE: DATABASE_CONFIG,
  TABLES: SUPABASE_TABLES,
  PERFORMANCE: PERFORMANCE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  DEV: DEV_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  
  // Funções utilitárias
  getMigrationStatus,
  logMigrationStatus,
  isFullyMigrated,
} as const;