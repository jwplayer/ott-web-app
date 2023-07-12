module.exports = {
  ci: {
    // collect: {
    //   url: ['http://127.0.0.1:4000'],
    //   startServerCommand: 'http-server ./build/public -p 4000 -g',
    //   startServerReadyPattern: 'Available on',
    //   numberOfRuns: 1,
    // },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.9 }],
      },
    },
  },
};
