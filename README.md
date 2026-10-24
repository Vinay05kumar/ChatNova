# CartNova Marketplace

# Build CartNova — Complete E-Commerce Frontend

Build **CartNova**, a complete, frontend-only e-commerce website using Angular 21. React + Vite is acceptable only if Angular 21 is not feasible.

You must implement both the technical requirements and the frontend design requirements below. The technical requirements define how the application works, while the design requirements define how it looks and feels.

# Part 1: Technical and Backend Integration Requirements

## 1. Application Architecture

- Build a frontend-only application.

- Do NOT use Supabase, Firebase, any database, or any backend implementation.

- Remove all mock product data and mock inventory.

- All product, stock, and order data must come from the Django REST API.

- Configure `apiBaseUrl` through the environment file.

- Default API base URL: `https://localhost:8002/api/storefront`.

## 2. Required Pages

Implement the following pages with proper routing:

- Product listing page

- Product details page: `/product/:sku`

- Shopping cart page

- Checkout page

- Order success page: `/order/:ref`

## 3. API Integration

### Get all products

`GET /products/`

Expected response:

`[{sku, name, description, category, price, currency, stock, image_url}]`

### Get a specific product

`GET /products/{sku}/`

### Get current stock

`GET /stock/?skus=A,B`

Expected response:

`{"A":12,"B":0}`

### Create an order

`POST /orders/`

Request body:

`{idempotency_key(UUID), customer{name,email,phone}, shipping_address{line1,city,state,postal_code} (optional), items[{sku,qty}], source{utm_source,utm_medium,utm_campaign,landing_url,referrer,first_seen_at}}`

Successful `200` or `201` response:

`{ref,status,currency,total,customer{name,email},items[{sku,name,qty,unit_price,line_total}],created_at}`

Handle these responses correctly:

- `409`: Insufficient stock, with `error: 'insufficient_stock'` and `items: [{sku,available}]`.

- `422`: Validation errors in `errors: {field: [msgs]}`.

- `429`: Too many requests.

- `5xx` and network failures: Display a friendly error and preserve the cart.

Use SKU as the product identifier everywhere. Never send product prices, line totals, or order totals in the order request. Prices and totals are for display only.

## 4. Inventory and Stock Behavior

- Display stock badges: `In stock`, `Only N left` when stock is five or fewer, and `Out of stock`.

- Disable Add to Cart when a product is out of stock.

- Cap the selected quantity at the available stock.

- Store the cart in localStorage using only `[{sku, qty}]`.

- Revalidate stock against fresh API data whenever the cart or checkout page loads.

- Poll `/stock/` every 8 seconds while the browser tab is visible.

- Refetch stock when the tab receives focus.

- Refetch `/products/` every 60 seconds.

- Make polling intervals configurable.

- When a `409` response occurs, identify the affected products, refresh stock, clamp the cart quantities, and explain the issue to the customer.

## 5. Checkout Behavior

- Required fields: customer name, email, and phone.

- Validate email format and convert the email to lowercase.

- Shipping address is optional.

- Generate one UUID idempotency key per checkout attempt and reuse it when retrying the same order.

- Disable the submit button while the order is being processed.

- Display field-specific errors for `422` responses.

- Display friendly messages for `429`, network errors, and server errors.

- Preserve the cart after a failed order.

- Clear the cart after a confirmed successful order.

## 6. Customer Source Tracking

At application startup, capture the following first-touch attribution data and save it in localStorage:

- `utm_source`

- `utm_medium`

- `utm_campaign`

- `landing_url`

- `referrer`

- `first_seen_at`

Never overwrite the original first-touch data. Send these values in the `source` object during checkout. If no campaign source is available, use `direct` for `utm_source`.

## 7. Order Success Page

After a successful order, display:

- Order reference

- Order status

- Purchased items and quantities

- Order total and currency

- Customer email

- Message: “A confirmation email is being sent to [email].”

Do not send emails from the frontend. The backend handles email delivery.

## 8. Configuration and Development

Provide the following configurable settings:

- `apiBaseUrl`

- `stockPollIntervalMs`

- `lowStockThreshold`

Run the frontend on fixed development port `4200` with HTTPS using:

- `localhost.pem`

- `localhost-key.pem`

Provide clear loading, empty, and error states throughout the application.

# Part 2: Frontend Design — Amazon-Inspired Shopping Experience

Design CartNova using Amazon's familiar e-commerce layout and shopping patterns as inspiration, while maintaining a distinct CartNova brand identity. The final result must look like a polished, realistic online shopping platform, not a basic starter template.

## 1. Header and Navigation

- Create a prominent header with the CartNova logo, a wide product search bar, account area, and shopping cart with a live item count.

- Add a secondary navigation bar for product categories and useful shopping links.

- Make search, navigation, and cart access convenient across the website.

- Use a responsive header suitable for desktop and mobile screens.

## 2. Homepage and Product Listing

- Build a professional product grid with consistent product cards.

- Display API-provided product images, names, prices, currency, and stock availability.

- Include functional search, category filtering, and sorting.

- Provide prominent Add to Cart buttons.

- Use clean card layouts, subtle borders, consistent spacing, and restrained hover effects.

- Make the shopping experience easy to browse, compare, and navigate.

- Do not fabricate products, discounts, ratings, reviews, or inventory.

## 3. Product Details Page

- Display a large product image and clear product information.

- Include product name, description, category, price, currency, and live stock status.

- Provide quantity selection and a prominent Add to Cart action.

- Disable purchasing for out-of-stock products.

- Use a professional marketplace-style layout with clear information hierarchy.

## 4. Shopping Cart Page

- Show product images, names, prices, quantities, and line totals.

- Allow quantity changes and item removal.

- Show the subtotal and a clear Proceed to Checkout action.

- Reflect stock changes and prevent customers from ordering quantities above available stock.

- Include an informative empty-cart state with a link to continue shopping.

## 5. Checkout and Order Confirmation Design

- Use a clean, trustworthy checkout layout.

- Separate customer information, optional shipping address, and order summary into clear sections.

- Show validation messages beside the relevant fields.

- Indicate order submission progress and prevent duplicate submissions.

- Create a polished order-success page that clearly communicates the order reference, items, total, and confirmation-email message.

## 6. Visual Style

Use a modern marketplace-inspired visual system:

- Dark navy or charcoal header.

- Light page background with white product cards.

- Restrained orange accents for primary shopping actions.

- Readable typography and consistent spacing.

- Clear buttons, professional icons, subtle shadows, and tasteful rounded corners.

- Smooth, restrained hover effects and transitions.

- Consistent colors and components across all pages.

Avoid excessive animations, oversized decorative sections, cluttered layouts, and unnecessary visual elements. The interface should be attractive, professional, and easy to use.

## 7. Responsive Design and Accessibility

- Support desktop, tablet, and mobile screen sizes.

- Make navigation, product grids, search, cart controls, and checkout forms responsive.

- Ensure keyboard accessibility, visible focus states, meaningful labels, and sufficient color contrast.

- Keep error messages, loading indicators, empty states, and stock warnings clear and understandable.

# Part 3: Final Implementation Requirements

1. Implement the complete application, including all required pages, routing, API services, models/types, state handling, and UI components.

2. Integrate every feature with the specified REST API. Do not replace API calls with mock data or local fake services.

3. Keep the cart in localStorage exactly as specified.

4. Make every visible button, link, search control, filter, quantity selector, and checkout action functional.

5. Handle loading, empty, stock changes, validation errors, failed requests, and successful orders.

6. Keep the API base URL and other specified configuration values environment-driven.

7. Preserve the fixed development port and HTTPS requirements.

8. Maintain clean, reusable, well-organized code without unnecessary complexity.

9. Do not implement a Django backend or create a database. The backend is provided separately.

10. Ensure the completed frontend is ready to integrate with the specified Django REST API.

**Expected result:** A fully functional CartNova e-commerce frontend with an Amazon-inspired shopping experience, real API integration, live stock updates, a working cart and checkout, and all the technical requirements implemented as specified.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/26cb100f-ee94-40f1-85ab-9a5243e40b1b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
