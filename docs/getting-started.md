# 🚦 Getting Started

Follow these steps to get your local development environment up and running.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/asgard.git
cd asgard
```

### 2. Configure Environment Variables
Copy the example env files for both apps:
```bash
# Server
cp apps/server/.env.example apps/server/.env

# Client
cp apps/client/.env.example apps/client/.env
```

### 3. Launch the Stack
```bash
docker compose up --build
```
This command builds the images, installs dependencies, and starts all services.

### 4. Initialize the Database
In a new terminal, apply the initial Prisma migration:
```bash
docker compose exec server bunx prisma migrate dev --name init
```

### Accessing the App
| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend** | http://localhost:3000 |
| **Database Admin (Prisma)** | http://localhost:5555 |
