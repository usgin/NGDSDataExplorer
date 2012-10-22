proxy = require './xml-proxy'
express = require 'express'
fs = require 'fs'

# Setup the server
app = express()

# Configure the body parser to deal with XML data
app.use proxy.xmlParser()

# Other general server configurations
app.set 'view engine', 'jade'
app.set 'view options', layout: false
app.use '/static', express.static './static'

# Search Intereface
app.get '/', (req, res) ->
 res.render 'index'

# Proxy for XML requests
app.get '/proxy', proxy.xmlProxy
app.post '/proxy', proxy.xmlProxy

app.use express.bodyParser()

# Server writes csv file when client directed to /csv
app.post '/csv', (req, res) ->
 # Create a new file at the specified path
 fs.writeFile './files/data.csv', req.body
 # Signal the end of the server response
 res.end ''
 
# Server sends csv file when client directed to /files/data.csv
app.get '/files/data.csv', (req, res) ->
  res.download './files/data.csv'
 
app.listen 3000