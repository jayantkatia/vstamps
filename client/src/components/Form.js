import '../styles/Form.css'

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
                <div className="drag-container">
                    <p>Drag or Click on the button to upload video/audio files</p>
                    <input type="file" accept="video/*,audio/*" id="user-video" name="file" onChange={props.onFileUploadHandle} />
                    <label className="button" htmlFor="user-video">Select video/audio</label>
                    <p className='small-text'>{props.file.replace(/\\/g, "/").split('/').pop()}</p>
                </div>
                <input type="submit" className="button" />
            </form>
        </div>
    );
}

export default Form