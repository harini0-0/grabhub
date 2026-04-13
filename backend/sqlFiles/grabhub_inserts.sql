USE grabhub;

-- ============================================================
-- CUSTOMER
-- ============================================================

INSERT INTO Customer (first_name, last_name, email, phone, password_hash) VALUES
('Alice', 'Johnson', 'alice@mail.com', '6171110001', SHA2('pass123',256)),
('Bob', 'Smith', 'bob@mail.com', '6171110002', SHA2('pass123',256)),
('Carol', 'Lee', 'carol@mail.com', '6171110003', SHA2('pass123',256)),
('David', 'Chen', 'david@mail.com', '6171110004', SHA2('pass123',256)),
('Eve', 'Patel', 'eve@mail.com', '6171110005', SHA2('pass123',256));

-- ============================================================
-- ADDRESS
-- ============================================================

INSERT INTO Address (street_number, street_name, city, state, zipcode) VALUES
('360', 'Huntington Ave', 'Boston', 'MA', '02115'),
('100', 'Federal St', 'Boston', 'MA', '02110'),
('45', 'Beacon St', 'Boston', 'MA', '02108'),
('88', 'Tremont St', 'Boston', 'MA', '02111'),
('200', 'Boylston St', 'Boston', 'MA', '02116');

-- ============================================================
-- CUSTOMER_ADDRESS (M:N)
-- ============================================================

INSERT INTO Customer_Address VALUES
(1,1,TRUE),
(1,2,FALSE),
(2,3,TRUE),
(3,4,TRUE),
(4,5,TRUE),
(5,1,FALSE);

-- ============================================================
-- RESTAURANT
-- ============================================================

INSERT INTO Restaurant (restaurant_name, street_number, street_name, city, state, zipcode, phone, email, description, delivery_fee, minimum_order, average_rating, max_scheduled_orders_per_slot)
VALUES
('Pad Thai Palace','10','Main St','Boston','MA','02110','6172221111','thai@food.com','Authentic Thai',3.99,15,4.5,20),
('Burger Barn','20','Broadway','Boston','MA','02111','6172222222','burger@food.com','American Burgers',2.99,10,4.2,15),
('Sushi Central','30','Cambridge St','Boston','MA','02114','6172223333','sushi@food.com','Japanese Sushi',4.99,20,4.7,10);

-- ============================================================
-- RESTAURANT HOURS
-- ============================================================

INSERT INTO Restaurant_Hours VALUES
(1,'Monday','10:00:00','22:00:00',FALSE),
(1,'Tuesday','10:00:00','22:00:00',FALSE),
(2,'Monday','09:00:00','23:00:00',FALSE),
(3,'Sunday','11:00:00','21:00:00',FALSE);

-- ============================================================
-- CUISINE
-- ============================================================

INSERT INTO Cuisine (cuisine_name, description) VALUES
('Thai','Spicy Thai cuisine'),
('American','Burgers and fast food'),
('Japanese','Sushi and ramen');

-- ============================================================
-- MENU ITEMS
-- ============================================================

INSERT INTO Menu_Item (cuisine_id, item_name, category, price, preparation_time, is_available, is_vegetarian, is_vegan, is_gluten_free, spice_level, calories)
VALUES
(1,'Pad Thai','Main Course',12.99,15,TRUE,FALSE,FALSE,FALSE,3,600),
(1,'Green Curry','Main Course',14.50,20,TRUE,FALSE,FALSE,FALSE,4,650),
(2,'Classic Burger','Main Course',9.99,10,TRUE,FALSE,FALSE,FALSE,1,800),
(2,'Fries','Side',4.99,5,TRUE,TRUE,FALSE,TRUE,0,300),
(3,'Salmon Sushi','Main Course',16.00,12,TRUE,FALSE,FALSE,TRUE,0,400);

-- ============================================================
-- ORDERS
-- ============================================================

INSERT INTO `Order` (customer_id, restaurant_id, address_id, order_type, status, subtotal, delivery_fee, tax, tip, total_amount)
VALUES
(1,1,1,'On-Demand','Delivered',27.49,3.99,2.06,5.00,38.54),
(2,2,3,'On-Demand','Preparing',15.48,2.99,1.16,3.00,22.63),
(3,3,4,'Scheduled','Scheduled',20.50,3.99,1.54,4.00,30.03);


INSERT INTO Restaurant_Menu_Item VALUES
(1,1), -- Pad Thai Palace → Pad Thai
(1,2),
(2,3),
(2,4),
(3,5);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

INSERT INTO Order_Item (order_id, item_id, quantity, unit_price) VALUES
(1,1,1,12.99),
(1,2,1,14.50),
(2,3,1,9.99),
(2,4,1,4.99),
(3,5,1,16.00);

-- ============================================================
-- DELIVERY PARTNER
-- ============================================================

INSERT INTO Delivery_Partner (first_name, last_name, phone, email, availability_status, rating)
VALUES
('John','Doe','6173331111','john@delivery.com','Online',4.6),
('Mike','Ross','6173332222','mike@delivery.com','Offline',4.3);

-- ============================================================
-- DELIVERY
-- ============================================================

INSERT INTO Delivery (order_id, partner_id, pickup_time, delivery_time, distance, delivery_status, partner_tip)
VALUES
(1,1,NOW(),NOW(),3.5,'Delivered',5.00),
(2,2,NOW(),NULL,2.0,'In Transit',3.00);

-- ============================================================
-- BILLING
-- ============================================================

INSERT INTO Billing (order_id, payment_method, card_last_four, billing_amount, payment_status)
VALUES
(1,'Credit Card','4242',38.54,'Completed'),
(2,'Apple Pay',NULL,22.63,'Pending'),
(3,'Debit Card','1234',30.03,'Pending');

-- ============================================================
-- REVIEW
-- ============================================================

INSERT INTO Review_Rating (order_id, customer_id, restaurant_id, food_rating, delivery_rating, overall_rating, comment)
VALUES
(1,1,1,5,5,5,'Amazing food!'),
(2,2,2,4,4,4,'Good burger');

-- ============================================================
-- FAVOURITES
-- ============================================================

INSERT INTO Favourites (customer_id, restaurant_id, item_id) VALUES
(1,1,1),
(1,1,2),
(2,2,3);

-- ============================================================
-- COMBO MEAL
-- ============================================================

INSERT INTO Combo_Meal (combo_item_id, component_item_id, quantity) VALUES
(1,2,1),
(3,4,1);

-- ============================================================
-- PROFILE CATEGORY (ML READY)
-- ============================================================

INSERT INTO Profile_Category (axis, category_name, description, threshold_rules) VALUES
('Cuisine','Thai Lover','Prefers Thai','{"thai":0.7}'),
('Spice','Spicy Enthusiast','Loves spicy food','{"spice_level":4}'),
('Health','Health Conscious','Prefers low calorie','{"calories":500}');

-- ============================================================
-- SUBSCRIPTION
-- ============================================================

INSERT INTO Subscription (customer_id, plan_type, start_date, end_date, status, auto_renew, monthly_fee)
VALUES
(1,'Monthly','2026-04-01','2026-05-01','Active',TRUE,9.99),
(2,'Annual','2026-01-01','2027-01-01','Active',TRUE,7.99);


INSERT INTO Profile_Category (axis, category_name, description, threshold_rules) VALUES

('Spice','Spicy Enthusiast','Loves high spice food','{"spice_level_min":4}'),
('Spice','Mild Eater','Prefers low spice food','{"spice_level_max":2}'),

('Health','Health Conscious','Prefers low calorie meals','{"calories_max":500}'),
('Health','Indulgent','Prefers rich high calorie meals','{"calories_min":600}'),

('Cuisine','Thai Lover','Frequently orders Thai cuisine','{"cuisine":"Thai"}'),
('Cuisine','American Lover','Frequently orders American cuisine','{"cuisine":"American"}'),
('Cuisine','Japanese Lover','Frequently orders Japanese cuisine','{"cuisine":"Japanese"}'),
('Cuisine','Balanced','No strong cuisine preference','{"cuisine":"Mixed"}');
INSERT INTO Profile_Category (axis, category_name, description, threshold_rules) VALUES
('Spice','Balanced','Moderate spice preference','{"spice_level":3}');
