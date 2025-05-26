import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { criarSolicitacao, buscarMotivos } from '../../repositories/SolicitacaoRepository';
import { useUser } from '../../contexts/UserContext';
import Swal from 'sweetalert2';
import { FaClipboard, FaRegClock, FaExclamationCircle } from 'react-icons/fa';
import { BiCameraMovie } from 'react-icons/bi';
import { MdOutlineSubtitles } from 'react-icons/md';
import { PlusSquareIcon } from 'lucide-react';
import MotivoModal from '../../components/MotivoModal';

interface FormValues {
  dataInicio: string;
  dataFim: string;
  veiculo?: string;
  motivo: string;
  descricao: string;
}

const NovaSolicitacao: React.FC = () => {
  const { user } = useUser();
  const [diferencaHoras, setDiferencaHoras] = useState('');
  const [motivos, setMotivos] = useState<{ id: string; nome: string }[]>([]);
  const [hovered, setHovered] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [motivoEditando, setMotivoEditando] = useState<{ id: string; nome: string } | undefined>();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const dataInicio = watch('dataInicio');
  const dataFim = watch('dataFim');

  const carregarMotivos = async () => {
    const motivosBuscados = await buscarMotivos();
    setMotivos(motivosBuscados);
  };

  useEffect(() => {
    carregarMotivos();
  }, []);

  useEffect(() => {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (fim <= inicio) {
        setError('dataFim', {
          type: 'manual',
          message: 'A data/hora final deve ser posterior à inicial.',
        });
        setDiferencaHoras('');
      } else {
        clearErrors('dataFim');
        const diffMs = fim.getTime() - inicio.getTime();
        const diffH = Math.floor(diffMs / 1000 / 60 / 60);
        const diffM = Math.floor((diffMs / 1000 / 60) % 60);
        setDiferencaHoras(`${diffH} hora(s) e ${diffM} minuto(s)`);
      }
    } else {
      setDiferencaHoras('');
      clearErrors('dataFim');
    }
  }, [dataInicio, dataFim, setError, clearErrors]);

  const onSubmit = async (data: FormValues) => {
    if (!user?.uid) {
      Swal.fire({ icon: 'error', title: 'Erro!', text: 'Usuário não autenticado.' });
      return;
    }

    try {
      // Procura o objeto Motivo correspondente ao id selecionado
      const motivoSelecionado = motivos.find(m => m.id === data.motivo);

      if (!motivoSelecionado) {
        Swal.fire({ icon: 'error', title: 'Erro!', text: 'Motivo selecionado inválido.' });
        return;
      }

      await criarSolicitacao({
        ...data,
        uid: user.uid,
        motivo: motivoSelecionado.id,  // envia o objeto completo
      });

      Swal.fire({ icon: 'success', title: 'Solicitação Enviada!', text: 'Sua solicitação foi enviada com sucesso.' });
      reset();
      setDiferencaHoras('');
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Erro!', text: 'Erro ao enviar solicitação. Tente novamente.' });
    }
  };

  const handleClickAdicionarMotivo = () => {
    setMotivoEditando(undefined);
    setModalVisible(true);
  };

  const handleMotivosAtualizados = () => {
    carregarMotivos(); // Sempre recarrega do banco
    setModalVisible(false);
  };

  return (
    <div className="container mt-4">
      <h2><FaClipboard className="me-2" /> Nova Solicitação</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label"><FaRegClock className="me-2" />Data/Hora Início*</label>
          <input
            type="datetime-local"
            className={`form-control ${errors.dataInicio ? 'is-invalid' : ''}`}
            {...register('dataInicio', { required: 'Campo obrigatório' })}
          />
          {errors.dataInicio && <div className="invalid-feedback">{errors.dataInicio.message}</div>}
        </div>

        {dataInicio && (
          <div className="mb-3">
            <label className="form-label"><FaRegClock className="me-2" />Data/Hora Fim*</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.dataFim ? 'is-invalid' : ''}`}
              {...register('dataFim', { required: 'Campo obrigatório' })}
            />
            {errors.dataFim && <div className="invalid-feedback">{errors.dataFim.message}</div>}
            {diferencaHoras && <p className="mt-1 text-success">Duração: {diferencaHoras}</p>}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label"><BiCameraMovie className="me-2" />Solicitação de câmeras</label>
          <input type="text" className="form-control" {...register('veiculo')} />
        </div>

        <div className="mb-3">
          <label className="form-label d-flex align-items-center">
            <FaExclamationCircle className="me-2" />
            Motivo*
            <PlusSquareIcon
              style={{
                marginLeft: '10px',
                cursor: 'pointer',
                color: hovered ? 'white' : '#000',
                backgroundColor: hovered ? '#000' : 'transparent',
                borderRadius: '4px',
                padding: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={handleClickAdicionarMotivo}
            />
          </label>
          <select
            className={`form-select ${errors.motivo ? 'is-invalid' : ''}`}
            {...register('motivo', { required: 'Campo obrigatório' })}
          >
            <option value="">Selecione um motivo</option>
            {motivos.map((motivo) => (
              <option key={motivo.id} value={motivo.id}>
                {motivo.nome}
              </option>
            ))}
          </select>
          {errors.motivo && <div className="invalid-feedback">{errors.motivo.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label"><MdOutlineSubtitles className="me-2" />Descrição*</label>
          <textarea
            className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
            rows={4}
            {...register('descricao', { required: 'Campo obrigatório' })}
          />
          {errors.descricao && <div className="invalid-feedback">{errors.descricao.message}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </form>

      <MotivoModal
        show={modalVisible}
        onClose={() => setModalVisible(false)}
        motivoEditando={motivoEditando}
        onMotivoAdicionado={handleMotivosAtualizados}
      />
    </div>
  );
};

export default NovaSolicitacao;