// src/utils/localStorage.js

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

export function getData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    return [];
  }
}
