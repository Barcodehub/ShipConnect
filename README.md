# ShipConnect: Social Network Application

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Post Routes](#post-routes)
  - [User Routes](#user-routes)
  - [Comment Routes](#comment-routes)
  - [Like Routes](#like-routes)
  - [Friend Routes](#friend-routes)
  - [Story Routes](#story-routes)
  - [Reel Routes](#reel-routes)
  - [Community Routes](#community-routes)
  - [Event Routes](#event-routes)
  - [Chat Routes](#chat-routes)
  - [Admin Routes](#admin-routes)
- [Security Measures](#security-measures)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

ShipConnect is a social networking platform developed using Node.js and MongoDB. It features user authentication with diverse roles, multimedia content sharing, community and event management, social interactions (comments, likes, friend requests), real-time instant messaging, and a personalized news feed. The application emphasizes security, implementing two-factor authentication, protection against common web vulnerabilities, and privacy controls for user content.

## Technologies Used

  - Express: A Node.js framework for building web applications.
  - Mongoose: A library for modeling MongoDB objects in Node.js.
  - bcrypt: For hashing passwords.
  - jsonwebtoken: For JWT-based authentication.
  - passport and passport-google-oauth20: For Google authentication.
  - dotenv: For loading environment variables from a .env file.
  - express-session and connect-mongo: For handling sessions and storing them in MongoDB.
  - csurf: For CSRF protection.
  - cookie-parser: For handling cookies.
  - helmet: For enhancing HTTP header security.
  - express-rate-limit: For limiting the number of requests to prevent brute force attacks.
  - express-mongo-sanitize: For sanitizing MongoDB data and preventing injections.
  - xss-clean: For preventing XSS attacks by cleaning user inputs.
  - multer: For handling file uploads.
  - nodemailer: For sending emails.
  - qrcode: For generating QR codes.
  - socket.io and socket.io-client: For real-time functionalities like chat.
  - cloudinary: For handling multimedia file uploads and storage.
  - speakeasy: For two-factor authentication (2FA).

## API Endpoints

### Authentication Routes

  - GET /api/auth/csrf-token: Retrieve the CSRF token.  
  - POST /api/auth/signup: Register a new user.  
  - POST /api/auth/login: Login a user.  
  - POST /api/auth/logout: Logout a user.  
  - POST /api/auth/generateTwoFactor: Generate a two-factor authentication code. 
  - POST /api/auth/verifyTwoFactor: Verify a two-factor authentication code.  
  - GET /api/auth/google: Initiate Google OAuth login.  
  - GET /api/auth/google/callback: Handle Google OAuth callback.  
  - POST /api/auth/forgotpassword: Initiate password reset.  
  - PUT /api/auth/resetpassword/:resettoken -Reset a password.  
  - GET /api/auth/me: Retrieve the authenticated user's details.  


### Post Routes

- POST /api/posts/: Create a new post.
- GET /api/posts/: Retrieve all posts.
- POST /api/posts/:postId/share  -Share a specific post.
- GET /api/posts/news-feed: Retrieve a personalized news feed.
- PATCH /api/posts/:postId/privacy: -Update the privacy settings of a post.
- DELETE /api/posts/:postId -Delete a post.
- PUT /api/posts/:postId  -Update a post.

### User Routes

- GET /api/users/profile: Retrieve user profile information.
- POST /api/users/profile: Update user profile information.
- GET /api/users/search: Search for users.
- DELETE /api/users/account: Delete a user account.


### Comment Routes

- POST /api/comments/: Add a comment to a post.
- POST /api/comments/reel: Add a comment to a reel.
- GET /api/comments/:postId  -Retrieve all comments on a specific post.
- PUT /api/comments/:commentId  -Update a specific comment.
- DELETE /api/comments/:commentId  -Delete a specific comment.


### Like Routes
- POST /api/likes/post/:postId -Like a specific post.
- POST /api/likes/reel/:reelId -Like a specific reel.
- POST /api/likes/story/:storyId -Like a specific story.
- POST /api/likes/comment/:commentId -Like a specific comment.
- DELETE /api/likes/:type/:id Remove a like from a specific item

### Friend Routes
- POST /api/friends/request: Send a friend request.
- POST /api/friends/respond: Respond to a friend request.
- GET /api/friends/requests: Retrieve all friend requests.
- DELETE /api/friends/:friendId -Remove a friend.

### Story Routes

- POST /api/stories/: Create a new story.
- GET /api/stories/: Retrieve all stories.
- PUT /api/stories/:storyId -Update a story.
- DELETE /api/stories/:storyId -Delete a story.
- PUT /api/stories/:storyId/privacy  -Update the privacy settings of a story.


### Reel Routes

- POST /api/reels/: Create a new reel.
- GET /api/reels/: Retrieve all reels.
- PUT /api/reels/:reelId -Update a reel.
- DELETE /api/reels/:reelId -Delete a reel.
- PUT /api/reels/:reelId/privacy -Update the privacy settings of a reel.

### Community Routes

- POST /api/communities/: Create a new community.
- GET /api/communities/public: Retrieve all public communities.
- POST /api/communities/join/:id  -Join a community.
- POST /api/communities/approve/:id/:userId  -Approve a user to join a community.
- POST /api/communities/:id/moderators  -Add a moderator to a community.
- PUT /api/communities/:id -Update community details.
- DELETE /api/communities/:id -Delete a community.

### Event Routes

- POST /api/events/:communityId -Create a new event within a community.
- GET /api/events/:communityId -Retrieve all events within a community.
- PUT /api/events/:id -Update an event.
- DELETE /api/events/:id -Delete an event.
- GET /api/events/feed/:communityId  -Retrieve a community's event feed.

### Chat Routes

- GET /api/chat/messages: Retrieve all messages with a friend.
- POST /api/chat/messages/:friendId Send a message to a friend.

### Admin Routes

- PUT /api/admin/roles: Update user roles.

  To test the API endpoints, you can use Postman or any other API testing tool. Make sure to include the JWT token-login in the header for protected routes, and csrf-token.

  Example:

  Authorization: `<your_login_token>`
  X-CSRF-Token: `<your_csrf_token>`

### Security Measures

  ShipConnect incorporates several security measures to protect user data and ensure safe interactions:

  - Two-Factor Authentication (2FA): Users can enable 2FA for an added layer of security.
  - CSRF Protection: The application uses CSRF tokens to protect against cross-site request forgery.
  - XSS Protection: User inputs are sanitized to prevent cross-site scripting (XSS) attacks.
  - Password Hashing: User passwords are securely hashed using bcrypt before being stored.
  - Rate Limiting: The application limits the number of requests to protect against brute force attacks.
  - Data Sanitization: MongoDB data is sanitized to prevent injection attacks.

### Environment Variables

    The following environment variables are required to run ShipConnect:
    
    NODE_ENV: Application environment (development, production).
    PORT: Port number the application will run on.
    MONGO_URI: MongoDB connection string.
    JWT_SECRET: Secret key for JWT.
    GOOGLE_CLIENT_ID: Google OAuth client ID.
    GOOGLE_CLIENT_SECRET: Google OAuth client secret.
    EMAIL_SERVICE: Email service provider.
    EMAIL_USERNAME: Email service username.
    EMAIL_PASSWORD: Email service password.
    CLOUDINARY_CLOUD_NAME: Cloudinary cloud name.
    CLOUDINARY_API_KEY: Cloudinary API key.
    CLOUDINARY_API_SECRET: Cloudinary API secret.
    QR_CODE_SECRET: Secret key for generating QR codes.
    RATE_LIMIT_MAX: Maximum number of requests allowed within the defined time window
    RATE_LIMIT_WINDOW_MS: Time window in milliseconds for rate limiting (3600000 ms = 1 hour)
    BODY_LIMIT: Size limit for JSON and URL-encoded request bodies
    SESSION_MAX_AGE: Maximum session lifetime in milliseconds (604800000 ms = 7 days)

## Installation and Setup

1. Clone the repository:

   git clone https://github.com/Barcodehub/ShipConnect.git

3. Install dependencies:

   `npm install`

4. Create a .env file in the root directory.

    Add the environment variables as listed above.

5. Start the server:

    `npm start`


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License with an Attribution Clause. See the [LICENSE](./LICENSE.txt) file for details.
