🔐 Cyber Risk Assessment Platform
Overview

The Cyber Risk Assessment Platform is a full-stack web app built to help small businesses, nonprofits, and student organizations understand their cybersecurity posture.

A lot of smaller organizations rely heavily on digital tools but don’t have access to cybersecurity experts. This project was built to help bridge that gap by turning security concepts into something simple and easy to act on.

Users go through a guided questionnaire, receive a risk score, and get clear recommendations on what to improve first. The focus is on making cybersecurity easier to understand, especially for non-technical users.

This was a team project built by me and one other developer.

What We Built

With this project, we were able to:

Build a full end-to-end web application (frontend + backend)
Create a 25-question cybersecurity assessment covering key security areas
Break security into categories like:
Access control
Data protection
Network and device security
Incident response
Security awareness
Add user authentication (email/password + Google login)
Build a dashboard where users can view past assessments
Generate AI-written reports that explain results in plain language
Store assessments and reports so users can access them later
Connect everything to a MySQL database for persistent data storage
Key Features
Guided cybersecurity assessment flow
Risk score with simple explanations
Secure login and user accounts
Dashboard for tracking past assessments
AI-generated summary reports
Saved reports and history tracking
Downloadable assessment reports
Tech Stack
Layer	Technologies
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express
Database	MySQL
Authentication	JWT, Google OAuth
AI	OpenAI API
Reporting	PDF generation
Why We Built It

We wanted to build something that makes cybersecurity less overwhelming.

Instead of expecting users to understand technical security terms, the platform helps break things down into simple feedback and clear next steps. It’s meant to help organizations identify weak points and know exactly what to improve first.

At the same time, the project gave us hands-on experience working with full-stack development, authentication systems, databases, and AI integration in a real application.

Running the Project Locally
Install dependencies:
npm install
Set up environment variables in the backend .env file.
Run database setup (if required):
npm run migrate
Start the server:
npm start
Open the app in your browser.
Summary

The Cyber Risk Assessment Platform is a working full-stack application that helps users understand and improve their cybersecurity in a simple and practical way.

It combines a guided assessment, risk scoring, user accounts, and AI-generated reporting into one system designed for real-world usability.
