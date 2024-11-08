// ResetPassword.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css'; // Importa o arquivo CSS

const ResetPassword = () => {
  const { token } = useParams(); // Pega o token da URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('As senhas não correspondem.');
      return;
    }

    try {
      const response = await axios.post('https://querotaxa.onrender.com/api/auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(response.data.message); // Mensagem de sucesso
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao redefinir a senha.');
    }
  };

  return (
    <div className="container">
      <div className="form-container-password">
        <h2>Redefinir Senha</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Redefinir Senha</button>
        </form>
        {message && (
          <div>
          <p>{message}</p>
          <div className="register-link">
            <a href="/login">Voltar ao login</a><br></br>

          </div>
      </div>)}
      </div>
    </div>
  );
};

export default ResetPassword;
