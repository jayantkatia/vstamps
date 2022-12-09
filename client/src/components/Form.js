import '../styles/Form.css'
import { FileUploader } from "react-drag-drop-files";

const Divider = () => {
    return (
        <div className="hr-with-text">
            <hr /> OR <hr />
        </div>
    );
}

const Form = (props) => {

    return (
        <div className="form-container">
            <form onSubmit={props.onSubmitHandle} encType="multipart/form-data">
                <input type="text" id="url" name="url" placeholder="Enter YouTube link" autoComplete="off" onChange={props.onUrlInputHandle} />
                <Divider />
                
                <FileUploader handleChange={props.onFileUploadHandle} name="file" dropMessageStyle={{position:'absolute', left: '-100%', width: "198%", background: 'whitesmoke'}} types={['mp4','mp3','wav', 'mov', 'avi', 'wmv', 'qt', 'flv', 'swf', 'avchd', 'm4p', 'm4v', 'ogg', 'webm', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'mp4a', 'aac', 'oga', 'flac', 'pcm', 'aiff', 'wma']} hoverTitle=' '
                    children={
                        <div className="drag-container">
                            <p>Drag or Click on the button to upload video/audio files</p>
                            <span className="button">Select video/audio</span>
                            <p className='small-text'>{props.file.replace(/\\/g, "/").split('/').pop()}</p>
                        </div>
                    }
                />

                <div className="checkbox-container">
                    <input name="wordWise" id="wordWise" type="checkbox" value={true} onChange={props.onIsWordWiseHandle}/> 
                    <label htmlFor="wordWise"> Get word-wise timestamps</label>
                </div>
                <input type="submit" className="button" />
            </form>
        </div>
    );
}

export default Form