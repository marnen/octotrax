module.exports = config:
  files:
    javascripts: joinTo: 'octotrax.js'
    stylesheets: joinTo: 'octotrax.css'
  modules:
    autoRequire: 'octotrax.js': ['octotrax']
  paths:
    public: 'dist/chrome'
  plugins:
    on: ['javascript-brunch'],
    off: ['babel-brunch']
  overrides:
    userscript:
      files:
        javascripts: joinTo: 'octotrax.user.js'
        stylesheets: joinTo: 'octotrax.user.css'
      paths:
        public: 'dist/userscript'
      plugins:
        on: ['babel-brunch'],
        off: ['javascript-brunch']
