# Database Setup for local development

**Foreword**

When reading this, the developer is assume to have a Java JDK and SDK per project specifications. This sections only aims to assist developers in integrating the database in their local environemnts.

**NOTICE**

Initializing the database is integral when you are aiming to use the TTG backend locally for development purposes.

**Prerequisites**

1. Install postgresql (v18.6)
2. User account in postgresql.

**Database Setup**

<u>Windows</u>

1. Open :  ```SQL Shell (psql)```.
2. Create an accoung with username ```ttgdev``` with a secure password with SUPERUSER privilage.
3. Create new database named ```main_db```.
4. configure ```application.properties``` as follows.

```properties
spring.application.name=TTGBackend

spring.datasource.url=jdbc:postgresql://localhost:5432/main_db
spring.datasource.username=ttgdev
spring.datasource.password=<YOUR_SECURE_PASSWORD>

spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true    
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database=postgresql
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

5. Initialize Database using ```init.sql``` found in ```TTGBackend/schemas/```.
```psql
\i '<path-to-init.sql>
```

