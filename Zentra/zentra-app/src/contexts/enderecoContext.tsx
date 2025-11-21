import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { enderecoService, EnderecoData } from '../services/enderecoService';
import { useAuth } from './AuthContext';

// ============================================================================
// 📍 TYPES & INTERFACES
// ============================================================================

export interface Endereco {
  id?: string;
  user_id: string;
  tipo: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  numero: string;
  complemento: string;
  estado: string;
  pais: string;
  referencia: string;
  principal: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EnderecoContextType {
  
  enderecos: Endereco[];
  enderecoPrincipal: Endereco | null;
  loading: boolean;
  error: string | null;
  
  criarEndereco: (endereco: Omit<EnderecoData, 'user_id'>) => Promise<boolean>;
  buscarEnderecos: () => Promise<void>;
  atualizarEndereco: (id: string, dados: Partial<EnderecoData>) => Promise<boolean>;
  removerEndereco: (id: string) => Promise<boolean>;
  definirEnderecoPrincipal: (id: string) => Promise<boolean>;
  

  limparErro: () => void;
  recarregarEnderecos: () => Promise<void>;
  validarEndereco: (endereco: Partial<EnderecoData>) => { valido: boolean; erros: string[] };
}


const EnderecoContext = createContext<EnderecoContextType | undefined>(undefined);

export function useEnderecoContext(): EnderecoContextType {
  const context = useContext(EnderecoContext);
  if (!context) {
    throw new Error('useEnderecoContext deve ser usado dentro de EnderecoProvider');
  }
  return context;
}



interface EnderecoProviderProps {
  children: ReactNode;
}

export function EnderecoProvider({ children }: EnderecoProviderProps) {
  const { user } = useAuth();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const enderecoPrincipal = enderecos.find(endereco => endereco.principal) || null;



  useEffect(() => {
    if (user?.id) {
      buscarEnderecos();
    } else {
      setEnderecos([]);
    }
  }, [user?.id]);



  const criarEndereco = async (dadosEndereco: Omit<EnderecoData, 'user_id'>): Promise<boolean> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    const validacao = validarEndereco(dadosEndereco);
    if (!validacao.valido) {
      setError(validacao.erros.join('\n'));
      return false;
    }

    setLoading(true);
    setError(null);

    // Suporte a atualização otimista: se o novo endereço for marcado como principal,
    // atualizamos localmente a flag dos endereços existentes e salvamos o estado anterior
    // para possível rollback em caso de falha.
    let snapshotEnderecos: Endereco[] | null = null;
    const deveMarcarPrincipal = enderecos.length === 0 || !!dadosEndereco.principal;

    try {
      if (deveMarcarPrincipal && enderecos.length > 0) {
        snapshotEnderecos = enderecos.slice();
        const otimista = enderecos.map(e => ({ ...e, principal: false }));
        setEnderecos(otimista);
      }

      const enderecoCompleto: EnderecoData = {
        ...dadosEndereco,
        user_id: user.id,
        principal: deveMarcarPrincipal,
      };

      const resultado = await enderecoService.criaEndereco(enderecoCompleto);

      if (resultado) {
        await buscarEnderecos(); // Recarregar lista com estado do servidor
        return true;
      }

      // se chegou aqui, operação não retornou sucesso
      setError('Erro ao criar endereço');
      // restaura snapshot caso tenhamos aplicado otimização
      if (snapshotEnderecos) setEnderecos(snapshotEnderecos);
      return false;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao criar endereço';
      setError(mensagem);
      // rollback da atualização otimista
      if (snapshotEnderecos) setEnderecos(snapshotEnderecos);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarEnderecos = async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const enderecosUsuario = await enderecoService.buscarEnderecosPorUsuario(user.id);
      setEnderecos(enderecosUsuario || []);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao buscar endereços';
      setError(mensagem);
      setEnderecos([]);
    } finally {
      setLoading(false);
    }
  };

  const atualizarEndereco = async (id: string, dados: Partial<EnderecoData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await enderecoService.atualizarEndereco(id, dados);

      if (resultado) {
        await buscarEnderecos(); 
        return true;
      } else {
        setError('Erro ao atualizar endereço');
        return false;
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao atualizar endereço';
      setError(mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removerEndereco = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await enderecoService.removerEndereco(id);

      if (resultado) {
        await buscarEnderecos(); 
        return true;
      } else {
        setError('Erro ao remover endereço');
        return false;
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao remover endereço';
      setError(mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const definirEnderecoPrincipal = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await enderecoService.definirEnderecoPrincipal(user!.id, id);

      if (resultado) {
        await buscarEnderecos(); 
        return true;
      } else {
        setError('Erro ao definir endereço principal');
        return false;
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao definir endereço principal';
      setError(mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const limparErro = () => setError(null);

  const recarregarEnderecos = async (): Promise<void> => {
    await buscarEnderecos();
  };

  const validarEndereco = (endereco: Partial<EnderecoData>): { valido: boolean; erros: string[] } => {
    const erros: string[] = [];

  
    if (!endereco.tipo) erros.push('Tipo de endereço é obrigatório');
    if (!endereco.cep) erros.push('CEP é obrigatório');
    if (!endereco.logradouro) erros.push('Logradouro é obrigatório');
    if (!endereco.bairro) erros.push('Bairro é obrigatório');
    if (!endereco.cidade) erros.push('Cidade é obrigatória');
    if (!endereco.numero) erros.push('Número é obrigatório');
    if (!endereco.estado) erros.push('Estado é obrigatório');
    if (!endereco.pais) erros.push('País é obrigatório');

  
    if (endereco.cep) {
      const cepLimpo = endereco.cep.replace(/[^\d]/g, '');
      if (cepLimpo.length !== 8) {
        erros.push('CEP deve ter 8 dígitos');
      }
    }

 
    const tiposValidos = ['residencial', 'comercial', 'trabalho', 'outro'];
    if (endereco.tipo && !tiposValidos.includes(endereco.tipo.toLowerCase())) {
      erros.push('Tipo de endereço inválido');
    }

    const estadosValidos = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    if (endereco.estado && !estadosValidos.includes(endereco.estado.toUpperCase())) {
      erros.push('Estado inválido');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  };



  const value: EnderecoContextType = {
   
    enderecos,
    enderecoPrincipal,
    loading,
    error,
    
   
    criarEndereco,
    buscarEnderecos,
    atualizarEndereco,
    removerEndereco,
    definirEnderecoPrincipal,
    
    
    limparErro,
    recarregarEnderecos,
    validarEndereco,
  };

  return (
    <EnderecoContext.Provider value={value}>
      {children}
    </EnderecoContext.Provider>
  );
}
