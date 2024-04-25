from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
from flask_pymongo import PyMongo
from config import ApplicationConfig
from pymongo import MongoClient 

app = Flask(__name__)
app.config.from_object(ApplicationConfig)  # Generate a random secret key
bcrypt = Bcrypt(app)
CORS(app, resources={
    "/login": {"origins": "http://localhost:3000"},
    "/signup": {"origins": "http://localhost:3000"},
    "/draw": {"origins": "http://localhost:3000"}
})
mongo = PyMongo(app)

server_session = Session(app)

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['maps']
users_collection = db['users']
drawings_collection = db['drawings']  # Collection to store drawing coordinates

@app.route("/@me")
def get_current_user():
    user_id = session.get("_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = users_collection.find_one({"_id": user_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": str(user["_id"]),  # Convert ObjectId to string
        "email": user["email"]
    }) 

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Authenticate user
    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    hashed_password = user.get('password')

    if not bcrypt.check_password_hash(hashed_password, password):
        return jsonify({"error": "Unauthorized"}), 401
    
    session["user_id"] = str(user["_id"])

    return jsonify({
        "id": str(user["_id"]),
        "email": user["email"]
    })

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if user already exists
    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 400
    
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = {"email": email, "password": hashed_password}

    # Save new user data to database
    result = users_collection.insert_one({'email': email, 'password': hashed_password})

    session["user_id"] = str(result._id)

    return jsonify({
        "id": str(result._id),
        "email": email
    })

@app.route('/logout', methods=['GET'])
def logout():
    session.pop("id")
    return jsonify({"message": "Logged out successfully"})

@app.route('/draw', methods=['POST'])
def save_drawing():
    data = request.get_json()
    print(session)
    user_id = session.get("user_id")
    print(user_id)

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    coordinates = data.get('coordinates')
    label_type = data.get('label_type')

    # Store drawing coordinates in MongoDB
    drawing_data = {
        "user_id": user_id,
        "coordinates": coordinates,
        "label_type": label_type
    }

    result = drawings_collection.insert_one(drawing_data)

    return jsonify({"message": "Drawing coordinates saved successfully", "drawing_id": str(result.inserted_id)})

if __name__ == '__main__':
    app.run(debug=True)
