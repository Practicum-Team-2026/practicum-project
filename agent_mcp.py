import subprocess
import os
import requests
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="GitHub Sync Agent")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_OWNER = "Avital-code"
REPO_NAME = "github-sync-agent"

def run_git_cmd(args):
    result = subprocess.run(["git"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        return f"Error: {result.stderr.strip()}"
    return result.stdout.strip() or "Success"

@app.get("/")
def home():
    return {"status": "Agent is running successfully!"}

@app.post("/morning-sync")
def git_morning_sync():
    fetch_res = run_git_cmd(["fetch", "origin", "dev"])
    merge_res = run_git_cmd(["merge", "origin/dev"])
    return {"status": "success", "fetch": fetch_res, "merge": merge_res}

@app.post("/evening-push")
def git_evening_push(commit_message: str = "Daily work update"):
    run_git_cmd(["add", "."])
    commit_res = run_git_cmd(["commit", "-m", commit_message])
    push_res = run_git_cmd(["push", "origin", "feature/agent-implementation"])
    return {"status": "success", "commit": commit_res, "push": push_res}

if __name__ == "__main__":
    print("Starting GitHub Sync Agent Server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)