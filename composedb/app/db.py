import sqlite3
import os

db_path = os.getenv("DB_PATH")
# db_path = "./mydb"
# db_path = os.path.expanduser("~/.ceramic/indexing.sqlite")

conn = sqlite3.connect(db_path, check_same_thread=False)
cursor = conn.cursor()
