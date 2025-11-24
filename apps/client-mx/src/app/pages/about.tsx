import { FC } from 'react';
import { Box, Container, Divider, Paper, Typography } from '@mui/material';

const About: FC = () => {
  return (
    <Container maxWidth={'md'}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          About Project
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1">
            This demo project showcases a monorepo architecture built with NX,
            containing multiple applications and shared libraries.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Applications
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
              <li>
                <strong>client-mx</strong> - A React-based client application
              </li>
              <li>
                <strong>server-nest</strong> - A NestJS server application
              </li>
              <li>
                <strong>auth-service</strong> - A dedicated NestJS microservice
                handling user authentication and authorization
              </li>
              <li>
                <strong>email-service</strong> - An event-driven NestJS
                microservice for email delivery, utilizing RabbitMQ message
                queue for asynchronous communication
              </li>
            </ul>
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Key Features & Implementation Highlights
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            User Experience
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                <strong>Product Catalog</strong> - Home page with sample product
                cards featuring infinite scroll with optimized performance
              </li>
              <li>
                <strong>Product Details</strong> - Individual product pages with
                comprehensive descriptions and specifications
              </li>
              <li>
                <strong>Shopping Cart</strong> - Full cart management system
                with add, remove, and quantity updates
              </li>
              <li>
                <strong>Order Processing</strong> - Complete order simulation
                flow from cart to checkout
              </li>
            </ul>
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Authentication & Security
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                <strong>Custom User Management</strong> - Registration with
                email confirmation and login functionality built from scratch
              </li>
              <li>
                <strong>JWT-Based Authentication</strong> - Industry best
                practices for access control using JSON Web Tokens
              </li>
              <li>
                <strong>Token Rotation System</strong> - Automatic access and
                refresh token management with rotation on each refresh
              </li>
              <li>
                <strong>Smart Token Refresh</strong> - Proactive token renewal
                based on expiration time to ensure seamless user experience
              </li>
              <li>
                <strong>Session Management</strong> - Configurable limits on
                concurrent active sessions per user
              </li>
              <li>
                <strong>CSRF Protection</strong> - Implementation of Cross-Site
                Request Forgery protection mechanisms
              </li>
              <li>
                <strong>DoS Prevention</strong> - API request throttling with
                endpoint-specific rate limits
              </li>
            </ul>
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            State Management & Data Layer
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                <strong>Hybrid State Management</strong> - Optimized combination
                of MobX for local state and TanStack Query (React Query) for
                server state
              </li>
              <li>
                <strong>Dual Database Architecture</strong> - RxDB for in-memory
                product data and PostgreSQL for user management
              </li>
              <li>
                <strong>Multi-Layer Caching</strong> - Strategic caching
                implementation with NGINX for static assets and API responses,
                and Redis for session and application data
              </li>
              <li>
                <strong>Unified Error Handling</strong> - Centralized approach
                to network and application errors across all services
              </li>
              <li>
                <strong>Shared Contracts</strong> - Type-safe models and DTOs
                shared across client and server applications
              </li>
            </ul>
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            DevOps & Quality Assurance
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                <strong>Comprehensive Testing</strong> - Extensive coverage with
                unit tests, integration tests, and end-to-end tests
              </li>
              <li>
                <strong>CI/CD Pipeline</strong> - Automated workflows with
                proper build optimization and zero-downtime deployment strategy
              </li>
              <li>
                <strong>Infrastructure Monitoring</strong> - Production-grade
                observability with metrics, alerts, and health checks
              </li>
              <li>
                <strong>Database Backups</strong> - Automated backup strategy
                following industry best practices
              </li>
              <li>
                <strong>Email Infrastructure</strong> - Integration with
                third-party email services using MJML for responsive layouts
              </li>
              <li>
                <strong>Developer Tools</strong> - Custom tooling to streamline
                development workflows and project maintenance
              </li>
            </ul>
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Infrastructure & Services
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
              <li>
                <strong>PostgreSQL Database</strong> - Primary relational
                database for the auth-service, handling user authentication
                data, session management, and authorization records
              </li>
              <li>
                <strong>Redis Cache</strong> - In-memory data store providing
                shared caching capabilities across all applications for session
                management and performance optimization
              </li>
              <li>
                <strong>RabbitMQ Message Broker</strong> - Event-driven
                messaging system enabling asynchronous communication between
                microservices with proper message persistence and retry
                mechanisms
              </li>
              <li>
                <strong>NGINX</strong> - High-performance web server serving the
                React SPA with gzip compression, API proxying with caching, and
                security headers enforcement
              </li>
              <li>
                <strong>HAProxy Load Balancer</strong> - Production-grade load
                balancer enabling zero-downtime blue-green deployments with
                SSL/TLS termination and live traffic shifting
              </li>
            </ul>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All infrastructure services are containerized and orchestrated
            through Docker Compose.
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Technical Stack
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Server API
          </Typography>
          <Typography variant="body2" paragraph>
            NestJS, RXDB, Jest, Swagger, class-validator, class-transformer
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Auth Service
          </Typography>
          <Typography variant="body2" paragraph>
            NestJS, PostgreSQL, Prisma, Jest, Swagger, class-validator,
            class-transformer
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Email Service
          </Typography>
          <Typography variant="body2" paragraph>
            NestJS, RabbitMQ, MJML templates for responsive email design
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Client Application
          </Typography>
          <Typography variant="body2" paragraph>
            React, React Router, MobX, React Query, Material-UI, Inversify,
            Jest, React Testing Library
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            All applications are developed in TypeScript and include exemplary
            test coverage with unit tests, integration tests, and end-to-end
            tests. The server APIs are fully documented through Swagger
            documentation.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This project includes production-grade monitoring with Prometheus
            for metrics collection and Grafana for dashboards and visualization.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            For the technical details see the original repository
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;
