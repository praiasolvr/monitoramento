// Importações principais
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
    getDocs,
    collection,
    doc,
    updateDoc,
    getDoc,
    DocumentData,
    serverTimestamp
} from "firebase/firestore";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { db } from "../../firebaseConfig";
import { format, parseISO, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { Motivo } from "../../types/Motivo";


// interface Solicitacao {
//     id: string;
//     situacao: "pendente" | "finalizado";
//     veiculo?: string;
//     motivo?: Motivo;
//     motivoId?: string;
//     descricao?: string;
//     dataInicio?: string;
//     dataFim?: string;
//     horaFinalizacao?: { seconds: number; nanoseconds: number };
//     temImagem?: boolean;
//     resolvido?: boolean;
//     observacao?: string;
//     criadoEm?: { seconds: number; nanoseconds: number } | string;
// }


// const carregarMotivos = async (): Promise<Map<string, string>> => {
//     const snapshot = await getDocs(collection(db, 'motivo'));
//     const motivoMap = new Map<string, string>();

//     snapshot.forEach((doc) => {
//         const data = doc.data();
//         motivoMap.set(doc.id, data.nome || 'Motivo desconhecido');
//     });

//     return motivoMap;
// };

const VisualizarSolicitacoes: React.FC = () => {
    const [usuarios, setUsuarios] = useState<{ id: string; nome: string; email: string }[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<{ [key: string]: Solicitacao[] }>({});
    const [carregando, setCarregando] = useState<boolean>(true);
    const [usuariosExpandido, setUsuariosExpandido] = useState<{ [key: string]: boolean }>({});
    const [filtroSituacao, setFiltroSituacao] = useState<string>("todos");
    const [filtroNome, setFiltroNome] = useState<string>("");
    const [_contagemStatus, setContagemStatus] = useState({ pendente: 0, finalizado: 0 });
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [motivosMap, setMotivosMap] = useState<Map<string, Motivo>>(new Map());



    interface Solicitacao {
        id: string;
        situacao: "pendente" | "finalizado";
        veiculo?: string;
        motivo?: Motivo;
        descricao?: string;
        dataInicio?: string;
        dataFim?: string;
        horaFinalizacao?: {
            seconds: number;
            nanoseconds: number;
        };
        temImagem?: boolean;
        resolvido?: boolean;
        observacao?: string;
        criadoEm?: {
            seconds: number;
            nanoseconds: number;
        };
    }

    useEffect(() => {
        fetchMotivos();
        fetchUsuarios();

        const verificarTamanhoTela = () => {
            setIsMobile(window.innerWidth < 768);
        };

        verificarTamanhoTela();
        window.addEventListener("resize", verificarTamanhoTela);
        return () => window.removeEventListener("resize", verificarTamanhoTela);
    }, []);

    const fetchMotivos = async () => {
        const motivosSnapshot = await getDocs(collection(db, "motivo"));
        const map = new Map<string, Motivo>();

        motivosSnapshot.forEach((doc) => {
            const data = doc.data();
            map.set(doc.id, { id: doc.id, nome: data.nome });
        });

        setMotivosMap(map);
    };

    useEffect(() => {
        if (usuarios.length > 0 && motivosMap.size > 0) {
            fetchTodasSolicitacoes(usuarios);
        }
    }, [usuarios, filtroSituacao, motivosMap]);

    useEffect(() => {
        if (usuarios.length > 0) {
            fetchTodasSolicitacoes(usuarios);
        }
    }, [filtroSituacao]);

    const fetchUsuarios = async () => {
        setCarregando(true);
        try {
            const usuariosSnapshot = await getDocs(collection(db, "solicitacoes"));
            if (usuariosSnapshot.empty) {
                setUsuarios([]);
            } else {
                const listaUsuarios = await Promise.all(
                    usuariosSnapshot.docs.map(async (documento) => {
                        const userId = documento.id;
                        const clienteRef = doc(db, "clientes", userId);
                        const clienteSnapshot = await getDoc(clienteRef);
                        const clienteData = clienteSnapshot.data() as DocumentData;

                        return {
                            id: userId,
                            nome: clienteSnapshot.exists() ? clienteData.nome : "Nome desconhecido",
                            email: clienteSnapshot.exists() ? clienteData.email : "Email desconhecido"
                        };
                    })
                );
                setUsuarios(listaUsuarios);
            }
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setCarregando(false);
        }
    };

    const fetchTodasSolicitacoes = async (usuariosLista: { id: string }[]) => {
        let pendentes = 0;
        let finalizados = 0;
        const todasSolicitacoes: { [key: string]: Solicitacao[] } = {};

        for (const usuario of usuariosLista) {
            const solicitacoesRef = collection(db, `solicitacoes/${usuario.id}/lista_solicitacoes`);
            const snapshot = await getDocs(solicitacoesRef);

            const listaSolicitacoes = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                const motivoId = data.motivo;
                const motivo = motivosMap.get(motivoId);

                const solicitacao: Solicitacao = {
                    id: docSnap.id,
                    ...data,
                    situacao: data.situacao || "pendente", // garantir que exista 'situacao'
                    motivo: motivo || { id: motivoId, nome: "Motivo desconhecido" }
                };

                if (solicitacao.situacao === "pendente") pendentes++;
                if (solicitacao.situacao === "finalizado") finalizados++;

                return solicitacao;
            });

            todasSolicitacoes[usuario.id] = listaSolicitacoes;
        }

        setSolicitacoes(todasSolicitacoes);
        setContagemStatus({ pendente: pendentes, finalizado: finalizados });
    };

    const toggleExpandir = (usuarioId: string) => {
        setUsuariosExpandido(prev => ({
            ...prev,
            [usuarioId]: !prev[usuarioId]
        }));
    };

    const confirmarFinalizacao = (usuarioId: string, solicitacaoId: string) => {
        Swal.fire({
            title: "Finalizar Solicitação",
            html: `
                <div style="text-align: left">
                    <label>Tem imagem?</label><br/>
                    <input type="radio" name="temImagem" value="sim" id="temImagemSim" /> Sim
                    <input type="radio" name="temImagem" value="nao" id="temImagemNao" /> Não
                    <br/><br/>

                    <label>Foi resolvido?</label><br/>
                    <input type="radio" name="resolvido" value="sim" id="resolvidoSim" /> Sim
                    <input type="radio" name="resolvido" value="nao" id="resolvidoNao" /> Não
                    <br/><br/>

                    <label for="observacao">Observação/Justificativa:</label><br/>
                    <textarea id="observacao" class="swal2-textarea" placeholder="Digite sua observação (obrigatório se não resolvido)"></textarea>
                </div>
            `,
            didOpen: () => {
                const temImagemSim = document.getElementById("temImagemSim") as HTMLInputElement;
                const temImagemNao = document.getElementById("temImagemNao") as HTMLInputElement;
                const resolvidoSim = document.getElementById("resolvidoSim") as HTMLInputElement;

                const handleImagemChange = () => {
                    if (temImagemNao.checked) {
                        resolvidoSim.disabled = true;
                        resolvidoSim.checked = false;
                        (document.getElementById("resolvidoNao") as HTMLInputElement).checked = true;
                    } else {
                        resolvidoSim.disabled = false;
                    }
                };

                temImagemSim.addEventListener("change", handleImagemChange);
                temImagemNao.addEventListener("change", handleImagemChange);
            },
            showCancelButton: true,
            confirmButtonText: "Sim, finalizar!",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const temImagem = (document.querySelector('input[name="temImagem"]:checked') as HTMLInputElement)?.value;
                const resolvido = (document.querySelector('input[name="resolvido"]:checked') as HTMLInputElement)?.value;
                const observacao = (document.getElementById("observacao") as HTMLTextAreaElement)?.value.trim();

                if (!temImagem || !resolvido) {
                    Swal.showValidationMessage("Por favor, responda se há imagem e se foi resolvido.");
                    return;
                }

                if (temImagem === "nao" && resolvido === "sim") {
                    Swal.showValidationMessage("Não é permitido marcar como resolvido se não há imagem.");
                    return;
                }

                if (resolvido === "nao" && !observacao) {
                    Swal.showValidationMessage("Justificativa é obrigatória se o chamado não foi resolvido.");
                    return;
                }

                return { temImagem, resolvido, observacao };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const { temImagem, resolvido, observacao } = result.value;
                atualizarSituacao(usuarioId, solicitacaoId, {
                    temImagem: temImagem === "sim",
                    resolvido: resolvido === "sim",
                    observacao
                });

                Swal.fire("Finalizado!", "O chamado foi marcado como finalizado.", "success");
            }
        });
    };

    const atualizarSituacao = async (
        usuarioId: string,
        solicitacaoId: string,
        extras?: { temImagem: boolean; resolvido: boolean; observacao: string }
    ) => {
        try {
            const solicitacaoRef = doc(db, `solicitacoes/${usuarioId}/lista_solicitacoes/${solicitacaoId}`);
            await updateDoc(solicitacaoRef, {
                situacao: "finalizado",
                horaFinalizacao: serverTimestamp(),
                ...extras
            });

            fetchUsuarios(); // Recarrega os dados
        } catch (error) {
            console.error(`Erro ao atualizar solicitação ${solicitacaoId}:`, error);
        }
    };


    // Função para calcular o tempo de imagem solicitado
    const calcularTempoImagemSolicitado = (dataInicio?: string, dataFim?: string) => {
        if (!dataInicio || !dataFim) return "Não informado"; // Se qualquer data estiver faltando, retorna "Não informado"

        try {
            const inicio = parseISO(dataInicio);
            const fim = parseISO(dataFim);

            const anos = differenceInYears(fim, inicio);
            const meses = differenceInMonths(fim, inicio) % 12;
            const dias = differenceInDays(fim, inicio) % 30; // Para dias que não completam um mês
            const horas = differenceInHours(fim, inicio) % 24;
            const minutos = differenceInMinutes(fim, inicio) % 60;

            let resultado = "";

            if (anos > 0) resultado += `${anos} ano${anos > 1 ? "s" : ""}, `;
            if (meses > 0) resultado += `${meses} mês${meses > 1 ? "es" : ""}, `;
            if (dias > 0) resultado += `${dias} dia${dias > 1 ? "s" : ""}, `;
            if (horas > 0 || minutos > 0) {
                resultado += `${horas} hora${horas > 1 ? "s" : ""}, ${minutos} minuto${minutos > 1 ? "s" : ""}`;
            }

            // Se a diferença for menor que 1 dia, exibe apenas horas e minutos
            if (dias === 0) {
                resultado = `${horas} hora${horas > 1 ? "s" : ""}, ${minutos} minuto${minutos > 1 ? "s" : ""}`;
            }

            return resultado || "Menos de 1 minuto"; // Caso a diferença seja muito pequena, exibe "Menos de 1 minuto"
        } catch (error) {
            console.error("Erro ao calcular a diferença de tempo:", error);
            return "Erro ao calcular tempo"; // Em caso de erro, retorna uma mensagem de erro
        }
    };

    // Função para calcular os dias passados desde a data de início
    // const calcularDiasPassados = (dataInicio?: string) => {
    //     if (!dataInicio) return "Data não disponível"; // Caso dataInicio seja undefined

    //     try {
    //         const inicio = parseISO(dataInicio);

    //         // Verifica se a data de início foi corretamente parseada
    //         if (!inicio) return "Data inválida";

    //         const hoje = new Date();
    //         const diasPassados = differenceInDays(hoje, inicio);

    //         return `${diasPassados} dia${diasPassados !== 1 ? "s" : ""} passado${diasPassados !== 1 ? "s" : ""}`;
    //     } catch (error) {
    //         console.error("Erro ao calcular dias passados:", error);
    //         return "Erro ao calcular"; // Em caso de erro, retorna uma mensagem de erro
    //     }
    // };

    // const getCorPorDiasPassados = (dias: number): string => {
    //     if (dias <= 2) return "green";
    //     if (dias === 3) return "yellow";
    //     if (dias === 4) return "orange";
    //     return "red"; // 5 ou mais dias
    // };

    return (
        <div className="container mt-4">
            <h2>Visualização de Solicitações</h2>

            {/* Filtros */}
            <div className="mb-3 d-flex gap-3 align-items-center flex-wrap">
                <div>
                    <label htmlFor="filtroNome" className="form-label mb-0">Filtrar por nome, veículo, motivo ou descrição:</label>
                    <input
                        list="nomesUsuarios"
                        id="filtroNome"
                        className="form-control"
                        placeholder="Digite o termo de busca"
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                    />
                    <datalist id="nomesUsuarios">
                        {usuarios.map((usuario) => (
                            <option key={usuario.id} value={usuario.nome} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label htmlFor="filtroSituacao" className="form-label mb-0">Situação:</label>
                    <select
                        id="filtroSituacao"
                        className="form-select"
                        value={filtroSituacao}
                        onChange={(e) => setFiltroSituacao(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="pendente">Pendentes</option>
                        <option value="finalizado">Finalizados</option>
                    </select>
                </div>
            </div>

            {/* Lista de usuários com solicitações */}
            {carregando ? (
                <p>Carregando usuários...</p>
            ) : (
                <ul className="list-unstyled">
                    {usuarios
                        .filter((usuario) => {
                            const solicitacoesUsuario = solicitacoes[usuario.id] || [];

                            const solicitacoesFiltradas = solicitacoesUsuario.filter((s) => {
                                const termo = filtroNome.trim().toLowerCase();
                                const situacaoOk = filtroSituacao === "todos" || s.situacao === filtroSituacao;
                                const campoCombina =
                                    termo === "" ||
                                    [usuario.nome, s.veiculo, s.motivo?.nome, s.descricao]
                                        .filter(Boolean)
                                        .some(campo => (campo as string).toLowerCase().includes(termo));

                                return situacaoOk && campoCombina;
                            });

                            // Só exibe o usuário se houver pelo menos uma solicitação filtrada
                            return solicitacoesFiltradas.length > 0;
                        })
                        .map(usuario => (
                            <li key={usuario.id} className="mb-3">
                                <button
                                    className="btn btn-link d-flex align-items-center"
                                    onClick={() => toggleExpandir(usuario.id)}
                                >
                                    {usuario.nome} - {usuario.email}
                                    <span className="ms-2">
                                        {usuariosExpandido[usuario.id] ? <FaChevronUp /> : <FaChevronDown />}
                                    </span>
                                </button>

                                {usuariosExpandido[usuario.id] && (
                                    <div>
                                        {(() => {
                                            const solicitacoesFiltradas = (solicitacoes[usuario.id] || []).filter((solicitacao) => {
                                                const termo = filtroNome.trim().toLowerCase();
                                                const situacaoOk = filtroSituacao === "todos" || solicitacao.situacao === filtroSituacao;
                                                const campoCombina =
                                                    termo === "" ||
                                                    [usuario.nome, solicitacao.veiculo, solicitacao.motivo?.nome, solicitacao.descricao]
                                                        .filter(Boolean)
                                                        .some(campo => (campo as string).toLowerCase().includes(termo))
                                                return situacaoOk && campoCombina;
                                            });

                                            if (isMobile) {
                                                return (
                                                    <div className="solicitacoes-list">
                                                        {solicitacoesFiltradas.map((solicitacao, index) => (
                                                            <div key={solicitacao.id} className="solicitacao-card mb-3 border p-3 rounded shadow-sm">
                                                                <h5>{`Solicitação #${index + 1}`}</h5>
                                                                <p><strong>Data Início:</strong> {solicitacao.dataInicio ? format(parseISO(solicitacao.dataInicio), "dd/MM/yyyy HH:mm") : "Não informado"}</p>
                                                                <p><strong>Data Fim:</strong> {solicitacao.dataFim ? format(parseISO(solicitacao.dataFim), "dd/MM/yyyy HH:mm") : "Não informado"}</p>
                                                                <p><strong>Veículo:</strong> {solicitacao.veiculo || "Não informado"}</p>
                                                                <p><strong>Motivo:</strong> {solicitacao.motivo?.nome}</p>
                                                                <p><strong>Descrição:</strong> {solicitacao.descricao}</p>
                                                                <p><strong>Status:</strong> {solicitacao.situacao}</p>
                                                                <p><strong>Hora Finalização:</strong> {solicitacao.horaFinalizacao?.seconds ? new Date(solicitacao.horaFinalizacao.seconds * 1000).toLocaleString() : "Ainda não finalizado"}</p>
                                                                <p><strong>Tempo de Imagem Solicitado:</strong> {calcularTempoImagemSolicitado(solicitacao.dataInicio, solicitacao.dataFim)}</p>
                                                                {(() => {
                                                                    const { situacao, dataInicio, criadoEm, horaFinalizacao } = solicitacao;

                                                                    // 1. Se for finalizado, calcular tempo de resolução
                                                                    const criadoEmDate = criadoEm
                                                                        ? typeof criadoEm === "string"
                                                                            ? parseISO(criadoEm)
                                                                            : new Date(criadoEm.seconds * 1000)
                                                                        : null;

                                                                    const horaFinalizacaoDate = horaFinalizacao?.seconds
                                                                        ? new Date(horaFinalizacao.seconds * 1000)
                                                                        : null;

                                                                    if (situacao === "finalizado" && criadoEmDate && horaFinalizacaoDate) {
                                                                        const diffMin = differenceInMinutes(horaFinalizacaoDate, criadoEmDate);
                                                                        const horas = Math.floor(diffMin / 60);
                                                                        const minutos = diffMin % 60;

                                                                        return (
                                                                            <p>
                                                                                <strong>Tempo para resolver:</strong> {horas}h {minutos}min
                                                                            </p>
                                                                        );
                                                                    }

                                                                    // 2. Caso pendente, mostrar dias passados com bolinha
                                                                    if (!dataInicio) {
                                                                        return <p><strong>Dias Passados:</strong> Data não disponível</p>;
                                                                    }

                                                                    try {
                                                                        const dias = differenceInDays(new Date(), parseISO(dataInicio));
                                                                        let cor = "";

                                                                        if (dias <= 2) cor = "green";
                                                                        else if (dias === 3) cor = "yellow";
                                                                        else if (dias === 4) cor = "orange";
                                                                        else cor = "red";

                                                                        return (
                                                                            <p>
                                                                                <strong>Dias Passados:</strong> {dias} dia{dias !== 1 ? "s" : ""} passado{dias !== 1 ? "s" : ""}
                                                                                <span
                                                                                    style={{
                                                                                        display: "inline-block",
                                                                                        width: "10px",
                                                                                        height: "10px",
                                                                                        borderRadius: "50%",
                                                                                        backgroundColor: cor,
                                                                                        marginLeft: "8px",
                                                                                        verticalAlign: "middle"
                                                                                    }}
                                                                                />
                                                                            </p>
                                                                        );
                                                                    } catch {
                                                                        return <p><strong>Dias Passados:</strong> Erro ao calcular</p>;
                                                                    }
                                                                })()}
                                                                {solicitacao.situacao === "pendente" && (
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        onClick={() => confirmarFinalizacao(usuario.id, solicitacao.id)}
                                                                    >
                                                                        Finalizar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div className="table-responsive">
                                                        <table className="table table-striped mt-2">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Data Início</th>
                                                                    <th>Data Fim</th>
                                                                    <th>Veículo</th>
                                                                    <th>Motivo</th>
                                                                    <th>Descrição</th>
                                                                    <th>Status</th>
                                                                    <th>Hora Finalização</th>
                                                                    <th>Tempo de Imagem Solicitado</th> {/* Nova coluna */}
                                                                    <th>Dias Passados</th> {/* Nova coluna */}
                                                                    <th>Ação</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {solicitacoesFiltradas.map((solicitacao, index) => (
                                                                    <tr key={solicitacao.id}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{solicitacao.dataInicio ? format(parseISO(solicitacao.dataInicio), "dd/MM/yyyy HH:mm") : "Não informado"}</td>
                                                                        <td>{solicitacao.dataFim ? format(parseISO(solicitacao.dataFim), "dd/MM/yyyy HH:mm") : "Não informado"}</td>
                                                                        <td>{solicitacao.veiculo || "Não informado"}</td>
                                                                        <td>{solicitacao.motivo?.nome}</td>
                                                                        <td>{solicitacao.descricao}</td>
                                                                        <td>{solicitacao.situacao}</td>
                                                                        <td>{solicitacao.horaFinalizacao?.seconds ? new Date(solicitacao.horaFinalizacao.seconds * 1000).toLocaleString() : "Ainda não finalizado"}</td>


                                                                        <td>{calcularTempoImagemSolicitado(solicitacao.dataInicio, solicitacao.dataFim)}</td>

                                                                        <td>
                                                                            {(() => {
                                                                                const { situacao, dataInicio, criadoEm, horaFinalizacao } = solicitacao;

                                                                                // Corrigir: criadoEm pode vir como string ISO
                                                                                const criadoEmDate = criadoEm
                                                                                    ? typeof criadoEm === "string"
                                                                                        ? parseISO(criadoEm)
                                                                                        : new Date(criadoEm.seconds * 1000)
                                                                                    : null;

                                                                                const horaFinalizacaoDate = horaFinalizacao?.seconds
                                                                                    ? new Date(horaFinalizacao.seconds * 1000)
                                                                                    : null;

                                                                                if (situacao === "finalizado" && criadoEmDate && horaFinalizacaoDate) {
                                                                                    const diffMin = differenceInMinutes(horaFinalizacaoDate, criadoEmDate);

                                                                                    const horas = Math.floor(diffMin / 60);
                                                                                    const minutos = diffMin % 60;

                                                                                    return (
                                                                                        <span>
                                                                                            <strong>Resolvido em:<br /></strong> {horas}h {minutos}min
                                                                                        </span>
                                                                                    );
                                                                                }

                                                                                // Caso pendente
                                                                                if (!dataInicio) return "Data não disponível";

                                                                                try {
                                                                                    const dias = differenceInDays(new Date(), parseISO(dataInicio));
                                                                                    let cor = "";

                                                                                    if (dias <= 2) cor = "green";
                                                                                    else if (dias === 3) cor = "yellow";
                                                                                    else if (dias === 4) cor = "orange";
                                                                                    else cor = "red";

                                                                                    return (
                                                                                        <span>
                                                                                            {dias} dia{dias !== 1 ? "s" : ""} passado{dias !== 1 ? "s" : ""}
                                                                                            <span
                                                                                                style={{
                                                                                                    display: "inline-block",
                                                                                                    width: "10px",
                                                                                                    height: "10px",
                                                                                                    borderRadius: "50%",
                                                                                                    backgroundColor: cor,
                                                                                                    marginLeft: "6px",
                                                                                                    verticalAlign: "middle"
                                                                                                }}
                                                                                            />
                                                                                        </span>
                                                                                    );
                                                                                } catch {
                                                                                    return "Erro ao calcular";
                                                                                }
                                                                            })()}
                                                                        </td>

                                                                        <td>
                                                                            {solicitacao.situacao === "pendente" && (
                                                                                <button
                                                                                    className="btn btn-sm btn-success"
                                                                                    onClick={() => confirmarFinalizacao(usuario.id, solicitacao.id)}
                                                                                >
                                                                                    Finalizar
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
};

export default VisualizarSolicitacoes;