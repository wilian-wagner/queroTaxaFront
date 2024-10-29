import React, { useState } from "react";
import "./CustomAlert.css";

function CustomAlert({ message, onClose }) {
  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

function Alert() {
  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <div>
      <button onClick={handleShowAlert}>Mostrar Alerta</button>
      {showAlert && (
        <CustomAlert message="Texto copiado para o clipboard!" onClose={handleCloseAlert} />
      )}
    </div>
  );
}

export default Alert;
