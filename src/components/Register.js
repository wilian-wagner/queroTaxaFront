import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import AuthService from "../services/auth.service";
import './Register.css';

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        Campo obrigatório!
      </div>
    );
  }
};

const validEmail = (value) => {
  if (!isEmail(value)) {
    return (
      <div className="alert alert-danger" role="alert">
        E-mail inválido.
      </div>
    );
  }
};

const Register = () => {
  const form = useRef();
  const checkBtn = useRef();
  const navigate = useNavigate();

  const [bancos, setBancos] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Novo estado para confirmação de senha
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [bank, setBank] = useState("");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://brasilapi.com.br/api/banks/v1")
      .then((response) => response.json())
      .then((data) => {
        setBancos(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar a lista de bancos:", error);
      });
  }, []);

  const onChangeUsername = (e) => setUsername(e.target.value);
  const onChangeEmail = (e) => setEmail(e.target.value);
  const onChangePassword = (e) => setPassword(e.target.value);
  const onChangeConfirmPassword = (e) => setConfirmPassword(e.target.value); // Para o campo de confirmação de senha
  const onChangePhone = (e) => setPhone(e.target.value);
  const onChangeBirthdate = (e) => setBirthdate(e.target.value);
  const onChangePixKey = (e) => setPixKey(e.target.value);
  const onChangeBank = (e) => setBank(e.target.value);
  const onChangeAgency = (e) => setAgency(e.target.value);
  const onChangeAccountNumber = (e) => setAccountNumber(e.target.value);

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage("");
    setSuccessful(false);

    // Verificar se as senhas são iguais
    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      AuthService.register(username, email, password, phone, birthdate, pixKey, bank, agency, accountNumber)
        .then((response) => {
          alert(response.data.message);
          setSuccessful(true);
          navigate("/login");
        })
        .catch((error) => {
          const resMessage =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
          setMessage(resMessage);
          setSuccessful(false);
        });
    }
  };

  return (
    <div className="container">

    <div className="register-container">
      <div className="form-container">
        <div className="titulo">
          <h2>
            <span className="cadastro-titulo">Cad</span>astro
          </h2>
          <p>Cadastre-se e comece hoje mesmo a lucrar</p>
        </div>
        <Form onSubmit={handleRegister} ref={form}>
          {!successful && (
            <div className="flex-wrapper">
              <div className="left-side">
                <Input
                  type="text"
                  name="username"
                  placeholder="Nome Completo"
                  value={username}
                  onChange={onChangeUsername}
                  validations={[required]}
                />
                <Input
                  type="date"
                  name="birthdate"
                  placeholder="Data de Nascimento"
                  value={birthdate}
                  onChange={onChangeBirthdate}
                  validations={[required]}
                />
                <Input
                  type="tel"
                  name="telefone"
                  pattern="\d{2}\d{5}\d{4}"
                  placeholder="(48)99999-9999"
                  value={phone}
                  onChange={onChangePhone}
                  validations={[required]}
                />
                <h5>Cadastre sua conta para recebimento </h5>
                  <h6>Necessário ser compativel com o nome da conta cadastrada</h6>
                  
                <Input
                  type="text"
                  name="pixKey"
                  placeholder="Chave Pix"
                  value={pixKey}
                  onChange={onChangePixKey}
                />
                <Select name="bank" value={bank} onChange={onChangeBank}>
                  <option value="">Selecione um banco</option>
                  {bancos.map((banco) => (
                    <option key={banco.code} value={banco.code}>
                      {banco.name}
                    </option>
                  ))}
                </Select>
                <Input
                  type="text"
                  name="agency"
                  placeholder="Agência"
                  value={agency}
                  onChange={onChangeAgency}
                />
                <Input
                  type="text"
                  name="accountNumber"
                  placeholder="Conta + Dígito"
                  value={accountNumber}
                  onChange={onChangeAccountNumber}
                />
              </div>
              <div className="right-side">
                <Input
                  type="text"
                  name="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={onChangeEmail}
                  validations={[required, validEmail]}
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Senha"
                  value={password}
                  onChange={onChangePassword}
                  validations={[required]}
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirme a Senha"
                  value={confirmPassword} // Usa o estado de confirmação de senha
                  onChange={onChangeConfirmPassword} // Atualiza o estado de confirmação de senha
                  validations={[required]}
                />
                <button className="btn-submit">Cadastrar</button>
                <div className="register-link">
                  <a href="/login">Já possuo conta</a>
                </div>
              </div>
            </div>
          )}
          {message && (
            <div className="form-group">
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            </div>
          )}
          <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
      </div>
    </div>
    </div>

  );
};

export default Register;
