const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// App Configuration
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://syrianwheels_admin:db_4t4Y3D4fD8h07rdO@cluster1.yaqlzp.mongodb.net/syrianwheels?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB database'))
  .catch(err => console.error('Failed to connect to MongoDB database', err));

// Car Model
const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  color: String,
  dailyRate: Number,
  available: Boolean,
  imageUrl: String,
  features: [String]
});

const Car = mongoose.model('Car', carSchema);

// Booking Model
const bookingSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  status: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// User Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Basic Routes
app.get('/', (req, res) => {
  res.send('Syrianwheels API is running');
});

// Car Routes
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Booking Routes
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate('carId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
