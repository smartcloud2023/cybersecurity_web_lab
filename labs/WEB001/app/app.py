import os
import sqlite3

from flask import Flask, render_template_string, request

app = Flask(__name__)

# Mutation inputs — set per session by the provisioner, never chosen by the
# student. VULN_PARAM changes which query parameter is actually injectable,
# so a payload copied from someone else's walkthrough (which names a
# specific parameter) doesn't work here unless the student actually probes
# the app to find the real one. FLAG is unique per session.
VULN_PARAM = os.environ.get("VULN_PARAM", "q")
FLAG = os.environ.get("FLAG", "FLAG{dev-only-placeholder}")

EMPLOYEES = [
    (1, "Grace Hopper", "Engineering"),
    (2, "Ada Lovelace", "Engineering"),
    (3, "Katherine Johnson", "Research"),
    (4, "Radia Perlman", "Network Operations"),
    (5, "Margaret Hamilton", "Flight Software"),
    (6, "Hedy Lamarr", "R&D"),
    (7, "Annie Easley", "Energy Systems"),
]


def get_db():
    # A fresh in-memory DB per process is enough here — each session is its
    # own container, so there's no cross-session state to worry about.
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE employees (id INTEGER, name TEXT, department TEXT)")
    conn.executemany("INSERT INTO employees VALUES (?, ?, ?)", EMPLOYEES)
    # Same column count/order as `employees` so a 3-column UNION lines up —
    # that shape is the actual thing being taught here, not memorizing one
    # magic payload.
    conn.execute("CREATE TABLE secrets (id INTEGER, name TEXT, department TEXT)")
    conn.execute("INSERT INTO secrets VALUES (1, ?, 'classified')", (FLAG,))
    return conn


PAGE = """
<!doctype html>
<title>Northwind Corp — Employee Directory</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { --accent: #3987e5; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, system-ui, "Segoe UI", sans-serif;
    margin: 0;
    background: #f4f5f7;
    color: #1a1a19;
  }
  .banner {
    background: linear-gradient(90deg, var(--accent), #2f6dc4);
    color: #fff;
    padding: .65rem 1.25rem;
    font-size: .8rem;
    font-weight: 600;
    letter-spacing: .02em;
    display: flex;
    align-items: center;
    gap: .5rem;
  }
  .banner .dot {
    width: .5rem; height: .5rem; border-radius: 50%;
    background: #fff; flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(255,255,255,.25);
  }
  main { max-width: 640px; margin: 2.5rem auto; padding: 0 1.25rem 3rem; }
  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06);
    padding: 1.75rem;
  }
  h1 { font-size: 1.3rem; margin: 0 0 .25rem; }
  .subtitle { color: #6b7280; font-size: .875rem; margin: 0 0 1.5rem; }
  form { display: flex; gap: .5rem; }
  input[type=text] {
    padding: .65rem .75rem;
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: .95rem;
    outline: none;
  }
  input[type=text]:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(57,135,229,.15); }
  button {
    padding: .65rem 1.25rem;
    border: none;
    border-radius: 8px;
    background: var(--accent);
    color: #fff;
    font-weight: 600;
    font-size: .9rem;
    cursor: pointer;
  }
  button:hover { background: #2f6dc4; }
  table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: .9rem; }
  th { text-align: left; padding: .5rem .4rem; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
  td { padding: .55rem .4rem; border-bottom: 1px solid #f0f1f3; }
  .error {
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-family: ui-monospace, monospace;
    font-size: .8rem;
    white-space: pre-wrap;
    padding: .65rem .75rem;
    margin-top: 1rem;
  }
</style>
<div class="banner">
  <span class="dot"></span>
  CyberLab training target — intentionally vulnerable. Only test systems you have permission to test.
</div>
<main>
  <div class="card">
    <h1>Northwind Corp — Employee Directory</h1>
    <p class="subtitle">Internal staff search. Try searching for a name to get started.</p>
    <form method="get">
      <input type="text" name="{{ param }}" value="{{ q }}" placeholder="Search by name…" autofocus>
      <button type="submit">Search</button>
    </form>
    {% if error %}<p class="error">{{ error }}</p>{% endif %}
    {% if results is not none %}
    <table>
      <tr><th>ID</th><th>Name</th><th>Department</th></tr>
      {% for row in results %}
      <tr><td>{{ row[0] }}</td><td>{{ row[1] }}</td><td>{{ row[2] }}</td></tr>
      {% endfor %}
    </table>
    {% endif %}
  </div>
</main>
"""


@app.route("/")
@app.route("/search")
def search():
    q = request.args.get(VULN_PARAM, "")
    results = None
    error = None
    if q:
        conn = get_db()
        try:
            # Intentionally vulnerable: string-built query, the whole point
            # of this lab. Never do this in real code — see app/main.py in
            # the actual CyberLab API for how every other endpoint in this
            # project uses parameterized queries via SQLAlchemy instead.
            query = f"SELECT id, name, department FROM employees WHERE name LIKE '%{q}%'"
            results = conn.execute(query).fetchall()
        except sqlite3.Error as exc:
            error = f"query error: {exc}"
        finally:
            conn.close()
    return render_template_string(PAGE, param=VULN_PARAM, q=q, results=results, error=error)


@app.route("/healthz")
def healthz():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
