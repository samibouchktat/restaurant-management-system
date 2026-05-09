# Restaurant Management System

Système web/mobile de gestion de restaurant déployé en local sur le réseau Wi-Fi du restaurant.

## Stack technique

### Back-end

- Spring Boot 3.x
- Java 17
- Spring Web
- Spring Data JPA
- Spring Security JWT
- PostgreSQL 15
- Swagger / OpenAPI
- Maven

### Front-end

- Next.js
- TypeScript
- Tailwind CSS
- Axios
- TanStack Query

### Mobile

- React Native
- Prévu après validation du back-end et du front-end web

## Structure du projet

```text
restaurant-management-system/
├── backend/
│   └── restaurant-api/
├── frontend/
│   └── restaurant-web/
├── mobile/
│   └── restaurant-server-app/
├── docs/
│   ├── cahier-des-charges/
│   ├── database/
│   ├── api/
│   └── postman/
│       └── requests/
├── docker/
│   ├── postgres/
│   └── local-deployment/
├── README.md
├── .gitignore
└── docker-compose.yml