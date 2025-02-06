from flask import Flask, request, jsonify, send_from_directory, send_file, jsonify, render_template

from flask_cors import CORS
from pyvis.network import Network
from neo4j import GraphDatabase
import uuid
from gtts import gTTS
import os

# Flask app setup
app = Flask(__name__, static_folder="/Backend/audio")
CORS(app)

# Neo4j database setup
NEO4J_URI = "bolt://localhost:7687"  # Replace with your Neo4j database URI
NEO4J_USER = "neo4j"                 # Replace with your Neo4j username
NEO4J_PASSWORD = "floorgangster"    # Replace with your Neo4j password

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

# Path to save the audio files
AUDIO_PATH = "Backend/audio/"  # Modify path as needed

# Function to convert text to speech and save the audio file
def text_to_audio(content_text):
    try:
        # Ensure the audio directory exists
        if not os.path.exists(AUDIO_PATH):
            os.makedirs(AUDIO_PATH)  # Create the directory if it doesn't exist
        
        # Generate audio file name
        audio_file_name = f"{str(uuid.uuid4())}.mp3"
        audio_file_path = os.path.join(AUDIO_PATH, audio_file_name)

        # Create TTS object and save to file
        tts = gTTS(text=content_text, lang='en')
        tts.save(audio_file_path)
        return audio_file_name
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None

# Function to create a session, content, and audio file
@app.route('/create-session', methods=['POST'])
def create_session():
    data = request.json
    session_id = str(uuid.uuid4())  # Generate a unique session ID
    content_text = data.get("content")
    
    if not content_text:
        return jsonify({"error": "Missing content text"}), 400
    
    # Convert text to audio
    audio_file_name = text_to_audio(content_text)
    if not audio_file_name:
        return jsonify({"error": "Error generating audio"}), 500

    try:
        with driver.session() as session:
            result = session.write_transaction(
                lambda tx: tx.run(
                    """
                    CREATE (s:Session {sessionId: $session_id, createdAt: timestamp()})
                    CREATE (c:Content {text: $content})
                    CREATE (a:AudioFile {fileName: $file_name, duration: $duration, generatedAt: timestamp()})
                    CREATE (s)-[:HAS_CONTENT]->(c)
                    CREATE (s)-[:HAS_AUDIO]->(a)
                    RETURN s, c, a
                    """,
                    session_id=session_id,
                    content=content_text,
                    file_name=audio_file_name,
                    duration=120  # Replace with actual audio duration if needed
                ).data()
            )
        return jsonify({
            "success": True,
            "sessionId": session_id,
            "audioFile": audio_file_name,
            "message": "Session created successfully."
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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



# Function to retrieve session details
@app.route('/get-session/<session_id>', methods=['GET'])
def get_session(session_id):
    try:
        with driver.session() as session:
            result = session.read_transaction(
                lambda tx: tx.run(
                    """
                    MATCH (s:Session {sessionId: $session_id})-[:HAS_CONTENT]->(c:Content),
                          (s)-[:HAS_AUDIO]->(a:AudioFile)
                    RETURN s.sessionId AS sessionId, c.text AS content, a.fileName AS audioFile, a.duration AS duration
                    """,
                    session_id=session_id
                ).data()
            )
        if result:
            return jsonify({"success": True, "data": result}), 200
        else:
            return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/list-sessions', methods=['GET'])
def list_sessions():
    try:
        with driver.session() as session:
            result = session.read_transaction(
                lambda tx: tx.run(
                    """
                    MATCH (s:Session)-[:HAS_CONTENT]->(c:Content), 
                          (s)-[:HAS_AUDIO]->(a:AudioFile)
                    RETURN s.sessionId AS sessionId, c.text AS content, a.fileName AS audioFile, a.duration AS duration
                    ORDER BY s.createdAt DESC
                    """
                ).data()
            )
        
        # Return all sessions as JSON
        if result:
            return jsonify({"success": True, "sessions": result}), 200
        else:
            return jsonify({"success": False, "message": "No sessions found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/visualize-graph', methods=['GET'])
def visualize_graph():
    try:
        net = Network(height="750px", width="100%", directed=True)

        # Set global graph styles
        net.set_options("""
        var options = {
          "nodes": {
            "color": {
              "highlight": {
                "background": "orange",
                "border": "black"
              },
              "hover": {
                "background": "lightblue",
                "border": "black"
              }
            },
            "font": {
              "size": 14,
              "face": "arial"
            },
            "shape": "dot",
            "scaling": {
              "min": 20,
              "max": 50
            }
          },
          "edges": {
            "color": {
              "inherit": true
            },
            "smooth": {
              "type": "cubicBezier"
            }
          },
          "physics": {
            "stabilization": true,
            "barnesHut": {
              "gravitationalConstant": -20000,
              "springLength": 100,
              "springConstant": 0.05
            }
          }
        }
        """)

        with driver.session() as session:
            query = """
            MATCH (n)-[r]->(m)
            RETURN n, r, m LIMIT 20
            """
            results = session.run(query)

            if not results.peek():
                return jsonify({"error": "No data found in the database for visualization"}), 404

            for record in results:
                source = record["n"]
                target = record["m"]
                relationship = record["r"]

                # Check if content is None and skip those records
                if not target['text']:  # If content text is None or empty
                    continue

                # Add nodes with colors based on labels
                net.add_node(
                    source.element_id,
                    label=f"Session: {source['sessionId']}",
                    title=str(source),
                    color="lightgreen",
                    size=40,  # Increased size of session nodes
                )
                net.add_node(
                    target.element_id,
                    label=f"Content: {target['text']}",
                    title=str(target),
                    color="lightcoral",
                    size=30,  # Increased size of content nodes
                )

                # Add edge with relationship type
                net.add_edge(
                    source.element_id,
                    target.element_id,
                    label=relationship.type,
                    title=str(relationship),
                    color="blue",
                )

        # Save the graph as an HTML file
        graph_html_path = os.path.abspath("templates/graph.html")
        net.save_graph(graph_html_path)
        print(f"Graph saved at: {graph_html_path}")

        # Serve the HTML graph file
        return send_file(graph_html_path, mimetype="text/html")

    except Exception as e:
        print(f"Error during graph visualization: {e}")
        return jsonify({"error": f"Error visualizing graph: {e}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Running"}), 200


# Close the Neo4j driver on app shutdown
@app.teardown_appcontext
def close_driver(exception=None):
    if driver:
        driver.close()


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=8070)  # Run Flask on port 8080

