// firebase-service.tsx
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Importando a instância de db configurada no firebase-config

class FirebaseService {
  // Função genérica para salvar dados em qualquer coleção do Firestore
  async saveData(collectionName: string, data: any) {
    try {
      if (Array.isArray(data)) {
        // Se for uma lista, salva todos os itens da lista
        const promises = data.map((item) =>
          addDoc(collection(db, collectionName), item)
        );
        await Promise.all(promises);
      } else {
        // Se for um único objeto
        await addDoc(collection(db, collectionName), data);
      }
      console.log("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }
}

export default new FirebaseService();