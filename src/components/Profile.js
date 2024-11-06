import React, { useState, useEffect } from "react";
import { TextField, Button, FormControl, Typography } from "@mui/material";
import { IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AuthService from "../services/auth.service";
import { fetchallPay } from "../services/payment";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Pie, Bar } from 'react-chartjs-2'; // Importando os gráficos
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "./Profile.css";
import EventBus from "../common/EventBus";

import Alert from "./alert";
// import maquina from '../../assets/stripe-front/assets/maquininha150x200.png'

// Registro de componentes necessários para os gráficos
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

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



  // UseEffect para buscar os dados quando o componente é montado
  useEffect(() => {
  }, []);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  // UseEffect para buscar os dados quando o componente é montado
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('https://querotaxa.onrender.com/api/payment/links');
        const responsePayment = await axios.get("https://querotaxa.onrender.com/api/payment");
        const filteredPayments = responsePayment.data.filter(payment => payment.customer_email === currentUser.email);
        const links = response.data;

        // Filtrando pelo username e convertendo as datas para objetos Date
        const filtered = links
          .filter(payment => payment.username === currentUser.username)
          .map(payment => ({
            ...payment,
            createdAt: new Date(payment.createdAt).toISOString(), // Garantindo o formato de data ISO
          }));
        setLinks(filtered);

        // Pegando o último link da lista filtrada e configurando com setText
        if (filtered.length > 0) {
          const lastLink = filtered[filtered.length - 1].link; // substitua '.link' pelo campo correto do link, caso necessário
          setText(lastLink);
        }

        // Agrupando por produto e calculando os totais
        const groupedData = filteredPayments.reduce((acc, payment) => {
          const product = payment.products;
          const totalPriceString = payment.total_price.replace("R$", "").replace(/\./g, "").replace(",", ".");
          const totalPrice = parseFloat(totalPriceString);

          // Verificar se `totalPrice` é um número válido antes de usá-lo
          if (!isNaN(totalPrice)) {
            if (!acc[product]) {
              acc[product] = { count: 0, totalValue: 0 };
            }
            acc[product].count += 1;
            acc[product].totalValue += totalPrice;
          } else {
            console.warn(`Preço inválido para o pagamento com ID ${payment.id}:`, payment.total_price);
          }

          return acc;
        }, {});

        setPayments(filteredPayments);

        // Verificar se há dados antes de configurar os gráficos
        const productNames = Object.keys(groupedData);
        const productCounts = Object.values(groupedData).map(item => item.count);
        const productTotalValues = Object.values(groupedData).map(item => item.totalValue);

        // Apenas configurar `pieData` e `barData` se houver dados válidos
        if (productNames.length > 0) {
          setPieData({
            labels: productNames,
            datasets: [
              {
                data: productCounts,
                backgroundColor: ["#43a047", "#e53935", "#ff9800"],
                hoverBackgroundColor: ["#66bb6a", "#ef5350", "#ffb74d"]
              }
            ]
          });

          setBarData({
            labels: productNames,
            datasets: [
              {
                label: "Valor Total (R$)",
                data: productTotalValues,
                backgroundColor: ["#43a047", "#e53935", "#ff9800"],
                barPercentage: 0.5, // Ajusta a largura da barra (0 a 1)
                categoryPercentage: 0.8, // Ajusta o espaçamento entre as barras
              }
            ]
          });
        }
        console.log(productTotalValues)
      } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
      }
    };

    fetchPayments();
  }, [currentUser.email]);



  const questions = [
    {
      id: 1,
      question: "Em quanto tempo recebo após concluir a venda?",
      answer: "Todo pagamento de comissão é feito a cada duas semanas.",
    },
    {
      id: 2,
      question: "Meu cliente está mandando mensagem com dúvidas, o que eu faço?",
      answer: "Enviei o contato do suporte (XX) XXXX-XXX, não é necessário que você dê nenhum suporte, além do pós venda. É responsabilidade 100% da QueroTaxa.",
    },
    {
      id: 3,
      question: "Preciso alterar dados do meu recebimento, como faço?",
      answer: "Entre contato com o suporte de revendedores: (48)998067813",
    },
    {
      id: 4,
      question: "Meu cliente errou dados, o que ele deve fazer?",
      answer: "Entrar em contato com o suporte técnico (xx) xxxx-xxxx",
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
    'https://pay.kirvano.com/e4f1c93c-e3d7-4710-ba11-86ed14ef9c9e',
    'https://pay.kirvano.com/d5517028-0061-400f-ad8e-d746ddcb48c2',
    'https://pay.kirvano.com/a7c1fb4a-6670-4ce1-abb1-26f77b4c647f',
    'https://pay.kirvano.com/9d4834b0-dd79-42d7-87ae-8d45289b83a7',
    'https://pay.kirvano.com/376b43db-7b94-4b5f-8aed-1b4819cbe977',
    'https://pay.kirvano.com/8b08688b-39a2-4a92-bccb-563514944e68',
    'https://pay.kirvano.com/ec7b7cec-3c52-4131-bd7f-2a5be5e7111a',
    'https://pay.kirvano.com/22bb7ca4-d4c0-49e8-9aca-83228d98d47d',
    'https://pay.kirvano.com/abce8275-bbc4-4024-8a01-f9ecf5762f03',
    'https://pay.kirvano.com/86825353-532c-4206-8886-8c740d89f672',
    'https://pay.kirvano.com/f9135920-8782-48a1-9e8e-0bfcb45ba0e3',

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
          <a href="/login" class="nav-link" onclick="logOut()">Sair</a>
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
                  onClick={() => alert('Iremos disponibilizar o mais breve possível')}
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
        flex: 1, marginLeft: 30, backgroundColor: '#30302f80', borderRadius: '15px', height: '40%',marginTop:'100px' }}>
        {/* Gráfico de Pizza - apenas se houver dados */}
        {pieData?.datasets?.[0]?.data?.length > 0 && (
          <div style={{ marginBottom: 50, marginTop: 20 }}>
            <Typography variant="h6" style={{ textAlign: "center" }}>Gráfico de Pizza</Typography>
            <Pie data={pieData} style={{ maxHeight: 300 }} />
          </div>
        )}

        {/* Gráfico de Barras - apenas se houver dados */}
        {barData?.datasets?.[0]?.data?.length > 0 && (
          <div>
            <Typography variant="h6" style={{ textAlign: "center" }}>Gráfico de Barras</Typography>
            <Bar data={barData} style={{ marginLeft: 100, maxHeight: 300 }} />
          </div>
        )}
      </div>


    </div >
  );
};

export default Profile;
