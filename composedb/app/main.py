from dotenv import load_dotenv  # nopep8
load_dotenv()  # nopep8
import datetime
from db import cursor
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, status
import uvicorn
import json
import os


PORT = os.getenv('GET_QUERY_PORT', 8000)

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
