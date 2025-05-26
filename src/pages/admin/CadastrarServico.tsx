import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul } from '../../values/colors';
import servicoeRepository from '../../repositories/ServicoRepository';
import clienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';
import { NumericFormat } from 'react-number-format';
import { Servico } from '../../types/Servico';
import { Cliente } from '../../types/Cliente';
import Select from 'react-select';

/**
 * Tela de cadastro e edição de serviços.
 */
const CadastrarServico = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposServico, setTiposServico] = useState<string[]>([]);
  const [servico, setServico] = useState<Servico>({
    id: '',
    tipo: '',
    valor: '',
    cliente: {
      id: '',
      nome: '',
      contatos: [],
    }
  });

  // Carrega dados iniciais
  useEffect(() => {
    // Busca os clientes cadastrados
    clienteRepository.findAll().then(setClientes).catch(console.error);

    // Busca os tipos de serviço da coleção "tipo-servico"
    servicoeRepository.findTiposFromCollection()
      .then(setTiposServico)
      .catch((error) => {
        console.error('Erro ao buscar tipos de serviço:', error);
      });

    // Se estiver editando, busca o serviço atual
    if (id) {
      servicoeRepository.findById(id)
        .then((servicoData) => {
          if (servicoData) {
            setServico({
              id: servicoData.id,
              tipo: servicoData.tipo || '',
              valor: servicoData.valor || '',
              cliente: servicoData.cliente || { id: '', nome: '', contatos: [] }
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar serviço:', error);
        });
    }
  }, [id]);

  /**
   * Atualiza os campos do serviço
   */
  const handleChange = (field: keyof Servico, value: string) => {
    setServico((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Filtra clientes com base no texto digitado no autocomplete
   */
  // const handleClientSearch = (search: string) => {
  //   return clientes
  //     .filter(cliente => cliente.nome.toLowerCase().includes(search.toLowerCase()))
  //     .map(cliente => ({
  //       value: cliente.id,
  //       label: cliente.nome,
  //     }));
  // };

  /**
   * Salva ou atualiza o serviço
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) {
        await servicoeRepository.update(id, servico);
      } else {
        await servicoeRepository.save({
          ...servico,
          criadoEm: new Date().toISOString(),
        });
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Serviço atualizado!' : 'Serviço salvo!',
        text: id ? 'O serviço foi editado com sucesso.' : 'O serviço foi cadastrado com sucesso.',
        confirmButtonColor: colorAzul,
      });

      navigate('/servicos', { replace: true });
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Não foi possível salvar o serviço.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className='menu-responsivel'>
      <div className="container mt-5" style={{ backgroundColor: '#fff', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>
          {id ? 'Editar Serviço' : 'Cadastrar Serviço'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Tipo do Serviço com autocomplete */}
          <div className="mt-4">
            <label>Tipo do Serviço:</label>
            <Select
              value={servico.tipo ? { value: servico.tipo, label: servico.tipo } : null}
              onChange={(selected) => handleChange('tipo', selected?.value || '')}
              options={tiposServico.map(tipo => ({ value: tipo, label: tipo }))}
              isClearable
              isSearchable
              className="mt-2"
              placeholder="Digite ou selecione o tipo..."
              noOptionsMessage={() => "Nenhum tipo encontrado"}
              required
            />
          </div>

          {/* Cliente */}
          <div className="mt-4">
            <label>Nome do Cliente:</label>
            <Select
              value={servico.cliente?.id ? { value: servico.cliente.id, label: servico.cliente.nome } : null}
              onChange={(selectedOption) => {
                const selectedCliente = clientes.find(c => c.id === selectedOption?.value);
                if (selectedCliente) {
                  setServico(prev => ({
                    ...prev,
                    cliente: {
                      id: selectedCliente.id, 
                      nome: selectedCliente.nome,
                      contatos: selectedCliente.contatos,
                    }
                  }));
                }
              }}
              options={clientes.map(cliente => ({
                value: cliente.id,
                label: cliente.nome,
              }))}
              className="mt-2"
              placeholder="Digite o nome do cliente"
              required
            />
          </div>

          {/* Valor */}
          <div className="mt-4">
            <label>Valor:</label>
            <NumericFormat
              placeholder='R$ 150,00'
              value={servico.valor}
              onValueChange={(values) => handleChange('valor', values.value)}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              className="form-control mt-2"
              required
            />
          </div>

          {/* Botão de envio */}
          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              {id ? 'Salvar Alterações' : 'Salvar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarServico;