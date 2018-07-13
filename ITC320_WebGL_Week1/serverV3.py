#!/usr/bin/python
import sys
PORT = 8080

import http.server

http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,port=PORT,bind="")
print ("Serving at port", PORT)
start_server() #If you want cgi, set cgi to True e.g. start_server(cgi=True)
        


