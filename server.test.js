const bcrypt = require('bcrypt');
jest.mock('bcrypt', () => {
    return {
        compare: jest.fn().mockResolvedValue(true)
    };
});

// Assuming you have test code here

