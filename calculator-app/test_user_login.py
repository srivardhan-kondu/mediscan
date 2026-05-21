import pytest
from flask import Flask
from flask.testing import FlaskClient
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'supersecretkey'

users = {}


@app.route('/register', methods=['POST'])

def register():
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

@pytest.fixture
 def client():
    with app.test_client() as client:
        yield client

 def test_register(client):
    response = client.post('/register', json={'username': 'testuser', 'password': 'password123'})
    assert response.status_code == 201
    assert response.json == {'message': 'User registered successfully'}

 def test_register_missing_details(client):
    response = client.post('/register', json={'username': 'testuser'})
    assert response.status_code == 400
    assert response.json == {'error': 'Username and password are required'}

 def test_register_duplicate_user(client):
    client.post('/register', json={'username': 'testuser', 'password': 'password123'})
    response = client.post('/register', json={'username': 'testuser', 'password': 'password456'})
    assert response.status_code == 400
    assert response.json == {'error': 'Username already exists'}