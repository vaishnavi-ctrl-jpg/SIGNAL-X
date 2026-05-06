import http.server
import socketserver
import os

PORT = int(os.environ.get("PORT", 8080))

Handler = http.server.SimpleHTTPRequestHandler

# Change the working directory to this script's directory (just in case)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
