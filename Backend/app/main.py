from fastapi import FastAPI

app = FastAPI(title="URL_Shortener")

@app.get("/")
def root():
    return {"message": "Welcome to URL_Shortener API"}
