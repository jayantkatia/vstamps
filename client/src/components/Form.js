import { useState } from 'react';
import '../styles/Form.css'
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const Divider = () => {
    return (
        <div className="hr-with-text">
            <hr /> OR <hr />
        </div>
    );
}

const Form = () => {
    const navigate = useNavigate()
    const [values, setValues] = useState({
        url: '',
        fileUploadData: ''
    })

    const handleSubmit = (event) => {
        event.preventDefault()
        
        // handle if no input
        if (!(values.url || values.fileUploadData)) {
            toast.error('Please input a link or upload audio/video file')
            return
        }
        
        if (values.url && values.fileUploadData) {
            toast.error('Please input only 1 source')
            return
        }
        navigate('/vstamps/result')
    }

    return (
        <div className="form-container">
            <><Toaster position="bottom-right" /></>
            <form onSubmit={handleSubmit}>
                <input type="text" id="url" name="url" placeholder="Enter YouTube link" autoComplete="off" onChange={e => setValues({...values, url:e.target.value})} value={values.url} />
                <Divider />
                <div className="drag-container">
                    <p>Drag or Click on the button to upload video/audio files</p>
                    <input type="file" accept="video/*,audio/*" id="user-video" name="file" onChange={e => setValues({...values, fileUploadData:e.target.value})} value={values.fileUploadData} />
                    <label className="button" htmlFor="user-video">Select video/audio</label>
                    <p className='small-text'>{values.fileUploadData.replace(/\\/g, "/").split('/').pop()}</p>
                </div>
                <input type="submit" className="button" />
            </form>
        </div>
    );
}

export default Form