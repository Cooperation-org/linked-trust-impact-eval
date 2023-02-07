import sqlite3
import os

db_path = os.getenv("DB_PATH")

conn = sqlite3.connect(db_path, check_same_thread=False)
cursor = conn.cursor()
