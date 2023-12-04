/**
 * Сохраняем данных в LocalStorage
 * @param {Array} Array Массив, который нужно сохранить
 * @param {String} key Ключ для сохранения
 */
function saveLocalStorage (key, Array) {
  localStorage.setItem(key, JSON.stringify(Array));
}

export default saveLocalStorage;