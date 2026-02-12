
---

# System Setup & Execution Guide

This guide explains how to compile and run the entire system, including the C++ Backend, Node.js Web Server, MongoDB, React Web Frontend, React Native Mobile App, C++ or PY Client and the tests for the Backend

### 1. Network Configuration

To allow the **Expo Go** app to communicate with the servers, you must provide your local machine's IP address:

* Open `docker-compose.yml` in the root directory.
* Locate the `drive_mobile` service.
* Update the `MY_IP` environment variable with your local network IP (ipconfig in cmd for windows).

### 2. Build the System

Compile the source code and build the Docker images for all core services:

```bash
docker compose build

```

### 3. Execution & Mobile Access

Start the containers in detached mode and follow the logs for the mobile app to view the QR code:

```bash
docker compose up -d server mongodb webserver frontend drive_mobile && docker compose logs -f drive_mobile
```

Note: This command initiates the main infrastructure required for the apps to function. The C++ client, Python client, and backend tests are excluded from this command to keep the environment clean.

### 4. Client Access

* 
**Mobile App:** Scan the QR code appearing in the terminal using the **Expo Go** app on your mobile device.


* 
**Web Interface:** Navigate to `http://localhost:3001` in your web browser.


* 
**C++ Backend:** The server listens internally on port `8080`.


### 5. Manual Execution (Tests & Clients)
Once the main infrastructure is running, you can execute the clients or tests manually using the run command:

To run the C++ Client:

```Bash
docker compose run client_cpp
To run the Python Client:
```

```Bash
docker compose run client_py
```

To run the Backend Tests:
```Bash
docker compose run tests
```

---

### Troubleshooting: Lockfile Sync

If the build fails with an `EUSAGE` error regarding `package-lock.json`, navigate to the `WebServer` or `frontend` folders on your host machine and run:

```bash
npm install

```

This syncs your local lockfile with the requirements in `package.json` before you rebuild the Docker containers.

---