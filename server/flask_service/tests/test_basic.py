import pytest
import threading
import http.server
import requests
import sys
from pathlib import Path
sys.path.append(str(Path('.').absolute().parent))
from app import return_srt

@pytest.fixture(scope="session")
def fake_vstamps():
    """
    The fake_vstamps fixture responds with fake data.
    """

    class HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(
                    b"Hello, World! VStamps Flask Backend Service up and running!")
            elif self.path == "/recieveAudioFile":
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(b"Audio File Received")

    with http.server.HTTPServer(server_address=("", 0), RequestHandlerClass=HTTPRequestHandler) as svr:
        threading.Thread(target=svr.serve_forever).start()
        yield svr
    svr.shutdown()


def test_endpoints(fake_vstamps):
    """
    Test the endpoints.
    """
    netloc = fake_vstamps.server_address[0] + \
        ":" + str(fake_vstamps.server_address[1])
    url = "http://" + netloc + "/"

    response = requests.get(url)

    # test index page
    assert response.status_code == 200
    assert response.text == "Hello, World! VStamps Flask Backend Service up and running!"

    # test /recieveAudioFile endpoint
    response = requests.get(url + "recieveAudioFile")
    assert response.status_code == 200
    assert response.text == "Audio File Received"


def test_return_srt():
    """
    Test the return_srt function.
    """
    assert return_srt("./data/test.srt") == "test"
