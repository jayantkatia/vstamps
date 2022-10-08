import '../styles/App.css';
import logo from '../assets/github-logo.svg'
import Form from './Form.js'
import { useState } from 'react';
import Result from './Result';
import toast, { Toaster } from 'react-hot-toast';

const Header = () => (
  <header className='App-header'>
        <div>
          <h1>VStamps</h1>
          <p className='large'>Search video for timestamps</p>
          <a href="https://github.com/jayantkatia/vstamps" className='github-logo'><img src={logo} alt="GitHub logo"></img></a>
        </div>
  </header>
)

function App() {
  const [isInputTaken, setIsInputTaken] = useState(false)
  const [file, setFile] = useState()
  const [urlInput, setUrlInput] = useState()

  const onFileUploadHandle = event => setFile(event.target.files[0])
  const onUrlInputHandle = event => setUrlInput(event.target.value);
  const onSubmitHandle = event => {
    event.preventDefault()

    // handle if no input
    if (!(file || urlInput)) {
      toast.error('Please input a link or upload audio/video file')
      return
    }

    if (file && urlInput) {
      toast.error('Please input only 1 source')
      return
    }

    setIsInputTaken(true)
  }
  const onBackButtonEvent = event => {
    event.preventDefault()
    setFile()
    setUrlInput()
    setIsInputTaken()
  }

  return (
    <div className="App">
      {
        isInputTaken
          ? <Result
            inputType={urlInput ? 'url' : 'file'}
            inputData={urlInput ? urlInput : file}
            onBackButtonEvent={onBackButtonEvent}
          />
          : <>
            <Header/>
            <Form
              onFileUploadHandle={onFileUploadHandle}
              onSubmitHandle={onSubmitHandle}
              onUrlInputHandle={onUrlInputHandle}
              file={file?file.name:''}
            />
          </>
      }
      <><Toaster position="bottom-right" /></>
      <footer>&copy; VStamps, 2022</footer>
    </div>
  );
}

export default App;