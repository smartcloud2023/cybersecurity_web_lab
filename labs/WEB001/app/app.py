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
<title>Northwind Directory — Employee Search</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 3rem auto; color: #1a1a19; }
  h1 { font-size: 1.25rem; }
  input[type=text] { padding: .5rem; width: 100%; box-sizing: border-box; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  td, th { text-align: left; padding: .4rem; border-bottom: 1px solid #ddd; }
  .error { color: #b91c1c; font-family: monospace; white-space: pre-wrap; }
</style>
<h1>Northwind Corp — Employee Directory</h1>
<form method="get">
  <input type="text" name="{{ param }}" value="{{ q }}" placeholder="Search by name…" autofocus>
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
