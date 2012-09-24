proxy = require './xml-proxy'
express = require 'express'

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

app.listen 3000