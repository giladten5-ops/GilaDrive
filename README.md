# Advanced-programming-project
this repository is our project and its main objective is to start the implementation of our home made "Drive" system.
this app (for now) implements the ability to add files, get their content and search content in all files.
the app compresses the data into files and saves them in a folder passed by an environment vriable (that needs to be exported into FILES_DIR)

## Part 2 changes
Fortunately, we put a lot of effort and thought on building the structure of part 1 such that it will be closed for changes and open for extensions. thanks to that, the following did not force us to change our code:
1. the fact that commands names changed
2. the fact that new commands were added
3. the fact that we moved from cli to socket
however, we are only humans after all, so we didnt think of everything. we had to implement a new level, the IfileSystem interface, which allowed us to handle mutex in this part more cleanly. in addition, we had to change a bit in order to handle the commands outputs more correctly.
overall, we believe our implemntation was rather fine SOLID wise, and we certainley learned some valuable lessons

## Part 3
In Exercise 3 we added a Node.js Web Server located under `./WebServer`.
This web server exposes a REST API and communicates with the C++ backend over TCP sockets as a client.
The Node server routes are mounted under:
- `/api/users`
- `/api/tokens`
- `/api/files`
- `/api/search`

## Requirements:
Docker
To build and run locally (C++): CMake + GCC
For local run (WebServer): Node.js

## Environement Variable: 
## C++ Backend
FILES_DIR=... (export this variable in the wanted directory when run locally)

## Node Web Server
- `PORT=3000`
- `BACKEND_HOST=127.0.0.1`
- `BACKEND_PORT=8080`

#  Build and Run

## Client side:
to run the clients you must ensure server is running on the ip and port you pass in the command line arguments. if you run server locally just do ip = 127.0.0.1 port = 8080

## for client only side run instructions - go to ./client/README.md

### Option 1: Docker Compose (Recommended)

This is the easiest way to run the project.

**1. Run backend + webserver together**
Builds and starts:
- C++ backend on `localhost:8080`
- Node web server on `localhost:3000`
- React frontend on `localhost:3001`

```bash
docker-compose up --build server webserver frontend drive_mobile
```

**2. Open the app**
Visit `http://localhost:3001` in your browser.

Note: The frontend dev server proxies API calls to the `webserver` container.

**3. Run the Clients**
You can run the Python or C++ client in a separate terminal.

```bash
# Run Python Client
docker-compose run --rm client_py

# Run C++ Client
docker-compose run --rm client_cpp
```

**4. Run Integration Tests**
Builds and runs the Google Test suite against the containerized server.
this command will also run the client in the background. so no need to run the server before this.

```bash
docker-compose up --build tests
```

**5. Stop Everything**

```bash
docker-compose down
```

-----

### Option 2: Run Locally

If you prefer to run locally

**1. Run the C++ backend**

```bash
mkdir -p files build
export FILES_DIR="$(pwd)/files"
cd build
cmake .. && make
./runProject 8080 5
```
(or choose your prefered port and number of working threads)


**2. Run the Node Web Server (in a separate terminal)**
```bash
cd WebServer
npm install
node src/server.js
```

**3. Run the React Frontend (in a separate terminal)**
```bash
cd frontend
npm install
REACT_APP_API_BASE=http://localhost:3000 PORT=3001 npm start
```

**4. Run the Tests**

```bash
export FILES_DIR="$(pwd)/files" 
cd tests
mkdir -p build && cd build
cmake .. && make
./runTests
```

## API (example flow)

**1. Create user and save his id to varaible:**

```bash
USER_ID=$(curl -s -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"u1","username":"user","password":"pas"}' \
  | awk -F'/api/users/' '/^Location:/{gsub("\r","");print $2}')

echo "USER_ID=$USER_ID"
```
**2. Create file (extract file_id from header):**

```bash
FILE_ID=$(curl -s -i -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{"name":"file.txt","type":"file","content":"hello"}' \
  | awk -F'/api/files/' '/^Location:/{gsub("\r","");print $2}')
```

**3. Search by name or content:**

```bash
curl -i "http://localhost:3000/api/search/hello" \
  -H "X-User-Id: $USER_ID"
```

**4. Give another user read access to the file (save permission id):**

```bash
USER_ID_2=$(curl -s -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"u2","username":"user2","password":"pas2"}' \
  | awk -F'/api/users/' '/^Location:/{gsub("\r","");print $2}')

PERMISSION_ID=$(curl -s -i -X POST http://localhost:3000/api/files/$FILE_ID/permissions \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{"userId":"'"$USER_ID_2"'","permissionType":"read"}' \
  | awk -F'/permissions/' '/^Location:/{gsub("\r","");print $2}')

echo "PERMISSION_ID=$PERMISSION_ID"
```

**5. Upgrade that user's access to write:**

```bash
curl -i -X PATCH "http://localhost:3000/api/files/$FILE_ID/permissions/$PERMISSION_ID" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{"permissionType":"write"}'
```

**6. Delete file:**

```bash
curl -i -X DELETE "http://localhost:3000/api/files/$FILE_ID" \
  -H "X-User-Id: $USER_ID"
```

## authors:
Gilad Tenenbaum

Ilya Vladimirskiy

Benny Bitran



![alt text](<imagesProof/more multi.png>)
![alt text](<imagesProof/multi client proof.png>)
