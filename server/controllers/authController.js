import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, businessName, businessType } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'both',
      businessName,
      businessType,
      authProvider: 'local',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user used OAuth
    if (user.authProvider !== 'local') {
      return res.status(401).json({
        message: `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`,
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.businessName = req.body.businessName || user.businessName;
    user.businessType = req.body.businessType || user.businessType;
    
    // Allow role update (for OAuth users completing setup)
    if (req.body.role && ['donor', 'receiver', 'both'].includes(req.body.role)) {
      user.role = req.body.role;
    }

    if (req.body.address) {
      user.address = { ...user.address, ...req.body.address };
    }

    if (req.body.location) {
      user.location = req.body.location;
    }

    if (req.body.password && user.authProvider === 'local') {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      businessName: updatedUser.businessName,
      businessType: updatedUser.businessType,
      address: updatedUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  const user = req.user;
  
  // Check if this is a new user (just created via OAuth)
  // New OAuth users need to complete their profile with role selection
  if (user._isNewUser || (user.role === 'both' && !user.businessName && !user.phone)) {
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}&setup=true`);
  } else {
    // Existing user or already set up
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
export const githubCallback = (req, res) => {
  const token = generateToken(req.user._id);
  const user = req.user;
  
  // Check if this is a new user (just created via OAuth)
  // New OAuth users need to complete their profile with role selection
  if (user._isNewUser || (user.role === 'both' && !user.businessName && !user.phone)) {
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}&setup=true`);
  } else {
    // Existing user or already set up
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  }
};

