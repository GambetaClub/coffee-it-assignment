<p align="center">
  <img src="https://cdn.prod.website-files.com/649d8dd0bdb4fa79179fa0a3/65363125329742981f6a8bf6_clublogo-wit.svg" width="400" alt="Coffee IT" />
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


## Description

This project implements a NestJS API to manage a list of cities and retrieve their weather information using the OpenWeatherMap API, as per the Coffee IT assessment requirements. It includes features for storing data in a PostgreSQL database using Prisma, scheduled data fetching, and API documentation with Swagger.

## Core Features

*   **City Management:** CRUD operations for cities.
*   **Weather Data:** Fetching and storing current and historical weather data from OpenWeatherMap.
*   **Database:** PostgreSQL integration via Prisma ORM.
*   **Scheduled Tasks:** Hourly updates of weather data for stored cities using `@nestjs/schedule`.
*   **API Documentation:** Swagger UI for endpoint documentation (`@nestjs/swagger`).
*   **Data Transfer Objects:** Usage of Class DTOs with `@ApiProperty` decorators.

## Technology Stack

*   NestJS
*   TypeScript
*   Prisma
*   PostgreSQL
*   Docker / Docker Compose
*   @nestjs/swagger
*   @nestjs/schedule

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run with Docker

To run the application using Docker, ensure you have Docker and Docker Compose installed. Then, from the root of the project, run:

```bash
docker-compose up
```

This will build the Docker image (if it doesn't exist), start the NestJS application container, and launch a PostgreSQL instance for the database. The application will be accessible at `http://localhost:3000` (or the port configured in your application/Docker setup).

## API Endpoints

The following endpoints are implemented:

*   `GET /cities`: Returns a list of all cities (id and name) including their latest stored weather data.
*   `POST /cities`: Creates a new city, retrieves its current weather, and stores it. Returns `409 Conflict` if the city already exists.
*   `DELETE /cities/:id`: Deletes the specified city and its associated weather data.
*   `GET /cities/weather`: Returns an overview of all cities in the database and their last known weather data.
*   `GET /cities/:name/weather`: Returns the last known weather data for the city specified by name, along with its weather data for the last 7 days (historical data is built up over time). If the city is not found in the database, it attempts to retrieve real-time data from OpenWeatherMap (this data is not persistently stored unless the city is added via `POST /cities`).

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

*(The Mau deployment section is specific to NestJS examples and might not be directly applicable unless configured for this project)*

## Advanced Features (Optional)

To further showcase skills, consider implementing:

*   **Caching:** Redis caching layer for weather data (with hit/miss metrics and invalidation). (Implemented)
*   **Resilience:** Circuit breaker, retry mechanisms, and fallback strategies for OpenWeatherMap API calls. (Not Implemented)
*   **Advanced Testing:** End-to-end tests with a real database, load testing, and mocking external APIs. (Not Implemented)

## Resources

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
