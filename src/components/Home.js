import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import UserService from "../services/user.service";
import Button from '@mui/material/Button';


const Home = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    UserService.getPublicContent().then(
      (response) => {
        setContent(response.data);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();

        setContent(_content);
      }
    );
  }, []);

  return (
    <div className="aaaa">
      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
        color='#404140'
      >      
      <TextField id="standard-basic" label="Digite o valor da venda" variant="standard" />
      <Button variant="outlined">Outlined</Button>

      </Box>
    </div>
  );
};

export default Home;
