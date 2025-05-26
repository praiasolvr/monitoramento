import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import tipoServicoRepository from '../../repositories/TipoServicoRepository';
import { colorAzul } from '../../values/colors';

/**
 * Componente para cadastrar, listar, editar e excluir tipos de serviço.
 */
const CadastrarTipoServico = () => {
  const [tipoServico, setTipoServico] = useState<string>(''); // Nome digitado
  const [tiposServico, setTiposServico] = useState<{ id: string; nome: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // ID do item sendo editado
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Buscar todos os tipos ao carregar
  useEffect(() => {
    tipoServicoRepository.findAll().then((dados) => {
      setTiposServico(dados.map((obj: any) => ({ id: obj.id, nome: obj.nome })));
    });
  }, []);

  // Lista filtrada e paginada
  const filteredTiposServico = tiposServico.filter((tipo) =>
    tipo.nome.toLowerCase().includes(search.toLowerCase())
  );
  const sortedTipos = filteredTiposServico.sort((a, b) => a.nome.localeCompare(b.nome));
  const indexOfLast = currentPage * itemsPerPage;
  const currentTipos = sortedTipos.slice(indexOfLast - itemsPerPage, indexOfLast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar existente
        await tipoServicoRepository.update(editingId, { nome: tipoServico });
        setTiposServico((prev) =>
          prev.map((tipo) =>
            tipo.id === editingId ? { ...tipo, nome: tipoServico } : tipo
          )
        );
        await Swal.fire({
          icon: 'success',
          title: 'Tipo de serviço atualizado!',
          confirmButtonColor: colorAzul,
        });
      } else {
        // Criar novo
        await tipoServicoRepository.save({
          nome: tipoServico,
          criadoEm: new Date().toISOString(),
        });
        const atualizados = await tipoServicoRepository.findAll();
        setTiposServico(atualizados.map((obj: any) => ({ id: obj.id, nome: obj.nome })));
        await Swal.fire({
          icon: 'success',
          title: 'Tipo de serviço cadastrado!',
          confirmButtonColor: colorAzul,
        });
      }
      setTipoServico('');
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar tipo de serviço:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível salvar o tipo de serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleEdit = (id: string) => {
    const tipo = tiposServico.find((t) => t.id === id);
    if (tipo) {
      setTipoServico(tipo.nome);
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo
    }
  };

  const handleCancelEdit = () => {
    setTipoServico('');
    setEditingId(null);
  };

  const confirmarExclusao = async (id: string, nome: string) => {
    const result = await Swal.fire({
      title: `Deseja excluir "${nome}"?`,
      text: 'Essa ação não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: colorAzul,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) handleDelete(id);
  };

  const handleDelete = async (id: string) => {
    try {
      await tipoServicoRepository.delete(id);
      setTiposServico((prev) => prev.filter((tipo) => tipo.id !== id));
      await Swal.fire({
        icon: 'success',
        title: 'Excluído!',
        text: 'O tipo de serviço foi removido com sucesso.',
        confirmButtonColor: colorAzul,
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível excluir o tipo de serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="menu-responsivel">
      <div className="container mt-5" style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>
          {editingId ? 'Editar Tipo de Serviço' : 'Cadastrar Tipo de Serviço'}
        </h2>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label>Tipo de Serviço:</label>
            <input
              type="text"
              className="form-control mt-2"
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value)}
              required
            />
          </div>
          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              {editingId ? 'Atualizar Tipo de Serviço' : 'Salvar Tipo de Serviço'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>

        {/* Campo de busca */}
        <div className="mt-5">
          <label>Buscar Tipo de Serviço:</label>
          <input
            type="text"
            className="form-control mt-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite o nome do tipo de serviço"
          />
        </div>

        {/* Lista */}
        <div className="mt-5">
          <h3>Tipos de Serviço Cadastrados</h3>
          <ul className="list-group mt-3">
            {currentTipos.map((tipo) => (
              <li key={tipo.id} className="list-group-item d-flex justify-content-between align-items-center">
                {tipo.nome}
                <div className="d-flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(tipo.id)}>
                    Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => confirmarExclusao(tipo.id, tipo.nome)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Paginação */}
        <div className="mt-4 d-flex justify-content-center">
          {Array.from({ length: Math.ceil(filteredTiposServico.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CadastrarTipoServico;