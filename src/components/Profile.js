import React, { useState, useEffect } from "react";
import { TextField, Button, FormControl, Typography, MenuItem, Select } from "@mui/material";
import { IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AuthService from "../services/auth.service";
import { fetchallPay } from "../services/payment";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Pie, Bar, Line } from 'react-chartjs-2'; // Importando os gráficos
import "./Profile.css";
import EventBus from "../common/EventBus";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Importando o plugin
import dayjs from 'dayjs';
import IconHandMoney from '../assets/maozinha.png'; // Substitua com o caminho correto para o ícone de mão


// import maquina from '../../assets/stripe-front/assets/maquininha150x200.png'
// Registro de componentes necessários para os gráficos
ChartJS.register(ArcElement, ChartTooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, PointElement, LineElement);

const Profile = () => {
  const currentUser = AuthService.getCurrentUser();
  const [valorVenda, setValorVenda] = useState("");
  const [option, setOption] = useState("quero faturar");
  const [text, setText] = useState("Ultimo Link Utilizado");
  const [payments, setPayments] = useState([]); // State to hold payment data
  const [barData, setBarData] = useState()
  const [pieData, setPieData] = useState()
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedMaquina, setSelectedMaquina] = useState(0);
  const [checkin, setCheckin] = useState(0);
  const [linkPage, setLinkPage] = useState(0);
  const [links, setLinks] = useState([])
  const [lineData, setLineData] = useState();
  const [dateFilter, setDateFilter] = useState("lastDay"); // Filtro de data
  const [productFilter, setProductFilter] = useState("all"); // Filtro de produto
  const [displayMode, setDisplayMode] = useState("valor"); // Estado para controlar a exibição
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [totalValue, setTotalValue] = useState(0);


  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  const handleProductFilterChange = (event) => {
    setProductFilter(event.target.value);
  };
  const calculateTotalValue = (data) => {
    const total = data.reduce((sum, payment) => {
      const value = parseFloat(payment.total_price.replace(/[^0-9,.]/g, "").replace(",", "."));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    setTotalValue(total.toFixed(2).replace(".", ","));
  };


  EventBus.on("logout", () => {
    logOut();
  });

  const logOut = () => {
    AuthService.logout();
  };

  const avancarLink = async (state) => {
    setLinkPage(state)
  };

  const selecionarCheckin = async (state) => {
    setCheckin(state)
  };
  const selecionarMaquina = async (state) => {
    setSelectedMaquina(state)
  };
  const avancarCheckin = async (state) => {
    setCheckin(state)
  };
  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };
  const applyDateFilter = (data) => {
    const now = dayjs();
    if (dateFilter === "last30Days") {
      return data.filter(payment => dayjs(payment.created_at).isAfter(now.subtract(30, "days")));
    } else if (dateFilter === "last7Days") {
      return data.filter(payment => dayjs(payment.created_at).isAfter(now.subtract(7, "days")));
    } else if (dateFilter === "lastDay") {
      return data.filter(payment => dayjs(payment.created_at).isAfter(now.subtract(1, "day")));
    }
    return data; // Retorna todos os dados se o filtro for "all"
  };

  const getPieData = () => {
    const data = filteredPayments;

    if (displayMode === "valor") {
      return pieData; // Usa os dados de valor padrão
    } else {
      // Agrupamento para o modo "Quantidade"
      const quantityData = data.reduce((acc, payment) => {
        const product = payment.products;
        acc[product] = (acc[product] || 0) + 1;
        return acc;
      }, {});

      return {
        labels: Object.keys(quantityData),
        datasets: [
          {
            data: Object.values(quantityData),
            backgroundColor: ["#43a047", "#00b767", "#006336", "#084823"]
          }
        ]
      };
    }
  };
  useEffect(() => {
    // Filtro de data
    let filteredData = payments;
    const now = dayjs();

    if (dateFilter === "last30Days") {
      filteredData = payments.filter(payment =>
        dayjs(payment.created_at).isAfter(now.subtract(30, "days"))
      );
    } else if (dateFilter === "last7Days") {
      filteredData = payments.filter(payment =>
        dayjs(payment.created_at).isAfter(now.subtract(7, "days"))
      );
    } else if (dateFilter === "lastDay") {
      filteredData = payments.filter(payment =>
        dayjs(payment.created_at).isAfter(now.subtract(1, "day"))
      );
    }

    // Filtro de produto
    if (productFilter !== "all") {
      filteredData = filteredData.filter(payment => payment.products === productFilter);
    }

    setFilteredPayments(filteredData);

    // Atualiza os gráficos com os dados filtrados
    updateCharts(filteredData);
  }, [dateFilter, productFilter, payments]);

  const updateCharts = (data) => {
    // Agora, `data` é `filteredPayments`, já filtrado por data e produto.
    const groupedData = data.reduce((acc, payment) => {
      const product = payment.products;
      const totalPriceString = payment.total_price.replace(/[^0-9,.]/g, "").replace(",", ".");
      const totalPrice = parseFloat(totalPriceString);

      if (!isNaN(totalPrice)) {
        if (!acc[product]) acc[product] = {};
        if (!acc[product][totalPrice]) acc[product][totalPrice] = 0;
        acc[product][totalPrice] += 1;
      }

      return acc;
    }, {});


    const datasets = Object.keys(groupedData).map((product, index) => {
      return {
        label: product,
        data: Object.entries(groupedData[product]).map(([price, count]) => ({
          x: parseFloat(price),
          y: count
        })),
        borderColor: ["#43a047", "#e53935", "#ff9800", "#1e88e5"][index % 4],
        backgroundColor: ["#43a047", "#e53935", "#ff9800", "#1e88e5"][index % 4],
        fill: false,
        tension: 0.4
      };
    });

    setLineData({ datasets });

    const frequencyData = data.reduce((acc, payment) => {
      const price = payment.total_price;
      acc[price] = (acc[price] || 0) + 1;
      return acc;
    }, {});

    const sortedPrices = Object.entries(frequencyData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const totalPayments = data.length;
    const pieLabels = sortedPrices.map(([price]) => price);
    const pieDataValues = sortedPrices.map(([_, count]) => ((count / totalPayments) * 100).toFixed(2));

    setPieData({
      labels: pieLabels,
      datasets: [
        {
          data: pieDataValues,
          backgroundColor: ["#43a047", "#00b767", "#006336", "#084823"]
        }
      ]
    });
  };


  // UseEffect para buscar os dados quando o componente é montado
  useEffect(() => {
  }, []);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };
  const pieOptions = {
    plugins: {
      legend: {
        display: false // Remove a legenda
      },
      datalabels: {
        color: '#fff', // Cor do texto
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          if (displayMode === 'valor') {
            return `${label}\n${value}%`; // Exibe o valor com porcentagem
          } else {
            return `${label}\n${value}`; // Exibe apenas a quantidade sem o símbolo de porcentagem
          }
        },
        anchor: 'center', // Posiciona o rótulo no centro da fatia
        align: 'center', // Centraliza o rótulo na fatia
        offset: 0, // Reduz o offset para evitar que saia da fatia
        font: {
          size: 14, // Ajusta o tamanho da fonte para uma melhor visualização
          weight: 'bold',
        },
        padding: 5, // Adiciona um pequeno padding para garantir que o texto não esteja muito próximo da borda
        clip: false, // Desativa o recorte para que os rótulos não fiquem cortados nas bordas
      }
    },
    responsive: true,
    maintainAspectRatio: false, // Permite que o gráfico ocupe mais espaço vertical se necessário
  };

  // UseEffect para buscar os dados quando o componente é montado
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('https://querotaxa.onrender.com/api/payment/links');
        const responsePayment = await axios.get("https://querotaxa.onrender.com/api/payment");
        const filteredPayments = responsePayment.data.filter(payment => payment.customer_email === currentUser.email);
        const links = response.data;

        const filtered = links
          .filter(payment => payment.username === currentUser.email)
          .map(payment => ({
            ...payment,
            createdAt: new Date(payment.createdAt).toISOString(),
          }));
        console.log(currentUser.username)
        setLinks(filtered);

        if (filtered.length > 0) {
          const lastLink = filtered[filtered.length - 1].link;
          setText(lastLink);
        }

        // Agrupando por produto e calculando a quantidade e o total de vendas por preço
        const groupedData = filteredPayments.reduce((acc, payment) => {
          const product = payment.products;

          // Limpeza de `total_price` para remover caracteres não numéricos e suportar tanto R$ quanto números simples
          const totalPriceString = payment.total_price.toString().replace(/[^0-9,.]/g, "").replace(",", ".");
          const totalPrice = parseFloat(totalPriceString);

          if (!isNaN(totalPrice)) {
            if (!acc[product]) acc[product] = {};
            if (!acc[product][totalPrice]) acc[product][totalPrice] = 0;
            acc[product][totalPrice] += 1; // Contagem de vendas por preço
          } else {
            console.warn(`Preço inválido para o pagamento com ID ${payment.id}:`, payment.total_price);
          }

          return acc;
        }, {});

        setPayments(filteredPayments);

        // Configuração do gráfico de linha
        const datasets = Object.keys(groupedData).map((product, index) => {
          return {
            label: product,
            data: Object.entries(groupedData[product]).map(([price, count]) => ({
              x: parseFloat(price),
              y: count
            })),
            borderColor: ["#43a047", "#e53935", "#ff9800", "#1e88e5"][index % 4],
            backgroundColor: ["#43a047", "#e53935", "#ff9800", "#1e88e5"][index % 4],
            fill: false,
            tension: 0.4
          };
        });

        // Configuração do gráfico de pizza (conforme já implementado)
        const frequencyData = filteredPayments.reduce((acc, payment) => {
          const price = payment.total_price;
          acc[price] = (acc[price] || 0) + 1;
          return acc;
        }, {});

        const sortedPrices = Object.entries(frequencyData)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);
        console.log(filteredPayments)
        const totalPayments = filteredPayments.length;
        const pieLabels = sortedPrices.map(([price]) => price);
        const pieDataValues = sortedPrices.map(([_, count]) => ((count / totalPayments) * 100).toFixed(2));
        console.log(pieDataValues)
        if (pieLabels.length > 0) {
          setPieData({
            labels: pieLabels,
            datasets: [
              {
                data: pieDataValues,
                backgroundColor: ["#43a047", "#00b767", "#006336", "#084823"]
              }
            ]
          });
        }

      } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
      }
    };

    fetchPayments();
    // Aplica o filtro de data para o cálculo total
    const filteredPayments = applyDateFilter(payments);
    calculateTotalValue(filteredPayments);
  }, [currentUser.email, dateFilter]);
  useEffect(() => {
    // Filtro de data e produto
    let filteredData = applyDateFilter(payments);

    // Aplicando o filtro de produto após o filtro de data
    if (productFilter !== "all") {
      filteredData = filteredData.filter(payment => payment.products === productFilter);
    }

    // Atualizando o estado com os dados filtrados
    setFilteredPayments(filteredData);

    // Atualiza os gráficos e o valor líquido com os dados filtrados
    updateCharts(filteredData);
    calculateTotalValue(filteredData);

  }, [dateFilter, productFilter, payments]);



  const questions = [
    {
      id: 1,
      question: "Em quanto tempo recebo após concluir a venda?",
      answer: "Todo pagamento de comissão é feito a cada duas semanas.",
    },
    {
      id: 2,
      question: "Meu cliente está mandando mensagem com dúvidas, o que eu faço?",
      answer: "Enviei o contato do suporte (48) 8506-7774, não é necessário que você dê nenhum suporte, além do pós venda. É responsabilidade 100% da QueroTaxa.",
    },
    {
      id: 3,
      question: "Preciso alterar dados do meu recebimento, como faço?",
      answer: "Entre contato com o suporte de revendedores: (48)998067813",
    },
    {
      id: 4,
      question: "Meu cliente errou dados, o que ele deve fazer?",
      answer: "Entrar em contato com o suporte técnico (48) 8506-7774",
    },
  ];


  // Definir as colunas da tabela
  const columns = [
    { field: 'valor', headerName: 'Valor', width: 100 },
    { field: 'maquina', headerName: 'Máquina', width: 150 },
    {
      field: 'link', headerName: 'Link', width: 250, renderCell: (params) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">{params.value}</a>
      )
    },
    ,
  ];
  const [maquina, setMaquina] = useState(0);
  const [selectedButtonpage, setSelectedButtonpage] = useState(1);
  const [selectedButtonTabelaTaxa, setSelectedButtonTabelaTaxa] = useState(0);



  // Example button data with images
  const buttons_maquinas = [
    { id: 0, label: 'Image 1', image: `${process.env.PUBLIC_URL}/assets/maquininha150x200.png` },
    { id: 1, label: 'Image 2', image: `${process.env.PUBLIC_URL}/assets/QUERO_FACIL.png` },
  ];
  const imagnes_taxas = [
    { id: 0, label: 'Image 2', image: `${process.env.PUBLIC_URL}/assets/TAXA_QUEROPROMO.png` },
    { id: 1, label: 'Image 1', image: `${process.env.PUBLIC_URL}/assets/TAXA_QUEROFATURAR.png` },

  ]
  const imagnes_taxas_facil = [
    { id: 0, label: 'Image 3', image: `${process.env.PUBLIC_URL}/assets/TAXA_QUEROFACILpng.png` }

  ]
  // Example button data with images
  const buttons_page = [
    { id: 1, label: 'Gerar link para pagmento' },
    { id: 2, label: 'Histórico' },
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options_querofacil = ['19,90', '39,90', '59,90', '79,90', '99,90']; // Array de opções
  const option_queroFaturar = ['197,90', '247,90', '297,90', '347,90', '397,90', '447,90', '497,90', '547,90', '597,90', '647,90', '697,90']
  const link_payments_querofacil = [
    // 'https://pay.kirvano.com/63d45320-22da-411f-aa55-e37a5e9228b1',

    'https://pay.kirvano.com/1a80cd56-dc92-435a-96ff-38d206e2d5b5',
    'https://pay.kirvano.com/a857c116-effc-413a-923a-f928f604fed4',
    'https://pay.kirvano.com/549ec712-da5f-4feb-b3de-3ece73435d8c',
    'https://pay.kirvano.com/519c5749-b42a-4681-86c0-913355fe7b97',
    'https://pay.kirvano.com/4a610944-326e-43f4-b4d3-31a9e8fdf43e'
  ]
  const link_payments_querofaturar = [
    // 'https://pay.kirvano.com/63d45320-22da-411f-aa55-e37a5e9228b1',
    'https://pay.kirvano.com/1e45e65d-4586-42d2-a5b0-b761f47228e9',
    'https://pay.kirvano.com/d89b39d3-562b-4ea2-bb19-890ef5491ecf',
    'https://pay.kirvano.com/97a6a7a1-cc47-4bdd-a5f4-9e6896286809',
    'https://pay.kirvano.com/bf0360b0-818e-4ff5-b64c-f22ad5aa6cc7',
    'https://pay.kirvano.com/9ced6928-6600-45da-93cb-ff1c4cd92f26',
    'https://pay.kirvano.com/6df70caa-56df-4923-ab9e-13bd9a34938f',
    'https://pay.kirvano.com/4abf80fe-95a4-4cd8-9ed8-cb886d44a539',
    'https://pay.kirvano.com/2c366824-ce76-465a-838a-15c2a39e065f',
    'https://pay.kirvano.com/616b967e-f907-4db4-9cb2-84177b0f5bb3',
    'https://pay.kirvano.com/884788c2-13ea-459d-a07a-21903ba7ce68',
    'https://pay.kirvano.com/f29d27fb-d1b9-4cec-8397-e2d494af6967'
  ]
  const link_payments_queropromo = [
    'https://pay.kirvano.com/07e945c7-29e2-4515-a1a9-81371c3c1c14',
    'https://pay.kirvano.com/7d9ba993-09c5-405b-bfa3-d5be6767a30a',
    'https://pay.kirvano.com/f2ac330b-56dc-46b3-ab72-396773c88ad5',
    'https://pay.kirvano.com/33ac8836-47b1-42d8-9379-07b2f1219002',
    'https://pay.kirvano.com/fc0cb20c-f379-470b-bef0-1c143dd18914',
    'https://pay.kirvano.com/2956a323-ab87-494a-a3fb-e5953a31f52d',
    'https://pay.kirvano.com/81f62734-583d-4a0c-9db3-ddfd98770940',
    'https://pay.kirvano.com/66db835a-fc97-48e6-aaad-1b44068f3594',
    'https://pay.kirvano.com/896256f1-f476-4848-b6e9-0e3f5305b5b2',
    'https://pay.kirvano.com/402b118d-eb60-4749-82cf-18bb9cc3e9c2',
    'https://pay.kirvano.com/779a8a7f-ccfc-4a09-b4e4-6478ba89776d'
  ]
  const handleSelectChange = (event) => {
    const index = event.target.selectedIndex;
    setSelectedIndex(index);

    console.log("Índice selecionado:", index);
  };
  const handleButtonClick = (id) => {
    setMaquina(id);
  };

  const handleButtonClickTabelaTaxa = (id) => {
    setSelectedButtonTabelaTaxa(id);
  };
  const handleButtonClickpage = (id) => {
    setSelectedButtonpage(id);
  };

  const handleCopyQueroFacil = async () => {
    try {
      const baseLink = link_payments_querofacil[selectedIndex - 1];
      const utmLink = generateUTM(baseLink, currentUser.email, 'social', 'quero_facil_campaign', 'promo');

      const response = await axios.post('https://querotaxa.onrender.com/api/payment/links', {
        valor: options_querofacil[selectedIndex - 1],
        maquina: 'Quero Fácil',
        link: utmLink,
        username: currentUser.email
      });

      navigator.clipboard.writeText(utmLink);
      alert('Link de pagamento copiado');
      setText(utmLink);
      setSelectedButtonpage(2);
      setSelectedMaquina(0);
      setCheckin(0);
      setLinkPage(0);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };

  // Função para copiar o texto para a área de transferência
  const handleCopyQueroFaturar = async () => {
    try {
      const baseLink = link_payments_querofaturar[selectedIndex - 1];
      const utmLink = generateUTM(baseLink, currentUser.email, 'social', 'quero_faturar_campaign', 'promo');

      const response = await axios.post('https://querotaxa.onrender.com/api/payment/links', {
        valor: option_queroFaturar[selectedIndex - 1],
        maquina: 'Quero Faturar',
        link: utmLink,
        username: currentUser.email
      });

      navigator.clipboard.writeText(utmLink);
      alert('Link de pagamento copiado');
      setText(utmLink);
      setSelectedButtonpage(2);
      setSelectedMaquina(0);
      setCheckin(0);
      setLinkPage(0);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };

  // Função para copiar o texto para a área de transferência
  const handleCopyQueroPromo = async () => {
    try {
      const baseLink = link_payments_queropromo[selectedIndex - 1];
      const utmLink = generateUTM(baseLink, currentUser.email, 'social', 'quero_promo_campaign', 'promo');

      const response = await axios.post('https://querotaxa.onrender.com/api/payment/links', {
        valor: option_queroFaturar[selectedIndex - 1],
        maquina: 'Quero Promo',
        link: utmLink,
        username: currentUser.email
      });

      console.log('Dados enviados com sucesso:', response.data);
      navigator.clipboard.writeText(utmLink);
      alert('Link de pagamento copiado');
      setText(utmLink);
      setSelectedButtonpage(2);
      setSelectedMaquina(0);
      setCheckin(0);
      setLinkPage(0);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  }
  const generateUTM = (baseLink, source, medium, campaign, content) => {
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_content: content,
    });
    return `${baseLink}?${params.toString()}`;
  };

  return (
    <div className='container-profile' style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
      <div class="top-bar">
        <h3 class="tag-topo">
          {currentUser.username}
          <a href="/login" class="nav-link" onClick="logOut()">Sair</a>
        </h3>
      </div>

      {selectedMaquina === 1 && checkin == 0 && linkPage == 0 && maquina == 0 && (<div className="tabelas-taxas" >
        <div className="tabelas">
          {imagnes_taxas.map((img) => (
            <button
              key={img.id}
              className={`toggle-button-tabela ${selectedButtonTabelaTaxa === img.id ? 'active' : ''}`}
              onClick={() => handleButtonClickTabelaTaxa(img.id)}
            >
              <img key={img.id} src={img.image} height={600} width={400} alt={img.label} />
            </button>
          ))}</div>
        <h1 style={{ textAlign: "center", marginTop: "30px" }}>
          <span>É responsabilidade do vendedor selecionar a taxa correta, </span> <span>caso ocorra algum erro, será acarretado em cancelamento da comissão.</span>
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>

          <button
            className="toggle-page-tabela"
            onClick={() => selecionarMaquina(0)}
          >
            Cancelar seleção
          </button>
          <button
            className="toggle-page-tabela"
            onClick={() => avancarCheckin(1)}
            style={{ backgroundColor: '#09ce78' }}
          >
            Confirmar seleção
          </button>
        </div>

      </div>)}
      {selectedMaquina === 1 && checkin == 0 && linkPage == 0 && maquina == 1 && (<div className="tabelas-taxas" >
        <div className="tabelas">
          {imagnes_taxas_facil.map((img) => (
            <button
              key={img.id}
              className={`toggle-button-tabela ${selectedButtonTabelaTaxa === img.id ? 'active' : ''}`}
              onClick={() => handleButtonClickTabelaTaxa(img.id)}
            >
              <img key={img.id} src={img.image} height={600} width={400} alt={img.label} />
            </button>
          ))}</div>
        <h1 style={{ textAlign: "center", marginTop: "30px" }}>
          <span>É responsabilidade do vendedor selecionar a taxa correta, </span> <span>caso ocorra algum erro, será acarretado em cancelamento da comissão.</span>
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>

          <button
            className="toggle-page-tabela"
            onClick={() => selecionarMaquina(0)}
          >
            Cancelar seleção
          </button>
          <button
            className="toggle-page-tabela"
            onClick={() => avancarCheckin(1)}
            style={{ backgroundColor: '#09ce78' }}
          >
            Confirmar seleção
          </button>
        </div>

      </div>)}
      {checkin === 1 && linkPage == 0 && maquina == 0 && (<div className="tabelas-taxas" >
        <div className="tabelas" width={'50%'}>

          <img src={imagnes_taxas[selectedButtonTabelaTaxa].image} height={700} width={400} />
          <div className="img-dropdown">
            <img src={buttons_maquinas[maquina].image} width={200} height={250} />
            <div className="dropdown-container">
              <select className="dropdown" onChange={handleSelectChange} defaultValue="">
                <option value="" disabled>
                  Selecione o valor
                </option>
                {option_queroFaturar.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <h1 style={{ textAlign: "center", marginTop: "30px" }}>
              <span>É responsabilidade do vendedor selecionar a taxa correta, </span> <span>caso ocorra algum erro, será acarretado em cancelamento da comissão.</span>
            </h1>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>

              <button
                className="toggle-page-tabela"
                onClick={() => avancarCheckin(0)}
              >
                Cancelar seleção
              </button>
              {selectedButtonTabelaTaxa == 1 && (
                <button
                  className="toggle-page-tabela"
                  onClick={handleCopyQueroFaturar}
                  style={{ backgroundColor: '#09ce78' }}
                >
                  Gerar Link
                </button>
              )}
              {selectedButtonTabelaTaxa == 0 && (
                <button
                  className="toggle-page-tabela"
                  onClick={handleCopyQueroPromo}
                  style={{ backgroundColor: '#09ce78' }}
                >
                  Gerar Link
                </button>
              )}
            </div>
          </div>
        </div>


      </div>)}
      {checkin === 1 && linkPage == 0 && maquina == 1 && (<div className="tabelas-taxas" >
        <div className="tabelas" width={'50%'}>

          <img src={imagnes_taxas_facil[selectedButtonTabelaTaxa].image} height={700} width={400} />
          <div className="img-dropdown">
            <img src={buttons_maquinas[maquina].image} width={200} height={250} />
            <div className="dropdown-container">
              <select className="dropdown" onChange={handleSelectChange} defaultValue="">
                <option value="" disabled>
                  Selecione o valor
                </option>
                {options_querofacil.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>

            </div>
            <h1 style={{ textAlign: "center", marginTop: "30px" }}>
              <span>É responsabilidade do vendedor selecionar a taxa correta, </span> <span>caso ocorra algum erro, será acarretado em cancelamento da comissão.</span>
            </h1>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>

              <button
                className="toggle-page-tabela"
                onClick={() => avancarCheckin(0)}
              >
                Cancelar seleção
              </button>
              <button
                className="toggle-page-tabela"
                onClick={handleCopyQueroFacil}
                style={{ backgroundColor: '#09ce78' }}
              >
                Gerar Link
              </button>
            </div>
          </div>
        </div>


      </div>)}

      {/* Div do Pagamento */}
      {selectedMaquina === 0 && (
        <div className="column">
          <div className="pagamento" style={{ flex: 1 }}>
            {/* Div para os botões de navegação de páginas */}
            <div className="page">
              {buttons_page.map((button) => (
                <button
                  key={button.id}
                  className={`toggle-page ${selectedButtonpage === button.id ? 'active' : ''}`}
                  onClick={() => handleButtonClickpage(button.id)}
                >
                  {button.label}
                </button>
              ))}
            </div>
            {selectedButtonpage === 1 ? (
              <div className="button-group">
                {buttons_maquinas.map((button) => (
                  <button
                    key={button.id}
                    className={`toggle-button ${maquina === button.id ? 'active' : ''}`}
                    onClick={() => handleButtonClick(button.id)}
                  >
                    <img src={button.image} alt={button.label} />
                  </button>
                ))}
                <div className="selecionar-taxa">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => selecionarMaquina(1)}
                    className="selecionar-taxa"
                  >
                    Selecionar taxa
                  </Button>
                  <h3>Clique para continuar e gerar link</h3>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', width: '100%' }}>
                  <TextField
                    value={text}
                    variant="outlined"
                    disabled
                    InputProps={{
                      disableUnderline: true,
                      style: {
                        color: '#ffffff',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#444444',
                        borderRadius: '8px',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                      },
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#ffffff',
                        opacity: 1,
                      },
                    }}
                    style={{
                      width: 'calc(100% - 200px)',
                      height: '40px',
                      boxSizing: 'border-box',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />

                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => alert('copiar')}
                    style={{ width: '250px', height: '50px' }}
                    className="selecionar-taxa"
                  >
                    Copiar último link gerado
                  </Button>
                </div>

                <div className="typography-data-container">
                  <Typography variant="h5" component="h2" style={{ color: "white" }}>
                    Histórico de Pagamentos
                  </Typography>
                  <div style={{ height: 150, width: "95%" }}>
                    <DataGrid
                      rows={links}
                      columns={columns}
                      pageSize={100}
                      rowsPerPageOptions={[]}
                      hideFooter={true}
                      disableSelectionOnClick
                      loading={!links.length}
                      sx={{
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: ' #30302f80', // Transforma o cabeçalho em transparente
                          opacity: 1, // Garante que a cor do texto seja visível
                        },
                        '& .MuiDataGrid-columnHeadersInner': {
                          backgroundColor: 'rgba(0, 0, 0, 0)', // Torna a camada interna do cabeçalho transparente
                        },
                        '& .MuiDataGrid-columnHeader': {
                          backgroundColor: 'rgba(0, 0, 0, 0) !important', // Força a transparência de cada célula do cabeçalho
                        },
                        '& .MuiDataGrid-columnSeparator': {
                          display: 'none', // Remove o separador entre as colunas
                        },
                        '& .MuiDataGrid-cell': {
                          color: '#ffffff', // Define as letras das células como brancas
                        },
                        '& .MuiDataGrid-row': {
                          backgroundColor: 'rgba(48, 48, 48, 0.5)', // Define o fundo das linhas como semitransparente
                        },
                        '& .MuiDataGrid-row:hover': {
                          backgroundColor: 'rgba(48, 48, 48, 0.7)', // Escurece ao passar o mouse
                        },
                        '& .MuiDataGrid-columnHeaders:before': {
                          display: 'none', // Remove quaisquer sombras adicionais ou camadas de fundo
                        },
                      }}
                    />
                  </div>
                </div>
              </>
            )}





            {/* Campo de link com botão de copiar */}
            <div style={{ display: "flex", alignItems: "center", flex: 2 }}>

            </div>

            {/* <Typography
            variant="h5"
            component="h2"
            style={{
              marginTop: "30px",
              marginBottom: "10px",
              textAlign: "center",
              color: "#000",
            }}
          >
            Histórico de Pagamentos
          </Typography> */}

            {/* Contêiner para centralizar o DataGrid */}
            {/* <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <div style={{ height: 400, width: "80%" }}>
            <DataGrid
              rows={payments}
              columns={columns}
              pageSize={100}
              rowsPerPageOptions={[]}
              hideFooter={true}
              disableSelectionOnClick
              loading={!payments.length}
            />
          </div>
        </div>
        </div>
          {/* Div para os botões de navegação de páginas */}
            <div className="ajuda" >

              <div className="ajuda-btn">
                <Button
                  variant="contained"
                  color="success"
                  className={`toggle-button-tabela`}
                >
                  Perguntas frequentes
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => window.open('https://drive.google.com/drive/u/4/folders/1KrprAonBPSQ6zuAImVTURx-YmD1afiJh', '_blank')}
                  className="ajuda-btn"
                >
                  Material Afiliado
                </Button>

              </div>
              <div className="page">
              </div>
              <div style={{ margin: "20px" }}>
                {questions.map((q) => (
                  <div key={q.id} style={{ marginBottom: "10px" }}>
                    <div
                      onClick={() => toggleQuestion(q.id)}
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        backgroundColor: "#f0f0f0",
                        padding: "10px",
                        borderRadius: "5px",
                        color: "black",
                        textDecorationColor: 'black',
                      }}
                    >
                      {q.question}
                    </div>
                    {activeQuestion === q.id && (
                      <div
                        style={{
                          marginTop: "5px",
                          padding: "10px",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "5px",
                          color: "black",
                          textDecorationColor: 'black',
                        }}
                      >
                        {q.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>)
      }


      {/* Nova Div contendo os gráficos */}
      <div style={{
        marginLeft: 60,
        backgroundColor: '#30302f80',
        borderRadius: '15px',
        marginTop: '100px',
      }}>
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: 30, paddingRight: 30 }}>

          {/* Botões Toggle para alternar entre Valor e Quantidade, no topo */}
          <div style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center", // Centraliza horizontalmente
            marginBottom: "20px"
          }}>
            <button
              className={`toggle-page ${displayMode === "valor" ? "active" : ""}`}
              onClick={() => handleDisplayModeChange("valor")}
            >
              Valor
            </button>
            <button
              className={`toggle-page ${displayMode === "quantidade" ? "active" : ""}`}
              onClick={() => handleDisplayModeChange("quantidade")}
            >
              Quantidade
            </button>
          </div>


          <div style={{
            width: '100%',
            borderRadius: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px'
          }}>
            {/* Gráfico de Pizza - apenas se houver dados */}
            {pieData?.datasets?.[0]?.data?.length > 0 && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '250x',
                  height: '250px',
                  position: 'relative'
                }}>
                  <Pie data={getPieData()} options={pieOptions} />
                </div>
              </div>
            )}

            {/* Contêiner para os seletores, um embaixo do outro */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginLeft: '20px' }}>
              <FormControl>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    backgroundColor: '#444444',
                    '& .MuiSelect-icon': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#09ce78' }
                  }}
                >
                  <MenuItem value="all">Todo o Tempo</MenuItem>
                  <MenuItem value="last30Days">Últimos 30 dias</MenuItem>
                  <MenuItem value="last7Days">Últimos 7 dias</MenuItem>
                  <MenuItem value="lastDay">Último dia</MenuItem>
                </Select>
              </FormControl>

              <FormControl>
                <Select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  sx={{
                    color: '#ffffff',
                    backgroundColor: '#444444',
                    '& .MuiSelect-icon': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffff' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#09ce78' }
                  }}
                >
                  <MenuItem value="all">Todos os Produtos</MenuItem>
                  {Array.from(new Set(payments.map(payment => payment.products))).map(product => (
                    <MenuItem key={product} value={product}>{product}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Caixa de Valor Líquido */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#3c3c3c',
                padding: '15px 20px',
                borderRadius: '10px',
                color: '#fff',
                marginTop: '20px'
              }}>
                <img src={IconHandMoney} alt="Ícone de valor líquido" style={{ width: '40px', marginRight: '10px' }} />
                <div style={{ whiteSpace: 'nowrap' }}> {/* Garante que o texto não quebre */}
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold', display: 'inline' }}>
                    Valor líquido:
                  </Typography>{' '}
                  <Typography variant="h6" style={{ fontWeight: 'bold', display: 'inline', marginLeft: '5px' }}>
                    {totalValue}
                  </Typography>
                </div>
              </div>

            </div>
          </div>
        </div>




        {/* Gráfico de Barras - apenas se houver dados */}
        {/* {lineData?.datasets?.length > 0 && (
    <div>
      <Typography variant="h6" style={{ textAlign: "center" }}>Gráfico de Linha</Typography>
      <Line
        data={lineData}
        options={{
          scales: {
            x: {
              title: {
                display: true,
                text: "Valor de Venda (R$)"
              }
            },
            y: {
              title: {
                display: true,
                text: "Quantidade Vendida"
              },
              beginAtZero: true
            }
          }
        }}
        style={{ marginLeft: 100, maxHeight: 300 }}
      />
    </div>
  )} */}
      </div>



    </div >
  );
};

export default Profile;
