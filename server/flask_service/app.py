from __future__ import unicode_literals
from flask import Flask
from flask_cors import CORS, cross_origin
from flask import request
import json
import logging as log
import os
import pandas as pd
from pytube import YouTube
from vosk import Model, KaldiRecognizer
import wave

app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

# save logs in a file
log.basicConfig(filename='app.log', filemode='w',
                format='%(name)s - %(levelname)s - %(message)s', level=log.DEBUG)


class Word:
    """
    A class representing a word from the JSON format for vosk speech recognition API
    This is being used to create a formatted output with the recognized words and their timestamps
    Using this we further create a dataframe with the recognized words and their timestamps
    """

    def __init__(self, dict):
        """
        Parameters:
          dict (dict) dictionary from JSON, containing:
            conf (float): degree of confidence, from 0 to 1
            end (float): end time of the pronouncing the word, in seconds
            start (float): start time of the pronouncing the word, in seconds
            word (str): recognized word
        """

        self.conf = dict["conf"]
        self.end = dict["end"]
        self.start = dict["start"]
        self.word = dict["word"]

    def to_string(self):
        ''' Returns a string describing this instance '''
        return "{:20} from {:.2f} sec to {:.2f} sec, confidence is {:.2f}%".format(
            self.word, self.start, self.end, self.conf*100)


@app.route('/')
@cross_origin()
def hello_world():
    return 'Hello, World! VStamps Flask Backend Service up and running!'


@app.route('/recieveAudioFile', methods=['POST'])
def recieve_audio_file():
    """
    Receives the audio file from the frontend and saves it as temp.wav
    OR
    Receives the video file from the frontend and saves it as video.mp4
    OR
    Receives the URL of the video from the frontend and saves it as video.mp4

    Further, calls the function to transcribe the audio file and returns the data
    """
    # Cleanup
    try:
        if (os.path.exists('temp.wav')):
            os.remove('temp.wav')
    except Exception as e:
        log.exception(
            f"/recieveAudioFile | Error deleting temp.wav, error: {e}")
        raise e

    try:
        if (os.path.exists('video.mp4')):
            os.remove('video.mp4')
    except Exception as e:
        log.exception(
            f"/recieveAudioFile | Error deleting video.mp4, error: {e}")
        raise e

    try:
        if (os.path.exists('out.srt')):
            os.remove('out.srt')
    except Exception as e:
        log.exception(
            f"/recieveAudioFile | Error deleting out.srt, error: {e}")
        raise e

    try:
        if not os.path.exists('./cache'):
            os.mkdir('./cache')
    except Exception as e:
        log.exception(
            f"/recieveAudioFile | Error creating cache directory, error: {e}")
        raise e

    log.info("/recieveAudioFile | Cleanup Completed")

    # Get the file
    if request.method == 'POST':
        if request.form.get("inputType") == "url":
            url = request.form.get("inputData")
            if url == "":
                log.error("No URL provided")
                return "No URL provided"

            # get video id from youtube url
            video_id = url.split("v=")[1]

            # check if .srt file exists in cache directory
            if os.path.exists(f'./cache/{video_id}.srt') and request.form.get("wordWise") != "true":
                log.info("SRT file found in cache, returning.")
                return return_srt(f'./cache/{video_id}.srt')

            if os.path.exists(f'./cache/{video_id}_wordWise.json') and request.form.get("wordWise") == "true":
                log.info("JSON file found in cache, returning.")
                with open(f'./cache/{video_id}_wordWise.json') as f:
                    return json.load(f)

            # download youtube video in mp4
            yt = YouTube(url)
            try:
                yt.streams.filter(progressive=True, file_extension='mp4').order_by(
                    'resolution')[-1].download()
            except Exception as e:
                log.exception(
                    f"/recieveAudioFile | Error downloading video from youtube, error: {e}")
                raise e
            try:
                os.rename(yt.streams.first().default_filename.split(
                    '.')[0]+'.mp4', 'video.mp4')
            except Exception as e:
                log.exception(
                    f"/recieveAudioFile | Error renaming video file, error: {e}")
                raise e
            log.info("/recieveAudioFile | Video Downloaded")

            if request.form.get("wordWise") == "true":
                # convert video to audio if wordWise is true
                try:
                    os.system(
                        'ffmpeg -i video.mp4 -acodec pcm_s16le -ac 1 -ar 16000 temp.wav')
                except Exception as e:
                    log.exception(
                        f"/recieveAudioFile | Error converting video to audio, error: {e}")
                    raise e
                log.info("/recieveAudioFile | Video converted to audio")
                return get_data_word_wise(video_id)

            return get_data_line_wise("video.mp4", video_id)

        elif request.form.get("inputType") == "file":
            log.info('***** Recieving Audio File *****')
            save_path = "./temp.wav"
            file = request.files['inputData']
            file.save(save_path)
            log.info('***** Audio File Saved *****')

            if request.form.get("wordWise") == "true":
                return get_data_word_wise()

            return get_data_line_wise("temp.wav")

        else:
            log.error("/recieveAudioFile | Wrong input type provided")
            return "Wrong input type provided"

    else:
        log.error("/recieveAudioFile | Invalid request method")
        return "Invalid request method"


def get_data_line_wise(filetype: str, video_id: str = None):
    """
    Returns a stringified srt file containing the data for the line-wise transcription

    Parameters:
        filetype (str): type of file, either "video.mp4" or "temp.wav"
    """
    log.info("****** Transcribing Line Wise *****")
    if filetype == "video.mp4" or filetype == "temp.wav":
        try:
            os.system(f'vosk-transcriber -i {filetype} -t srt -o out.srt')
        except Exception as e:
            log.exception(
                f"get_data_line_wise | Error executing vosk-transcriber, error: {e}")
            raise e
        log.info("get_data_line_wise | transcribing executed successfully")

        # move out.srt to ./cache/video_id.srt if filetype == "video.mp4"
        if filetype == "video.mp4":
            os.rename('out.srt', f'./cache/{video_id}.srt')
            log.info(
                f"get_data_line_wise | out.srt moved to cache as {video_id}.srt")
            return return_srt(f'./cache/{video_id}.srt')

        # return srt file OR any other suitable format
        return return_srt("out.srt")

    else:
        log.error("get_data_line_wise | Invalid filetype provided")
        return "Invalid filetype provided"


def get_data_word_wise(video_id: str = None):
    """
    Returns a DataFrame as JSON object containing the data for the word-wise transcription
    """
    log.info("***** Transciribing wordWise | Processing Audio File *****")
    model_path = "./vosk-model-en-us-0.21"
    audio_filename = "./temp.wav"

    try:
        model = Model(model_path)
    except Exception as e:
        log.exception(
            f"get_data_word_wise | Error loading model, error: {e}")
        raise e

    try:
        wf = wave.open(audio_filename, "rb")
        rec = KaldiRecognizer(model, wf.getframerate())
        rec.SetWords(True)
    except Exception as e:
        log.exception(
            f"get_data_word_wise | Error loading audio file, error: {e}")
        raise e

    # get the list of JSON dictionaries
    results = []
    # recognize speech using vosk model

    try:
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                part_result = json.loads(rec.Result())
                results.append(part_result)
        part_result = json.loads(rec.FinalResult())
        results.append(part_result)
    except Exception as e:
        log.exception(
            f"get_data_word_wise | Error recognizing speech and wave forms, error: {e}")
        raise e

    # convert list of JSON dictionaries to list of 'Word' objects
    list_of_Words = []
    try:
        for sentence in results:
            if len(sentence) == 1:
                # sometimes there are bugs in recognition
                # and it returns an empty dictionary
                # {'text': ''}
                continue
            for obj in sentence['result']:
                w = Word(obj)  # create custom Word object
                list_of_Words.append(w)  # and add it to list

        wf.close()  # close audiofile
    except Exception as e:
        log.exception(
            f"get_data_word_wise | Error creating Word objects, error: {e}")
        raise e

    # extract timestamps from list of 'Word' objects
    # then convert list of 'Word' objects to DataFrame
    list_of_list_of_Words = []
    try:
        for j in range(len(list_of_Words)):
            raw_words_list = list_of_Words[j].to_string().split(' ')
            while "" in raw_words_list:
                raw_words_list.remove("")
            list_of_list_of_Words.append(raw_words_list)

        i = 1  # id of transcript currently set to 1 and can be dynamically changed
        df = pd.DataFrame(list_of_list_of_Words)
        df = df.drop([1, 3, 4, 6, 7, 8], axis=1)
        transcript_id = [i for _ in range(len(list_of_list_of_Words))]
        df.insert(0, 'transcript_id', transcript_id)
        df.columns = ['transcript_id', 'word',
                      'start_timestamp(sec)', 'end_timestamp(sec)', 'confidence']
    except Exception as e:
        log.exception(
            f"get_data_word_wise | Error extracting timestamps and in DataFrame Generation, error: {e}")
        raise e

    log.info('***** Timestamping for Transcript', i,
             'done! Returning DataFrame as JSON object *****')

    # save dataframe to cache in json format if it was a youtube video.
    if video_id:
        df.to_json(f'./cache/{video_id}_wordWise.json')
        log.info(
            f"get_data_word_wise | DataFrame saved to cache as {video_id}_wordWise.json")

    return df.to_json(orient="split")


def return_srt(filename: str):
    """
    Returns the srt file as a JSON object
    """
    log.info("***** Returning srt file as JSON object *****")
    log.info(f"Return SRT from {filename}")
    try:
        with open(f'{filename}', 'r') as f:
            return f.read()
    except Exception as e:
        log.exception(
            f"return_srt | Error reading srt file, error: {e}")
        raise e


if __name__ == "__main__":
    app.run(host='0.0.0.0')
