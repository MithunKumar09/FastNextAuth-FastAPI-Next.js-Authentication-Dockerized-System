# FastNextAuth – FastAPI & Next.js Authentication + Dockerized System

A modern authentication and dashboard system using Next.js, TypeScript, Ant Design, and SQLAlchemy with MySQL. This project includes user registration, login, profile management, and Docker integration for backend services.

## Features

- User Authentication (Registration & Login)
- JWT-based authentication
- Secure localStorage usage
- Profile management with edit functionality
- Animated UI with Framer Motion
- Docker support for containerized deployment
- Backend with FastAPI and SQLAlchemy (MySQL)

## Technologies Used

### Frontend:
- **Next.js** (React Framework)
- **TypeScript**
- **Ant Design** (UI Components)
- **Framer Motion** (Animations)

### Backend:
- **FastAPI** (Python Framework)
- **SQLAlchemy** (ORM for MySQL)
- **JWT Authentication**
- **Docker** (Containerization)

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (Latest LTS Version)
- Python 3.9+
- MySQL
- Docker (Optional for containerized setup)

### Backend Setup (FastAPI & MySQL)

1. **Clone the repository:**
```sh
$ git clone https://github.com/your-repo.git
$ cd your-repo
```

2. **Create a virtual environment and install dependencies:**
```sh
$ python -m venv env
$ source env/bin/activate  # On Windows use `env\Scripts\activate`
$ pip install -r requirements.txt
```

3. **Configure environment variables:**
Create a `.env` file with the following details:
```
DATABASE_URL=mysql+pymysql://username:password@localhost/dbname
SECRET_KEY=your_secret_key
```

4. **Run the backend:**
```sh
$ uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (Next.js)

1. **Navigate to frontend directory and install dependencies:**
```sh
$ cd frontend
$ npm install
```

2. **Run the development server:**
```sh
$ npm run dev
```

3. Open `http://localhost:3000` in your browser.

### Docker Setup (Optional)

1. **Build the Docker image:**
```sh
$ docker-compose build
```

2. **Run the containers:**
```sh
$ docker-compose up
```

### API Endpoints

| Endpoint          | Method | Description |
|------------------|--------|-------------|
| `/register/`     | POST   | User Registration |
| `/login/`        | POST   | User Login |
| `/update-profile/` | POST | Update Profile |

### Folder Structure
```
project-root/
│── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── Dockerfile
│── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   ├── components/
│   ├── public/
│── docker-compose.yml
│── README.md
```

## Future Enhancements
- Implement OAuth authentication (Google, GitHub, etc.)
- Add password reset functionality
- Improve UI/UX design with animations and dark mode support

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, reach out at [your-email@example.com].

