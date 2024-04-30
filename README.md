# EpiMax Backend

## Description

The EpiMax Backend is a RESTful API server built using Express.js and SQLite3, providing endpoints for managing tasks, users, and administrative operations. It includes authentication and authorization mechanisms using JWT (JSON Web Tokens) for secure access to different routes based on user roles.

## Features

- **Tasks Management**: Create, read, update, and delete tasks.
- **User Management**: View user profile, update user profile, and delete user account.
- **Admin Operations**: Admin-only routes for managing users.
- **Authentication**: Token-based authentication using JWT.
- **Authorization**: Role-based access control to restrict access to certain routes.
- **Database Persistence**: Data storage using SQLite3 for persistence.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Veeramanikandanr48/EpiMax-Backend.git
    ```

2. Navigate to the project directory:

    ```bash
    cd epimax-backend
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Run the server:

    ```bash
    npm start
    ```

## Configuration

- **Database**: By default, the SQLite database file is located at `./db.sqlite`. You can configure the database connection settings in the `server.js` file.

- **Environment Variables**: You can configure environment variables for sensitive information such as database credentials, JWT secret, and server port.

## Usage

### Authentication

To authenticate and access protected routes, obtain a JWT token by sending a POST request to the `/login` endpoint with valid credentials. Include the obtained token in the `Authorization` header prefixed with `Bearer`.

### Endpoints

- **Tasks**: `/tasks`
- **User Profile**: `/user/profile`
- **Admin Routes**: `/admin`

Refer to the API documentation or source code for detailed information on available endpoints and their functionalities.

## Testing

To run tests:

```bash
npm test
```

Make sure to update the test cases as needed to match your project requirements.

