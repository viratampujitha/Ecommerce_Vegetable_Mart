# VeggieMart .NET Core API

This is the backend API for the VeggieMart vegetable e-commerce application built with .NET 8 and Entity Framework Core.

## Prerequisites

- .NET 8 SDK
- MySQL Server
- Visual Studio or VS Code (optional)

## Setup Instructions

### 1. Database Setup

Make sure MySQL is running and create a database:

```sql
CREATE DATABASE veggiemart_db;
```

### 2. Update Connection String

Update the connection string in `appsettings.json` and `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=veggiemart_db;Uid=root;Pwd=your_password;"
  }
}
```

### 3. Install Dependencies

```bash
cd VeggieEcommerce.Api
dotnet restore
```

### 4. Run the Application

```bash
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7000`
- HTTP: `http://localhost:5000`
- Swagger UI: `https://localhost:7000/swagger`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID

### Vegetables
- `GET /api/vegetables` - Get all vegetables
- `GET /api/vegetables/{id}` - Get vegetable by ID
- `GET /api/vegetables/category/{categoryId}` - Get vegetables by category
- `GET /api/vegetables/search?query={query}` - Search vegetables

### Orders (Requires Authentication)
- `POST /api/orders` - Create new order
- `GET /api/orders/user/{userId}` - Get user orders
- `GET /api/orders/{id}` - Get order by ID

## Features

- JWT-based authentication
- Entity Framework Core with MySQL
- Automatic database seeding with sample data
- Password hashing with BCrypt
- CORS enabled for Angular frontend
- Swagger documentation
- Input validation and error handling

## Database Schema

The application uses the following entities:
- **Users** - User accounts and profiles
- **Categories** - Product categories
- **Vegetables** - Product catalog
- **Orders** - Customer orders
- **OrderItems** - Order line items

## Security

- Passwords are hashed using BCrypt
- JWT tokens for authentication
- CORS configured for frontend integration
- Input validation on all endpoints