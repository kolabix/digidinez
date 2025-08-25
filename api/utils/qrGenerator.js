import QRCode from "qrcode";
import crypto from "crypto";
import { uploadRawBufferToS3, deleteS3Object } from "./s3Upload.js";

class QRGenerator {
  constructor() {
    this.publicMenuUrl = process.env.PUBLIC_MENU_URL || "http://localhost:4000";
  }

  async generateQRCode(restaurantId) {
    const menuUrl = `${this.publicMenuUrl}/${restaurantId}`;

    // 1) Generate QR PNG buffer
    const options = {
      type: "png",
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      width: 300
    };
    const pngBuffer = await QRCode.toBuffer(menuUrl, options);

    // 2) Choose a key for S3 store (restaurants/{id}/qr-images/*)
    const fileName = `${restaurantId}.png`;
    const key = `restaurants/${restaurantId}/qr-images/${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)}-${fileName}`;

    // 3) Upload directly to S3 (public access)
    const result = await uploadRawBufferToS3(key, pngBuffer, "image/png");

    return {
      url: menuUrl, // where QR points to
      key,
      fileName,
      publicUrl: result.publicUrl,
      size: pngBuffer.length,
      generatedAt: new Date()
    };
  }

  async deleteQRCode(keyOrUrl) {
    return await deleteS3Object(keyOrUrl);
  }

  async regenerateQRCode(restaurantId, previousKeyOrUrl) {
    if (previousKeyOrUrl) {
      await this.deleteQRCode(previousKeyOrUrl);
    }
    return this.generateQRCode(restaurantId);
  }
}

export default new QRGenerator();
