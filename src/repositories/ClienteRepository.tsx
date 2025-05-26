import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import FirebaseService from '../services/FirebaseService';

import { Cliente } from '../types/Cliente';

class ClienteRepository {
  async save(cliente: Omit<Cliente, 'id'> | Cliente) {
    await FirebaseService.saveData('clientes', cliente);
  }

  async findAll(): Promise<Cliente[]> {
    const snapshot = await getDocs(collection(db, 'clientes'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || '',
        contatos: data.contatos || [],
        endereco: data.endereco || {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        }
      };
    });
  }

  async findById(id: string): Promise<Cliente> {
    const clienteRef = doc(db, 'clientes', id);
    const snapshot = await getDoc(clienteRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        nome: data.nome || '',
        contatos: data.contatos || [],
        endereco: data.endereco || {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        }
      };
    } else {
      throw new Error('Cliente não encontrado');
    }
  }

  async update(id: string, cliente: Partial<Cliente>) {
    const clienteRef = doc(db, 'clientes', id);
    await updateDoc(clienteRef, cliente);
  }

  async delete(id: string) {
    await deleteDoc(doc(db, 'clientes', id));
  }
}

export default new ClienteRepository();