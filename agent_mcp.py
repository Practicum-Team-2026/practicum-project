import subprocess
import os
import requests
from mcp.server.fastmcp import FastMCP

# אתחול שרת ה-MCP הרזה
mcp = FastMCP("GitHub-Sync-Agent")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_OWNER ="Avital-code"
REPO_NAME = "github-sync-agent"

def run_git_cmd(args):
    result = subprocess.run(["git"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        return f"Error: {result.stderr.strip()}"
    return result.stdout.strip() or "Success"

@mcp.tool()
def git_morning_sync() -> str:
    """מבצע סנכרון בוקר: Fetch ו-Merge מול ענף dev המרכזי."""
    fetch_res = run_git_cmd(["fetch", "origin", "dev"])
    merge_res = run_git_cmd(["merge", "origin/dev"])
    return f"Morning Sync Result:\nFetch: {fetch_res}\nMerge: {merge_res}"

@mcp.tool()
def git_evening_push(commit_message: str, branch_name: str = "feature/agent-implementation") -> str:
    """מבצע סנכרון ערב: Commit ו-Push של השינויים לענף ה-feature."""
    run_git_cmd(["add", "."])
    commit_res = run_git_cmd(["commit", "-m", commit_message])
    push_res = run_git_cmd(["push", "origin", branch_name])
    return f"Evening Push Result:\nCommit: {commit_res}\nPush: {push_res}"

@mcp.tool()
def create_pull_request(title: str, body: str, head_branch: str = "feature/agent-implementation", base_branch: str = "dev") -> str:
    """פותח Pull Request מול GitHub API מענף ה-feature לתוך ענף dev."""
    if not GITHUB_TOKEN:
        return "Error: GITHUB_TOKEN environment variable is not set."
    
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {
        "title": title,
        "body": body,
        "head": head_branch,
        "base": base_branch
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 201:
        pr_data = response.json()
        return f"Pull Request created successfully! URL: {pr_data.get('html_url')}"
    else:
        return f"Failed to create PR ({response.status_code}): {response.text}"

if __name__ == "__main__":
    mcp.run()