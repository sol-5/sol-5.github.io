class Store {
  static Add(key, value) {
    if(localStorage.getItem(key) !== null) {
      console.error(`Failed to Add Record: Item Exists: ${key}`);
      return null;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  static Remove(key) {
    if(localStorage.getItem(key) === null) {
      console.error(`Failed to Remove: Item Does not Exist: ${key}`);
      return null;
    }
    localStorage.removeItem(key);
  }

  static Get(key) {
    if(localStorage.getItem(key) === null) {
      console.error(`Failed to Get: Item Does not Exist: ${key}`);
      return null;
    }
    return JSON.parse(localStorage.getItem(key));
  }

  static Update(key, newValue) {
    if(localStorage.getItem(key) === null) {
      console.error(`Failed to Update: Item Does not Exist: ${key}`);
      return null;
    }
    localStorage.setItem(key, JSON.stringify(newValue));
  }

  static Clear() {
    localStorage.clear();
  }
}

export default Store;