from fastapi import FastAPI

app = FastAPI(title="Pokemon Team Builder API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
