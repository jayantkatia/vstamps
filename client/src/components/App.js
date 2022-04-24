import '../styles/App.css';
import logo from '../assets/github-logo.svg'
import Form from './Form.js'

function App() {
  return (
    <div className="App">
      <header className='App-header'>
        <div>
          <h1>VStamps</h1> 
          <p className='large'>Search video for timestamps</p>
          <a href="https://github.com/jayantkatia/vstamps" className='github-logo'><img src={logo} alt="GitHub logo"></img></a>
        </div>
      </header>
      <Form/>
      <footer>&copy; VStamps, 2022</footer>
    </div>
  );
}

export default App;