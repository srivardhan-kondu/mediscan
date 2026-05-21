from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/calculate', methods=['POST'])

def calculate():
    """API endpoint to perform calculator operations."""
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

if __name__ == '__main__':
    app.run(debug=True)