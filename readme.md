# Retail Pulse Image Processing Service

## Description
This service processes images collected from retail stores. It calculates the perimeter of each image (2 * [Height + Width]) and maintains job status for multiple concurrent jobs. The service handles downloading images, processing them, and providing status updates via an API.

## Features
- Submit jobs with multiple store visits and images
- Track job status (ongoing, completed, or failed)
- Process thousands of images concurrently
- Error handling for non-existent stores and failed image downloads
- Docker support for easy deployment

## Assumptions
1. The StoreMasterAssignment.csv file is properly formatted with columns: store_id, store_name, area_code
2. The service has internet access to download images from URLs
3. All image URLs are publicly accessible
4. Temporary file storage is allowed for processing images
5. The random delay (0.1 to 0.4 seconds) is sufficient to simulate GPU processing time

## Installation and Setup

### Prerequisites
- Node.js (v14 or later)
- npm
- Docker (optional)
- CSV file with store data (StoreMasterAssignment.csv)

### Setup Without Docker
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd retail-pulse-image-processor
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Place the StoreMasterAssignment.csv file in the data directory

4. Start the server
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. The server will start on port 3000 (or the port specified in the PORT environment variable)

### Setup With Docker
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd retail-pulse-image-processor
   ```

2. Place the StoreMasterAssignment.csv file in the data directory

3. Build and start with Docker Compose
   ```bash
   docker-compose up --build
   ```

4. The server will be accessible on port 3000

## API Usage

### 1. Submit Job
**Endpoint**: POST `/api/submit`

**Request Payload**:
```json
{
   "count": 2,
   "visits": [
      {
         "store_id": "S00339218",
         "image_url": [
            "https://www.gstatic.com/webp/gallery/2.jpg",
            "https://www.gstatic.com/webp/gallery/3.jpg"
         ],
         "visit_time": "2023-03-09T12:00:00"
      },
      {
         "store_id": "S01408764",
         "image_url": [
            "https://www.gstatic.com/webp/gallery/3.jpg"
         ],
         "visit_time": "2023-03-09T13:00:00"
      }
   ]
}
```

**Response** (201 CREATED):
```json
{
   "job_id": "1678385421234"
}
```

### 2. Get Job Status
**Endpoint**: GET `/api/status?jobid=1678385421234`

**Response for ongoing/completed job** (200 OK):
```json
{
   "status": "completed",
   "job_id": "1678385421234"
}
```

**Response for failed job** (200 OK):
```json
{
   "status": "failed",
   "job_id": "1678385421234",
   "error": [
      {
         "store_id": "S00339218",
         "error": "Store ID does not exist"
      }
   ]
}
```

## Work Environment
- **Computer**: MacBook Pro
- **Operating System**: macOS
- **IDE**: Visual Studio Code
- **Node.js Version**: 18.x
- **Libraries**:
  - express: Web server framework
  - axios: HTTP client for downloading images
  - csv-parser: For reading CSV store data
  - image-size: To determine image dimensions
  - fs-extra: Enhanced file system operations
  - body-parser: Request body parsing
  - nodemon: Development auto-reload

## Future Improvements

Given more time, I would implement the following improvements:

1. **Scalability**: Implement a distributed worker system using message queues (like RabbitMQ or Kafka) to distribute the image processing load across multiple instances.

2. **Database Integration**: Store job and result data in a database (MongoDB or PostgreSQL) rather than in-memory storage for persistence.

3. **Authentication and Authorization**: Add API key management or JWT authentication to secure endpoints.

4. **Caching**: Implement caching for previously processed images to improve performance.

5. **Metrics and Monitoring**: Add Prometheus metrics for monitoring job processing times, error rates, and system health.

6. **Unit and Integration Tests**: Add comprehensive test coverage for all components.

7. **Pagination and Filtering**: Add query parameters to the status API to support pagination and filtering of results.

8. **Rate Limiting**: Implement rate limiting to prevent abuse of the API.

9. **Better Error Handling**: Enhance error handling with more detailed error codes and messages.

10. **Documentation**: Generate API documentation using tools like Swagger or OpenAPI.
