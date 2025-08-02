const generateId = (text) => {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${text}${randomNumber}`;
}

export default generateId;