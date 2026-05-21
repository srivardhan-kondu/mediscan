from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'supersecretkey'

users = {}

@app.route('/register', methods=['POST'])

def register():
    """API endpoint to register a new user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    if username in users:
        return jsonify({'error': 'Username already exists'}), 400
    password_hash = generate_password_hash(password)
    users[username] = password_hash
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])

def login():
    """API endpoint to log in a user."""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    password_hash = users.get(username)
    if password_hash and check_password_hash(password_hash, password):
        session['user'] = username
        return jsonify({'message': 'Logged in successfully'}), 200
    return jsonify({'error': 'Invalid username or password'}), 401

if __name__ == '__main__':
    app.run(debug=True)