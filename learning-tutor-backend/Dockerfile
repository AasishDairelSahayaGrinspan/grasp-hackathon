# Use Node.js base image with additional compilers
FROM node:20-bookworm

# Install Java (OpenJDK), GCC, G++, and Python
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    gcc \
    g++ \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
