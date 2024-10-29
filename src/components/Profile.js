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
import Alert from "./alert";
// import maquina from '../../assets/stripe-front/assets/maquininha150x200.png'

// Registro de componentes necessários para os gráficos
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

const Profile = () => {
  const currentUser = AuthService.getCurrentUser();
  const [valorVenda, setValorVenda] = useState("");
  const [option, setOption] = useState("quero faturar");
  const [text, setText] = useState("Http://checkoutpipipi...");
  const [payments, setPayments] = useState([]); // State to hold payment data


  const [selectedImage, setSelectedImage] = useState("");
  const [selectedMaquina, setSelectedMaquina] = useState(0);
  const [checkin, setCheckin] = useState(0);
  const [linkPage, setLinkPage] = useState(0);




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
  // Função para buscar dados de pagamento
  useEffect(() => {
    const fetchPayments = async () => {
      const data = await fetchallPay();
      setPayments(Array.isArray(data) ? data : []); // Certifica-se de que payments seja uma array
    };
    fetchPayments();
  }, []);
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
  // Agrupar dados por valor e tipo de produto
  const groupByValueAndProduct = () => {
    if (!Array.isArray(payments)) return { labels: [], queroFaturarData: [], queroPromoData: [] };

    const groupedData = payments.reduce((acc, payment) => {
      // Analisando `products` e extraindo `product`
      const parsedProducts = JSON.parse(payment.products || "[]");
      const product = parsedProducts.length > 0 ? parsedProducts[0].name : "Outro";

      // Extraindo `amount` do `total_price` (sem símbolo)
      const amount = parseFloat(payment.total_price.replace("R$ ", "").replace(",", "."));

      if (!acc[amount]) {
        acc[amount] = { "Quero Fácil": 0, "Quero Promo": 0 };
      }
      acc[amount][product] += 1;
      return acc;
    }, {});

    const labels = Object.keys(groupedData);
    const queroFaturarData = labels.map((label) => groupedData[label]["Quero Fácil"]);
    const queroPromoData = labels.map((label) => groupedData[label]["Quero Promo"]);

    return { labels, queroFaturarData, queroPromoData };
  };

  const { labels, queroFaturarData, queroPromoData } = groupByValueAndProduct();

  // Dados para o gráfico de Pizza
  const pieData = {
    labels: ["Quero Fácil", "Quero Promo"],
    datasets: [
      {
        data: [queroFaturarData.reduce((a, b) => a + b, 0), queroPromoData.reduce((a, b) => a + b, 0)],
        backgroundColor: ["#43a047", "#e53935"],
        hoverBackgroundColor: ["#66bb6a", "#ef5350"],
      },
    ],
  };
  // Dados para o gráfico de Barras agrupado por valor
  const barData = {
    labels: labels,
    datasets: [
      {
        label: "Quero Fácil",
        data: queroFaturarData,
        backgroundColor: "#43a047",
      },
      {
        label: "Quero Promo",
        data: queroPromoData,
        backgroundColor: "#e53935",
      },
    ],
  };

  // Definir as colunas da tabela
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "product", headerName: "Produto", width: 150 },
    { field: "amount", headerName: "Valor", width: 110 },
    { field: "status", headerName: "Status", width: 130 },
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
  const link_payments_querofacil = ['https://pay.kirvano.com/1a80cd56-dc92-435a-96ff-38d206e2d5b5',
    'https://pay.kirvano.com/a857c116-effc-413a-923a-f928f604fed4',
    'https://pay.kirvano.com/549ec712-da5f-4feb-b3de-3ece73435d8c',
    'https://pay.kirvano.com/519c5749-b42a-4681-86c0-913355fe7b97',
    'https://pay.kirvano.com/4a610944-326e-43f4-b4d3-31a9e8fdf43e'
  ]
  const link_payments_querofaturar = [
    'https://pay.kirvano.com/9e8f6e7e-0dea-46d3-98f9-958799e346bf',
    'https://pay.kirvano.com/1b115842-d2e7-41ab-b2b1-dbb0fdf2c201',
    'https://pay.kirvano.com/0cb087b4-18c0-40f7-80a6-75b0a9a6d35e',
    'https://pay.kirvano.com/32863626-c062-4db7-99ec-ac7d0522f5ea',
    'https://pay.kirvano.com/48786c61-4059-48b9-99f4-158571f300c5',
    'https://pay.kirvano.com/eb100f8a-760f-4d4e-b2a1-76d2bd930611',
    'https://pay.kirvano.com/eb100f8a-760f-4d4e-b2a1-76d2bd930611',
    'https://pay.kirvano.com/7d1c2b1c-c57d-46fd-b130-b32c0eaa51f1',
    'https://pay.kirvano.com/5c0fcd4e-2490-49b8-8269-afe332d0ffb1',
    'https://pay.kirvano.com/a496b666-a736-4096-9074-4918b711bde2',
    'https://pay.kirvano.com/64bbe4ce-b6c2-414c-a25d-3f89350e271e'
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

  // Função para copiar o texto para a área de transferência
  const handleCopyQueroFacil = () => {
    navigator.clipboard.writeText(link_payments_querofacil[selectedIndex - 1]);
    alert('Link de pagamento copiado')
  };
  // Função para copiar o texto para a área de transferência
  const handleCopyQueroFaturar = () => {
    navigator.clipboard.writeText(link_payments_querofaturar[selectedIndex - 1]);
    alert('Link de pagamento copiado')
  };
  return (
    <div className='container-profile' style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
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
                  Selecione
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
              <button
                className="toggle-page-tabela"
                onClick={handleCopyQueroFaturar}
                style={{ backgroundColor: '#09ce78' }}
              >
                Gerar Link
              </button>
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
                  Selecione
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
      {selectedMaquina === 0 && (<div className="column">
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
          {/* Botões de opções "quero faturar" e "quero promo" */}
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
              <h3 >Clique para continuar e gerar link</h3>
            </div>
            {/* <h2>Clique para continuar e gerar link</h2> */}
          </div>


          {/* Campo para valor da venda */}
          {/* <TextField
          required
          label="Digite o valor da venda"
          value={valorVenda}
          onChange={handleChangeValorVenda}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          sx={{ width: "75%" }}
          margin="normal"
          variant="filled"
          style={{ backgroundColor: "white", flex: 1, marginLeft: 10 }}
        /> */}

          {/* Campo de link com botão de copiar */}
          <div style={{ display: "flex", alignItems: "center", flex: 2 }}>
            {/* <TextField
            value={text}
            variant="outlined"
            disabled
            fullWidth
            style={{
              backgroundColor: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
              marginRight: "10px",
              marginLeft: 10,
            }}
          /> */}

            {/* <Tooltip title="Copiar texto">
            <IconButton
              onClick={handleCopy}
              style={{ backgroundColor: "#4a4b4a", color: "#fff" }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip> */}
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

      </div>)}


      {/* Nova Div contendo os gráficos */}
      <div style={{ flex: 1, marginLeft: 20 }}>
        {/* Gráfico de Pizza */}
        <div style={{ marginBottom: 50 }}>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            Gráfico de Pizza
          </Typography>
          <Pie data={pieData} style={{ maxHeight: 300 }} />
        </div>

        <div>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            Gráfico de Barras
          </Typography>
          <Bar data={barData} style={{ marginLeft: 100, maxHeight: 300 }} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
