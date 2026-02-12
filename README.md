
---

# Drive Project - Exercise 5

### Project Overview

A full-stack Google Drive clone featuring a C++ backend storage server, a Node.js/Express web server with MongoDB/Mongoose persistence, and dual clients: a React web interface and a React Native mobile application.

### Quick Start (Core Infrastructure)

To bring up the main environment:

1. **Set IP:** Update `MY_IP` in `docker-compose.yml` with your local network IP. (use ipconfig from cmd)
2. **Build:** `docker compose build`
3. **Run:** `docker compose up -d server mongodb webserver frontend drive_mobile`
4. **Mobile Access:** `docker compose logs -f drive_mobile` to scan the Expo QR code.

### Manual Services (Clients & Tests)

* **C++ Client:** `docker compose run client_cpp`
* **Python Client:** `docker compose run client_py`
* **Backend Tests:** `docker compose run tests`

### Work Process Summary

* 
**Architecture:** Implemented MVC on the Node.js server and loose coupling principles in the C++ backend.


* 
**Persistence:** Migrated from in-memory arrays to a persistent MongoDB database using Mongoose.



### Documentation

For detailed explanations, screenshots of user flows, and input validation demonstrations, please refer to the **`wiki/`** folder in this repository.

## Authors:
Benny Bitran (scrum master and team leader ;)

Gilad Tenenbaum

Ilya vladimirskiy

# it was a pleasure.
---
