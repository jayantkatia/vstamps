import { useEffect, useState } from "react";
import "../styles/Result.css"
import HashLoader from "react-spinners/HashLoader";


const loadTime = 3
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

const Tile = (props) => {
    return (
        <div className="tile" key={props.key}>
            <span className="time">{props.time}</span>  <span>{props.words? props.words.join("   ") : ''}</span>
        </div>
    )
}

const Transcriptions = (props) => {
    const para = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    let computedTileData = []
  
    const splittedPara = para.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ").split(" ")
    let prevTime = 0
    for(let i=0; i<splittedPara.length/5; i++){
        const words = splittedPara.slice(i*5, i*5 + 5)
        
        const time = `${prevTime<10? `0${prevTime}` : prevTime } - ${prevTime+5<10? `0${prevTime+5}` : prevTime+5 }`
        prevTime = prevTime + 5
        if(words.length!=0)
        computedTileData.push({
            time,
            words,
            i
        })
    }
 

    return (
        <div id="transcriptions-container">
        {
            computedTileData.map(tile => {
                if (!props.keyword || (tile && tile.words && tile.words.includes(props.keyword)))
                    return <Tile key={tile.key} time={tile.time} words={tile.words} />
            })   
        }
        </div>
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