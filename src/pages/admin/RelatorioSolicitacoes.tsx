// Importações principais
import React, { useState, useEffect } from "react";


import {
    getDocs,
    collection,
    doc,
    getDoc,
    DocumentData
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Chart.js
import {
    Chart,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PieController,
    ArcElement
} from "chart.js";
import { Bar } from "react-chartjs-2";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, PieController, ArcElement);

// Componente principal de relatório de solicitações
const RelatorioSolicitacoes: React.FC = () => {
    const [usuarios, setUsuarios] = useState<{ id: string; nome: string; email: string }[]>([]);

    const [_carregando, setCarregando] = useState<boolean>(true);

    const [contagemStatus, setContagemStatus] = useState({ pendente: 0, finalizado: 0 });
    const [horasPorUsuario, setHorasPorUsuario] = useState<{ [usuarioId: string]: number }>({});
    const [contagemPorMotivo, setContagemPorMotivo] = useState<{ [motivo: string]: number }>({});

    const [_mapaMotivos, setMapaMotivos] = useState<{ [id: string]: string }>({});

    useEffect(() => {
        const carregarDados = async () => {
            const motivosMap = await fetchMotivos(); // aguarda e recebe diretamente
            await fetchUsuarios(motivosMap); // passa direto para evitar timing issue
        };

        carregarDados();
    }, []);

    const fetchMotivos = async (): Promise<{ [id: string]: string }> => {
        const motivosSnapshot = await getDocs(collection(db, "motivo"));
        const motivosMap: { [id: string]: string } = {};

        motivosSnapshot.forEach(doc => {
            const data = doc.data();
            motivosMap[doc.id] = data.nome || "Sem nome";
        });

        setMapaMotivos(motivosMap); // ainda pode atualizar o state, se quiser usar em outro lugar
        return motivosMap;
    };

    const fetchUsuarios = async (motivosMap: { [id: string]: string }) => {
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
                contarSolicitacoes(listaUsuarios, motivosMap); // passa os motivos diretamente
            }
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setCarregando(false);
        }
    };

    const contarSolicitacoes = async (usuariosLista: { id: string }[], motivosMap: { [id: string]: string }) => {
        let pendentes = 0;
        let finalizados = 0;
        const horasMap: { [usuarioId: string]: number } = {};
        const motivoMap: { [motivo: string]: number } = {};

        for (const usuario of usuariosLista) {
            const solicitacoesRef = collection(db, `solicitacoes/${usuario.id}/lista_solicitacoes`);
            const snapshot = await getDocs(solicitacoesRef);

            let totalHorasUsuario = 0;

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.situacao === "pendente") pendentes++;
                if (data.situacao === "finalizado") finalizados++;

                const inicio = new Date(data.dataInicio);
                const fim = new Date(data.dataFim);
                const diffHoras = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                totalHorasUsuario += diffHoras;

                const motivoId = data.motivo || "Desconhecido";
                const nomeMotivo = motivosMap[motivoId] || motivoId;
                motivoMap[nomeMotivo] = (motivoMap[nomeMotivo] || 0) + 1;
            });

            horasMap[usuario.id] = totalHorasUsuario;
        }

        setContagemStatus({ pendente: pendentes, finalizado: finalizados });
        setHorasPorUsuario(horasMap);
        setContagemPorMotivo(motivoMap);
    };


    // Gráfico de status (existente)
    const chartData = {
        labels: ["Pendentes", "Finalizados"],
        datasets: [
            {
                label: "Quantidade",
                backgroundColor: ["#ffc107", "#28a745"],
                data: [contagemStatus.pendente, contagemStatus.finalizado]
            }
        ]
    };

    // Gráfico de horas por usuário
    const horasChartData = {
        labels: usuarios.map(user => user.nome),
        datasets: [
            {
                label: "Total de Horas",
                backgroundColor: "#007bff",
                data: usuarios.map(user => horasPorUsuario[user.id] || 0)
            }
        ]
    };

    // Gráfico por motivo
    const motivosChartData = {
        labels: Object.keys(contagemPorMotivo),
        datasets: [
            {
                label: "Chamados por Motivo",
                backgroundColor: [
                    "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6c757d", "#20c997", "#6610f2"
                ],
                data: Object.values(contagemPorMotivo)
            }
        ]
    };

    return (
        <div className="container mt-4">
            <h2>Relatório de Solicitações</h2>

            {/* Gráfico de status */}
            <div className="mb-4">
                <h5>Status das Solicitações</h5>
                <Bar data={chartData} />
            </div>

            {/* Gráfico de horas por usuário */}
            <div className="mb-4">
                <h5>Horas Totais de Solicitações por Usuário</h5>
                <Bar data={horasChartData} />
            </div>

            {/* Gráfico por motivo */}
            <div className="mb-4">
                <h5>Quantidade de Solicitações por Motivo</h5>
                <Bar data={motivosChartData} />
                {/* Ou use <Pie data={motivosChartData} /> para visual diferente */}
            </div>
        </div>
    );
};

export default RelatorioSolicitacoes;