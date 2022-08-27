import { useEffect, useState } from "react";
import "../styles/Result.css"
import HashLoader from "react-spinners/HashLoader";


const loadTime = 9
const Loading = (props) => {
    const loadText = ["Extracting Audio...", "Transcribing Audio...", "TimeStamping Audio..."]
    const [value, setValue] = useState(0)

    useEffect(() => {
        setTimeout(() => {
            setValue(value < loadText.length ? value + 1 : value)
        }, loadTime * 1000 / loadText.length)
    }, [value])

    return (
        <div id="load-container">
            <HashLoader color={"#4BB543"} loading={props.isLoading} /> <p>{loadText[value]}</p>
            <br/>
        </div>
    )
}

const Transcriptions = () => {
    return (
        <></>
    )
}


const Result = () => {
    const [keyword, setKeyword] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), loadTime * 1000);
    }, [])

    return (
        <div id="result-page">
            <div id="search-bar">
                <input type="text" name="keyword" placeholder="Enter Keyword" autoComplete="off" onChange={e => setKeyword(e.target.value)} value={keyword} />
            </div>
            <div id="result-container">
                {isLoading ? <Loading isLoading={isLoading} /> : <Transcriptions keyword={keyword} />}
            </div>
        </div>
    )
}

export default Result;