# CPU Scheduling Algorithms Animated Simulator (CPUSAAS)

A web-based application for simulating and visualizing CPU scheduling algorithms.

## Features

- User authentication and profile management
- Create, save, and manage process sets
- Run simulations with different CPU scheduling algorithms:
  - First Come First Served (FCFS)
  - Shortest Job First (SJF) Non-Preemptive
  - Priority Scheduling Non-Preemptive
- Visualize results with Gantt charts
- View performance metrics (waiting time, turnaround time, response time)

## Tech Stack

- **Frontend**: React.js, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main application component
│   └── package.json        # Frontend dependencies
│
└── server/                 # Node.js backend
    ├── config/             # Configuration files
    ├── controllers/        # API controllers
    ├── middlewares/        # Express middlewares
    ├── routes/             # API routes
    ├── .env                # Environment variables
    ├── db_setup.sql        # Database setup script
    ├── index.js            # Server entry point
    └── package.json        # Backend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

### Database Setup

1. Create a PostgreSQL database:
   ```
   createdb cpu_scheduling
   ```

2. Run the setup script:
   ```
   psql -d cpu_scheduling -f server/db_setup.sql
   ```

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile

### Process Sets

- `POST /api/process` - Create a new process set
- `GET /api/process` - Get all process sets
- `GET /api/process/:processSetId` - Get a specific process set
- `PUT /api/process/:processSetId` - Update a process set
- `DELETE /api/process/:processSetId` - Delete a process set

### Simulations

- `POST /api/simulate/run` - Run a simulation
- `GET /api/simulate` - Get all simulations
- `GET /api/simulate/:simulationId` - Get a specific simulation

## License

MIT 