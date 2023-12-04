/**
 * Генерация случайного числа в заданном диапазоне
 * @param {Number} min Минимальное число
 * @param {Number} max Максимальное число
 * @returns Случайное число
 */
export default function getRandomNumber(min, max) {
  return Math.floor(min + Math.random() * (max + 1 - min));
}