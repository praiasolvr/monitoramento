import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { TipoServico } from '../types/TipoServico'; // Importando o tipo

class TipoServicoRepository {
  /**
   * Salva um novo tipo de serviço
   * @param tipoServico Objeto contendo o nome e data de criação
   */
  async save(tipoServico: TipoServico | Omit<TipoServico, 'id'>): Promise<void> {
    // Verifica se o objeto tem a propriedade 'id', se sim, é um tipo de serviço existente
    const ref = 'id' in tipoServico 
      ? doc(db, 'tipo-servico', tipoServico.id)
      : doc(collection(db, 'tipo-servico'));

    await setDoc(ref, {
      nome: tipoServico.nome,
      criadoEm: tipoServico.criadoEm
    });
  }

  /**
   * Retorna todos os tipos de serviço com ID
   */
  async findAll(): Promise<TipoServico[]> {
    const snapshot = await getDocs(collection(db, 'tipo-servico'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Aqui sempre teremos 'id', porque é fornecido pelo Firestore
        nome: data.nome || '',
        criadoEm: data.criadoEm || ''
      };
    });
  }

  /**
   * Busca um tipo de serviço por ID
   */
  async findById(id: string): Promise<TipoServico> {
    const ref = doc(db, 'tipo-servico', id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error('Tipo de serviço não encontrado');
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      nome: data.nome || '',
      criadoEm: data.criadoEm || ''
    };
  }

  /**
   * Atualiza um tipo de serviço pelo ID
   */
  async update(id: string, tipoServico: Partial<TipoServico>): Promise<void> {
    const ref = doc(db, 'tipo-servico', id);
    await updateDoc(ref, tipoServico);
  }

  /**
   * Deleta um tipo de serviço pelo ID
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tipo-servico', id));
  }
}

export default new TipoServicoRepository();