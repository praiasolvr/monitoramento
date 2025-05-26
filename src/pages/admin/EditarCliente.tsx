import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClienteRepository from '../../repositories/ClienteRepository';
import { Contato } from '../../types/Cliente';

const EditarCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({
    nome: '',
    contatos: [] as Contato[], // Múltiplos contatos
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarCliente = async () => {
      if (!id) return;

      const clientes = await ClienteRepository.findAll();
      const clienteEncontrado = clientes.find((c: any) => c.id === id);

      if (clienteEncontrado) {
        setCliente({
          nome: clienteEncontrado.nome || '',
          contatos: clienteEncontrado.contatos || [],
          endereco: clienteEncontrado.endereco || {
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: ''
          }
        });
      } else {
        alert('Cliente não encontrado!');
        navigate('/clientes');
      }

      setLoading(false);
    };

    buscarCliente();
  }, [id, navigate]);

  // Função para atualizar os campos do cliente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number, field: keyof Contato) => {
    const { value } = e.target;
    const updatedContatos = [...cliente.contatos];
    updatedContatos[index] = { ...updatedContatos[index], [field]: value };
    setCliente({ ...cliente, contatos: updatedContatos });
  };

  // Adicionar novo contato
  const handleAddContato = () => {
    setCliente({
      ...cliente,
      contatos: [...cliente.contatos, { tipo: '', valor: '' }]
    });
  };

  // Remover contato
  const handleRemoveContato = (index: number) => {
    const updatedContatos = cliente.contatos.filter((_, i) => i !== index);
    setCliente({ ...cliente, contatos: updatedContatos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de contatos
    const contatosValidos = cliente.contatos.filter((contato) => contato.tipo.trim() && contato.valor.trim());

    if (contatosValidos.length === 0) {
      alert('Você precisa adicionar pelo menos um contato válido!');
      return;
    }

    const clienteData = {
      nome: cliente.nome,
      contatos: contatosValidos,
      endereco: cliente.endereco,
      criadoEm: new Date().toISOString(),
    };

    try {
      if (id) {
        await ClienteRepository.update(id, clienteData);
      } else {
        await ClienteRepository.save(clienteData);
      }
      alert('Cliente atualizado com sucesso!');
      navigate('/clientes', { replace: true });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar o cliente.');
    }
  };

  if (loading) {
    return <p>Carregando dados do cliente...</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Editar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            name="nome"
            value={cliente.nome}
            onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
            required
          />
        </div>

        {/* Contatos */}
        <div className="mb-3">
          <label className="form-label">Contatos</label>
          {cliente.contatos.map((contato, index) => (
            <div key={index} className="d-flex gap-2 mt-2">
              <select
                value={contato.tipo}
                onChange={(e) => handleChange(e, index, 'tipo')}
                className="form-control"
              >
                <option value="">Selecione uma opção</option>
                <option value="Telefone">Telefone</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="E-mail">E-mail</option>
              </select>
              <input
                type="text"
                placeholder="ex: (xx) xxxxx-xxxx ou email@dominio.com"
                value={contato.valor}
                onChange={(e) => handleChange(e, index, 'valor')}
                className="form-control"
                required
              />
              {cliente.contatos.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveContato(index)}
                  className="btn btn-danger"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddContato}
            className="btn btn-sm mt-2 btn-primary"
          >
            Adicionar Contato
          </button>
        </div>

        {/* Endereço */}
        <div className="mt-4">
          <label className="form-label">Endereço</label>
          <input
            type="text"
            placeholder="Rua"
            value={cliente.endereco.rua}
            onChange={(e) => setCliente({ ...cliente, endereco: { ...cliente.endereco, rua: e.target.value } })}
            className="form-control mt-2"
            required
          />
          <input
            type="text"
            placeholder="Número"
            value={cliente.endereco.numero}
            onChange={(e) => setCliente({ ...cliente, endereco: { ...cliente.endereco, numero: e.target.value } })}
            className="form-control mt-2"
            required
          />
          <input
            type="text"
            placeholder="Bairro"
            value={cliente.endereco.bairro}
            onChange={(e) => setCliente({ ...cliente, endereco: { ...cliente.endereco, bairro: e.target.value } })}
            className="form-control mt-2"
            required
          />
          <input
            type="text"
            placeholder="Cidade"
            value={cliente.endereco.cidade}
            onChange={(e) => setCliente({ ...cliente, endereco: { ...cliente.endereco, cidade: e.target.value } })}
            className="form-control mt-2"
            required
          />
          <input
            type="text"
            placeholder="Estado"
            value={cliente.endereco.estado}
            onChange={(e) => setCliente({ ...cliente, endereco: { ...cliente.endereco, estado: e.target.value } })}
            className="form-control mt-2"
            required
          />
          <input
            type="text"
            placeholder="CEP"
            value={cliente.endereco.cep}
            onChange={(e) => setCliente({ ...cliente, endereco: { ...cliente.endereco, cep: e.target.value } })}
            className="form-control mt-2"
            required
          />
        </div>

        {/* Botões */}
        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-success">
            {id ? 'Salvar Alterações' : 'Salvar Cliente'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCliente;