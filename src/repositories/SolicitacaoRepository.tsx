// SolicitationRepository.ts
import {
  doc,
  collection,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

import { Motivo } from '../types/Motivo';


interface SolicitacaoData {
  dataInicio: string;
  dataFim: string;
  veiculo?: string;
  motivo: string;
  descricao: string;
  uid: string;
}



// ---------- Solicitacao ----------
export const criarSolicitacao = async (solicitacao: SolicitacaoData) => {
  if (!solicitacao.uid) {
    console.error('Erro: UID do usuário não foi informado.');
    return;
  }

  const dados = {
    ...solicitacao,
    situacao: 'pendente',
    criadoEm: new Date().toISOString(),
    adminView: true,
  };

  try {
    const usuarioRef = doc(db, 'solicitacoes', solicitacao.uid);
    const usuarioDoc = await getDoc(usuarioRef);

    if (!usuarioDoc.exists()) {
      console.log(`Criando documento do usuário: ${solicitacao.uid}`);
      await setDoc(usuarioRef, {});
    }

    const listaRef = collection(usuarioRef, 'lista_solicitacoes');
    const novaSolicitacaoRef = await addDoc(listaRef, dados);
    console.log('Solicitação criada com sucesso', novaSolicitacaoRef.id);
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
  }
};

// ---------- Motivos CRUD ----------
const motivoCollection = collection(db, 'motivo');

export const buscarMotivos = async (): Promise<Motivo[]> => {
  try {
    const snapshot = await getDocs(motivoCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
  } catch (error) {
    console.error("Erro ao buscar motivos:", error);
    return [];
  }
};

// 🔧 Função auxiliar: busca nome do motivo dado um ID
export const obterNomeMotivo = async (idMotivo: string): Promise<string> => {
  try {
    const motivos = await buscarMotivos();
    const motivo = motivos.find((m) => m.id === idMotivo);
    return motivo?.nome ?? "Motivo não encontrado";
  } catch (error) {
    console.error("Erro ao obter nome do motivo:", error);
    return "Erro ao buscar motivo";
  }
};

export const criarMotivo = async (nome: string): Promise<Motivo> => {
  try {
    const docRef = await addDoc(motivoCollection, { nome });
    return { id: docRef.id, nome };
  } catch (error) {
    console.error('Erro ao criar motivo:', error);
    throw error;
  }
};

export const editarMotivo = async (id: string, nome: string): Promise<void> => {
  try {
    const motivoRef = doc(db, 'motivo', id);
    await updateDoc(motivoRef, { nome });
  } catch (error) {
    console.error('Erro ao editar motivo:', error);
    throw error;
  }
};

export const excluirMotivo = async (id: string): Promise<void> => {
  try {
    const motivoRef = doc(db, 'motivo', id);
    await deleteDoc(motivoRef);
  } catch (error) {
    console.error('Erro ao excluir motivo:', error);
    throw error;
  }
};