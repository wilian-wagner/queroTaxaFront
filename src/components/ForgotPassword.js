// ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css'; // Importa o arquivo CSS

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://querotaxa.onrender.com/api/auth/forgot-password', { email });
      setMessage(response.data.message); // Mensagem de sucesso
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao enviar o e-mail.');
    }
  };

  return (
    <div className="container">
      <div className="form-container-password">
        <h2>Esqueci minha senha</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar link de redefinição</button>
        </form>
        {message && <p>{message}</p>}
        <div className="register-link">
          <a href="/login">Voltar ao login</a><br></br>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
