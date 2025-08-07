import React from "react";
import './global.scss';
import EssrDictation from './lib/EssrDictation';

if (typeof window !== 'undefined') {
  import('react-dom').then(ReactDOM => {
    window.React = React;
    window.ReactDOM = ReactDOM;
    window.EssrDictation = EssrDictation;
  });
}

export default EssrDictation;