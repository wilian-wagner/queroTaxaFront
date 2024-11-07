import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import AuthService from "../services/auth.service";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import './Login.css'; // Importing CSS

const required = (value) => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        Campo obrigatório!
      </div>
    );
  }
};

const Login = () => {
  let navigate = useNavigate();

  const form = useRef();
  const checkBtn = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onChangeUsername = (e) => {
    setUsername(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    form.current.validateAll();

    if (checkBtn.current.context._errors.length === 0) {
      AuthService.login(username, password).then(
        () => {
          navigate("/profile");
          window.location.reload();
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          setLoading(false);
          setMessage(resMessage);
        }
      );
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
      </div>
      <div className="login-right">
        <div className="titulo">
          <h2><span className="entre-titulo">Entr</span>e</h2>
        <p>E comece a faturar!</p>
        </div>

        <Form onSubmit={handleLogin} ref={form}>
          <div className="input-group">
            <div>
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <Input
                type="text"
                name="username"
                placeholder="E-mail"
                value={username}
                onChange={onChangeUsername}
                validations={[required]}
              />
            </div>
          </div>
          <div className="input-group">
            <FontAwesomeIcon icon={faLock} className="input-icon" />

            <Input
              type="password"
              name="password"
              placeholder="Senha"
              value={password}
              onChange={onChangePassword}
              validations={[required]}
            />
          </div>
          {/* <div className="forgot-password">
            <a href="/forgot-password">Esqueci a senha</a>
          </div> */}
          <button className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Entrar"}
          </button>
          <div className="register-link">
            <a href="/register">Ainda não possui conta</a><br></br>
            <a href="/forgot-password">Esqueceu sua senha?</a>

          </div>
          <CheckButton style={{ display: "none" }} ref={checkBtn} />

        </Form>
        {message && (
          <div className="form-group">
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
