import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import Result from './components/Result';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/vstamps/' element={<App/>} />
        <Route path='/vstamps/result/' element={<Result/>} />
      </Routes>
    </Router>
  </React.StrictMode>
);