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
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { useEndereco } from '../../hooks/userEndereco';
import { useHistoricoPedidos } from '../../hooks/hooksHistorico';
import EditarPerfilModal from '../../components/EditarPerfilModal';
import EditarEnderecoModal from '../../components/EditarEnderecoModal';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loadingProfile } = useUser();
  const { enderecoPrincipal, loading: loadingEndereco } = useEndereco();
  const { estatisticas } = useHistoricoPedidos();


  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditAddress, setShowEditAddress] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          }
        }
      ]
    );
  };


  const formatarCPF = (cpf: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone: string) => {
    if (!telefone) return 'Não informado';
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatarEndereco = (endereco: any) => {
    if (!endereco) return 'Não cadastrado';
    return `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`;
  };

  const formatarCidadeEstado = (endereco: any) => {
    if (!endereco) return '';
    return `${endereco.cidade}, ${endereco.estado} - ${endereco.cep}`;
  };

  const formatarDataCadastro = () => {
    if (!user?.created_at) return 'Recente';
    try {
      const data = new Date(user.created_at);
      return data.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return 'Recente';
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#48C9B0" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#48C9B0" />
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {profile?.nome || user?.email?.split('@')[0] || 'Usuário'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.memberSince}>
              Membro desde: {formatarDataCadastro()}
            </Text>
          </View>
        </View>

        {/* ============================================================================ */}
        {/*  SEÇÃO  DADOS PESSOAIS */}
        {/* ============================================================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#48C9B0" />
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          </View>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => setShowEditProfile(true)}
          >
            <View style={styles.listItemContent}>
              <View>
                <Text style={styles.listItemLabel}>Nome</Text>
                <Text style={styles.listItemValue}>
                  {profile?.nome || 'Não informado'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View>
                <Text style={styles.listItemLabel}>Email</Text>
                <Text style={styles.listItemValue}>
                  {user?.email || 'Não informado'}
                </Text>
              </View>
              <Ionicons name="lock-closed-outline" size={20} color="#ccc" />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => setShowEditProfile(true)}
          >
            <View style={styles.listItemContent}>
              <View>
                <Text style={styles.listItemLabel}>Telefone</Text>
                <Text style={styles.listItemValue}>
                  {formatarTelefone(profile?.telefone)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View>
                <Text style={styles.listItemLabel}>CPF</Text>
                <Text style={styles.listItemValue}>
                  {formatarCPF(profile?.cpf)}
                </Text>
              </View>
              <Ionicons name="lock-closed-outline" size={20} color="#ccc" />
            </View>
          </View>
        </View>

        {/* ============================================================================ */}
        {/*  SEÇÃO  ENDEREÇO */}
        {/* ============================================================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home-outline" size={20} color="#48C9B0" />
            <Text style={styles.sectionTitle}>Meu Endereço</Text>
          </View>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => setShowEditAddress(true)}
            disabled={loadingEndereco}
          >
            <View style={styles.listItemContent}>
              <View style={styles.addressContainer}>
                <Text style={styles.listItemValue}>
                  {formatarEndereco(enderecoPrincipal)}
                </Text>
                {enderecoPrincipal && (
                  <Text style={styles.addressSubtext}>
                    {formatarCidadeEstado(enderecoPrincipal)}
                  </Text>
                )}
              </View>
              {loadingEndereco ? (
                <ActivityIndicator size="small" color="#48C9B0" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#666" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================================ */}
        {/* SEÇÃO  HISTÓRICO DE COMPRAS */}
        {/* ============================================================================ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#48C9B0" />
            <Text style={styles.sectionTitle}>Histórico de Compras</Text>
          </View>

          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => router.push('/(tabs)/historico')}
          >
            <View style={styles.listItemContent}>
              <View>
                <Text style={styles.listItemValue}>
                  {estatisticas.totalPedidos} pedidos realizados
                </Text>
                <Text style={styles.listItemSubtext}>
                  Valor total: R$ {estatisticas.valorTotal.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

    
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EditarPerfilModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={() => {
          
        }}
      />
      
      <EditarEnderecoModal
        visible={showEditAddress}
        onClose={() => setShowEditAddress(false)}
        onSuccess={() => {
        
        }}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
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

  // Header
  header: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#48C9B0',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#133E4E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
  },

  // Seções
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#133E4E',
    marginLeft: 12,
  },

  // Lista de items
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listItemValue: {
    fontSize: 16,
    color: '#133E4E',
    fontWeight: '500',
  },
  listItemSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },

  // Endereço
  addressContainer: {
    flex: 1,
    marginRight: 12,
  },
  addressSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    backgroundColor: '#fff',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Temporário para TODOs
  todoText: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#856404',
  },

  bottomSpacing: {
    height: 30,
  },
});