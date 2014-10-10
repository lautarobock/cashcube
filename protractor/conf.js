exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['cube.spec.js'],
  capabilities: {
    browserName: 'firefox'
  }
};