import unittest
from app import process_data, validate_user

class TestAppLogic(unittest.TestCase):
    def test_process_data_success(self):
        # Test standard processing behavior
        result = process_data({'id': 101, 'status': 'active'})
        self.assertTrue(result['success'])
        self.assertEqual(result['code'], 200)

    def test_process_data_invalid_input(self):
        # Test edge-case empty input handling
        with self.assertRaises(ValueError):
            process_data({})

    def test_validate_user_authorized(self):
        # Test user authorization validation
        status = validate_user('admin', 'secret_token')
        self.assertTrue(status)

    def test_validate_user_unauthorized(self):
        # Test handling of incorrect security tokens
        status = validate_user('guest', 'wrong_token')
        self.assertFalse(status)