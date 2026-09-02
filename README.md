# Mini Claims Register

A full-stack web application designed to track insurance claims, record multi-currency payments, calculate outstanding balances, and provide filtered analytics with currency-grouped totals.

## 🚀Live Demo & Repository

- Live URL: [Insert Vercel / Render / Railway Link Here]

- GitHub Repository: [Insert Repository Link Here]

## 🛠️Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (Frontend), Fly.io (Backend)

## 🏃‍♂️Running Local

To run this project on your local machine, follow these steps:

1. Clone the repository:

   ```bash
   git clone [Insert Repository Link Here]
   ```

2. Navigate to the project directory:

   ```bash
   cd mini-claims-register-web
    ```

3. Install dependencies for both frontend and backend:

   ```bash
   npm install
   ```

4. Set up environment variables for both frontend and backend. Create a `.env` file in the root of each directory and add the necessary variables:

    ```env
    DATABASE_URL=your_supabase_database_url
    NEXT_PUBLIC_API_URL=secret
    ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000` to view the application.

## 🧠 Architectural Decisions & Assumptions

Per the project brief, where ambiguities arose, the following decisions were made:

1. **Multi-Currency Handling:**
  
    - Assumption: Claims can be logged in any currency (e.g., USD, GHS, EUR), and payments against a claim can occasionally be made in a different currency.

    - To ensure accurate math in the totals row without requiring a live third-party FX rate API that could fail, the app utilizes a baseliine static exchange rate configuration table for cross-currency calculations, converting payment amounts back to the primary claim currency for balance deduction.

2. **Derived Status Logic:**

    - Reserved, not yet settled: Triggered when approved_amount is null or zero.
  
    - Settled, payment outstanding: Triggered when approved_amount is set AND (approved_amount - total_paid) > 0.
  
    - Settled and paid: Triggered when the calculated outstanding balance is less than or equal to zero.

3. **Totals Row Grouping:**

    - Because currency aggregation cannot be cleanly summed into a single flat number, the dashboard dynamically groups the footer totals row by currency code (e.g., displaying separate totals for USD, GHS, etc., based on the current active filter view).

## What I Would Do Differently With More Time

Given a production timeline with a larger scope, I would implement:

- User Authentication & Role-Based Access Control (RBAC): Restricting claim approval actions strictly to designated supervisor roles.

- Live FX Rate Integration: Connecting a real-time currency conversion API to handle fluctuating exchange rates dynamically.

- Automated Audit Logs: Tracking exactly who modified a claim approval amount or recorded a payment and when.

- Analytics Dashboard: Build a visual interface to provide a  deep interactive exploration, filtering, and historical intelligence of the business.
