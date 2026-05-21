import pytest
from calculator_operations import Calculator

@pytest.fixture
 def setup_calculator():
    return Calculator()

 def test_add(setup_calculator):
    assert setup_calculator.add(2, 3) == 5
    assert setup_calculator.add(-2, 3) == 1
    assert setup_calculator.add(2.5, 0.5) == 3

 def test_add_invalid_input(setup_calculator):
    with pytest.raises(ValueError, match="Invalid input: add\(\) requires numbers"):
        setup_calculator.add("a", 1)

 def test_subtract(setup_calculator):
    assert setup_calculator.subtract(3, 2) == 1
    assert setup_calculator.subtract(3, -2) == 5

 def test_subtract_invalid_input(setup_calculator):
    with pytest.raises(ValueError, match="Invalid input: subtract\(\) requires numbers"):
        setup_calculator.subtract(3, "b")

 def test_multiply(setup_calculator):
    assert setup_calculator.multiply(2, 3) == 6
    assert setup_calculator.multiply(2, -3) == -6

 def test_multiply_invalid_input(setup_calculator):
    with pytest.raises(ValueError, match="Invalid input: multiply\(\) requires numbers"):
        setup_calculator.multiply("c", 3)

 def test_divide(setup_calculator):
    assert setup_calculator.divide(4, 2) == 2
    assert setup_calculator.divide(5, 2) == 2.5

 def test_divide_by_zero(setup_calculator):
    with pytest.raises(ValueError, match="Cannot divide by zero."):
        setup_calculator.divide(5, 0)

 def test_divide_invalid_input(setup_calculator):
    with pytest.raises(ValueError, match="Invalid input: divide\(\) requires numbers"):
        setup_calculator.divide(5, "d")