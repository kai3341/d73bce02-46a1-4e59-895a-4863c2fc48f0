import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';
// import './App.css';
// import { StyledEngineProvider } from '@mui/material/styles';

import { Projects, InputFlowData } from './pages/projects';


function App() {
  const [ data, setData ] = useState<InputFlowData|null>(null)

  useEffect(
    () => {
      fetch("./inputData.json").then(response => response.json().then(setData))
    },
    [],
  );

  return data === null ? null
  : (
    <Projects data={data} />
  );
}

export default App;
