import { useEffect, useState } from "react";
import "../styles/Result.css"
import HashLoader from "react-spinners/HashLoader";
import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg";
import axios from 'axios'
const ffmpeg = createFFmpeg({log: true});


const OperationStatus = {
    initialize: "Initializing ...",
    fetching: "Fetching Audio...",
    extract: "Extracting Audio...",
    convert: "Converting Audio...",
    transcribe: "Transcribing Audio...",
    done: "Done!",
    error: "Error!"
}

const Loading = (props) => {
    return (
        <div id="load-container">
            <HashLoader color={"#4BB543"} loading={true} /> <p>{props.loadingStatus}</p>
            <br />
        </div>
    )
}

const Tile = (props) => {
    return (
        <div className="tile" key={props.uniqueKey}>
            <span className="time">{props.time}</span>  <span>{props.words}</span>
        </div>
    )
}

const Transcriptions = (props) => {
    return (
        <div id="transcriptions-container">
            {  
               props.result.data.map(
                    tile =>  {
                        if (!props.keyword || (tile[1].includes(props.keyword)))
                            return <Tile uniqueKey={tile[2]} time={`${tile[2]}-${tile[3]}`} words={tile[1]} />
                        return <></>
                    }
               )
            }
        </div>
    )
}

const Result = (props) => {
    const [keyword, setKeyword] = useState('')
    const [status, setStatus] = useState(OperationStatus.initialize)
    const [error, setError] = useState()
    const [result, setResult] = useState()

    const handleOperations = async () => {
        let thisFile
        if(props.inputType==="file"){
            // convert to wav
            setStatus(OperationStatus.extract)

            const inputFileName = "inp." + props.inputData.name.split(".").at(-1)
            console.log(inputFileName)
            console.log(window.location.pathname)
            await ffmpeg.load();
            ffmpeg.FS("writeFile", inputFileName, await fetchFile(props.inputData));
            await ffmpeg.run("-i", inputFileName, "-acodec", "pcm_s16le", "-ar", "44100", "-c", "copy", "out.wav");
            const buf = ffmpeg.FS("readFile", "out.wav");
            thisFile = new File([buf], "out.wav");
            console.log(thisFile)

        } else thisFile = props.inputData 



        // post request to server to transcribe
        setStatus(OperationStatus.transcribe)
        const url = 'http://192.168.47.79:5000/recieveAudioFile';

        const formData = new FormData();
        formData.append('inputData', thisFile);
        formData.append('inputType', props.inputType);
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        };
        axios.post(url, formData, config).then((response) => {
            console.log(response.data)
            setResult(response.data)
            setStatus(OperationStatus.done)
        }).catch(error => {
            console.log(error)
            setError(error)
            setStatus(OperationStatus.error)
        });
    }
    useEffect(() => {
        // Back button functionality
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', props.onBackButtonEvent);

        // call future computations
        handleOperations()
        
        return () => {
            window.removeEventListener('popstate', props.onBackButtonEvent);
        };
    }, []);

    return (
        <div id="result-page">
            <div id="search-bar">
                <input type="text" name="keyword" placeholder="Enter Keyword" autoComplete="off" onChange={e => setKeyword(e.target.value)} value={keyword} />
            </div>
            <div id="result-container">
                {
                    status === OperationStatus.done
                        ? <Transcriptions result={result} keyword={keyword} />
                        : (status === OperationStatus.error
                            ? <p>{error.message}</p>
                            : <Loading loadingStatus={status} />
                        )
                }
            </div>
        </div>
    )
}

export default Result;