import os

# Keep test collection independent from the pytest console-script import path.
BACKEND_ROOT = os.path.dirname(os.path.dirname(__file__))
if BACKEND_ROOT not in os.sys.path:
    os.sys.path.insert(0, BACKEND_ROOT)

os.environ.setdefault("APP_NAME", "Engineering AI Platform")
os.environ.setdefault("APP_VERSION", "0.1.0")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("HOST", "127.0.0.1")
os.environ.setdefault("PORT", "8000")
