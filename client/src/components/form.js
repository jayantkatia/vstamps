import '../styles/Form.css'

const Form = () => {
    return (
        <div className="form-container">
            <form>
                <div className="drag-container">
                    <p>Drag or Click on the button to upload video/audio files</p>
                    <input type="file" accept="video/*,audio/*" id="user-video" name="file" required/>
                    <label className="button" htmlFor="user-video">Select video/audio</label>
                </div>
                <input type="text" id="user-keyword" name="keyword" placeholder="Enter Keyword" required/>
                <input type="submit" className="button"/>
            </form>
        </div>
    );
}

export default Form