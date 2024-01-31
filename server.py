from flask import Flask, jsonify, send_from_directory, render_template
import os
import json

app = Flask(__name__)

# Serve index.html from the 'templates' folder
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files from the 'static' folder
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

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

if __name__ == '__main__':
    app.run(port=5000)
