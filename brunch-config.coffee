module.exports = config:
  files:
    javascripts: joinTo: 'octotrax.js'
    stylesheets: joinTo: 'octotrax.css'
  modules:
    autoRequire: 'octotrax.js': ['octotrax']
