import pytest
from flask import Flask
from flask.testing import FlaskClient
from flask import jsonify, request

app = Flask(__name__)

@app.route('/calculate', methods=['POST'])

def calculate():
    data = request.json
    try:
        num1 = float(data['num1'])
        num2 = float(data['num2'])
        operation = data['operation']
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'Invalid input data'}), 400

    if operation == 'add':
        result = num1 + num2
    elif operation == 'subtract':
        result = num1 - num2
    elif operation == 'multiply':
        result = num1 * num2
    elif operation == 'divide':
        if num2 == 0:
            return jsonify({'error': 'Division by zero is not allowed'}), 400
        result = num1 / num2
    else:
        return jsonify({'error': 'Invalid operation'}), 400

    return jsonify({'result': result}), 200

@pytest.fixture
 def client():
    with app.test_client() as client:
        yield client

 def test_add(client):
    response = client.post('/calculate', json={'num1': 2, 'num2': 3, 'operation': 'add'})
    assert response.status_code == 200
    assert response.json == {'result': 5}

 def test_divide_by_zero(client):
    response = client.post('/calculate', json={'num1': 5, 'num2': 0, 'operation': 'divide'})
    assert response.status_code == 400
    assert response.json == {'error': 'Division by zero is not allowed'}

 def test_invalid_operation(client):
    response = client.post('/calculate', json={'num1': 2, 'num2': 3, 'operation': 'modulus'})
    assert response.status_code == 400
    assert response.json == {'error': 'Invalid operation'}