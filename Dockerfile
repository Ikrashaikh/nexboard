# ---- Stage 1: Build ----
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy maven wrapper and pom first (layer cache for dependencies)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Download dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build, skipping tests (tests run in CI)
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ---- Stage 2: Run ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S nexboard && adduser -S nexboard -G nexboard

# Copy the built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
RUN chown nexboard:nexboard app.jar

USER nexboard

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
