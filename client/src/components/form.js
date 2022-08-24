import '../styles/Form.css'

const Divider = () => {
    return (
        <div className="hr-with-text">
            <hr />
            OR
            <hr />
        </div>
    );
}

const Form = () => {
    return (
        <div className="form-container">
            <form>
                <input type="text" id="url" name="url" placeholder="Enter YouTube link" autocomplete="off"  required />
                <Divider />
                <div className="drag-container">
                    <p>Drag or Click on the button to upload video/audio files</p>
                    <input type="file" accept="video/*,audio/*" id="user-video" name="file" required />
                    <label className="button" htmlFor="user-video">Select video/audio</label>
                </div>
                <input type="submit" className="button" />
            </form>
        </div>
    );
}

export default Form