## Python backend (signup/login)

### 1) Create venv + install deps

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### 2) Run server

```bash
python app.py
```

Server runs on `http://localhost:5000`.

### Endpoints

- `POST /signup`
  - body: `{ "username": "...", "email": "...", "password": "..." }`
- `POST /login`
  - body: `{ "username": "username or email", "password": "..." }`

