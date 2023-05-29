import React from 'react';
import logo from './logo.svg';
import './App.css';
import RegexDownloadData from './Components/RegexDownloadData/RegexDownloadData';
import Header from './Components/Header/Header';

function App() {
  return (
    <main>
      <Header />
      <div>
        <RegexDownloadData />
      </div>
    </main>

  );
}

export default App;
