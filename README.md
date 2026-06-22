# LifeDrop Client

LifeDrop is a blood donation platform where users can register as donors, search donors by blood group and location, create donation requests, manage their own requests, and use role-based dashboard features.

This is the frontend/client side of the LifeDrop project. I built it with Next.js, Tailwind CSS, Better Auth, and a separate Express backend API.

## Live URL

Frontend Live Site:
https://lifedrop-client.vercel.app

Backend API:
https://lifedrop-server-two.vercel.app

## Project Purpose

The main purpose of this project is to make a blood donation management system where donors, volunteers, and admins can work from separate dashboards.

A normal visitor can search donors and see public pending donation requests. A logged-in donor can create and manage donation requests. Volunteers can manage public donation request statuses. Admins can manage users, roles, donation requests, and funding records.

## Key Features

* User signup and login using Better Auth
* Donor registration with avatar, blood group, district, and upazila
* Role-based dashboard for donor, volunteer, and admin
* JWT token saved on login/signup and sent with private API requests
* Search donors by blood group, district, and upazila
* Public donation request listing
* Create blood donation request
* View, edit, cancel, and update donation requests
* Admin can manage all users
* Admin can block/unblock users
* Admin can make users volunteer or admin
* Admin and volunteer can manage public donation requests
* Funding page with Stripe checkout flow
* Admin funding records page
* Profile page and password change option
* Responsive UI for desktop and mobile
* Production API connection with deployed backend

## User Roles

### Donor

* Can create donation requests
* Can view own donation requests
* Can edit pending requests
* Can cancel pending or in-progress requests
* Can give fund

### Volunteer

* Can view public donation requests
* Can update donation request status
* Can use dashboard features based on role permission

### Admin

* Can view platform statistics
* Can manage all users
* Can block/unblock users
* Can update user roles
* Can view and manage public donation requests
* Can view funding records

## Main Pages

* Home page
* Search Donors page
* Public Donation Requests page
* Login page
* Signup page
* Dashboard home
* My Profile
* Create Donation Request
* My Donation Requests
* All Users
* Public Request Management
* Funding page
* Admin Funding page
* Terms page
* Privacy page

## NPM Packages Used

Main packages used in this frontend:

* next
* react
* react-dom
* tailwindcss
* better-auth
* react-hot-toast
* react-icons
* @heroui/react

## Environment Variables

The frontend uses these environment variables:

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGO_DB_URI=
AUTH_DB_NAME=lifedrop_db
NEXT_PUBLIC_IMGBB_API_KEY=
NEXT_PUBLIC_BASE_URL=
```

For production, `NEXT_PUBLIC_BASE_URL` should be the backend live URL:

```env
NEXT_PUBLIC_BASE_URL=https://lifedrop-server-two.vercel.app
```

## Run Locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start production build:

```bash
npm start
```

## Deployment

The frontend is deployed on Vercel from GitHub.

Live frontend URL:

```txt
https://lifedrop-client.vercel.app
```

## Notes

Private dashboard APIs are protected using JWT token verification from the backend. After login or signup, the frontend receives a JWT token from the backend and sends it with protected API requests using the Authorization header.
