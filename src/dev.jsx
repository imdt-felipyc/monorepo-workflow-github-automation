import React from "react";
import ReactDOM from "react-dom";
import './global.scss';
import EssrDictation from './lib/EssrDictation';

const container = document.getElementById('root');
if (!container) throw new Error("Root container missing in DOM");

ReactDOM.render(
  <React.StrictMode>
    <EssrDictation />
  </React.StrictMode>,
  container
);