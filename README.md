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

## Installation Guide

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Git

### Clone the Repository

```bash
git clone https://github.com/M-Umair-Kn/cpusaas.git
cd cpusaas
```

### Database Setup

1. Install PostgreSQL if not already installed:
   - Windows: Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)
   - Linux: `sudo apt-get install postgresql postgresql-contrib`
   - macOS: `brew install postgresql`

2. Create a PostgreSQL database:
   ```bash
   createdb cpu_scheduling
   ```

3. Run the database setup script:
   ```bash
   psql -d cpu_scheduling -f server/db_setup.sql
   ```

4. Import sample data (optional):
   ```bash
   # Windows
   type server/database_export.json | psql -d cpu_scheduling -c "COPY (SELECT json_populate_record(null::users, json)) TO STDOUT"
   
   # Linux/macOS
   cat server/database_export.json | psql -d cpu_scheduling -c "COPY (SELECT json_populate_record(null::users, json)) TO STDOUT"
   ```

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env file with your database credentials
   # Replace these values with your actual configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cpu_scheduling
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application should now be running at `http://localhost:3000`

## Default Test Account

You can use the following test account to try the application:
```
Email: abcd@efg.com
Password: your_password_here
```

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

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists and is accessible

2. **Port Already in Use**
   - Default ports: Backend (5000), Frontend (3000)
   - Change ports in respective configuration files if needed

3. **Module Not Found Errors**
   - Run `npm install` in both client and server directories
   - Clear npm cache: `npm cache clean --force`

### Getting Help

If you encounter any issues:
1. Check the console logs for error messages
2. Review the troubleshooting section above
3. Open an issue on GitHub with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages and logs

