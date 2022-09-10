from flask import Flask
from flask import request
import pandas as pd
import wave
import json
from vosk import Model, KaldiRecognizer, SetLogLevel
app = Flask(__name__)


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
def hello_world():
    return 'Hello, World!'


@app.route('/recieveAudioFile', methods=['POST'])
def recieveAudioFile():
    if request.method == 'POST':
        print('***** Recieving Audio File *****')
        save_path = "./temp.wav"
        file = request.files['audiofile']
        file.save(save_path)
        print('***** Audio File Saved *****')
    return getData()


def getData():
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
