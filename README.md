# Exam Hall Seating Allocation System

A responsive MERN application for managing students, exams, halls, and automatic seat allocation with hall-wise reports.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Axios, Zustand, React Hook Form
- Backend: Node.js, Express, JWT, Bcrypt, Mongoose
- Database: MongoDB

## Features

- Admin authentication
- Bulk upload for students, exams, and halls using CSV or Excel
- Automatic hall and seat allocation based on hall capacity
- Hall-wise seating charts and student seat numbers
- Downloadable CSV reports
- Printable seating layouts
- Responsive admin dashboard with off-white, blue, and orange theme

## Run locally

1. Copy `server/.env.example` to `server/.env`
2. Copy `client/.env.example` to `client/.env`
3. Install dependencies:
   - `npm install`
   - `npm run install:server`
   - `npm run install:client`
4. Start the app:
   - `npm run dev`

## Default flow

1. Register an admin account from the auth page
2. Upload students and exams in bulk or add them manually
3. Add exam halls with capacities
4. Generate seating for an exam
5. Download reports or print hall layouts

