# Stellar Student Hub - PostgreSQL Management System

A modern, responsive student management system built with Node.js, Express, and PostgreSQL. This application enables educational institutions to manage student records with a beautiful, intuitive interface.

## ✨ Features

- **Complete CRUD Operations**: Add, retrieve, update, and delete student records
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Real-time Search**: Instantly search through student records
- **Data Sorting**: Sort student data by various parameters
- **Grade Calculation**: Automatic grade assignment based on percentage scores
- **Data Validation**: Form validation to ensure data integrity
- **Interactive UI**: Smooth animations and intuitive user experience
- **Secure Database Operations**: Parameterized queries to prevent SQL injection
- **Student Photo Management**: Upload and display student profile photos
- **Dark/Light Theme Toggle**: UI theme customization for better user experience
- **Validation Tooltips**: Helpful guidance for form input fields
- **Responsive Buttons**: Loading states and visual feedback for user actions
- **Mobile-Optimized Interface**: Enhanced layout for smaller screens

## 📸 Screenshots

![](./public/images/ss%20(8).png)
![](./public/images/ss%20(7).png)
![](./public/images/ss%20(6).png)
![](./public/images/ss%20(5).png)
![](./public/images/ss%20(4).png)
![](./public/images/ss%20(3).png)
![](./public/images/ss%20(2).png)
![](./public/images/ss%20(1).png)

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: EJS templates, CSS3, JavaScript
- **Icons & Fonts**: Font Awesome, Google Fonts
- **File Handling**: Multer for image uploads

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- PostgreSQL (v12.x or higher)

## 🔧 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ishivam0980/stellar-student-hub.git
   cd stellar-student-hub
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Database Setup:

   - Create a PostgreSQL database named `crud`
   - Use the following query to create the required table:

   ```sql
   CREATE TABLE student (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     roll VARCHAR(20) UNIQUE NOT NULL,
     percentage NUMERIC(5,2) CHECK (percentage >= 0 AND percentage <= 100),
     photo_path TEXT
   );
   ```
4. Create a `.env` file in the root directory:

   ```
   DB_PASSWORD=YOUR_PASSWORD
   ```
5. Start the application:

   ```bash
   npm start
   ```

   For development with automatic restart:

   ```bash
   npm run dev
   ```
6. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

## 🧩 Project Structure

```
stellar-student-hub/
├── index.js            # Main application file with routes and DB connection
├── package.json        # Project dependencies and metadata
├── .env                # Environment variables (database password)
├── public/
│   ├── styles/         # CSS stylesheets
│   │   ├── form.css    # Styles for the main form page
│   │   ├── display.css # Styles for the display all students page
│   │   ├── show.css    # Styles for the single student view
│   │   └── 404.css     # Styles for the 404 error page
│   ├── images/         # Static images used in the application
│   └── uploads/        # Student photo uploads (created automatically)
├── views/
│   ├── form.ejs        # Main form template with add/update/delete options
│   ├── display.ejs     # Template for displaying all students
│   ├── show.ejs        # Template for showing a single student
│   └── 404.ejs         # 404 error page template
└── README.md           # Project documentation
```

## 🔍 Database Schema

The application uses a simple but effective PostgreSQL schema:

| Column     | Type         | Constraints                        | Description                  |
| ---------- | ------------ | ---------------------------------- | ---------------------------- |
| id         | SERIAL       | PRIMARY KEY                        | Auto-incrementing identifier |
| name       | VARCHAR(100) | NOT NULL                           | Student's full name          |
| roll       | VARCHAR(20)  | UNIQUE, NOT NULL                   | Unique roll/ID number        |
| percentage | NUMERIC(5,2) | CHECK (percentage >= 0 AND <= 100) | Academic score percentage    |
| photo_path | TEXT         | NULL                               | Path to student's photo      |

## 🚀 Usage

### Home Page Functionality

1. **Enroll New Scholar**: Add a new student with name, roll number, and percentage score
2. **Upload Student Photo**: Attach a profile picture to a student record
3. **Locate Student Profile**: Search for a specific student by roll number
4. **Modify Scholar Records**: Update an existing student's information
5. **Remove Student Record**: Delete a student record from the database
6. **View All Scholars**: Display a table of all students with sorting and search capabilities
7. **Toggle Theme**: Switch between light and dark themes for better viewing comfort

### Display Page Features

- Search by name or roll number
- Sort by roll number, name, or percentage
- View calculated letter grades
- See student photos in the table
- Quick actions: view, edit, or delete any student

## 🧪 API Endpoints

| Method | Endpoint      | Description                        |
| ------ | ------------- | ---------------------------------- |
| GET    | /             | Renders the main form page         |
| POST   | /submit       | Adds a new student record          |
| POST   | /upload-photo | Uploads a student photo            |
| POST   | /update       | Updates an existing student        |
| POST   | /show         | Shows a specific student           |
| POST   | /delete       | Deletes a student record and photo |
| GET    | /display      | Shows all students in a table      |

## 🔒 Security Considerations

- The application uses parameterized queries to prevent SQL injection attacks
- Input validation is performed on both client and server sides
- Error handling captures and logs database errors
- File uploads are validated for type and size
- Uploaded files are given unique names to prevent conflicts

## 📷 Photo Upload Features

- Supports common image formats: JPEG, PNG, GIF, WebP
- 5MB file size limit for uploads
- Automatic scaling and display in the UI
- Photos appear in both individual student profiles and the main table
- Proper cleanup of image files when deleting student records

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.