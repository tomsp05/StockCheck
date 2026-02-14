StockSync: Multi-Site Inventory Manager

**StockSync** is a lightweight, web-based inventory management system designed for companies that need to track stock levels across multiple locations without the overhead of a massive database.

By using a **React** frontend for a snappy user experience and a **Java** backend for robust data handling, StockSync allows businesses to visualize stock distribution and identify where resources can be better utilized.

---

## 🛠 Tech Stack

* **Frontend:** React (State management, responsive UI)
* **Backend:** Java (Spring Boot recommended for REST API)
* **Storage:** Flat-file CSV (Simple, human-readable, and easy to export)

---

## 📋 User Stories & Roadmap

I've organized these into "Phases" so you can build a Minimum Viable Product (MVP) before adding complexity.

### Phase 1: The Foundation (Core Data & Setup)

* **Story:** As a Developer, I want to store inventory data in **CSV files** so that the data is easily readable by humans and portable to other software like Excel.
* **Story:** As a User, I want to view a dashboard of all current stock across **multiple sites** so I can see the "big picture" of company assets.

### Phase 2: The "Checkout" Interface (Efficiency)

* **Story:** As a Staff Member, I want an **"Easy-Out" interface** (mobile-friendly buttons or quick-entry fields) to quickly decrement stock as I use it, reducing the friction of data entry.
* **Story:** As a Staff Member, I want to see visual indicators (e.g., Red/Yellow labels) when stock is **running low** so I can trigger reorders.

### Phase 3: Administrative Control

* **Story:** As an Admin, I want to **manually update and override** stock levels via a secure dashboard to correct discrepancies or log new deliveries.
* **Story:** As an Admin, I want to **move stock** between sites in the system to reflect physical transfers, ensuring one site's surplus covers another's shortage.

### Phase 4: Data Portability

* **Story:** As a Manager, I want to **export the current state** of any site’s inventory as a clean CSV file for reporting and auditing purposes.

---

## 🏗 Project Structure (Proposed)

```text
├── backend-java/
│   ├── src/
│   └── data/           # Where your .csv files live
├── frontend-react/
│   ├── src/
│   └── public/
└── README.md

```

---

1. **Backend:** Navigate to `/backend-java`, run `./mvnw spring-boot:run`.
2. **Frontend:** Navigate to `/frontend-react`, run `npm install` and `npm start`.
3. **Data:** Ensure the `stock_levels.csv` file is present in the data directory.

---
