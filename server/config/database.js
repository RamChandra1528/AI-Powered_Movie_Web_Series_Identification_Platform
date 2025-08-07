const fs = require('fs');
const path = require('path');

// Simple file-based database for this demo
// In production, use PostgreSQL, MongoDB, or MySQL
class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../data');
    this.usersFile = path.join(this.dbPath, 'users.json');
    this.moviesFile = path.join(this.dbPath, 'movies.json');
    this.searchHistoryFile = path.join(this.dbPath, 'search_history.json');
    
    this.ensureDirectoryExists();
    this.initializeFiles();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  initializeFiles() {
    const files = [
      { path: this.usersFile, defaultData: [] },
      { path: this.moviesFile, defaultData: [] },
      { path: this.searchHistoryFile, defaultData: [] }
    ];

    files.forEach(({ path, defaultData }) => {
      if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify(defaultData, null, 2));
      }
    });
  }

  readFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return [];
    }
  }

  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      return false;
    }
  }

  // User operations
  getUsers() {
    return this.readFile(this.usersFile);
  }

  saveUsers(users) {
    return this.writeFile(this.usersFile, users);
  }

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  }

  findUserById(id) {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  updateUser(id, updateData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.saveUsers(users);
    return users[userIndex];
  }

  // Movie operations
  getMovies() {
    return this.readFile(this.moviesFile);
  }

  saveMovies(movies) {
    return this.writeFile(this.moviesFile, movies);
  }

  addMovie(movieData) {
    const movies = this.getMovies();
    const newMovie = {
      id: Date.now().toString(),
      ...movieData,
      createdAt: new Date().toISOString()
    };
    movies.push(newMovie);
    this.saveMovies(movies);
    return newMovie;
  }

  // Search history operations
  getSearchHistory(userId) {
    const history = this.readFile(this.searchHistoryFile);
    return history.filter(item => item.userId === userId);
  }

  addSearchHistory(userId, searchData) {
    const history = this.readFile(this.searchHistoryFile);
    const newEntry = {
      id: Date.now().toString(),
      userId,
      ...searchData,
      timestamp: new Date().toISOString()
    };
    history.push(newEntry);
    this.writeFile(this.searchHistoryFile, history);
    return newEntry;
  }
}

const db = new Database();

const connectDB = () => {
  console.log('📁 File-based database initialized');
  
  // Database initialized - no sample data
  console.log('✅ Database ready for production use');
};

module.exports = { db, connectDB };