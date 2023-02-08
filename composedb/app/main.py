import os
import json
import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from db import cursor
import datetime


PORT = os.getenv('GET_QUERY_PORT', 8000)
DB_TABLE_GITHUB = os.getenv('DB_TABLE_GITHUB')
DB_TABLE_FIVERR = os.getenv('DB_TABLE_FIVERR')
DB_TABLE_PLATFORM_API_KEY = os.getenv('DB_TABLE_PLATFORM_API_KEY')
DB_TABLE_PLATFORM_RATING = os.getenv('DB_TABLE_PLATFORM_RATING')

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def fetch_from_db(query):
    result = None
    try:
        result = cursor.execute(query).fetchall()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Something went wrong.")

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Not found.")

    return result


def format_doc_list(docs):
    records = []
    for doc in docs:
        id, json_string = doc
        record = json.loads(json_string)
        record["id"] = id
        records.append(record)
    return records


@app.get("/get-round-claims/")
def get_claims():
    # TECHDEBT
    # This API will be removed once composedb implements the feature to query with fields
    # https://forum.ceramic.network/t/queries-by-fields/260/6

    DB_TABLE = "kjzl6hvfrbw6c66jh4zydcz4cli1309rpvji20gr6kzqnm0raohx3c6oj120qec"  # Should not be hardcoded
    seconds_since_epoch = round(datetime.datetime.now().timestamp())
    query = f'''
        SELECT stream_id, stream_content 
        FROM {DB_TABLE} 
        WHERE json_extract(stream_content, '$.claimSatisfactionStatus')="unsatisfied" 
        AND json_extract(stream_content, '$.effectiveDate')<{seconds_since_epoch}
    '''
    result = None
    try:
        result = fetch_from_db(query)
    except Exception as e:
        raise e
    records = format_doc_list(result)

    return records


if __name__ == "__main__":
    uvicorn.run("main:app", port=int(PORT), reload=True, host="0.0.0.0")
