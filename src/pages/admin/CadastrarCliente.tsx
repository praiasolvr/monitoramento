import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colorAzul, colorBranco } from '../../values/colors';
import ClienteRepository from '../../repositories/ClienteRepository';
import Swal from 'sweetalert2';

interface Contato {
  tipo: string;
  valor: string;
  erro: string;
}

const CadastrarCliente = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState('');
  const [contatos, setContatos] = useState<Contato[]>([{ tipo: '', valor: '', erro: '' }]);
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  });

  // Máscara para telefone/whatsapp
  const applyMask = (tipo: string, value: string): string => {
    value = value.replace(/\D/g, '');
    if (tipo === 'Telefone' || tipo === 'WhatsApp') {
      if (value.length <= 2) return value.replace(/^(\d{0,2})/, '($1');
      else if (value.length <= 6) return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      else return value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    return value;
  };

  // Validação para tipos de contato
  const validateContato = (tipo: string, valor: string): string => {
    if (!valor.trim()) return 'Campo obrigatório';

    if (tipo === 'Telefone' || tipo === 'WhatsApp') {
      const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      return telefoneRegex.test(valor) ? '' : 'Telefone inválido';
    }

    if (tipo === 'E-mail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(valor) ? '' : 'E-mail inválido';
    }

    return '';
  };

  // Buscar dados se for edição
  useEffect(() => {
    if (id) {
      ClienteRepository.findById(id)
        .then((cliente) => {
          if (cliente) {
            setNome(cliente.nome || '');
            const contatosCarregados = (cliente.contatos || []).map((c: any) => ({
              tipo: c.tipo || '',
              valor: c.valor || '',
              erro: '',
            }));
            setContatos(contatosCarregados.length ? contatosCarregados : [{ tipo: '', valor: '', erro: '' }]);
            setEndereco(cliente.endereco || {
              rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: ''
            });
          }
        })
        .catch(console.error);
    }
  }, [id]);

  // Adicionar novo contato
  const handleAddContato = () => {
    setContatos([...contatos, { tipo: '', valor: '', erro: '' }]);
  };

  // Remover contato
  const handleRemoveContato = (index: number) => {
    const updated = [...contatos];
    updated.splice(index, 1);
    setContatos(updated);
  };

  // Atualizar tipo do contato e limpar valor
  const handleTipoChange = (index: number, value: string) => {
    const updated = [...contatos];
    updated[index].tipo = value;
    updated[index].valor = '';
    updated[index].erro = 'Campo obrigatório';
    setContatos(updated);
  };

  // Atualizar valor e validar automaticamente
  const handleContatoChange = (index: number, value: string) => {
    const updated = [...contatos];
    const tipo = updated[index].tipo;

    const valorFormatado = tipo === 'Telefone' || tipo === 'WhatsApp'
      ? applyMask(tipo, value)
      : value;

    updated[index].valor = valorFormatado;
    updated[index].erro = validateContato(tipo, valorFormatado);
    setContatos(updated);
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Remove contatos totalmente vazios
    const contatosPreenchidos = contatos.filter(c => c.tipo || c.valor);

    // Valida apenas os preenchidos
    const contatosValidados = contatosPreenchidos.map((c) => ({
      ...c,
      erro: validateContato(c.tipo, c.valor),
    }));

    const contatosValidos = contatosValidados.filter(c => !c.erro && c.tipo && c.valor);

    // Verifica se ao menos um contato válido está presente
    if (contatosValidos.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'É necessário pelo menos um contato válido!',
        confirmButtonColor: '#d33',
      });
      setContatos(contatosValidados);
      return;
    }

    setContatos(contatosValidados);

    const cliente = {
      nome,
      contatos: contatosValidos.map(({ tipo, valor }) => ({ tipo, valor })),
      endereco,
      criadoEm: new Date().toISOString(),
    };

    try {
      if (id) {
        await ClienteRepository.update(id, cliente);
      } else {
        await ClienteRepository.save(cliente);
      }

      await Swal.fire({
        icon: 'success',
        title: id ? 'Cliente atualizado!' : 'Cliente cadastrado!',
        confirmButtonColor: colorAzul,
      });

      navigate('/clientes', { replace: true });
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Falha ao salvar cliente.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="menu-responsivel">
      <div className="container mt-5" style={{ backgroundColor: '#F5F5F5', padding: 20, borderRadius: 8 }}>
        <h2 style={{ color: colorAzul }}>{id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="mt-3">
            <label>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Contatos */}
          <div className="mt-3">
            <label>Contatos:</label>
            {contatos.map((contato, index) => (
              <div key={index} className="mt-2">
                <div className="d-flex gap-2">
                  <select
                    value={contato.tipo}
                    onChange={(e) => handleTipoChange(index, e.target.value)}
                    className="form-control"
                  >
                    <option value="">Tipo</option>
                    <option value="Telefone">Telefone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="E-mail">E-mail</option>
                  </select>
                  <input
                    type="text"
                    placeholder="ex: (xx) xxxxx-xxxx ou email@dominio.com"
                    value={contato.valor}
                    onChange={(e) => handleContatoChange(index, e.target.value)}
                    className={`form-control ${contato.erro ? 'is-invalid' : ''}`}
                  />
                  {contatos.length > 1 && (
                    <button type="button" onClick={() => handleRemoveContato(index)} className="btn btn-danger">
                      Remover
                    </button>
                  )}
                </div>
                {contato.erro && (
                  <small className="text-danger">{contato.erro}</small>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddContato}
              className="btn btn-sm mt-2"
              style={{ backgroundColor: colorAzul, color: colorBranco }}
            >
              Adicionar Contato
            </button>
          </div>

          {/* Endereço */}
          <div className="mt-4">
            <label>Endereço:</label>
            {['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'].map((campo) => (
              <input
                key={campo}
                type="text"
                placeholder={campo[0].toUpperCase() + campo.slice(1)}
                value={endereco[campo as keyof typeof endereco]}
                onChange={(e) => setEndereco({ ...endereco, [campo]: e.target.value })}
                className="form-control mt-2"
                required
              />
            ))}
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
    </div>
  );
};

export default CadastrarCliente;