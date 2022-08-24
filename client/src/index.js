import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/'  element={<App/>} />
        <Route path='/result' element={<p>result</p>} />
      </Routes>
    </Router>
  </React.StrictMode>
);