"""
DueDate - Python Backend HTTP Service
Provides REST API endpoints for:
- Phone & UPI validation
- Double reminder prevention & WhatsApp dispatch
- IST Cron automation check
- Organization & Member calculations
Runs using Python 3 standard library (http.server) - zero external dependencies required.
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime

from phone_validator import normalize_phone_number, check_duplicate_member
from upi_service import validate_upi_id, generate_upi_payment_link
from whatsapp_bot import sendWhatsApp, render_message_template, check_can_send_reminder, DEFAULT_TEMPLATES
from cron_engine import get_current_ist_time, evaluate_reminder_trigger

PORT = 5050

class DueDateAPIHandler(http.server.SimpleHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _respond_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        if path == '/api/health':
            ist_now = get_current_ist_time()
            self._respond_json(200, {
                "status": "healthy",
                "service": "DueDate Python Engine",
                "ist_time": ist_now.strftime("%Y-%m-%d %H:%M:%S IST"),
                "version": "1.0.0"
            })
            return

        if path == '/api/templates':
            self._respond_json(200, {
                "templates": DEFAULT_TEMPLATES
            })
            return

        self._respond_json(404, {"error": f"Endpoint {path} not found"})

    def do_POST(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length)
        try:
            body = json.loads(body_bytes.decode('utf-8')) if body_bytes else {}
        except Exception:
            body = {}

        if path == '/api/validate-phone':
            raw_phone = body.get('phone', '')
            is_valid, formatted, err = normalize_phone_number(raw_phone)
            self._respond_json(200, {
                "is_valid": is_valid,
                "formatted": formatted,
                "error": err
            })
            return

        if path == '/api/validate-upi':
            upi_id = body.get('upi_id', '')
            amount = float(body.get('amount', 0))
            payee_name = body.get('payee_name', 'DueDate')
            note = body.get('note', 'Fee payment')

            is_valid, err = validate_upi_id(upi_id)
            upi_link = generate_upi_payment_link(upi_id, amount, payee_name, note) if is_valid else ""
            self._respond_json(200, {
                "is_valid": is_valid,
                "error": err,
                "upi_link": upi_link
            })
            return

        if path == '/api/send-reminder':
            phone = body.get('phone', '')
            message = body.get('message', '')
            member_status = body.get('status', 'PENDING')
            last_sent = body.get('last_sent_at', None)

            can_send, reason = check_can_send_reminder(member_status, last_sent)
            if not can_send:
                self._respond_json(400, {
                    "success": False,
                    "error": reason,
                    "blocked_by": "Double Reminder Guard"
                })
                return

            result = sendWhatsApp(phone, message)
            self._respond_json(200, {
                "success": True,
                "delivery": result
            })
            return

        if path == '/api/cron-check':
            due_day = int(body.get('due_day', 5))
            offsets = body.get('offsets', [-2, 0, 3, 7, 10])
            should_run, offset, label = evaluate_reminder_trigger(due_day, offsets)
            self._respond_json(200, {
                "should_trigger": should_run,
                "offset": offset,
                "label": label,
                "ist_time": get_current_ist_time().strftime("%Y-%m-%d %H:%M:%S IST")
            })
            return

        self._respond_json(404, {"error": f"Endpoint {path} not found"})

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), DueDateAPIHandler) as httpd:
            print(f"DueDate Python Engine running on port {PORT} (IST Time: {get_current_ist_time()})")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down DueDate server...")
    except Exception as e:
        print(f"Server error: {e}")

if __name__ == "__main__":
    run_server()
