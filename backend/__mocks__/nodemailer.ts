// Mock nodemailer module for testing without the actual package
// This file is used when nodemailer is not installed (e.g., npm registry unavailable)

// Use function expressions to avoid 'jest is not defined' issues in manual mocks
export const createTransport = function() {
  return {
    sendMail: async function() { 
      return { messageId: 'test-message-id' }; 
    },
    verify: async function() { 
      return true; 
    },
  };
};

export default {
  createTransport,
};
