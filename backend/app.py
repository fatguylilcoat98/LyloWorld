from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2, numpy as np, base64, io, os, random
from PIL import Image

# Initialize Flask to serve the frontend folder
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

@app.route('/')
def index():
    # This route serves your index.html to the browser
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/process-image', methods=['POST'])
def process():
    try:
        data = request.get_json()
        img_data = data['image'].split(',')[1]
        img = Image.open(io.BytesIO(base64.b64decode(img_data))).convert('RGB')
        img_np = cv2.resize(np.array(img), (32, 32))
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        
        # 0=Floor, 1=Wall, 2=Hazard
        grid = [[1 if p > 150 else 0 for p in row] for row in gray]
        return jsonify({'semantic_grid': grid, 'processing_success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
