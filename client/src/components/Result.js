import { useEffect, useState } from "react";
import "../styles/Result.css";
import HashLoader from "react-spinners/HashLoader";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import axios from "axios";
import srtParser2 from "srt-parser-2";

const ffmpeg = createFFmpeg({ log: true });
const srtParser = new srtParser2();

const OperationStatus = {
  initialize: "Initializing ...",
  fetching: "Fetching Audio...",
  extract: "Extracting Audio...",
  convert: "Converting Audio...",
  transcribe: "Transcribing Audio...",
  done: "Done!",
  error: "Error!",
};

const Loading = (props) => {
  return (
    <div id="load-container">
      <HashLoader color={"#4BB543"} loading={true} /> <p>{props.loadingStatus}</p>
      <br />
    </div>
  );
};

const Tile = (props) => {
  return (
    <div className="tile" key={props.uniqueKey}>
      {props.isIFrame ? (
        <a href={`https://youtu.be/${props.videoId}?t=${Math.floor(props.startSeconds)}`} className="time">
          {props.time}
        </a>
      ) : (
        <span className="time">{props.time}</span>
      )}{" "}
      <span>{props.words}</span>
    </div>
  );
};

const Transcriptions = (props) => {
  return (
    <div id="transcriptions-container">
      {props.result.map((data) => {
        if (!props.keyword || data.text.includes(props.keyword))
          return (
            <Tile
              uniqueKey={data.startTime}
              time={`${data.startTime.split(',')[0]} - ${data.endTime.split(',')[0]}`}
              words={data.text}
              isIFrame={props.isIFrame}
              videoId={props.videoId}
              startSeconds={data.startSeconds}
            />
          );
        return <></>;
      })}
    </div>
  );
};

const Result = (props) => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(OperationStatus.initialize);
  const [error, setError] = useState();
  const [result, setResult] = useState();
  const [videoId, setVideoId] = useState("");

  const handleOperations = async () => {
    let thisFile;
    if (props.inputType === "file") {
      // convert to wav
      setStatus(OperationStatus.extract);

      const inputFileName = "inp." + props.inputData.name.split(".").at(-1);

      await ffmpeg.load();
      ffmpeg.FS("writeFile", inputFileName, await fetchFile(props.inputData));
      await ffmpeg.run(
        "-i",
        inputFileName,
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        "out.wav"
      );

      thisFile = new File([ffmpeg.FS("readFile", "out.wav")], "out.wav");
    } else thisFile = props.inputData;

    // post request to server to transcribe
    setStatus(OperationStatus.transcribe);

    const url = `${process.env.REACT_APP_SERVER_PROTOCOL}://${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SERVER_PORT}/recieveAudioFile`;

    const formData = new FormData();
    formData.append("inputData", thisFile);
    formData.append("inputType", props.inputType);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    axios
      .post(url, formData, config)
      .then((response) => {
        setResult(srtParser.fromSrt(response.data));
        setStatus(OperationStatus.done);
      })
      .catch((error) => {
        setError(error);
        setStatus(OperationStatus.error);
      });
  };
  useEffect(() => {
    // // Back button functionality
    // window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", props.onBackButtonEvent);

    if (props.inputType === "url") {
      const vIds = props.inputData.match(
        /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/
      );
      if (vIds != null) {
        setVideoId(vIds[1]);
        handleOperations();
      } else {
        setError("Failed to get video id");
      }
    } else {
      handleOperations();
    }

    return () => {
      window.removeEventListener("popstate", props.onBackButtonEvent);
    };
  }, []);

  return (
    <div id="result-page">
      <div id="search-bar">
        <input
          type="text"
          name="keyword"
          placeholder="Enter Keyword"
          autoComplete="off"
          onChange={(e) => setKeyword(e.target.value)}
          value={keyword}
        />
      </div>
      <div id="result-container">
        {status === OperationStatus.done ? (
          <Transcriptions
            result={result}
            keyword={keyword}
            isIFrame={props.inputType === "url"}
            videoId={videoId}
          />
        ) : status === OperationStatus.error ? (
          <p>{error.message}</p>
        ) : (
          <Loading loadingStatus={status} />
        )}
      </div>
    </div>
  );
};

export default Result;
