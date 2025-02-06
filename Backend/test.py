from flask import Flask, jsonify, send_file
import os

app = Flask(__name__)

# Make sure AUDIO_PATH is properly set
AUDIO_PATH = os.path.join('Backend', 'audio')  # Automatically uses correct path delimiter

@app.route('/download-audio/<audio_file>', methods=['GET'])
def download_audio(audio_file):
    # try:
        # Construct the full path to the audio file
    audio_file_path = os.path.join(AUDIO_PATH, audio_file)
    print(f"Looking for audio file at: {audio_file_path}")  # Debug: print the file path

        # Check if the file exists
    if not os.path.exists(audio_file_path):
        return jsonify({"error": "File not found"}), 404

        # Use send_file to send the file
    return send_file(audio_file_path, as_attachment=True)

    # except Exception as e:
    #     return jsonify({"error": f"Error retrieving audio file: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8071)
