#!/usr/bin/python
import sys
PORT = 8080

import SimpleHTTPServer
import SocketServer
	
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
Handler.extensions_map.update({
		'.webapp': 'application/x-web-app-manifest+json',
	});
	
httpd = SocketServer.TCPServer(("", PORT), Handler)
	
print "Serving at port", PORT
httpd.serve_forever()

