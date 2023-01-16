import sqlite3
import os

# db_path2 = os.getenv("DB_PATH")
db_path = "./mydb"

conn = sqlite3.connect(db_path, check_same_thread=False)
cursor = conn.cursor()
