// src/components/FormularioCliente.tsx
import React, { useState, useEffect } from 'react';
import { colorAzul } from '../values/colors';

interface Cliente {
  id?: string;
  nome: string;
  contatos: { tipo: string; valor: string }[];
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface FormularioClienteProps {
  cliente?: Cliente;
  onSubmit: (cliente: Cliente) => void;
  onCancel?: () => void; // Função de cancelar
}

const FormularioCliente: React.FC<FormularioClienteProps> = ({ cliente, onSubmit, onCancel }) => {
  const [nome, setNome] = useState(cliente?.nome || '');
  const [contatos, setContatos] = useState(cliente?.contatos || [{ tipo: '', valor: '' }]);
  const [endereco, setEndereco] = useState(cliente?.endereco || '');
  const [cidade, setCidade] = useState(cliente?.cidade || '');
  const [estado, setEstado] = useState(cliente?.estado || '');
  const [cep, setCep] = useState(cliente?.cep || '');

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setContatos(cliente.contatos || []);
      setEndereco(cliente.endereco || '');
      setCidade(cliente.cidade || '');
      setEstado(cliente.estado || '');
      setCep(cliente.cep || '');
    }
  }, [cliente]);

  // Função para salvar as alterações ou cadastrar um novo cliente
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const clienteData: Cliente = {
      nome,
      contatos,
      endereco,
      cidade,
      estado,
      cep
    };
    onSubmit(clienteData);  // Chama a função onSubmit quando o formulário for enviado
  };

  return (
    <div className="container mt-5" style={{ backgroundColor: '#F5F5F5' }}>
      <h2 style={{ color: colorAzul }}>
        {cliente ? 'Editar Cliente' : 'Cadastrar Cliente'}
      </h2>
      <form onSubmit={handleSubmit}>  {/* Associando a função de submit */}
        {/* Campos do formulário */}
        <div>
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Endereço</label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success">
            {cliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormularioCliente;