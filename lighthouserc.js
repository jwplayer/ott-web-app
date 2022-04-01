module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4000'],
      startServerCommand: 'node ./test-lhci/server.js',
      startServerReadyPattern: 'Available on',
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        "csp-xss": "warn"
      }
    },
  },
};
