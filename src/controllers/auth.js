// controllers/auth.js
const supabase = require('../config/supabase');
const { comparePassword, hashPassword, generateToken } = require('../utils/auth.js');
// Use simple column selector to avoid external helper coupling
const select = '*';

const roleMapping = {
  1: 'student',
  2: 'lecturer',
  3: 'moderator',
  4: 'admin',
  5: 'owner',
};

function mapRole(roleId) {
  if (typeof roleId === 'string') roleId = parseInt(roleId, 10);
  return roleMapping[roleId] || 'student';
}

exports.register = async (req, res) => {
  try {
    const { email, username, password, roleId = 1 } = req.body || {};
    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'email, username, and password are required' });
    }

    const hashed = await hashPassword(password);
    // store user profile in an app table if needed; for the test flow we only use auth.signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password: hashed,
      options: {
        data: { username, roleId }
      }
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({ success: true, user: data && data.user ? data.user : null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password are required' });
    }

    // App-managed users table
    const from = supabase.from('tbuser');
    const { data: user, error } = await from.select(select).eq('username', username).single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = await generateToken({
      id: user.userid || user.id,
      username: user.username,
      role: mapRole(user.roleid || user.roleId || 1),
    });

    return res.json({
      token,
      user: {
        id: user.userid || user.id,
        username: user.username,
        role: mapRole(user.roleid || user.roleId || 1),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (req.user) {
      return res.json({ success: true, user: req.user });
    }

    // Fallback: get by id from params
    const id = req.params?.id;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing user context' });
    }
    const { data, error } = await supabase.from('tbuser').select(select).eq('userid', id).single();
    if (error) throw error;
    return res.json({ success: true, user: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Get profile failed', error: error.message });
  }
};

exports.logout = async (_req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    // Assume req.user is populated by a previous middleware
    if (!req.user) {
      return res.status(400).json({ success: false, message: 'Missing user' });
    }
    const token = await generateToken({
      id: req.user.id,
      username: req.user.username,
      role: mapRole(req.user.roleId || req.user.roleid || 1),
    });
    return res.json({ token, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Google callback failed', error: error.message });
  }
};
