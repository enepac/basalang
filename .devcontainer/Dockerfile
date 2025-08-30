FROM node:20-bullseye

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip sudo vim && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user (matches ubuntu)
RUN useradd -m -s /bin/bash ubuntu && \
    echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set workdir
WORKDIR /workspace
