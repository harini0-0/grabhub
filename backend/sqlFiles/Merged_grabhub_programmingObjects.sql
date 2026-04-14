-- ============================================================
-- GrabHub — Mithuna's Database Programming Objects
-- CS 5200 | Spring 2026 | Prof. Kathleen Durant
-- ============================================================
-- Run this AFTER the DDL file has been executed.
-- ============================================================

USE grabhub;

-- ============================================================
-- 1. FUNCTION: is_slot_available
-- ============================================================
-- Checks whether a restaurant is open at a given datetime.
-- Used by place_order to validate scheduled order times.
--
-- Logic:
--   1. Find the day of the week for the requested datetime
--   2. Look up that restaurant's hours for that day
--   3. Check if the requested TIME falls within open–close
--   4. Return TRUE if open, FALSE if closed or no hours found
--
-- Example call:
--   SELECT is_slot_available(1, '2026-04-12 18:30:00');
-- ============================================================

DROP FUNCTION IF EXISTS is_slot_available;

DELIMITER //

CREATE FUNCTION is_slot_available(
    p_restaurant_id INT,
    p_requested_datetime DATETIME
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_day_name VARCHAR(10);
    DECLARE v_requested_time TIME;
    DECLARE v_open_time TIME;
    DECLARE v_close_time TIME;
    DECLARE v_is_closed BOOLEAN;
    DECLARE v_found INT DEFAULT 0;

    -- Extract the day name and time from the requested datetime
    SET v_day_name = DAYNAME(p_requested_datetime);
    SET v_requested_time = TIME(p_requested_datetime);

    -- Look up restaurant hours for that day
    SELECT opening_time, closing_time, is_closed, 1
    INTO v_open_time, v_close_time, v_is_closed, v_found
    FROM Restaurant_Hours
    WHERE restaurant_id = p_restaurant_id
      AND day_of_week = v_day_name
    LIMIT 1;

    -- No hours record found for that day → not available
    IF v_found = 0 THEN
        RETURN FALSE;
    END IF;

    -- Restaurant is explicitly closed that day
    IF v_is_closed = TRUE THEN
        RETURN FALSE;
    END IF;

    -- Check if requested time is within operating hours
    IF v_requested_time >= v_open_time AND v_requested_time <= v_close_time THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END //

DELIMITER ;


-- ============================================================
-- 2. STORED PROCEDURE: place_order
-- ============================================================
-- Places a new order for a customer. Does three things in
-- one transaction:
--   1. Validates the time slot (for Scheduled/Party orders)
--   2. Inserts the Order row
--   3. Inserts all Order_Item rows (passed as a comma-
--      separated string, parsed with a cursor)
--   4. Inserts the Billing row
--
-- If anything fails, the whole thing rolls back.
--
-- Parameters:
--   p_customer_id      → who is ordering
--   p_restaurant_id    → from which restaurant
--   p_address_id       → delivery address
--   p_order_type       → 'On-Demand', 'Scheduled', or 'Party'
--   p_scheduled_time   → required for Scheduled/Party, NULL for On-Demand
--   p_party_size       → required for Party, NULL otherwise
--   p_special_instructions → optional note
--   p_item_list        → comma-separated: 'menu_item_id:qty:unit_price,...'
--                         e.g., '1:2:12.99,3:1:9.99'
--   p_delivery_fee     → delivery fee
--   p_tip              → tip amount
--   p_payment_method   → 'Credit Card', 'Debit Card', etc.
--   p_card_last_four   → last 4 digits (NULL for PayPal/Apple Pay)
--
-- OUT:
--   p_order_id         → the newly created order_id
--
-- Example call:
--   CALL place_order(1, 1, 1, 'Scheduled', '2026-04-12 19:00:00',
--        NULL, 'Ring bell', '1:2:12.99,2:1:14.50', 3.99, 5.00,
--        'Credit Card', '4242', @new_order_id);
--   SELECT @new_order_id;
-- ============================================================

DROP PROCEDURE IF EXISTS place_order;

DELIMITER //

CREATE PROCEDURE place_order(
    IN p_customer_id        INT,
    IN p_restaurant_id      INT,
    IN p_address_id         INT,
    IN p_order_type         VARCHAR(20),
    IN p_scheduled_time     DATETIME,
    IN p_party_size         INT,
    IN p_special_instructions VARCHAR(255),
    IN p_item_list          TEXT,
    IN p_delivery_fee       DECIMAL(6,2),
    IN p_tip                DECIMAL(6,2),
    IN p_payment_method     VARCHAR(20),
    IN p_card_last_four     CHAR(4),
    OUT p_order_id          INT
)
BEGIN
    DECLARE v_subtotal      DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_tax           DECIMAL(8,2)  DEFAULT 0.00;
    DECLARE v_total         DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_status        VARCHAR(20);
    DECLARE v_item_str      TEXT;
    DECLARE v_one_item      VARCHAR(100);
    DECLARE v_menu_item_id  INT;
    DECLARE v_qty           INT;
    DECLARE v_unit_price    DECIMAL(8,2);
    DECLARE v_comma_pos     INT;
    DECLARE v_colon_pos1    INT;
    DECLARE v_colon_pos2    INT;

    -- Use a handler to rollback on any error
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'place_order failed — transaction rolled back.';
    END;

    START TRANSACTION;

    -- ---- STEP 1: Validate slot for Scheduled / Party orders ----
    IF p_order_type IN ('Scheduled', 'Party') THEN
        IF p_scheduled_time IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Scheduled/Party orders require a scheduled_time.';
        END IF;

        IF is_slot_available(p_restaurant_id, p_scheduled_time) = FALSE THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Restaurant is not available at the requested time.';
        END IF;
    END IF;

    IF p_order_type = 'Party' AND (p_party_size IS NULL OR p_party_size <= 0) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Party orders require a valid party_size.';
    END IF;

    -- Determine initial status
    IF p_order_type = 'Scheduled' OR p_order_type = 'Party' THEN
        SET v_status = 'Scheduled';
    ELSE
        SET v_status = 'Confirmed';
    END IF;

    -- ---- STEP 2: Parse item list and calculate subtotal ----
    -- Format: 'menu_item_id:qty:unit_price,menu_item_id:qty:unit_price,...'
    SET v_item_str = p_item_list;

    -- We'll use a temp table to hold parsed items
    DROP TEMPORARY TABLE IF EXISTS tmp_order_items;
    CREATE TEMPORARY TABLE tmp_order_items (
        menu_item_id    INT,
        quantity        INT,
        unit_price      DECIMAL(8,2)
    );

    -- Parse the comma-separated string
    parse_loop: WHILE LENGTH(v_item_str) > 0 DO
        -- Find next comma
        SET v_comma_pos = LOCATE(',', v_item_str);
        IF v_comma_pos = 0 THEN
            SET v_one_item = v_item_str;
            SET v_item_str = '';
        ELSE
            SET v_one_item = LEFT(v_item_str, v_comma_pos - 1);
            SET v_item_str = SUBSTRING(v_item_str, v_comma_pos + 1);
        END IF;

        -- Parse 'id:qty:price'
        SET v_colon_pos1 = LOCATE(':', v_one_item);
        SET v_colon_pos2 = LOCATE(':', v_one_item, v_colon_pos1 + 1);

        SET v_menu_item_id = CAST(LEFT(v_one_item, v_colon_pos1 - 1) AS UNSIGNED);
        SET v_qty          = CAST(SUBSTRING(v_one_item, v_colon_pos1 + 1, v_colon_pos2 - v_colon_pos1 - 1) AS UNSIGNED);
        SET v_unit_price   = CAST(SUBSTRING(v_one_item, v_colon_pos2 + 1) AS DECIMAL(8,2));

        INSERT INTO tmp_order_items VALUES (v_menu_item_id, v_qty, v_unit_price);

        SET v_subtotal = v_subtotal + (v_qty * v_unit_price);
    END WHILE;

    -- ---- STEP 3: Calculate tax and total ----
    SET v_tax   = ROUND(v_subtotal * 0.075, 2);  -- 7.5% MA tax
    SET v_total = v_subtotal + p_delivery_fee + v_tax + p_tip;

    -- ---- STEP 4: Insert Order ----
    INSERT INTO `Order` (
        customer_id, restaurant_id, address_id, order_type,
        status, scheduled_time, party_size, special_instructions,
        subtotal, delivery_fee, tax, tip, total_amount
    ) VALUES (
        p_customer_id, p_restaurant_id, p_address_id, p_order_type,
        v_status, p_scheduled_time, p_party_size, p_special_instructions,
        v_subtotal, p_delivery_fee, v_tax, p_tip, v_total
    );

    SET p_order_id = LAST_INSERT_ID();

    -- ---- STEP 5: Insert Order_Items from temp table ----
    INSERT INTO Order_Item (order_id, menu_item_id, quantity, unit_price)
    SELECT p_order_id, menu_item_id, quantity, unit_price
    FROM tmp_order_items;

    DROP TEMPORARY TABLE IF EXISTS tmp_order_items;

    -- ---- STEP 6: Insert Billing ----
    INSERT INTO Billing (
        order_id, payment_method, card_last_four,
        billing_amount, payment_status
    ) VALUES (
        p_order_id, p_payment_method, p_card_last_four,
        v_total, 'Pending'
    );

    COMMIT;
END //

DELIMITER ;


-- ============================================================
-- 3. STORED PROCEDURE: cancel_order
-- ============================================================
-- Cancels an order, but ONLY if its status is 'Scheduled' or
-- 'Confirmed'. Once it's 'Preparing' or beyond, it's too late.
--
-- Also updates Billing to 'Refunded' and records the refund.
--
-- Example call:
--   CALL cancel_order(3, @result_msg);
--   SELECT @result_msg;
-- ============================================================

DROP PROCEDURE IF EXISTS cancel_order;

DELIMITER //

CREATE PROCEDURE cancel_order(
    IN  p_order_id      INT,
    OUT p_result_msg    VARCHAR(255)
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE v_billing_amount DECIMAL(10,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_msg = 'Error: cancellation failed — transaction rolled back.';
    END;

    START TRANSACTION;

    -- Check current order status (lock the row)
    SELECT status INTO v_current_status
    FROM `Order`
    WHERE order_id = p_order_id
    FOR UPDATE;

    -- Order not found
    IF v_current_status IS NULL THEN
        SET p_result_msg = CONCAT('Error: Order #', p_order_id, ' not found.');
        ROLLBACK;

    -- Can only cancel if Scheduled or Confirmed
    ELSEIF v_current_status NOT IN ('Scheduled', 'Confirmed') THEN
        SET p_result_msg = CONCAT('Error: Order #', p_order_id,
            ' is already "', v_current_status, '" — cannot cancel.');
        ROLLBACK;

    ELSE
        -- Update order status
        UPDATE `Order`
        SET status = 'Cancelled'
        WHERE order_id = p_order_id;

        -- Process refund in Billing
        SELECT billing_amount INTO v_billing_amount
        FROM Billing
        WHERE order_id = p_order_id;

        UPDATE Billing
        SET payment_status = 'Refunded',
            refund_date    = NOW(),
            refund_amount  = v_billing_amount
        WHERE order_id = p_order_id;

        SET p_result_msg = CONCAT('Success: Order #', p_order_id,
            ' cancelled and $', v_billing_amount, ' refunded.');
        COMMIT;
    END IF;
END //

DELIMITER ;


-- ============================================================
-- 4. MYSQL EVENT: auto_confirm_scheduled_orders
-- ============================================================
-- Runs every 5 minutes. Finds orders with:
--   status = 'Scheduled'
--   scheduled_time is within the next 60 minutes
-- and transitions them to 'Confirmed'.
--
-- This simulates the restaurant "accepting" the order
-- roughly an hour before the delivery slot.
--
-- IMPORTANT: MySQL Event Scheduler must be ON.
--   SET GLOBAL event_scheduler = ON;
-- ============================================================

-- Make sure event scheduler is enabled
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS auto_confirm_scheduled_orders;

DELIMITER //

CREATE EVENT auto_confirm_scheduled_orders
ON SCHEDULE EVERY 5 MINUTE
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE `Order`
    SET status = 'Confirmed'
    WHERE status = 'Scheduled'
      AND scheduled_time IS NOT NULL
      AND scheduled_time <= DATE_ADD(NOW(), INTERVAL 60 MINUTE)
      AND scheduled_time > NOW();  -- don't confirm orders in the past
END //

DELIMITER ;


-- ============================================================
-- QUICK TESTS (run these to verify everything works)
-- ============================================================

-- Test 1: is_slot_available
-- (Will return FALSE unless Harini's Restaurant_Hours has data.
--  Insert a test row first.)
INSERT IGNORE INTO Restaurant_Hours (restaurant_id, day_of_week, opening_time, closing_time, is_closed)
VALUES (1, 'Sunday', '10:00:00', '22:00:00', FALSE);

SELECT is_slot_available(1, '2026-04-12 18:30:00') AS should_be_true;
SELECT is_slot_available(1, '2026-04-12 23:30:00') AS should_be_false;

-- Test 2: place_order
CALL place_order(
    2,                          -- customer_id (Bob)
    1,                          -- restaurant_id (Pad Thai Palace)
    3,                          -- address_id (Bob's home)
    'Scheduled',                -- order_type
    '2026-04-12 19:00:00',     -- scheduled_time (Sunday evening)
    NULL,                       -- party_size (not a party)
    'Please include chopsticks', -- special_instructions
    '1:2:12.99,2:1:14.50',     -- items: 2x Pad Thai + 1x Green Curry
    3.99,                       -- delivery_fee
    5.00,                       -- tip
    'Credit Card',              -- payment_method
    '9999',                     -- card_last_four
    @new_order_id
);
SELECT @new_order_id AS new_order_id;
SELECT * FROM `Order` WHERE order_id = @new_order_id;
SELECT * FROM Order_Item WHERE order_id = @new_order_id;
SELECT * FROM Billing WHERE order_id = @new_order_id;

-- Test 3: cancel_order
CALL cancel_order(@new_order_id, @cancel_msg);
SELECT @cancel_msg;
SELECT status FROM `Order` WHERE order_id = @new_order_id;
SELECT payment_status, refund_amount FROM Billing WHERE order_id = @new_order_id;

-- ============================================================
-- TRIGGER: validate_order_item_restaurant
-- ============================================================
-- Fires BEFORE inserting into Order_Item.
-- Checks that the menu_item being added belongs to the
-- same restaurant as the order.
--
-- Without this trigger, someone could place an order at
-- Restaurant A but sneak in a menu item from Restaurant B.
-- This trigger prevents that.
--
-- Example:
--   Order #1 is for restaurant_id = 1 (Pad Thai Palace)
--   Menu_Item #3 belongs to restaurant_id = 2 (Burger Barn)
--   → Trigger REJECTS the insert with an error message.
-- ============================================================

USE grabhub;

DROP TRIGGER IF EXISTS validate_order_item_restaurant;

DELIMITER //

CREATE TRIGGER validate_order_item_restaurant
BEFORE INSERT ON Order_Item
FOR EACH ROW
BEGIN
    DECLARE v_order_restaurant_id INT;
    DECLARE v_item_restaurant_id INT;

    -- Get the restaurant for this order
    SELECT restaurant_id INTO v_order_restaurant_id
    FROM `Order`
    WHERE order_id = NEW.order_id;

    -- Get the restaurant for this menu item
    SELECT restaurant_id INTO v_item_restaurant_id
    FROM Restaurant_Menu_Item
    WHERE item_id = NEW.item_id;

    -- If they don't match, reject the insert
    IF v_order_restaurant_id != v_item_restaurant_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot add item: menu item does not belong to this order''s restaurant.';
    END IF;
END //

DELIMITER ;


-- ============================================================
-- TEST: Verify the trigger works
-- ============================================================

-- This should SUCCEED (Order 1 is restaurant 1, Menu_Item 1 is restaurant 1)
 INSERT INTO Order_Item (order_id, menu_item_id, quantity, unit_price)
 VALUES (1, 1, 1, 12.99);

-- This should FAIL (Order 1 is restaurant 1, Menu_Item 3 is restaurant 2)
 INSERT INTO Order_Item (order_id, menu_item_id, quantity, unit_price)
 VALUES (1, 3, 1, 9.99);



-- ============================================================
-- GrabHub — Harini's Database Programming Objects
-- ============================================================

USE grabhub;

-- ============================================================
-- 1. FUNCTION: get_restaurant_cuisine
-- ============================================================
-- Returns a comma-separated list of cuisines offered by a
-- restaurant based on its menu items.
--
-- Assumption:
-- Menu_Item has cuisine_id (your design)
-- ============================================================

DROP FUNCTION IF EXISTS get_restaurant_cuisine;

DELIMITER //

CREATE FUNCTION get_restaurant_cuisine(p_restaurant_id INT)
RETURNS TEXT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_cuisines TEXT;

    SELECT GROUP_CONCAT(DISTINCT c.cuisine_name SEPARATOR ', ')
    INTO v_cuisines
    FROM Menu_Item m
    JOIN Cuisine c ON m.cuisine_id = c.cuisine_id
    WHERE m.restaurant_id = p_restaurant_id;

    RETURN v_cuisines;
END //

DELIMITER ;

-- ============================================================
-- 2. STORED PROCEDURE: assign_delivery_partner
-- ============================================================
-- Assigns the first available delivery partner to an order
-- and creates a delivery record.
-- ============================================================

DROP PROCEDURE IF EXISTS assign_delivery_partner;

DELIMITER //

CREATE PROCEDURE assign_delivery_partner(IN p_order_id INT)
BEGIN
    DECLARE v_partner_id INT;

    -- Find available partner
    SELECT partner_id INTO v_partner_id
    FROM Delivery_Partner
    WHERE availability_status = 'Online'
    LIMIT 1;

    IF v_partner_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No available delivery partners.';
    END IF;

    -- Create delivery record
    INSERT INTO Delivery (
        order_id,
        partner_id,
        delivery_status
    )
    VALUES (
        p_order_id,
        v_partner_id,
        'Assigned'
    );

END //

DELIMITER ;

-- ============================================================
-- 3. TRIGGER: update_restaurant_avg_rating
-- ============================================================
-- Updates Restaurant.average_rating whenever a new review is added
-- ============================================================

DROP TRIGGER IF EXISTS update_restaurant_avg_rating;

DELIMITER //

CREATE TRIGGER update_restaurant_avg_rating
AFTER INSERT ON Review_Rating
FOR EACH ROW
BEGIN
    UPDATE Restaurant
    SET average_rating = (
        SELECT AVG(overall_rating)
        FROM Review_Rating
        WHERE restaurant_id = NEW.restaurant_id
    )
    WHERE restaurant_id = NEW.restaurant_id;
END //

DELIMITER ;

-- ============================================================
-- 4. TRIGGER: party_order_heads_up
-- ============================================================
-- Fires when a party order is created
-- Used to simulate notifying restaurant for prep planning
--
-- For simplicity: we log into a helper table
-- ============================================================

-- Helper table for logging party alerts
CREATE TABLE IF NOT EXISTS Party_Order_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    restaurant_id INT,
    guest_count INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS party_order_heads_up;

DELIMITER //

CREATE TRIGGER party_order_heads_up
AFTER INSERT ON `Order`
FOR EACH ROW
BEGIN
    IF NEW.order_type = 'Party' THEN
        INSERT INTO Party_Order_Log (
            order_id,
            restaurant_id,
            guest_count
        )
        VALUES (
            NEW.order_id,
            NEW.restaurant_id,
            NEW.party_size
        );
    END IF;
END //

DELIMITER ;


DROP TRIGGER IF EXISTS validate_profile_axis;

DELIMITER //

-- axis column was removed from Customer_Profile (BCNF fix).
-- This trigger now enforces the one-category-per-axis-per-customer rule:
-- a customer cannot be assigned two categories that share the same axis.
CREATE TRIGGER validate_profile_axis
BEFORE INSERT ON Customer_Profile
FOR EACH ROW
BEGIN
    DECLARE v_new_axis  ENUM('Cuisine','Spice','Health');
    DECLARE v_axis_count INT DEFAULT 0;

    -- Resolve the axis of the incoming category
    SELECT axis INTO v_new_axis
    FROM Profile_Category
    WHERE category_id = NEW.category_id;

    -- Check whether this customer already has a category on the same axis
    SELECT COUNT(*) INTO v_axis_count
    FROM Customer_Profile cp
    JOIN Profile_Category pc ON cp.category_id = pc.category_id
    WHERE cp.customer_id = NEW.customer_id
      AND pc.axis = v_new_axis;

    IF v_axis_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Customer already has a profile category assigned for this axis.';
    END IF;
END //

DELIMITER ;