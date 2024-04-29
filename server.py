from flask import Flask, jsonify, send_from_directory, render_template, make_response, request
import os
import json
import webbrowser


app = Flask(__name__)

# Serve index.html from the 'templates' folder
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files from the 'static' folder
@app.route('/static/<path:filename>')
def serve_static(filename):
    response = make_response(send_from_directory('static', filename))
    if filename.endswith('.mjs'):
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8; module'
    return response

# API endpoint to get the list of files
@app.route('/get_files')
def get_files():
    folder_path = './static/js/filters'
    files = os.listdir(folder_path)
    print(files)
    return jsonify(files)

@app.route('/get_config')
def get_config():
    path = "./config.json"
    with open(path, 'r') as file:
        data = json.load(file)
        return data


    


@app.route('/write_csv', methods=['POST'])
def write_csv():
    data = request.get_json()  # Assuming data is sent as JSON from JavaScript
    # Append data to CSV file
    with open('data.csv', 'a') as f:
        row = [str(item) for item in data]  # Convert integers to strings
        f.write(','.join(row) + '\n')
    return 'Data successfully appended to CSV file'

if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5000/")
    app.run(port=5000)
