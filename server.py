from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching in all responses
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8000), NoCacheHandler)
    print("Serving on port 8000 (no-cache mode)...")
    server.serve_forever()
