# 🔐 Cyber Risk Assessment Platform

## Overview
The Cyber Risk Assessment Platform is a full-stack web application designed to help small businesses, nonprofits, and student organizations understand their cybersecurity risks in a simple and structured way.

Many smaller organizations rely on digital systems but do not have access to cybersecurity experts. This project was built to help close that gap by turning security concepts into clear, actionable insights.

This was a team project built by two developers.

---

## Problem
Most small organizations:
- Do not have cybersecurity staff  
- Struggle to understand technical security reports  
- Do not know which risks to prioritize  

As a result, important vulnerabilities often go unaddressed.

---

## Solution
This platform provides a guided assessment that:
- Evaluates cybersecurity practices through structured questions  
- Calculates a risk score based on responses  
- Highlights key security weaknesses  
- Uses AI to explain results in simple language  

---

## Features

- Guided 25-question cybersecurity assessment  
- Risk scoring system (Low → Critical)  
- Breakdown of security areas:
  - Access Control  
  - Data Protection  
  - Network & Device Security  
  - Incident Response  
  - Security Awareness  

- User authentication (email/password + Google OAuth)  
- Dashboard to view past assessments  
- AI-generated reports using ChatGPT  
- MySQL database for persistent storage  
- Downloadable and saved reports  

---

## How It Works
1. User completes cybersecurity assessment  
2. System calculates a risk score based on responses  
3. Results are categorized by severity  
4. ChatGPT generates a plain-language explanation  
5. User receives prioritized recommendations  

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | HTML, CSS, JavaScript |
| Backend    | Node.js, Express |
| Database   | MySQL |
| Auth       | JWT, Google OAuth |
| AI         | OpenAI API (ChatGPT) |
| Reports    | PDF generation |

---

## Setup Instructions

```bash
npm install

