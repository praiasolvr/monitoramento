import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import FirebaseService from '../services/FirebaseService';
import { Servico } from '../types/Servico';
import { Cliente } from '../types/Cliente';

/**
 * Repositório responsável pelas operações de CRUD para os serviços no Firestore.
 * Abstrai todas as interações com o banco de dados relacionadas à entidade "serviço".
 */
class ServicoRepository {
  /**
   * Salva um novo serviço na coleção "servicos".
   * @param servico Objeto do tipo Servico contendo os dados a serem salvos.
   */
  async save(servico: Servico) {
    await FirebaseService.saveData('servicos', servico);
  }

  /**
   * Retorna todos os serviços cadastrados na coleção "servicos".
   * @returns Lista de objetos do tipo Servico
   */
  async findAll(): Promise<Servico[]> {
    // Faz a leitura dos documentos da coleção "servicos"
    const snapshot = await getDocs(collection(db, 'servicos'));

    // Mapeia os dados dos serviços e retorna a lista
    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        tipo: data.tipo || '',
        valor: data.valor || '',
        cliente: data.cliente as Cliente || undefined, // Cast necessário para manter o tipo correto
        criadoEm: data.criadoEm || '', // Adicionando o campo 'criadoEm'
      };
    });
  }

  /**
   * Retorna os tipos de serviço existentes na coleção "servicos", sem duplicatas.
   * (Usado quando não há uma base separada para tipos de serviço.)
   * @returns Lista de tipos de serviço únicos (string[])
   */
  async findAllTiposServico(): Promise<string[]> {
    const snapshot = await getDocs(collection(db, 'servicos'));

    // Extrai apenas os campos "tipo"
    const tipos = snapshot.docs.map((doc) => doc.data().tipo as string);

    // Remove duplicatas com Set e filtra valores vazios
    const tiposUnicos = Array.from(new Set(tipos)).filter(Boolean);

    return tiposUnicos;
  }

  /**
   * Retorna os tipos de serviço da coleção separada "tipo-servico".
   * (Usado para listar tipos de serviço fixos/autônomos.)
   * @returns Lista de nomes dos tipos de serviço
   */
  async findTiposFromCollection(): Promise<string[]> {
    const snapshot = await getDocs(collection(db, 'tipo-servico'));

    // Mapeia os documentos e retorna apenas o campo "nome"
    return snapshot.docs.map((doc) => doc.data().nome as string).filter(Boolean);
  }

  /**
   * Retorna um serviço da coleção "servicos" com base no ID.
   * @param id ID do serviço a ser consultado
   * @returns Objeto do tipo Servico
   * @throws Erro se o documento não existir
   */
  async findById(id: string): Promise<Servico> {
    const ref = doc(db, 'servicos', id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error('Serviço não encontrado');
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,
      tipo: data.tipo || '',
      valor: data.valor || '',
      cliente: data.cliente as Cliente || undefined,
      criadoEm: data.criadoEm || '', // Garantir que o campo 'criadoEm' está disponível
    };
  }

  // buscar os dados do cliente logado para o cliente publicos
  async findByClienteId(clienteId: string): Promise<Servico[]> {
    const snapshot = await getDocs(collection(db, 'servicos'));
  
    return snapshot.docs
      .filter(doc => doc.data().cliente === clienteId)
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          tipo: data.tipo || '',
          valor: data.valor || '',
          cliente: data.cliente, // aqui será apenas o ID, e está ok
          criadoEm: data.criadoEm || '',
        };
      });
  }


  /**
   * Atualiza um serviço existente com base no ID.
   * @param id ID do serviço a ser atualizado
   * @param servico Objeto com os dados atualizados
   */
  async update(id: string, servico: Servico) {
    const servicoRef = doc(db, 'servicos', id);

    await updateDoc(servicoRef, {
      tipo: servico.tipo,
      valor: servico.valor,
      cliente: servico.cliente,
      criadoEm: servico.criadoEm, // Incluindo a atualização da data de criação, se necessário
    });
  }

  /**
   * Remove um serviço da coleção "servicos" com base no ID.
   * @param id ID do serviço a ser removido
   */
  async delete(id: string) {
    await deleteDoc(doc(db, 'servicos', id));
  }
}

// Exporta uma instância única do repositório para ser usada em toda a aplicação
export default new ServicoRepository();