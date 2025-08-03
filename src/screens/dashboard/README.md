# Dashboard Screens

## ApplyCVScreen

The ApplyCVScreen is a comprehensive screen that displays all jobs that the current user has applied for. It's based on the web components from the JobFinder frontend and adapted for React Native.

### Features

- **Job List Display**: Shows all applied jobs grouped by job ID
- **Search Functionality**: Filter jobs by title, description, or location
- **Status Indicators**: Visual status badges for application status (Pending, Interview, Rejected, Accepted)
- **Pagination**: Navigate through multiple pages of applied jobs
- **Pull to Refresh**: Refresh the job list by pulling down
- **Navigation to Detail**: Tap "X Applied" to view detailed applications for a specific job

### Navigation

- Navigate to job details by tapping on a job card
- View application details by tapping the "X Applied" button (navigates to ApplyCVDetailScreen)

### API Integration

The screen integrates with:
- `applicationService.getAppliedJobs()` - Fetch user's applied jobs
- `JobService.getJobById()` - Get detailed job information
- Uses authentication tokens for API calls

### State Management

- `applications`: Array of all user applications
- `filteredJobs`: Filtered and grouped job applications
- `searchTerm`: Current search query
- `currentPage`: Current pagination page
- `loading`: Loading state indicator
- `error`: Error state management

### Styling

The screen uses a consistent design system with:
- Card-based layout for job items
- Status badges with color coding
- Modern pagination controls
- Consistent spacing and typography

### Usage

Access this screen from the Dashboard by tapping "Applied Jobs!" in the menu. The screen will automatically load the user's applied jobs and display them in a paginated list.

## ApplyCVDetailScreen

The ApplyCVDetailScreen shows detailed information about all applications for a specific job. It's based on the AppliedListByJob.jsx web component.

### Features

- **Job Information**: Displays job title, company, and location
- **Application List**: Shows all applications for the selected job
- **Cover Letter Display**: View cover letters with "View more" functionality
- **CV Viewing**: Access CV files for each application
- **Pagination**: Navigate through multiple applications
- **Pull to Refresh**: Refresh the application list
- **Modal Views**: View full cover letters in modal popups

### Navigation

- Receives `jobId` as a route parameter
- Shows detailed application information for the specific job
- Modal popup for viewing full cover letters

### API Integration

The screen integrates with:
- `applicationService.getAppliedJobs()` - Fetch user's applied jobs
- `JobService.getJobById()` - Get detailed job information
- Uses authentication tokens for API calls

### State Management

- `applications`: Array of applications for the specific job
- `jobDetails`: Detailed job information
- `currentPage`: Current pagination page
- `loading`: Loading state indicator
- `error`: Error state management

### Styling

The screen uses a consistent design system with:
- Table-like layout for application details
- Card-based design for job information
- Modern pagination controls
- Responsive modal dialogs
- Consistent spacing and typography

### Usage

This screen is accessed by tapping "X Applied" on any job card in the ApplyCVScreen. It requires a `jobId` parameter to function properly.

## FavoriteJobDetailScreen

The FavoriteJobDetailScreen displays all jobs that the current user has marked as favorites. It provides a comprehensive view of saved job opportunities with the ability to manage favorites directly from the list.

### Features

- **Favorite Jobs List**: Shows all jobs marked as favorites by the user
- **Job Management**: Remove jobs from favorites directly from the list
- **Pull to Refresh**: Refresh the favorite jobs list
- **Empty State**: Helpful message when no favorite jobs exist
- **Navigation to Job Details**: Tap on any job card to view full job details
- **Statistics Display**: Shows count of saved jobs
- **Error Handling**: Comprehensive error handling with retry functionality

### Navigation

- Navigate to job details by tapping on a job card
- Remove jobs from favorites by tapping the bookmark icon
- Navigate to JobList to browse more jobs when no favorites exist

### API Integration

The screen integrates with:
- `favoriteJobService.getUserFavorites()` - Fetch user's favorite jobs
- `favoriteJobService.removeFavoriteJob()` - Remove jobs from favorites
- `JobService.getJobs()` - Get all jobs for filtering
- `authService.getUserId()` - Get current user ID
- Uses authentication tokens for API calls

### State Management

- `favoriteJobs`: Array of favorite job objects
- `loading`: Loading state indicator
- `error`: Error state management
- `refreshing`: Pull-to-refresh state

### Key Functions

- `fetchFavoriteJobs()`: Load user's favorite jobs from API
- `handleRemoveFavorite()`: Remove a job from favorites
- `onRefresh()`: Refresh the favorite jobs list
- `renderJobCard()`: Render individual job cards

### Styling

The screen uses a consistent design system with:
- Card-based layout for job items (similar to JobListScreen)
- Bookmark icon for removing favorites
- Statistics card showing favorite count
- Empty state with call-to-action
- Consistent spacing and typography
- Pull-to-refresh functionality

### Usage

Access this screen from the Dashboard by tapping "Favorite Jobs" in the menu. The screen will automatically load the user's favorite jobs and display them in a scrollable list. Users can remove jobs from favorites by tapping the red bookmark icon on each job card.

### Error Handling

- Authentication errors: Shows login requirement message
- Network errors: Displays retry button
- Empty state: Shows helpful message with browse button
- API errors: Comprehensive error logging and user feedback 