
CREATE DATABASE IF NOT EXISTS veggiemart_db;
USE veggiemart_db;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(500),
    City VARCHAR(100),
    State VARCHAR(50),
    ZipCode VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (Email)
);

-- Categories table
CREATE TABLE IF NOT EXISTS Categories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    ImageUrl VARCHAR(500)
);

-- Vegetables table
CREATE TABLE IF NOT EXISTS Vegetables (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    ImageUrl VARCHAR(500) NOT NULL,
    CategoryId INT NOT NULL,
    InStock BOOLEAN DEFAULT TRUE,
    StockQuantity INT DEFAULT 0,
    Unit VARCHAR(50) NOT NULL,
    NutritionInfo VARCHAR(1000),
    Origin VARCHAR(200),
    IsOrganic BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE RESTRICT,
    INDEX idx_category (CategoryId),
    INDEX idx_name (Name),
    INDEX idx_price (Price)
);

-- Orders table
CREATE TABLE IF NOT EXISTS Orders (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    TotalAmount DECIMAL(10,2) NOT NULL,
    ShippingAddress VARCHAR(1000) NOT NULL,
    PaymentMethod VARCHAR(100) NOT NULL,
    Notes VARCHAR(1000),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE RESTRICT,
    INDEX idx_user (UserId),
    INDEX idx_status (Status),
    INDEX idx_order_date (OrderDate)
);

-- OrderItems table
CREATE TABLE IF NOT EXISTS OrderItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    VegetableId INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (VegetableId) REFERENCES Vegetables(Id) ON DELETE RESTRICT,
    INDEX idx_order (OrderId),
    INDEX idx_vegetable (VegetableId)
);

-- Insert sample categories
INSERT INTO Categories (Id, Name, Description) VALUES
(1, 'Leafy Greens', 'Fresh leafy vegetables'),
(2, 'Root Vegetables', 'Nutritious root vegetables'),
(3, 'Fruits', 'Fresh vegetables that are technically fruits'),
(4, 'Herbs', 'Fresh aromatic herbs');

-- Insert sample vegetables
INSERT INTO Vegetables (Id, Name, Description, Price, ImageUrl, CategoryId, InStock, StockQuantity, Unit, IsOrganic, Origin) VALUES
(1, 'Fresh Spinach', 'Organic fresh spinach leaves, perfect for salads and cooking', 3.99, 'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg', 1, TRUE, 50, 'bunch', TRUE, 'Local Farm'),
(2, 'Organic Carrots', 'Sweet and crunchy organic carrots, great for snacking and cooking', 2.49, 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg', 2, TRUE, 75, 'lb', TRUE, 'California'),
(3, 'Fresh Tomatoes', 'Juicy red tomatoes, perfect for salads and sauces', 4.99, 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', 3, TRUE, 30, 'lb', FALSE, 'Mexico'),
(4, 'Fresh Basil', 'Aromatic fresh basil leaves, perfect for Italian dishes', 2.99, 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg', 4, TRUE, 25, 'pack', TRUE, 'Local Greenhouse'),
(5, 'Broccoli', 'Fresh green broccoli crowns, packed with nutrients', 3.49, 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg', 1, TRUE, 40, 'head', FALSE, 'California'),
(6, 'Sweet Potatoes', 'Orange sweet potatoes, naturally sweet and nutritious', 2.99, 'https://images.pexels.com/photos/89247/pexels-photo-89247.jpeg', 2, TRUE, 60, 'lb', TRUE, 'North Carolina');

-- Insert sample user (password is hashed version of "password123")
INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Phone, Address, City, State, ZipCode) VALUES
(1, 'john.doe@example.com', '$2a$11$K2CtDP7zSGOKgjXjxD8E5uKhTa8ksKJCJYfZr8zKJYfZr8zKJYfZr8', 'John', 'Doe', '+1234567890', '123 Main St', 'Anytown', 'CA', '12345');

-- Insert sample order
INSERT INTO Orders (Id, UserId, Status, TotalAmount, ShippingAddress, PaymentMethod, Notes) VALUES
(1, 1, 'Delivered', 15.47, '123 Main St, Anytown, CA 12345', 'Credit Card', 'Please leave at front door');

-- Insert sample order items
INSERT INTO OrderItems (OrderId, VegetableId, Quantity, Price, Subtotal) VALUES
(1, 1, 2, 3.99, 7.98),
(1, 2, 1, 2.49, 2.49),
(1, 4, 2, 2.99, 5.98);