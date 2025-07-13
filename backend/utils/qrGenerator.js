import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * QR Code Generator Utility
 * Handles QR code generation and management for restaurant menus
 */

class QRGenerator {
  constructor() {
    this.qrCodeDir = path.join(__dirname, '..', 'qr-codes');
    this.frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Generate QR code for a restaurant's menu
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object>} QR code details
   */
  async generateQRCode(restaurantId) {
    try {
      // Create the URL that customers will visit
      const menuUrl = `${this.frontendBaseUrl}/menu/${restaurantId}`;
      
      // Define the file path for the QR code
      const fileName = `${restaurantId}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      
      // QR code options
      const options = {
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 300 // 300x300 pixels
      };

      // Generate QR code and save to file
      await QRCode.toFile(filePath, menuUrl, options);

      // Return QR code details
      return {
        url: menuUrl,
        fileName,
        filePath,
        publicUrl: `/qr-codes/${fileName}`,
        size: await this.getFileSize(filePath),
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }

  /**
   * Get QR code details if it exists
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object|null>} QR code details or null
   */
  async getQRCode(restaurantId) {
    try {
      const fileName = `${restaurantId}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      
      // Check if file exists
      await fs.access(filePath);
      
      const stats = await fs.stat(filePath);
      const menuUrl = `${this.frontendBaseUrl}/menu/${restaurantId}`;
      
      return {
        url: menuUrl,
        fileName,
        filePath,
        publicUrl: `/qr-codes/${fileName}`,
        size: stats.size,
        generatedAt: stats.birthtime
      };
    } catch (error) {
      // File doesn't exist
      return null;
    }
  }

  /**
   * Delete QR code for a restaurant
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteQRCode(restaurantId) {
    try {
      const fileName = `${restaurantId}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      
      // Check if file exists before deleting
      await fs.access(filePath);
      await fs.unlink(filePath);
      
      return true;
    } catch (error) {
      // File doesn't exist or couldn't be deleted
      return false;
    }
  }

  /**
   * Regenerate QR code (delete old one and create new)
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object>} New QR code details
   */
  async regenerateQRCode(restaurantId) {
    // Delete existing QR code if it exists
    await this.deleteQRCode(restaurantId);
    
    // Generate new QR code
    return await this.generateQRCode(restaurantId);
  }

  /**
   * Get file size
   * @param {string} filePath - File path
   * @returns {Promise<number>} File size in bytes
   */
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Ensure QR codes directory exists
   * @returns {Promise<void>}
   */
  async ensureQRCodeDirectory() {
    try {
      await fs.access(this.qrCodeDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(this.qrCodeDir, { recursive: true });
    }
  }
}

export default new QRGenerator();
