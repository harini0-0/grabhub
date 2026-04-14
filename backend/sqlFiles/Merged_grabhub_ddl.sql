-- ============================================================
-- GrabHub FINAL DATABASE (MERGED)
-- ============================================================

DROP DATABASE IF EXISTS grabhub;
CREATE DATABASE grabhub;
USE grabhub;

-- ============================================================
-- CUSTOMER (Mithuna)
-- ============================================================

CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ADDRESS (Updated to M:N)
-- ============================================================

CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    street_number VARCHAR(10),
    street_name VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    zipcode VARCHAR(10)
);

CREATE TABLE Customer_Address (
    customer_id INT,
    address_id INT,
    is_default BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (customer_id, address_id),

    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Address(address_id) ON DELETE CASCADE
);

-- ============================================================
-- RESTAURANT (Harini)
-- ============================================================

CREATE TABLE Restaurant (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_name VARCHAR(100),
    street_number VARCHAR(10),
    street_name VARCHAR(100),
    unit_number VARCHAR(20),
    city VARCHAR(50),
    state VARCHAR(50),
    zipcode VARCHAR(10),
    phone VARCHAR(15),
    email VARCHAR(100),
    description TEXT,
    delivery_fee DECIMAL(6,2),
    minimum_order DECIMAL(6,2),
    is_active BOOLEAN DEFAULT TRUE,
    average_rating DECIMAL(2,1),
    max_scheduled_orders_per_slot INT
);

-- ============================================================
-- RESTAURANT HOURS
-- ============================================================

CREATE TABLE Restaurant_Hours (
    restaurant_id INT,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN,

    PRIMARY KEY (restaurant_id, day_of_week),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id) ON DELETE CASCADE
);

-- ============================================================
-- CUISINE (KEPT)
-- ============================================================

CREATE TABLE Cuisine (
    cuisine_id INT AUTO_INCREMENT PRIMARY KEY,
    cuisine_name VARCHAR(50),
    description TEXT
);

-- ============================================================
-- MENU ITEM (WITH cuisine_id)
-- ============================================================

CREATE TABLE Menu_Item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    cuisine_id INT,
    item_name VARCHAR(100),
    description TEXT,
    category ENUM('Appetizer','Main Course','Dessert','Beverage','Side'),
    price DECIMAL(6,2),
    preparation_time INT,
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN,
    is_vegan BOOLEAN,
    is_gluten_free BOOLEAN,
    spice_level INT,
    calories INT,

    FOREIGN KEY (cuisine_id) REFERENCES Cuisine(cuisine_id)
);

CREATE TABLE Restaurant_Menu_Item (
    restaurant_id INT,
    item_id INT,

    PRIMARY KEY (restaurant_id, item_id),

    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Menu_Item(item_id) ON DELETE CASCADE
);


-- ============================================================
-- ORDER (Mithuna logic preserved)
-- ============================================================

CREATE TABLE `Order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    restaurant_id INT,
    address_id INT,
    order_type ENUM('On-Demand','Scheduled','Party'),
    status ENUM('Scheduled','Confirmed','Preparing','Ready','Out for Delivery','Delivered','Cancelled'),
    order_placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_time DATETIME,
    party_size INT,
    subtotal DECIMAL(10,2),
    delivery_fee DECIMAL(6,2),
    tax DECIMAL(8,2),
    tip DECIMAL(6,2),
    total_amount DECIMAL(10,2),

    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- ============================================================
-- ORDER ITEM (M:N RELATION)
-- ============================================================

CREATE TABLE Order_Item (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    item_id INT,
    quantity INT CHECK (quantity > 0),
    unit_price DECIMAL(8,2),

    FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Menu_Item(item_id)
);

-- ============================================================
-- DELIVERY PARTNER
-- ============================================================

CREATE TABLE Delivery_Partner (
    partner_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(100),
    availability_status ENUM('Online','Offline'),
    rating DECIMAL(2,1),
    date_joined DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DELIVERY
-- ============================================================

CREATE TABLE Delivery (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    partner_id INT,
    pickup_time DATETIME,
    delivery_time DATETIME,
    distance DECIMAL(6,2),
    delivery_status ENUM('Assigned','Picked Up','In Transit','Delivered'),
    partner_tip DECIMAL(6,2),

    FOREIGN KEY (order_id) REFERENCES `Order`(order_id),
    FOREIGN KEY (partner_id) REFERENCES Delivery_Partner(partner_id)
);

-- ============================================================
-- BILLING (Mithuna)
-- ============================================================

CREATE TABLE Billing (
    billing_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    payment_method VARCHAR(50),
    card_last_four CHAR(4),
    billing_amount DECIMAL(10,2),
    payment_status ENUM('Pending','Completed','Refunded','Failed'),

    FOREIGN KEY (order_id) REFERENCES `Order`(order_id)
);

-- ============================================================
-- REVIEW RATING
-- ============================================================

CREATE TABLE Review_Rating (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    customer_id INT,
    restaurant_id INT,

    food_rating INT CHECK (food_rating BETWEEN 1 AND 5),
    delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
    overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),

    comment TEXT,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    helpful_count INT DEFAULT 0,

    FOREIGN KEY (order_id) REFERENCES `Order`(order_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id)
);

-- ============================================================
-- FAVOURITES
-- ============================================================

CREATE TABLE Favourites (
    favourite_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    restaurant_id INT,
    item_id INT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id),
    FOREIGN KEY (item_id) REFERENCES Menu_Item(item_id)
);

-- ============================================================
-- COMBO MEAL
-- ============================================================

CREATE TABLE Combo_Meal (
    combo_id INT AUTO_INCREMENT PRIMARY KEY,
    combo_item_id INT,
    component_item_id INT,
    quantity INT CHECK (quantity > 0),

    FOREIGN KEY (combo_item_id) REFERENCES Menu_Item(item_id),
    FOREIGN KEY (component_item_id) REFERENCES Menu_Item(item_id)
);

-- ============================================================
-- PROFILE CATEGORY (FINAL — UML ALIGNED)
-- ============================================================
DROP TABLE IF EXISTS Profile_Category;
CREATE TABLE Profile_Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    axis ENUM('Cuisine','Spice','Health') NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    threshold_rules JSON,

    CONSTRAINT unique_axis_category UNIQUE (axis, category_name)
);

DROP TABLE IF EXISTS Customer_Profile;

-- axis removed: it was a BCNF violation (category_id → axis, but axis was part of the PK).
-- axis is now derived via JOIN to Profile_Category when needed.
-- One-category-per-axis-per-customer is enforced by the validate_profile_axis trigger.
CREATE TABLE Customer_Profile (
    customer_id INT NOT NULL,
    category_id INT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (customer_id, category_id),

    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Profile_Category(category_id) ON DELETE CASCADE
);
-- ============================================================
-- SUBSCRIPTION (Mithuna)
-- ============================================================

CREATE TABLE Subscription (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    plan_type ENUM('Monthly','Annual'),
    start_date DATE,
    end_date DATE,
    status ENUM('Active','Cancelled','Expired'),
    auto_renew BOOLEAN,
    monthly_fee DECIMAL(6,2),

    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

-- ============================================================
-- VERIFY
-- ============================================================

SHOW TABLES;