# Data Model: Phase 2 Full-Stack Web Application

## User Entity
- **user_id**: String (Primary Key, UUID)
- **email**: String (Unique, Required)
- **email_verified**: Boolean (Default: false)
- **username**: String (Optional, Unique)
- **password_hash**: String (Required, for password authentication)
- **first_name**: String (Optional)
- **last_name**: String (Optional)
- **role**: String (Default: "user", Values: "user", "admin", "moderator")
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated)
- **last_login_at**: DateTime (Optional)
- **is_active**: Boolean (Default: true)

**Validation Rules**:
- Email must be valid email format
- Password must meet security requirements (min 8 chars, mixed case, number, special char)
- Username must be 3-30 chars, alphanumeric + underscore/hyphen only

## Todo Entity
- **todo_id**: String (Primary Key, UUID)
- **user_id**: String (Foreign Key to User, Required)
- **title**: String (Required, 1-200 chars)
- **description**: String (Optional, 0-1000 chars)
- **completed**: Boolean (Default: false)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated)
- **completed_at**: DateTime (Optional)

**Validation Rules**:
- Title must be 1-200 characters
- Description must be 0-1000 characters
- User ID must reference existing user
- Prevent users from accessing todos belonging to other users

## Session Entity
- **session_id**: String (Primary Key, UUID)
- **user_id**: String (Foreign Key to User, Required)
- **token_id**: String (Required, for JWT token tracking)
- **expires_at**: DateTime (Required)
- **created_at**: DateTime (Auto-generated)
- **last_accessed_at**: DateTime (Auto-generated)
- **user_agent**: String (Optional, for device tracking)
- **ip_address**: String (Optional, for security)

**Validation Rules**:
- Session must reference existing user
- Expiration date must be in the future
- Expired sessions should be cleaned up

## JWT Token Entity
- **token_id**: String (Primary Key, UUID)
- **user_id**: String (Foreign Key to User, Required)
- **type**: String (Required, Values: "access", "refresh")
- **expires_at**: DateTime (Required)
- **revoked**: Boolean (Default: false)
- **created_at**: DateTime (Auto-generated)

**Validation Rules**:
- Token must reference existing user
- Access tokens expire within 30 minutes
- Refresh tokens expire within 24 hours

## Entity Relationships
- User (1) : Todo (Many) - One user can have many todos
- User (1) : Session (Many) - One user can have multiple active sessions
- User (1) : JWT Token (Many) - One user can have multiple tokens

## Data Isolation Strategy
- All queries must be filtered by user_id
- Cross-user data access is prohibited
- Role-based permissions for admin access
- Proper validation at API level to prevent unauthorized access