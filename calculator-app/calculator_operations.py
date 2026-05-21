class Calculator:
    """Calculator class to perform basic operations."""

    @staticmethod
    def add(a, b):
        """Add two numbers and return the result."""
        try:
            return a + b
        except TypeError:
            raise ValueError("Invalid input: add() requires numbers")

    @staticmethod
    def subtract(a, b):
        """Subtract two numbers and return the result."""
        try:
            return a - b
        except TypeError:
            raise ValueError("Invalid input: subtract() requires numbers")

    @staticmethod
    def multiply(a, b):
        """Multiply two numbers and return the result."""
        try:
            return a * b
        except TypeError:
            raise ValueError("Invalid input: multiply() requires numbers")

    @staticmethod
    def divide(a, b):
        """Divide two numbers and return the result."""
        try:
            if b == 0:
                raise ValueError("Cannot divide by zero.")
            return a / b
        except TypeError:
            raise ValueError("Invalid input: divide() requires numbers")