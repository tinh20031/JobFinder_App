# Services Documentation

## favoriteJobService.js

This service handles all favorite job operations including adding, removing, and checking favorite status.

### Functions

#### `getUserFavorites(userId)`
- **Purpose**: Get all favorite jobs for a specific user
- **Parameters**: `userId` (string/number) - The user's ID
- **Returns**: Promise with array of favorite jobs

#### `isJobFavorite(userId, jobId)`
- **Purpose**: Check if a specific job is favorited by a user
- **Parameters**: 
  - `userId` (string/number) - The user's ID
  - `jobId` (string/number) - The job's ID
- **Returns**: Promise with boolean indicating if job is favorited

#### `addFavoriteJob(userId, jobId)`
- **Purpose**: Add a job to user's favorites
- **Parameters**: 
  - `userId` (string/number) - The user's ID
  - `jobId` (string/number) - The job's ID
- **Returns**: Promise with success response

#### `removeFavoriteJob(userId, jobId)`
- **Purpose**: Remove a job from user's favorites
- **Parameters**: 
  - `userId` (string/number) - The user's ID
  - `jobId` (string/number) - The job's ID
- **Returns**: Promise with success response

### Usage in JobDetailScreen

The service is integrated into JobDetailScreen with the following features:

1. **Auto-check favorite status**: When the job loads, it automatically checks if the current job is favorited
2. **Toggle functionality**: Users can tap the bookmark button to add/remove from favorites
3. **Visual feedback**: The bookmark icon changes appearance based on favorite status
4. **Loading states**: Shows loading indicator during API calls
5. **Error handling**: Displays alerts for authentication and API errors

### API Endpoints

- Base URL: `${BASE_URL}/api/UserFavoriteJob`
- GET `/user/{userId}` - Get user's favorite jobs
- GET `/{userId}/{jobId}` - Check if job is favorited
- POST `/` - Add job to favorites
- DELETE `/{userId}/{jobId}` - Remove job from favorites

### Error Handling

The service includes comprehensive error handling:
- **404 responses** are treated as "not favorited" for `isJobFavorite`
- **204 responses** are handled as successful deletion without content
- **Network errors** are logged and handled gracefully
- **Authentication errors** are caught and reported
- **Response parsing** handles different response formats

### Debugging

The service includes detailed logging for debugging:
- API URLs being called
- Response status codes
- Response data structure
- Error details with stack traces 