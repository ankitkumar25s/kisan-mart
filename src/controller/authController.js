const { users } = require('../db');

function login(req, res) {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ error: 'Mobile number and password are required' });
  }

  const user = users.find((user) => user.mobile === mobile && user.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid mobile number or password' });
  }

  res.json({
    message: 'Login successful',
    user: {
      name: user.name,
      mobile: user.mobile,
      village: user.village,
      state: user.state,
      pincode: user.pincode,
      land: user.land
    }
  });
}

function signup(req, res) {
  const { name, mobile, password, village, state, pincode, land } = req.body;

  if (!name || !mobile || !password) {
    return res.status(400).json({ error: 'Name, mobile number, and password are required' });
  }

  const existingUser = users.find((user) => user.mobile === mobile);

  if (existingUser) {
    return res.status(409).json({ error: 'Mobile number already registered' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    mobile,
    password,
    village: village || '',
    state: state || '',
    pincode: pincode || '',
    land: land || 0
  };

  users.push(newUser);

  res.status(201).json({
    message: 'Signup successful',
    user: {
      name: newUser.name,
      mobile: newUser.mobile,
      village: newUser.village,
      state: newUser.state,
      pincode: newUser.pincode,
      land: newUser.land
    }
  });
}

module.exports = { login, signup };
