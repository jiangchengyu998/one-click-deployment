import bcrypt from 'bcryptjs';

const hash = '$2a$10$wV9gNPrkDr03ZV9p6Gfh8uD0oUK35tsTv37kCmK0NKPSrkbKQuVvi';

console.log(bcrypt.compareSync('admin123', hash)); // true
console.log(bcrypt.compareSync('wrongpassword', hash)); // false
console.log(bcrypt.hashSync('admin123', 12)); // false
