import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { 
  usePedidoDetalhes, 
  formatarStatusPedido, 
  formatarDataPedido,
  calcularTempoDecorrido,
  formatarTempoEntrega
} from '../../hooks/hooksHistorico';
import { atualizarPagamento } from '../../services/pagamentoService';
import { atualizarPedido } from '../../services/pedidoService';


function formatarStatusIndividual(status: StatusPedido): { texto: string; cor: string; icone: string } {
  const statusMap: Record<string, { texto: string; cor: string; icone: string }> = {
    CRIADO: { texto: 'Processando', cor: '#f39c12', icone: 'sync-outline' },
    PAGO: { texto: 'Pagamento Aprovado', cor: '#3498db', icone: 'card-outline' },
    PREPARANDO: { texto: 'Preparando', cor: '#f39c12', icone: 'sync-outline' },
    ENVIADO: { texto: 'Em Transporte', cor: '#3498db', icone: 'car-outline' },
    ENTREGUE: { texto: 'Finalizado', cor: '#27ae60', icone: 'checkmark-circle-outline' },
    CANCELADO: { texto: 'Cancelado', cor: '#e74c3c', icone: 'close-circle-outline' },
  };
  return statusMap[status] || statusMap['CRIADO'];
}
import { formatarValor } from '../../hooks/hooksPagamento';
import { Pedido, StatusPedido } from '../../services/pedidoService';



interface StatusTimelineProps {
  pedido: Pedido;
}

function StatusTimeline({ pedido }: StatusTimelineProps) {
 
  const pagamentoAprovado = pedido.pagamentos?.some((p: any) => {
    const s = String((p as any).status || '').toLowerCase();
    return s.includes('aprov') || s === 'approved';
  });


  if (pagamentoAprovado) {
    return (
      <View style={styles.timelineContainer}>
        {/* Processando */}
        <View style={styles.timelineItem}>
          <View style={[styles.timelineIcon, { backgroundColor: '#27ae60' }]}>
            <Ionicons name="sync-outline" size={20} color="#fff" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Processando</Text>
            <Text style={styles.timelineData}>{formatarDataPedido(pedido.created_at)}</Text>
          </View>
        </View>

        {/* Pagamento Aprovado */}
        <View style={styles.timelineItem}>
          <View style={[styles.timelineIcon, { backgroundColor: '#27ae60' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Pagamento Aprovado</Text>
            <Text style={styles.timelineData}>
              {formatarDataPedido(pedido.pagamentos[0]?.data_aprovacao || pedido.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const statusSequencia: StatusPedido[] = ['CRIADO', 'PAGO', 'PREPARANDO', 'ENVIADO', 'ENTREGUE'];
  const statusAtualIndex = statusSequencia.indexOf(pedido.status);
  const isCancelado = pedido.status === 'CANCELADO';

  if (isCancelado) {
    return (
      <View style={styles.timelineContainer}>
        <View style={styles.timelineItem}>
          <View style={[styles.timelineIcon, { backgroundColor: '#e74c3c' }]}>
            <Ionicons name="close-circle" size={20} color="#fff" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Pedido Cancelado</Text>
            <Text style={styles.timelineData}>
              {formatarDataPedido(pedido.updated_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.timelineContainer}>
      {statusSequencia.map((status, index) => {
        const isCompleted = index <= statusAtualIndex;
        const isCurrent = index === statusAtualIndex;
        const statusInfo = formatarStatusIndividual(status);
        
        let dataExibicao = '';
        if (status === 'CRIADO') dataExibicao = pedido.created_at;
        else if (status === 'PAGO' && pedido.pagamentos[0]?.data_aprovacao) {
          dataExibicao = pedido.pagamentos[0].data_aprovacao;
        } else if (status === 'ENTREGUE' && pedido.data_entrega_real) {
          dataExibicao = pedido.data_entrega_real;
        } else if (isCompleted) {
          dataExibicao = pedido.updated_at;
        }

        return (
          <View key={status} style={styles.timelineItem}>
            <View style={[
              styles.timelineIcon,
              {
                backgroundColor: isCompleted ? statusInfo.cor : '#e0e0e0',
                borderWidth: isCurrent ? 3 : 0,
                borderColor: isCurrent ? statusInfo.cor : 'transparent'
              }
            ]}>
              <Ionicons 
                name={isCompleted ? statusInfo.icone as any : 'ellipse-outline'} 
                size={20} 
                color={isCompleted ? '#fff' : '#999'} 
              />
            </View>
            
            <View style={styles.timelineContent}>
              <Text style={[
                styles.timelineTitle,
                { color: isCompleted ? '#333' : '#999' }
              ]}>
                {statusInfo.texto}
              </Text>
              {dataExibicao && isCompleted && (
                <Text style={styles.timelineData}>
                  {formatarDataPedido(dataExibicao)}
                </Text>
              )}
              {status === 'ENVIADO' && pedido.tempo_estimado_entrega && isCompleted && (
                <Text style={styles.timelineInfo}>
                  Tempo estimado: {formatarTempoEntrega(pedido.tempo_estimado_entrega)}
                </Text>
              )}
            </View>
            
            {index < statusSequencia.length - 1 && (
              <View style={[
                styles.timelineLine,
                { backgroundColor: index < statusAtualIndex ? statusInfo.cor : '#e0e0e0' }
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
}



interface ItemDetalhesProps {
  item: any; 
}

function ItemDetalhes({ item }: ItemDetalhesProps) {
  const [showDetalhes, setShowDetalhes] = useState(false);

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={styles.itemHeader}
        onPress={() => setShowDetalhes(!showDetalhes)}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemNome}>{item.produto.nome}</Text>
          <Text style={styles.itemQuantidade}>
            {item.quantidade}x • {formatarValor(item.preco_unitario)} cada
          </Text>
          <View style={styles.itemTags}>
            {item.produto.requer_receita && (
              <View style={styles.receitaTag}>
                <Ionicons name="document-text" size={12} color="#e74c3c" />
                <Text style={styles.receitaText}>Receita</Text>
              </View>
            )}
            {item.produto.controlado && (
              <View style={styles.controladoTag}>
                <Ionicons name="shield-checkmark" size={12} color="#e74c3c" />
                <Text style={styles.controladoText}>Controlado</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.itemPreco}>
          <Text style={styles.itemPrecoTotal}>
            {formatarValor(item.preco_total)}
          </Text>
          <Ionicons 
            name={showDetalhes ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>

      {showDetalhes && (
        <View style={styles.itemDetalhes}>
          {item.produto.principio_ativo && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Princípio Ativo:</Text>
              <Text style={styles.detalheValor}>{item.produto.principio_ativo}</Text>
            </View>
          )}
          
          {item.produto.dosagem && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Dosagem:</Text>
              <Text style={styles.detalheValor}>{item.produto.dosagem}</Text>
            </View>
          )}
          
          {item.produto.apresentacao && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Apresentação:</Text>
              <Text style={styles.detalheValor}>{item.produto.apresentacao}</Text>
            </View>
          )}
          
          {item.produto.fabricante && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Fabricante:</Text>
              <Text style={styles.detalheValor}>{item.produto.fabricante}</Text>
            </View>
          )}
          
          {item.produto.registro_ms && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Registro MS:</Text>
              <Text style={styles.detalheValor}>{item.produto.registro_ms}</Text>
            </View>
          )}
          
          {item.observacoes && (
            <View style={styles.detalheItem}>
              <Text style={styles.detalheLabel}>Observações:</Text>
              <Text style={styles.detalheValor}>{item.observacoes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}


interface PagamentoInfoProps {
  pedido: Pedido;
}

function PagamentoInfo({ pedido }: PagamentoInfoProps) {
  const pagamento = pedido.pagamentos[0]; 
  
  if (!pagamento) return null;


  const pagamentoData = pagamento as any; 
  
  
  const rawStatus = String(pagamentoData.status || '').toLowerCase();
  const isApproved = rawStatus.includes('aprov') || rawStatus === 'approved';
  const isPending = rawStatus.includes('pend') || rawStatus === 'pending';

  const status = isApproved
    ? { cor: '#27ae60', texto: 'Pagamento Aprovado', icone: 'checkmark-circle' }
    : isPending
    ? { cor: '#f39c12', texto: 'Pagamento Pendente', icone: 'time-outline' }
    : { cor: '#95a5a6', texto: String(pagamentoData.status), icone: 'alert-circle-outline' };

  const detectarMetodo = () => {
    if (pagamentoData.payment_type === 'credit_card') return 'Cartão de Crédito';
    if (pagamentoData.payment_type === 'debit_card') return 'Cartão de Débito';
    if (pagamentoData.payment_type === 'account_money') return 'Saldo MP';
    return null; 
  };

  const metodoPagamento = detectarMetodo();

  return (
    <View style={styles.pagamentoContainer}>
      <Text style={styles.secaoTitulo}>Informações de Pagamento</Text>

      {metodoPagamento && (
        <View style={styles.pagamentoItem}>
          <Text style={styles.pagamentoLabel}>Método:</Text>
          <Text style={styles.pagamentoValor}>{metodoPagamento}</Text>
        </View>
      )}
      
      <View style={styles.pagamentoItem}>
        <Text style={styles.pagamentoLabel}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.cor, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }]}>
          <Ionicons name={status.icone as any} size={14} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.statusBadgeText}>{status.texto}</Text>
        </View>
      </View>
      
      <View style={styles.pagamentoItem}>
        <Text style={styles.pagamentoLabel}>Valor Pago:</Text>
        <Text style={styles.pagamentoValor}>{formatarValor(pagamentoData.valor_pago)}</Text>
      </View>
      
    
      {pagamentoData.payment_id && (
        <View style={styles.pagamentoItem}>
          <Text style={styles.pagamentoLabel}>ID Pagamento:</Text>
          <Text style={styles.pagamentoValor}>{pagamentoData.payment_id}</Text>
        </View>
      )}
      
      {pagamentoData.data_aprovacao && (
        <View style={styles.pagamentoItem}>
          <Text style={styles.pagamentoLabel}>Aprovado em:</Text>
          <Text style={styles.pagamentoValor}>
            {formatarDataPedido(pagamentoData.data_aprovacao)}
          </Text>
        </View>
      )}
    </View>
  );
}



export default function PedidoDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const pedidoId = typeof id === 'string' ? parseInt(id) : null;
  
  const { pedido, loading, error, recarregar } = usePedidoDetalhes(pedidoId);

  const handleCancelarPedido = () => {
    Alert.alert(
      'Cancelar Pedido',
      'Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, cancelar', 
          style: 'destructive',
          onPress: async () => {
            if (!pedido) {
              Alert.alert('Erro', 'Pedido não encontrado para cancelamento');
              return;
            }
            try {
         
              if (pedido.pagamentos && Array.isArray(pedido.pagamentos)) {
                await Promise.all(pedido.pagamentos.map(async (p: any) => {
                  try {
                    await atualizarPagamento(p.id, { status: 'CANCELADO' });
                  } catch (err) {
                    console.warn('Falha ao atualizar pagamento', p.id, err);
                  }
                }));
              }

  
              await atualizarPedido(pedido.id, { status: 'CANCELADO' });

              
              recarregar();

             
              Alert.alert('Sucesso', 'Pedido e pagamentos cancelados com sucesso', [
                {
                  text: 'OK',
                  onPress: () => {
                    try {
                      router.replace('/historico' as any);
                    } catch (e) {
                  
                      try { router.back(); } catch (_) {}
                    }
                  }
                }
              ]);
            } catch (err) {
              console.error('Erro ao cancelar pedido:', err);
              Alert.alert('Erro', 'Não foi possível cancelar o pedido. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handleRecomprar = () => {
    Alert.alert(
      'Recomprar',
      'Deseja adicionar todos os itens deste pedido ao carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Adicionar ao carrinho',
          onPress: () => {
            // Implementar recompra
            Alert.alert('Sucesso', 'Itens adicionados ao carrinho');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#48C9B0" />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pedido) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Pedido não encontrado</Text>
          <Text style={styles.errorMessage}>
            {error || 'Não foi possível carregar os detalhes do pedido'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Detecta se existe pagamento aprovado (normalize strings)
  const pagamentoAprovado = pedido.pagamentos?.some((p: any) => {
    const s = String((p as any).status || '').toLowerCase();
    return s.includes('aprov') || s === 'approved';
  });

  // Não permitir cancelamento se pagamento já aprovado
  const podeSerCancelado = !pagamentoAprovado && ['CRIADO', 'PAGO', 'PREPARANDO'].includes(pedido.status);
  // Mostrar prioridade do status de pagamento quando aplicável (ex.: pagamento pendente)
  const pagamentoPendente = pedido.pagamentos?.some((p: any) => {
    const s = String((p as any).status || '').toLowerCase();
    return s.includes('pend') || s === 'pending';
  });

  const statusInfo = pagamentoPendente
    ? { texto: 'Pagamento Pendente', cor: '#f39c12', icone: 'time-outline' }
    : formatarStatusPedido(pedido); // ✅ Passa pedido completo

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
        <TouchableOpacity onPress={recarregar}>
          <Ionicons name="refresh" size={24} color="#48C9B0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações Principais */}
        <View style={styles.mainInfoContainer}>
          <View style={styles.pedidoHeader}>
            <Text style={styles.codigoPedido}>{pedido.codigo_pedido}</Text>
          </View>

          {/* Mostrar apenas o texto do status do pedido (sem tag ao lado) */}
          <Text style={[styles.statusTextHeader, { color: statusInfo.cor }]}>{statusInfo.texto}</Text>

          <Text style={styles.dataPedido}>
            Realizado em {formatarDataPedido(pedido.created_at)}
          </Text>
          
          {pedido.observacoes && (
            <View style={styles.observacoesContainer}>
              <Text style={styles.observacoesLabel}>Observações:</Text>
              <Text style={styles.observacoesTexto}>{pedido.observacoes}</Text>
            </View>
          )}
        </View>

        {/* Timeline do Status */}
        <View style={styles.secaoContainer}>
          <Text style={styles.secaoTitulo}>Status do Pedido</Text>
          <StatusTimeline pedido={pedido} />
        </View>

        {/* Itens do Pedido */}
        <View style={styles.secaoContainer}>
          <Text style={styles.secaoTitulo}>
            Itens do Pedido ({pedido.itens.length})
          </Text>
          {pedido.itens.map((item, index) => (
            <ItemDetalhes key={index} item={item} />
          ))}
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.secaoContainer}>
          <Text style={styles.secaoTitulo}>Resumo Financeiro</Text>
          <View style={styles.resumoFinanceiro}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Subtotal:</Text>
              <Text style={styles.resumoValor}>{formatarValor(pedido.subtotal)}</Text>
            </View>
            
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Taxa de entrega:</Text>
              <Text style={styles.resumoValor}>{formatarValor(pedido.taxa_entrega)}</Text>
            </View>
            
            {pedido.desconto > 0 && (
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Desconto:</Text>
                <Text style={[styles.resumoValor, { color: '#27ae60' }]}>
                  -{formatarValor(pedido.desconto)}
                </Text>
              </View>
            )}
            
            <View style={[styles.resumoItem, styles.totalItem]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValor}>{formatarValor(pedido.total)}</Text>
            </View>
          </View>
        </View>

        {/* Informações de Pagamento */}
        <PagamentoInfo pedido={pedido} />

        {/* Botões de Ação */}
        <View style={styles.acoesContainer}>
          {!pagamentoAprovado && podeSerCancelado && (
            <TouchableOpacity 
              style={styles.botaoCancelar}
              onPress={handleCancelarPedido}
            >
              <Ionicons name="close-circle-outline" size={20} color="#e74c3c" />
              <Text style={styles.botaoCancelarText}>Cancelar Pedido</Text>
            </TouchableOpacity>
          )}

          {pagamentoAprovado ? (
            <TouchableOpacity
              style={[styles.botaoRecomprar, { backgroundColor: '#27ae60', borderColor: '#27ae60' }]}
              onPress={handleRecomprar}
            >
              <Ionicons name="refresh-circle-outline" size={20} color="#fff" />
              <Text style={[styles.botaoRecomprarText, { color: '#fff' }]}>Recomprar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.botaoRecomprar}
              onPress={handleRecomprar}
            >
              <Ionicons name="refresh-circle-outline" size={20} color="#48C9B0" />
              <Text style={styles.botaoRecomprarText}>Recomprar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 0,
  },
  

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 10, 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  content: {
    flex: 1,
  },

 
  mainInfoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codigoPedido: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusTextHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusTextLarge: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  dataPedido: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  observacoesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  observacoesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  observacoesTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Seções
  secaoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },

  // Timeline
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timelineData: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timelineInfo: {
    fontSize: 11,
    color: '#48C9B0',
    marginTop: 2,
    fontStyle: 'italic',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 16,
  },

  // Itens
  itemContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantidade: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    gap: 8,
  },
  receitaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
  },
  receitaText: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '500',
  },
  controladoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
  },
  controladoText: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '500',
  },
  itemPreco: {
    alignItems: 'flex-end',
  },
  itemPrecoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  itemDetalhes: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
    gap: 8,
  },
  detalheItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detalheLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detalheValor: {
    fontSize: 12,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },

  // Resumo Financeiro
  resumoFinanceiro: {
    gap: 12,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumoLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumoValor: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },

  // Pagamento
  pagamentoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  pagamentoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pagamentoLabel: {
    fontSize: 14,
    color: '#666',
  },
  pagamentoValor: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // Ações
  acoesContainer: {
    padding: 20,
    gap: 12,
    marginBottom: 20,
  },
  botaoCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    backgroundColor: '#fff',
    gap: 8,
  },
  botaoCancelarText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
  botaoRecomprar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#48C9B0',
    backgroundColor: '#fff',
    gap: 8,
  },
  botaoRecomprarText: {
    color: '#48C9B0',
    fontSize: 16,
    fontWeight: '500',
  },

  // Estados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#48C9B0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});