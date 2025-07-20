import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Restaurant, MenuCategory } from '../models/index.js';

// Load environment variables
dotenv.config();

// Default categories for Indian restaurants
const defaultCategories = [
  { name: 'Appetizers', sortOrder: 1 },
  { name: 'Soups', sortOrder: 2 },
  { name: 'Salads', sortOrder: 3 },
  { name: 'Main Course', sortOrder: 4 },
  { name: 'Rice & Biryani', sortOrder: 5 },
  { name: 'Breads', sortOrder: 6 },
  { name: 'Chinese', sortOrder: 7 },
  { name: 'South Indian', sortOrder: 8 },
  { name: 'Desserts', sortOrder: 9 },
  { name: 'Beverages', sortOrder: 10 },
  { name: 'Street Food', sortOrder: 11 }
];

const createDefaultCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all restaurants
    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants`);

    for (const restaurant of restaurants) {
      console.log(`Creating categories for ${restaurant.name}...`);
      
      // Check if restaurant already has categories
      const existingCategories = await MenuCategory.find({ restaurantId: restaurant._id });
      
      if (existingCategories.length === 0) {
        // Create default categories for this restaurant
        const categoriesToCreate = defaultCategories.map(cat => ({
          ...cat,
          restaurantId: restaurant._id
        }));
        
        await MenuCategory.insertMany(categoriesToCreate);
        console.log(`✅ Created ${defaultCategories.length} categories for ${restaurant.name}`);
      } else {
        console.log(`⏭️  ${restaurant.name} already has ${existingCategories.length} categories`);
      }
    }

    console.log('\n🎉 Default categories setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up default categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createDefaultCategories();
