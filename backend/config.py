class ApplicationConfig:
    DEBUG = True
    SECRET_KEY = 'your_secret_key_here'
    MONGO_URI = 'mongodb://127.0.0.1:27017/'
    SESSION_TYPE = 'mongodb'  # Specify the session interface
    SESSION_PERMANENT = False