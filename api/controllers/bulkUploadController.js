import { MenuItem, Restaurant, MenuCategory, Tag } from '../models/index.js';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';

// @desc    Upload bulk data from Excel/CSV file
// @route   POST /menu/bulk-upload
// @access  Private
export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { file } = req;
    const { updateExisting = false } = req.body;

    // Determine file type and parse accordingly
    let parsedData;
    try {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        parsedData = await parseCSVFile(file.buffer);
      } else {
        parsedData = await parseExcelFile(file.buffer);
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format or corrupted file',
        error: error.message
      });
    }

    // Validate parsed data structure
    const validationResult = validateBulkData(parsedData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data structure',
        errors: validationResult.errors
      });
    }

    // Process data in order: Categories -> Tags -> Menu Items
    const results = {
      categories: { created: 0, updated: 0, errors: [] },
      tags: { created: 0, updated: 0, errors: [] },
      menuItems: { created: 0, updated: 0, errors: [] }
    };

    // Process categories first
    if (parsedData.categories && parsedData.categories.length > 0) {
      const categoryResults = await processCategories(parsedData.categories, req.restaurant.id, updateExisting);
      results.categories = categoryResults;
    }

    // Process tags
    if (parsedData.tags && parsedData.tags.length > 0) {
      const tagResults = await processTags(parsedData.tags, req.restaurant.id, updateExisting);
      results.tags = tagResults;
    }

    // Process menu items (depends on categories and tags)
    if (parsedData.menuItems && parsedData.menuItems.length > 0) {
      const menuItemResults = await processMenuItems(parsedData.menuItems, req.restaurant.id, updateExisting);
      results.menuItems = menuItemResults;
    }

    // Calculate totals
    const totalCreated = results.categories.created + results.tags.created + results.menuItems.created;
    const totalUpdated = results.categories.updated + results.tags.updated + results.menuItems.updated;
    const totalErrors = results.categories.errors.length + results.tags.errors.length + results.menuItems.errors.length;

    res.json({
      success: true,
      message: 'Bulk upload completed',
      data: {
        summary: {
          totalCreated,
          totalUpdated,
          totalErrors
        },
        details: results
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk upload',
      error: error.message
    });
  }
};

// @desc    Download Excel template
// @route   GET /menu/bulk-upload/template
// @access  Private
export const downloadTemplate = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Fetch existing data from the restaurant
    const [existingCategories, existingTags, existingMenuItems] = await Promise.all([
      MenuCategory.find({ restaurantId }).sort({ sortOrder: 1 }),
      Tag.find({ restaurantId }),
      MenuItem.find({ restaurantId }).populate('categoryIds tagIds')
    ]);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare categories data
    const categoriesData = [['Name', 'Sort Order']];
    if (existingCategories.length > 0) {
      // Use existing categories
      existingCategories.forEach(category => {
        categoriesData.push([category.name, category.sortOrder]);
      });
    } else {
      // Use sample data if no existing categories
      categoriesData.push(
        ['Appetizers', 1],
        ['Main Course', 2],
        ['Desserts', 3],
        ['Beverages', 4]
      );
    }
    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

    // Prepare tags data
    const tagsData = [['Name', 'Color']];
    if (existingTags.length > 0) {
      // Use existing tags
      existingTags.forEach(tag => {
        tagsData.push([tag.name, tag.color]);
      });
    } else {
      // Use sample data if no existing tags
      tagsData.push(
        ['Spicy', '#FF4444'],
        ['Vegetarian', '#44FF44'],
        ['Popular', '#4444FF'],
        ['Chef Special', '#FFAA44']
      );
    }
    const tagsSheet = XLSX.utils.aoa_to_sheet(tagsData);
    XLSX.utils.book_append_sheet(workbook, tagsSheet, 'Tags');

    // Prepare menu items data
    const menuItemsData = [['Name', 'Description', 'Price', 'Categories', 'Tags', 'Food Type', 'Is Spicy', 'Spicy Level', 'Preparation Time', 'Is Available', 'Calories', 'Protein', 'Carbs', 'Fat', 'Allergens']];
    
    if (existingMenuItems.length > 0) {
      // Use existing menu items
      existingMenuItems.forEach(item => {
        const categoryNames = item.categoryIds.map(cat => cat.name).join(',');
        const tagNames = item.tagIds.map(tag => tag.name).join(',');
        const allergens = item.allergens ? item.allergens.join(',') : '';
        
        menuItemsData.push([
          item.name,
          item.description || '',
          item.price,
          categoryNames,
          tagNames,
          item.foodType,
          item.isSpicy,
          item.spicyLevel,
          item.preparationTime || '',
          item.isAvailable,
          item.nutritionInfo?.calories || '',
          item.nutritionInfo?.protein || '',
          item.nutritionInfo?.carbs || '',
          item.nutritionInfo?.fat || '',
          allergens
        ]);
      });
    } else {
      // Use sample data if no existing menu items
      menuItemsData.push(
        ['Margherita Pizza', 'Classic tomato and mozzarella pizza', 299.99, 'Main Course', 'Popular,Vegetarian', 'veg', false, 0, 20, true, 800, 25, 80, 30, 'dairy,wheat'],
        ['Chicken Tikka', 'Spicy grilled chicken tikka', 399.99, 'Main Course', 'Spicy', 'non-veg', true, 2, 25, true, 650, 35, 15, 25, ''],
        ['Chocolate Cake', 'Rich chocolate cake with cream', 199.99, 'Desserts', 'Popular', 'veg', false, 0, 5, true, 450, 8, 60, 20, 'dairy,eggs,wheat']
      );
    }
    const menuItemsSheet = XLSX.utils.aoa_to_sheet(menuItemsData);
    XLSX.utils.book_append_sheet(workbook, menuItemsSheet, 'Menu Items');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="menu_bulk_upload_template.xlsx"');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating template'
    });
  }
};

// Helper Functions

function parseExcelFile(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const result = {};

  // Parse Categories sheet
  if (workbook.Sheets['Categories']) {
    const categoriesSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Categories'], { header: 1 });
    result.categories = parseSheetData(categoriesSheet, ['Name', 'Sort Order']);
  }

  // Parse Tags sheet
  if (workbook.Sheets['Tags']) {
    const tagsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Tags'], { header: 1 });
    result.tags = parseSheetData(tagsSheet, ['Name', 'Color']);
  }

  // Parse Menu Items sheet
  if (workbook.Sheets['Menu Items']) {
    const menuItemsSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Menu Items'], { header: 1 });
    result.menuItems = parseSheetData(menuItemsSheet, [
      'Name', 'Description', 'Price', 'Categories', 'Tags', 'Food Type', 
      'Is Spicy', 'Spicy Level', 'Preparation Time', 'Is Available', 
      'Calories', 'Protein', 'Carbs', 'Fat', 'Allergens'
    ]);
  }

  return result;
}

function parseCSVFile(buffer) {
  return new Promise((resolve, reject) => {
    const result = { categories: [], tags: [], menuItems: [] };
    const stream = Readable.from(buffer);
    
    let currentSection = null;
    let headers = null;

    stream
      .pipe(csv())
      .on('data', (row) => {
        // Detect section based on first column
        if (row['Name'] && row['Description'] && row['Price']) {
          currentSection = 'menuItems';
          headers = Object.keys(row);
        } else if (row['Name'] && row['Color']) {
          currentSection = 'tags';
          headers = Object.keys(row);
        } else if (row['Name'] && (row['Sort Order'] || Object.keys(row).length === 1)) {
          currentSection = 'categories';
          headers = Object.keys(row);
        }

        if (currentSection && headers) {
          const cleanRow = {};
          headers.forEach(header => {
            if (row[header] !== undefined && row[header] !== '') {
              cleanRow[header] = row[header];
            }
          });
          
          if (Object.keys(cleanRow).length > 0) {
            result[currentSection].push(cleanRow);
          }
        }
      })
      .on('end', () => resolve(result))
      .on('error', reject);
  });
}

function parseSheetData(sheetData, expectedHeaders) {
  if (sheetData.length < 2) return [];

  const headers = sheetData[0];
  const data = [];

  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.every(cell => !cell)) continue; // Skip empty rows

    const rowData = {};
    headers.forEach((header, index) => {
      if (row[index] !== undefined && row[index] !== '') {
        rowData[header] = row[index];
      }
    });

    if (Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  }

  return data;
}

function validateBulkData(data) {
  const errors = [];

  // Validate categories
  if (data.categories) {
    data.categories.forEach((category, index) => {
      if (!category.Name) {
        errors.push(`Category ${index + 1}: Name is required`);
      }
      if (category.Name && String(category.Name).length > 50) {
        errors.push(`Category ${index + 1}: Name cannot exceed 50 characters`);
      }
    });
  }

  // Validate tags
  if (data.tags) {
    data.tags.forEach((tag, index) => {
      if (!tag.Name) {
        errors.push(`Tag ${index + 1}: Name is required`);
      }
      if (tag.Name && String(tag.Name).length > 30) {
        errors.push(`Tag ${index + 1}: Name cannot exceed 30 characters`);
      }
      if (tag.Color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(tag.Color)) {
        errors.push(`Tag ${index + 1}: Invalid color format (use hex color)`);
      }
    });
  }

  // Validate menu items
  if (data.menuItems) {
    data.menuItems.forEach((item, index) => {
      if (!item.Name) {
        errors.push(`Menu Item ${index + 1}: Name is required`);
      }
      if (!item.Price) {
        errors.push(`Menu Item ${index + 1}: Price is required`);
      }
      if (item.Price && (isNaN(item.Price) || parseFloat(item.Price) <= 0)) {
        errors.push(`Menu Item ${index + 1}: Price must be a positive number`);
      }
      if (item['Food Type'] && !['veg', 'non-veg'].includes(String(item['Food Type']).toLowerCase())) {
        errors.push(`Menu Item ${index + 1}: Food Type must be 'veg' or 'non-veg'`);
      }
      if (item['Spicy Level'] && (isNaN(item['Spicy Level']) || parseInt(item['Spicy Level']) < 0 || parseInt(item['Spicy Level']) > 3)) {
        errors.push(`Menu Item ${index + 1}: Spicy Level must be between 0 and 3`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function processCategories(categories, restaurantId, updateExisting) {
  const results = { created: 0, updated: 0, errors: [] };

  for (const categoryData of categories) {
    try {
      const existingCategory = await MenuCategory.findOne({
        name: String(categoryData.Name || '').trim(),
        restaurantId
      });

      if (existingCategory) {
        if (updateExisting) {
          existingCategory.sortOrder = parseInt(categoryData['Sort Order']) || existingCategory.sortOrder;
          await existingCategory.save();
          results.updated++;
        } else {
          results.errors.push(`Category "${String(categoryData.Name || '')}" already exists`);
        }
      } else {
        await MenuCategory.create({
          name: String(categoryData.Name || '').trim(),
          sortOrder: parseInt(categoryData['Sort Order']) || 0,
          restaurantId
        });
        results.created++;
      }
    } catch (error) {
      results.errors.push(`Category "${String(categoryData.Name || '')}": ${error.message}`);
    }
  }

  return results;
}

async function processTags(tags, restaurantId, updateExisting) {
  const results = { created: 0, updated: 0, errors: [] };

  for (const tagData of tags) {
    try {
      const existingTag = await Tag.findOne({
        name: String(tagData.Name || '').trim(),
        restaurantId
      });

      if (existingTag) {
        if (updateExisting) {
          if (tagData.Color) existingTag.color = tagData.Color;
          await existingTag.save();
          results.updated++;
        } else {
          results.errors.push(`Tag "${String(tagData.Name || '')}" already exists`);
        }
      } else {
        await Tag.create({
          name: String(tagData.Name || '').trim(),
          color: tagData.Color || '#3B82F6',
          restaurantId
        });
        results.created++;
      }
    } catch (error) {
      results.errors.push(`Tag "${String(tagData.Name || '')}": ${error.message}`);
    }
  }

  return results;
}

async function processMenuItems(menuItems, restaurantId, updateExisting) {
  const results = { created: 0, updated: 0, errors: [] };

  // Get existing categories and tags for reference
  const categories = await MenuCategory.find({ restaurantId });
  const tags = await Tag.find({ restaurantId });

  const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat._id]));
  const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag._id]));

  for (const itemData of menuItems) {
    try {
      // Check for existing menu item
      const existingItem = await MenuItem.findOne({
        name: String(itemData.Name || '').trim(),
        restaurantId
      });

      // Prepare menu item data
      const menuItemData = {
        name: String(itemData.Name || '').trim(),
        description: itemData.Description ? String(itemData.Description).trim() : '',
        price: parseFloat(itemData.Price),
        foodType: String(itemData['Food Type'] || 'veg').toLowerCase(),
        isSpicy: Boolean(itemData['Is Spicy']),
        spicyLevel: parseInt(itemData['Spicy Level']) || 0,
        preparationTime: itemData['Preparation Time'] ? parseInt(itemData['Preparation Time']) : null,
        isAvailable: itemData['Is Available'] !== false && itemData['Is Available'] !== 'false',
        nutritionInfo: {
          calories: itemData.Calories ? parseInt(itemData.Calories) : null,
          protein: itemData.Protein ? parseFloat(itemData.Protein) : null,
          carbs: itemData.Carbs ? parseFloat(itemData.Carbs) : null,
          fat: itemData.Fat ? parseFloat(itemData.Fat) : null
        },
        allergens: itemData.Allergens ? String(itemData.Allergens).split(',').map(a => a.trim()).filter(a => a) : []
      };

      // Process categories
      if (itemData.Categories) {
        const categoryNames = String(itemData.Categories).split(',').map(c => c.trim());
        const categoryIds = [];
        
        for (const categoryName of categoryNames) {
          const categoryId = categoryMap.get(categoryName.toLowerCase());
          if (categoryId) {
            categoryIds.push(categoryId);
          } else {
            results.errors.push(`Menu Item "${String(itemData.Name || '')}": Category "${categoryName}" not found`);
          }
        }
        
        menuItemData.categoryIds = categoryIds;
      }

      // Process tags
      if (itemData.Tags) {
        const tagNames = String(itemData.Tags).split(',').map(t => t.trim());
        const tagIds = [];
        
        for (const tagName of tagNames) {
          const tagId = tagMap.get(tagName.toLowerCase());
          if (tagId) {
            tagIds.push(tagId);
          } else {
            results.errors.push(`Menu Item "${String(itemData.Name || '')}": Tag "${tagName}" not found`);
          }
        }
        
        menuItemData.tagIds = tagIds;
      }

      if (existingItem) {
        if (updateExisting) {
          Object.assign(existingItem, menuItemData);
          await existingItem.save();
          results.updated++;
        } else {
          results.errors.push(`Menu Item "${itemData.Name}" already exists`);
        }
      } else {
        await MenuItem.create({
          ...menuItemData,
          restaurantId
        });
        results.created++;
      }
    } catch (error) {
      results.errors.push(`Menu Item "${String(itemData.Name || '')}": ${error.message}`);
    }
  }

  return results;
}
