# GrabHub: A Food Delivery Database System
## CS 5200 — Database Management Systems | Spring 2026
### Prof. Kathleen Durant

**Group Name:** GrabHub  
**Members:** Subamithuna, Harini

---

## Table of Contents

1. [README — Setup and Installation](#1-readme--setup-and-installation)
2. [Technical Specifications](#2-technical-specifications)
3. [Conceptual Design — UML Diagram](#3-conceptual-design--uml-diagram)
4. [Logical Design — Database Schema](#4-logical-design--database-schema)
5. [Final User Flow](#5-final-user-flow)
6. [Lessons Learned](#6-lessons-learned)
7. [Future Work](#7-future-work)

---

## 1. README — Setup and Installation

### Prerequisites

Install all of the following before proceeding:

| Software | Version | Download |
|---|---|---|
| Node.js (includes npm) | v18.x or higher | https://nodejs.org/en/download |
| MySQL Community Server | 8.0 or higher | https://dev.mysql.com/downloads/mysql |
| MySQL Workbench (optional, recommended) | 8.0 | https://dev.mysql.com/downloads/workbench |
| Python | 3.10 or higher | https://www.python.org/downloads |
| Git | Latest | https://git-scm.com/downloads |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/harini0-0/grabhub.git
cd grabhub
```

### Step 2 — Set Up the MySQL Database

1. Open MySQL Workbench or a MySQL client and connect as root.
2. Run the DDL file to create the schema:

```sql
SOURCE /path/to/grabhub/backend/sqlFiles/Merged_grabhub_ddl.sql;
```

3. Run the programming objects file (functions, procedures, triggers, events):

```sql
SOURCE /path/to/grabhub/backend/sqlFiles/Merged_grabhub_programmingObjects.sql;
```

4. Optionally, load sample data:

```sql
SOURCE /path/to/grabhub/backend/sqlFiles/grabhub_inserts.sql;
```

5. Confirm the MySQL Event Scheduler is enabled (required for the auto-confirm scheduled orders event):

```sql
SET GLOBAL event_scheduler = ON;
```

---

### Step 3 — Configure the Backend Environment

Navigate into the `backend/` directory and create a `.env` file:

```bash
cd backend
cp .env.example .env   # or create manually
```

Edit `.env` with your MySQL credentials:

```
PORT=5050
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grabhub
```

---

### Step 4 — Install Backend Dependencies

From the `backend/` directory:

```bash
npm install
```

Key packages installed:
- `express` — HTTP server and routing
- `mysql2` — MySQL client for Node.js
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — Environment variable loader
- `nodemon` — Development auto-restart

---

### Step 5 — Set Up the Python KNN Service

The KNN-based customer profiling module is written in Python. From the `backend/` directory:

```bash
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install numpy scikit-learn mysql-connector-python
```

---

### Step 6 — Install Frontend Dependencies

From the `frontend/` directory:

```bash
cd ../frontend
npm install
```

Key packages installed:
- `react` v19.x — UI framework
- `react-scripts` — Create React App build tooling
- `react-dom` — DOM rendering

---

### Step 7 — Run the Application

Open two terminal windows.

**Terminal 1 — Start the backend:**

```bash
cd backend
npx nodemon server.js        # or: node server.js
```

The backend server starts on `http://localhost:5050`.

**Terminal 2 — Start the frontend:**

```bash
cd frontend
npm start
```

The React app opens automatically in the browser at `http://localhost:3000`.

---

### Expected Port Assignments

| Service | Port |
|---|---|
| React Frontend | 3000 |
| Express Backend API | 5050 |
| MySQL Server | 3306 (default) |

---

## 2. Technical Specifications

### Technology Stack

| Component | Technology | Version |
|---|---|---|
| Frontend Language | JavaScript (JSX) | ES2022 |
| Frontend Framework | React | 19.2.5 |
| Frontend Styling | CSS (custom + theme.css) | — |
| Backend Language | JavaScript | Node.js 18.x |
| Backend Framework | Express.js | 4.x |
| Database | MySQL | 8.0 |
| Database Client | mysql2 | 3.x |
| ML / Profiling | Python + scikit-learn | Python 3.10 |
| Environment Config | dotenv | 16.x |
| Version Control | Git / GitHub | — |

---

### Backend Architecture

The backend follows a layered MVC pattern:

- **`server.js`** — Entry point; boots the Express application and listens on the configured port.
- **`app.js`** — Registers all route modules and middleware (CORS, JSON body parsing).
- **`config/db.js`** — Creates and exports the MySQL connection pool using `mysql2/promise`.
- **`routes/`** — One route file per domain entity (11 route files total), each mapping HTTP endpoints to controller functions.
- **`controllers/`** — Business logic layer. Each controller calls the database directly via the connection pool.
- **`services/knnService.js`** — Node.js wrapper that spawns `ml/knn.py` as a child process and parses its output to assign customer profile categories.

### Frontend Architecture

The frontend is a single-page React application organized as component modules:

- `LandingPage.js` — Entry screen with login and registration.
- `CustomerDashboard.js` — Top-level customer view after login.
- `RestaurantList.js` — Browsable list of restaurants with cuisine filtering.
- `MenuView.js` — Per-restaurant menu with add-to-cart functionality.
- `Orders.js` / `OrderHistory.js` — Order placement and past order lookup.
- `Billing.js` — Payment details and billing status.
- `DeliveryDashboard.js` — Delivery partner interface for status updates.
- `RestaurantAdmin.js` — Restaurant operator panel for menu and order management.
- `Profile.js` / `Recommendations.js` — Customer taste profile and KNN-driven suggestions.
- `Subscriptions.js` / `Favourites` / `Addresses.js` — Account management panels.

### Database Layer

- **DBMS:** MySQL 8.0
- **Schema:** 19 tables covering the full delivery workflow.
- **Programmable Objects:** 2 user-defined functions, 3 stored procedures, 4 triggers, 1 scheduled event.
- **Connection:** Connection pooling via `mysql2`; all SQL is executed server-side through the Express API. No raw SQL is exposed to the frontend.

---

## 3. Conceptual Design — UML Diagram

The entity-relationship diagram below describes the 18 primary entities and their associations. (Refer to the reverse-engineered diagram exported from MySQL Workbench for the graphical version.)

### Entity Relationships Summary

```
Customer ──(1:N)──> Customer_Address <──(N:1)── Address
Customer ──(1:N)──> Subscription
Customer ──(1:N)──> Order
Customer ──(1:N)──> Review_Rating
Customer ──(M:N via Customer_Profile)──> Profile_Category
Customer ──(1:N)──> Favourites

Restaurant ──(1:N)──> Restaurant_Hours
Restaurant ──(M:N via Restaurant_Menu_Item)──> Menu_Item
Restaurant ──(1:N)──> Order
Restaurant ──(1:N)──> Review_Rating

Menu_Item ──(N:1)──> Cuisine
Menu_Item ──(self-ref M:N via Combo_Meal)──> Menu_Item
Menu_Item ──(1:N)──> Favourites

Order ──(1:N)──> Order_Item ──(N:1)──> Menu_Item
Order ──(1:1)──> Delivery ──(N:1)──> Delivery_Partner
Order ──(1:1)──> Billing
Order ──(1:1)──> Review_Rating
```

### Cardinalities

| Relationship | Type | Notes |
|---|---|---|
| Customer — Address | M:N (via Customer_Address) | A customer can have multiple addresses; an address can be shared |
| Customer — Order | 1:N | One customer places many orders |
| Customer — Profile_Category | M:N (via Customer_Profile) | One category per axis (Cuisine, Spice, Health) per customer, enforced by trigger |
| Restaurant — Menu_Item | M:N (via Restaurant_Menu_Item) | Same dish can appear at multiple restaurants |
| Order — Order_Item | 1:N | Each order has one or more line items |
| Order — Delivery | 1:1 | Each order has exactly one delivery record |
| Order — Billing | 1:1 | Each order has exactly one billing record |
| Order — Review_Rating | 1:1 | At most one review per completed order |
| Menu_Item — Combo_Meal | Self-referencing M:N | A menu item can be the combo product or a component item |

---

## 4. Logical Design — Database Schema

The final submitted schema contains 19 tables. All foreign keys include explicit `ON DELETE` and `ON UPDATE` actions. The schema is in **3NF** for all tables. The `Customer_Profile` table was refactored to eliminate a BCNF violation (`category_id → axis` with `axis` in the PK).

### Table Descriptions

#### Customer
Stores registered users. `email` is a unique alternate key.
```
customer_id (PK), first_name NOT NULL, last_name NOT NULL,
email UNIQUE NOT NULL, phone NOT NULL, password_hash NOT NULL,
registration_date DEFAULT CURRENT_TIMESTAMP
```

#### Address
Delivery addresses. Shared across customers via Customer_Address.
```
address_id (PK), street_number, street_name, city, state, zipcode
```

#### Customer_Address *(junction)*
Links customers to their saved addresses. Tracks which is the default.
```
customer_id (FK → Customer, CASCADE), address_id (FK → Address, CASCADE),
is_default DEFAULT FALSE | PK (customer_id, address_id)
```

#### Restaurant
Restaurant profiles including contact, address, and operational settings.
```
restaurant_id (PK), restaurant_name, street_number, street_name,
unit_number, city, state, zipcode, phone, email, description,
delivery_fee, minimum_order, is_active DEFAULT TRUE,
average_rating, max_scheduled_orders_per_slot
```

#### Restaurant_Hours
Per-day operating hours per restaurant.
```
restaurant_id (FK → Restaurant, CASCADE), day_of_week ENUM(...),
opening_time, closing_time, is_closed | PK (restaurant_id, day_of_week)
```

#### Cuisine
Lookup table for cuisine types (Italian, Indian, Thai, etc.).
```
cuisine_id (PK), cuisine_name, description
```

#### Menu_Item
Individual food items with dietary and nutritional metadata.
```
item_id (PK), cuisine_id (FK → Cuisine, SET NULL),
item_name, description, category ENUM(...), price, preparation_time,
is_available DEFAULT TRUE, is_vegetarian, is_vegan, is_gluten_free,
spice_level, calories
```

#### Restaurant_Menu_Item *(junction)*
Associates menu items to the restaurants that offer them.
```
restaurant_id (FK → Restaurant, CASCADE), item_id (FK → Menu_Item, CASCADE)
| PK (restaurant_id, item_id)
```

#### `Order`
The central transactional entity. Tracks type, status, pricing, and scheduling.
```
order_id (PK), customer_id (FK → Customer, RESTRICT),
restaurant_id (FK → Restaurant, RESTRICT), address_id (FK → Address, RESTRICT),
order_type ENUM('On-Demand','Scheduled','Party'),
status ENUM('Scheduled','Confirmed','Preparing','Ready','Out for Delivery','Delivered','Cancelled'),
order_placed_at DEFAULT CURRENT_TIMESTAMP, scheduled_time, party_size,
subtotal, delivery_fee, tax, tip, total_amount
```

#### Order_Item
Line items for each order; captures the unit price at time of order for historical accuracy.
```
order_item_id (PK), order_id (FK → Order, CASCADE),
item_id (FK → Menu_Item, RESTRICT), quantity CHECK (> 0), unit_price
```

#### Delivery_Partner
Registered delivery drivers.
```
partner_id (PK), first_name, last_name, phone, email,
availability_status ENUM('Online','Offline'), rating, date_joined
```

#### Delivery
One-to-one with Order; tracks the physical delivery lifecycle.
```
delivery_id (PK), order_id UNIQUE (FK → Order, RESTRICT),
partner_id (FK → Delivery_Partner, SET NULL),
pickup_time, delivery_time, distance,
delivery_status ENUM('Assigned','Picked Up','In Transit','Delivered'), partner_tip
```

#### Billing
Payment record tied 1:1 to an order.
```
billing_id (PK), order_id UNIQUE (FK → Order, RESTRICT),
payment_method, card_last_four CHAR(4), billing_amount,
payment_status ENUM('Pending','Completed','Refunded','Failed')
```

#### Review_Rating
Post-delivery review submitted by the customer. At most one per order.
```
review_id (PK), order_id (FK → Order, RESTRICT),
customer_id (FK → Customer, RESTRICT), restaurant_id (FK → Restaurant, RESTRICT),
food_rating CHECK (1–5), delivery_rating CHECK (1–5), overall_rating CHECK (1–5),
comment, review_date DEFAULT CURRENT_TIMESTAMP, helpful_count DEFAULT 0
```

#### Favourites
Bookmarked restaurant+item combinations per customer.
```
favourite_id (PK), customer_id (FK → Customer, CASCADE),
restaurant_id (FK → Restaurant, CASCADE), item_id (FK → Menu_Item, CASCADE),
saved_at DEFAULT CURRENT_TIMESTAMP
```

#### Combo_Meal *(self-referencing)*
Defines composite menu items built from two or more component items.
```
combo_id (PK), combo_item_id (FK → Menu_Item, CASCADE),
component_item_id (FK → Menu_Item, CASCADE), quantity CHECK (> 0)
```

#### Profile_Category
Master list of classification labels per axis (Cuisine, Spice, Health).
```
category_id (PK), axis ENUM('Cuisine','Spice','Health') NOT NULL,
category_name VARCHAR(100) NOT NULL, description, threshold_rules JSON
| UNIQUE (axis, category_name)
```

#### Customer_Profile *(refactored — BCNF fix)*
Stores each customer's assigned profile category per axis. The `axis` column was removed after identifying a BCNF violation (`category_id → axis` with `axis` in the PK). Axis is now derived via JOIN to `Profile_Category`. The one-category-per-axis-per-customer rule is enforced by the `validate_profile_axis` trigger.
```
customer_id NOT NULL (FK → Customer, CASCADE),
category_id NOT NULL (FK → Profile_Category, CASCADE),
assigned_at DEFAULT CURRENT_TIMESTAMP | PK (customer_id, category_id)
```

#### Subscription
Customer premium membership records.
```
subscription_id (PK), customer_id (FK → Customer, CASCADE),
plan_type ENUM('Monthly','Annual'), start_date, end_date,
status ENUM('Active','Cancelled','Expired'), auto_renew, monthly_fee
```

#### Party_Order_Log *(helper table)*
Operational log written by the `party_order_heads_up` trigger when a party order is placed, simulating a restaurant notification.
```
log_id (PK), order_id, restaurant_id, guest_count,
created_at DEFAULT CURRENT_TIMESTAMP
```

---

### Programmable Objects

#### Functions

| Name | Purpose |
|---|---|
| `is_slot_available(restaurant_id, datetime)` | Returns TRUE if the restaurant is open at the requested datetime, used by `place_order` to validate scheduled order slots |
| `get_restaurant_cuisine(restaurant_id)` | Returns a comma-separated string of cuisine names offered by a restaurant, derived through its menu items |

#### Stored Procedures

| Name | Purpose |
|---|---|
| `place_order(...)` | Validates the time slot, inserts the Order, all Order_Item rows (parsed from a comma-separated string), and the Billing record in a single ACID transaction with full rollback on failure |
| `cancel_order(order_id)` | Cancels an order only if it is in `Scheduled` or `Confirmed` status; updates Billing to `Refunded` |
| `assign_delivery_partner(order_id)` | Finds the first available (`Online`) delivery partner and creates a Delivery record |

#### Triggers

| Name | Fires | Purpose |
|---|---|---|
| `validate_order_item_restaurant` | BEFORE INSERT on Order_Item | Rejects inserts where the menu item does not belong to the order's restaurant |
| `update_restaurant_avg_rating` | AFTER INSERT on Review_Rating | Recalculates and updates `Restaurant.average_rating` |
| `party_order_heads_up` | AFTER INSERT on Order | Inserts a log row into `Party_Order_Log` when a Party-type order is placed |
| `validate_profile_axis` | BEFORE INSERT on Customer_Profile | Prevents a customer from holding two profile categories on the same axis |

#### Events

| Name | Schedule | Purpose |
|---|---|---|
| `auto_confirm_scheduled_orders` | Every 5 minutes | Transitions `Scheduled` orders to `Confirmed` when they are within 60 minutes of their scheduled delivery time |

---

## 5. Final User Flow

### Customer Flow

1. **Register / Log In** — POST `/api/customers/register` or `/api/customers/login`. Returns customer session data.
2. **Manage Addresses** — GET/POST/DELETE `/api/addresses`. Add or remove saved delivery addresses; mark one as default.
3. **Browse Restaurants** — GET `/api/restaurants`. Filter by cuisine via query param `?cuisine=Thai`.
4. **View Menu** — GET `/api/menu/:restaurant_id`. Returns all available items for the restaurant with dietary flags and pricing.
5. **Add to Cart** — Handled client-side in React state.
6. **Place Order** — POST `/api/orders`. Calls the `place_order` stored procedure. Payload includes order type, scheduled time (if applicable), party size (if party), item list, and payment info.
   - On-demand orders receive `Confirmed` status immediately.
   - Scheduled and Party orders receive `Scheduled` status and auto-transition via the MySQL Event.
7. **Track Order** — GET `/api/orders/:order_id`. Returns current status in the lifecycle: Scheduled → Confirmed → Preparing → Ready → Out for Delivery → Delivered.
8. **Cancel Order** — PUT `/api/orders/:order_id/cancel`. Calls `cancel_order` procedure; valid only before `Preparing`.
9. **View Billing** — GET `/api/billing/:order_id`.
10. **Leave a Review** — POST `/api/reviews`. Submits food, delivery, and overall ratings (1–5) linked to a completed order.
11. **View Profile & Recommendations** — GET `/api/profile/:customer_id`. Displays KNN-assigned categories (Cuisine, Spice, Health). GET `/api/recommendations/:customer_id` returns personalized menu suggestions.
12. **Manage Favourites** — GET/POST/DELETE `/api/favourites`.
13. **Manage Subscription** — GET/POST `/api/subscriptions`.

### Restaurant Admin Flow

1. **Log In** — Via restaurant credentials.
2. **Manage Menu** — POST `/api/menu` to add items; PUT `/api/menu/:item_id` to update; DELETE to remove.
3. **View Operating Hours** — GET/PUT `/api/restaurants/:id/hours`.
4. **View Incoming Orders** — GET `/api/orders?restaurant_id=X`. Party orders display guest count for advance planning.
5. **Update Order Status** — PUT `/api/orders/:order_id/status`. Advances the status through the lifecycle.

### Delivery Partner Flow

1. **Log In** — Via partner credentials.
2. **Set Availability** — PUT `/api/delivery-partners/:id/status` with `{ availability_status: 'Online' }`.
3. **Receive Assignment** — `assign_delivery_partner` procedure creates the Delivery record automatically when an order is confirmed.
4. **Update Delivery Status** — PUT `/api/deliveries/:delivery_id/status`. Moves through: Assigned → Picked Up → In Transit → Delivered.

---

## 6. Lessons Learned

### Technical Expertise Gained

- **MySQL Stored Programming:** Writing production-quality stored procedures with multi-step transactions, rollback handlers, and string parsing (splitting a comma-separated item list inside a procedure) deepened our understanding of what the database layer can own versus what belongs in application code.
- **Trigger Chains and Limitations:** Implementing triggers for cross-table validation (e.g., `validate_order_item_restaurant`) revealed important constraints: MySQL triggers cannot call stored procedures, and a trigger that fires during a cascaded operation can produce unexpected locking behavior. The `validate_profile_axis` trigger required a full rewrite after a BCNF fix changed the table's primary key.
- **Normalization in Practice:** The 3NF and BCNF analysis of the live schema — not a textbook example — made it clear how easy it is to introduce transitive dependencies when merging two designers' work. The `Customer_Profile` BCNF violation (`category_id → axis` with `axis` in the PK) emerged only after systematic analysis and required coordinated changes to both the DDL and the trigger.
- **KNN in a Relational Context:** Integrating a Python scikit-learn KNN model with a relational database required designing a bridge layer (`knnService.js`) that spawns the Python process, feeds it order history from MySQL, and maps the output back to `Profile_Category` rows. This is a practical pattern for embedding ML into a RDBMS-backed system.
- **React + REST API Integration:** Connecting a React frontend to Express routes exposed the importance of consistent API response shapes. Several frontend components initially broke when the backend returned `null` for empty result sets rather than empty arrays; defensive null-checking was added across all components.

### Data Domain Insights

- **Price Snapshotting:** Storing `unit_price` in `Order_Item` rather than always reading from `Menu_Item.price` is essential for a food delivery system. Menu prices change; historical orders must reflect the price the customer actually paid. This was a deliberate and correct design choice, not redundancy.
- **Delivery Fee Duplication:** `Order.delivery_fee` duplicates `Restaurant.delivery_fee`, which was flagged as redundancy. The justification for keeping it is the same price-snapshotting argument: a restaurant's delivery fee can change, but a placed order must preserve the fee that was charged.
- **Party Order Scope:** The party order feature was intentionally kept as a flag on the `Order` entity rather than a separate entity. The `Party_Order_Log` table used for the trigger demonstration is a simulation of a notification system, not a permanent operational table.

### Time Management Insights

- Schema design and normalization took significantly more time than anticipated when merging two developers' independently designed schemas. Naming inconsistencies (`item_id` vs `menu_item_id` in column references), missing columns referenced in procedures (`special_instructions`, `refund_date`, `refund_amount`), and conflicting assumptions about cardinality all surfaced during integration and required rework.
- Front-to-back integration should be started earlier. Several backend API responses were not tested against the frontend until late in the project, resulting in a round of fixes specifically for null-safety and response shape consistency.

### Alternative Design Approaches Considered

- **Separate Zipcode Table:** A `Zipcode(zipcode, city, state)` table was considered to resolve the `zipcode → city, state` transitive dependency in `Address` and `Restaurant`. The team chose to leave this as a known, accepted denormalization to avoid adding a lookup table that would complicate every address-related query without operational benefit.

### Code Not Working / Known Issues

- **`cancel_order` procedure:** References `Billing.refund_date` and `Billing.refund_amount` in its UPDATE statement. Neither column exists in the `Billing` DDL. The procedure will throw a runtime error when a cancellation is attempted. The fix is to either add these two columns to `Billing` or remove the refund columns from the UPDATE. Hence the button or festure is not implemented so far yet.
- **`assign_delivery_partner` procedure:** Does not mark the assigned partner's `availability_status` as `'Offline'` after assignment. Consecutive calls will assign the same partner to multiple concurrent deliveries.
- **`update_restaurant_avg_rating` trigger:** Only fires on INSERT. If a review is updated or deleted, `Restaurant.average_rating` is not recalculated and becomes stale.

---

## 7. Future Work

### Planned Uses of the Database

- **Operational Analytics Dashboard:** The current schema captures sufficient data to support a restaurant-facing analytics view: average order value per time slot, most-ordered items by day of week, cancellation rate by order type, and delivery partner performance metrics. These can be driven entirely by the existing tables using aggregation queries.
- **Subscription Perks Enforcement:** The `Subscription` table exists but the application does not yet apply subscription benefits (free delivery, discounts) at order placement time. The `place_order` procedure should be extended to check `Subscription.status = 'Active'` for the customer and apply the relevant discount or waive the delivery fee.
- **Automated Subscription Expiry:** A MySQL Event similar to `auto_confirm_scheduled_orders` could run nightly to transition `Subscription.status` from `Active` to `Expired` when `end_date < CURDATE()` and `auto_renew = FALSE`.

## 8. BONUS — Implemented Additional Functionality

The following bonus features were completed as part of the project submission.

---

#### 1. Additional Frontend Functionality — React Web Application 

GrabHub ships a full React 19 single-page application with 14 components covering every user-facing workflow. The UI is role-aware and presents a distinct interface depending on who is logged in. Notable frontend work includes:

- **Customer Dashboard** — Tabbed interface with sub-views for restaurant browsing, order placement and history, saved addresses, billing, subscription management, and personalised recommendations.
- **RestaurantAdmin** — Operators can add new menu items (with all dietary metadata, spice level, price, and availability), browse and manage their existing menu, and monitor incoming orders including party order guest counts.
- **DeliveryDashboard** — Delivery partners see their assigned orders, can toggle availability status, and update delivery status through each stage of the lifecycle (Assigned → Picked Up → In Transit → Delivered).

The frontend communicates exclusively through the Express REST API; no SQL is written in the client.

---

#### 2. Multiple User Roles with Distinct Operations 

The application supports three fully separated user roles, each with a different set of permitted operations:

| Role | Key Operations |
|---|---|
| **Customer** | Register/login, browse restaurants, place on-demand/scheduled/party orders, cancel orders, pay, review, manage addresses, manage subscriptions, view profile and recommendations, save favourites |
| **Restaurant Admin** | View and manage own menu items, view incoming orders (with party order flags), update order status through preparation lifecycle |
| **Delivery Partner** | Set availability online/offline, receive delivery assignments, update delivery status through pickup and transit stages |

Each role's data access is scoped in the backend — a delivery partner endpoint, for example, only exposes delivery and partner records, not customer account or billing data.

---

#### 3. KNN Machine Learning Model Built from Order Data

A K-Nearest Neighbours classifier (`backend/ml/knn.py`) is trained on customer ordering behaviour to classify each customer across three taste dimensions:

- **Cuisine Preference** — e.g., "Spicy Enthusiast", "Health Conscious", "Balanced"
- **Spice Preference**
- **Health Preference**

**How it works:**

1. When a customer requests their profile, `profileController.js` queries the database for that customer's order history — aggregating `spice_level`, `calories`, and `cuisine_id` from `Order_Item → Menu_Item → Order`.
2. The aggregated feature vector is passed to `knnService.js`, which spawns `knn.py` as a child process via Node's `child_process.spawn`.
3. `knn.py` uses scikit-learn's `KNeighborsClassifier` (k=3) to classify the vector and returns the predicted category label as JSON.
4. The result is stored in `Customer_Profile` via the `validate_profile_axis` trigger-protected insert and surfaced to the `Recommendations` component.

**Libraries used:** `scikit-learn`, `numpy`, `mysql-connector-python` (Python); the Node bridge uses no additional packages beyond the standard `child_process` module.

---

#### 4. Complex User Operation to Database Operation Translation 

The **place_order** workflow is the most operationally complex feature in the system. A single "Place Order" button click from the customer triggers the following database operations inside a single ACID transaction managed by the `place_order` stored procedure:

1. **Slot validation** — Calls `is_slot_available()` to verify the restaurant is open at the requested datetime by querying `Restaurant_Hours`.
2. **Item string parsing** — Parses a comma-separated item list (`item_id:qty:price,...`) using a `WHILE` loop inside the procedure, storing tokens in a temporary table.
3. **Subtotal calculation** — Iterates the temp table to compute the running subtotal.
4. **Tax calculation** — Applies 7.5% Massachusetts tax rate to the subtotal.
5. **Order insert** — Writes the `Order` row with computed subtotal, tax, and total.
6. **Order_Item inserts** — Bulk inserts all line items from the temp table into `Order_Item`.
7. **Billing insert** — Creates the `Billing` record with `Pending` status.
8. **Party log** — The `party_order_heads_up` AFTER INSERT trigger fires automatically if the order type is `Party`, writing to `Party_Order_Log`.
9. **Full rollback** — An `EXIT HANDLER FOR SQLEXCEPTION` rolls back all of the above if any step fails.

This single user action spans 4 tables, 1 stored function call, 1 temporary table, 1 trigger, and a full transaction — entirely server-side with no multi-step round trips from the application layer.
