import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Motivo } from '../types/Motivo';
import {
  criarMotivo,
  editarMotivo,
  excluirMotivo,
  buscarMotivos,
} from '../repositories/SolicitacaoRepository';

interface MotivoModalProps {
  show: boolean;
  onClose: () => void;
  motivoEditando?: Motivo;
  onMotivoAdicionado: (motivo: Motivo) => void;
}

const MotivoModal: React.FC<MotivoModalProps> = ({
  show,
  onClose,
  motivoEditando,
  onMotivoAdicionado,
}) => {
  const [nome, setNome] = useState('');
  const [motivos, setMotivos] = useState<Motivo[]>([]);
  const [motivoParaEdicao, setMotivoParaEdicao] = useState<Motivo | undefined>();

  useEffect(() => {
    const fetchMotivos = async () => {
      const dados = await buscarMotivos();
      setMotivos(dados);
    };
    fetchMotivos();
  }, [motivos]);

  useEffect(() => {
    const motivo = motivoParaEdicao || motivoEditando;
    if (motivo) {
      setNome(motivo.nome);
    } else {
      setNome('');
    }
  }, [motivoEditando, motivoParaEdicao]);

  const handleSalvar = async () => {
    const motivoEmEdicao = motivoParaEdicao || motivoEditando;
    try {
      if (motivoEmEdicao) {
        await editarMotivo(motivoEmEdicao.id, nome);
        onMotivoAdicionado({ id: motivoEmEdicao.id, nome });
      } else {
        const novoMotivo = await criarMotivo(nome);
        onMotivoAdicionado(novoMotivo);
      }
      
      setMotivoParaEdicao(undefined);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar motivo:', error);
    }
  };

  const handleExcluir = async () => {
    const motivoEmEdicao = motivoParaEdicao || motivoEditando;
    if (motivoEmEdicao) {
      try {
        await excluirMotivo(motivoEmEdicao.id);
        onMotivoAdicionado({ id: motivoEmEdicao.id, nome: '' });
      } catch (error) {
        console.error('Erro ao excluir motivo:', error);
      }
    }
    setMotivoParaEdicao(undefined);
    onClose();
  };

  return (
    <Modal show={show} onHide={() => {
      setMotivoParaEdicao(undefined);
      onClose();
    }}>
      <Modal.Header closeButton>
        <Modal.Title>{motivoParaEdicao || motivoEditando ? 'Editar Motivo' : 'Adicionar Novo Motivo'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formMotivo">
            <Form.Label>Nome do Motivo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do motivo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </Form.Group>
        </Form>

        <hr />
        <h6>Motivos cadastrados:</h6>
        <ul className="list-unstyled">
          {motivos.map((motivo) => (
            <li key={motivo.id} className="d-flex justify-content-between align-items-center">
              <span>{motivo.nome}</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => setMotivoParaEdicao(motivo)}
              >
                Editar
              </Button>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        {(motivoParaEdicao || motivoEditando) && (
          <Button variant="danger" onClick={handleExcluir}>
            Excluir
          </Button>
        )}
        <Button variant="secondary" onClick={() => {
          setMotivoParaEdicao(undefined);
          onClose();
        }}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handleSalvar}>
          {(motivoParaEdicao || motivoEditando) ? 'Salvar Alterações' : 'Adicionar Motivo'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MotivoModal;