from __future__ import unicode_literals
from flask import Flask
from flask_cors import CORS, cross_origin
from flask import request
import json
import logging as log
import os
import pandas as pd
from pytube import YouTube
from vosk import Model, KaldiRecognizer, SetLogLevel
import wave

app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

# save logs in a file
log.basicConfig(filename='app.log', filemode='w',
                format='%(name)s - %(levelname)s - %(message)s', level=log.DEBUG)


class Word:
    ''' A class representing a word from the JSON format for vosk speech recognition API '''

    def __init__(self, dict):
        '''
        Parameters:
          dict (dict) dictionary from JSON, containing:
            conf (float): degree of confidence, from 0 to 1
            end (float): end time of the pronouncing the word, in seconds
            start (float): start time of the pronouncing the word, in seconds
            word (str): recognized word
        '''

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
def recieveAudioFile():

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

    log.info("/recieveAudioFile | Cleanup Completed")

    # Get the file
    if request.method == 'POST':
        if request.form.get("inputType") == "url":
            url = request.form.get("inputData")
            if url == "":
                log.error("No URL provided")
                return "No URL provided"

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
            return getDataUpdated("video.mp4")

        elif request.form.get("inputType") == "file":
            log.info('***** Recieving Audio File *****')
            save_path = "./temp.wav"
            file = request.files['inputData']
            file.save(save_path)
            log.info('***** Audio File Saved *****')
            if request.form.get("wordWise") == "true":
                return getDataWordWise()

            return getDataUpdated("temp.wav")

        else:
            log.error("Wrong input type provided")
            return "Wrong input type provided"

    else:
        log.error("Invalid request method")
        return "Invalid request method"


def getDataUpdated(filetype: str):
    if filetype == "video.mp4" or filetype == "temp.wav":
        try:
            os.system(f'vosk-transcriber -i {filetype} -t srt -o out.srt')
        except Exception as e:
            log.exception(
                f"getDataUpdated | Error executing vosk-transcriber, error: {e}")
            raise e
        log.info("getDataUpdated | transcribing executed successfully")

        # return srt file OR any other suitable format
        try:
            with open('out.srt', 'r') as f:
                return f.read()
        except Exception as e:
            log.exception(
                f"getDataUpdated | Error reading srt file, error: {e}")
            raise e

    else:
        log.error("getDataUpdated | Invalid filetype provided")
        return "Invalid filetype provided"


def getDataWordWise():
    print("***** Processing Audio File *****")
    model_path = "./vosk-model-en-us-0.21"
    audio_filename = "./temp.wav"

    model = Model(model_path)
    wf = wave.open(audio_filename, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    # get the list of JSON dictionaries
    results = []
    # recognize speech using vosk model
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            part_result = json.loads(rec.Result())
            results.append(part_result)
    part_result = json.loads(rec.FinalResult())
    results.append(part_result)

    # convert list of JSON dictionaries to list of 'Word' objects
    list_of_Words = []
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

    master_list = []
    for j in range(len(list_of_Words)):
        l = list_of_Words[j].to_string().split(' ')
        while "" in l:
            l.remove("")
        master_list.append(l)

    i = 1
    df = pd.DataFrame(master_list)
    df = df.drop([1, 3, 4, 6, 7, 8], axis=1)
    transcript_id = [i for _ in range(len(master_list))]
    df.insert(0, 'transcript_id', transcript_id)
    df.columns = ['transcript_id', 'word',
                  'start_timestamp(sec)', 'end_timestamp(sec)', 'confidence']
    print('***** Timestamping for Transcript', i, 'done! *****')
    return df.to_json(orient="split")
