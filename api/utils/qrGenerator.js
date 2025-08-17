import QRCode from "qrcode";
import crypto from "crypto";
import { put, del } from "@vercel/blob"; // npm install @vercel/blob

class QRGenerator {
  constructor() {
    this.publicMenuUrl = process.env.PUBLIC_MENU_URL || "http://localhost:4000";

    if (!process.env.BLOB_PUBLIC_BASE) {
      throw new Error("public storage base path is not set in environment variables");
    }
    this.blobPublicBase = process.env.BLOB_PUBLIC_BASE;
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

    // 2) Choose a key for Blob store (restaurants/{id}/qr-images/*)
    const fileName = `${restaurantId}.png`;
    const key = `restaurants/${restaurantId}/qr-images/${Date.now()}-${crypto
      .randomUUID()
      .slice(0, 8)}-${fileName}`;

    // 3) Upload directly to Blob (public access)
    const { url } = await put(key, pngBuffer, {
      access: "public",
      contentType: "image/png",
      cacheControl: "public, max-age=31536000, immutable"
    });

    return {
      url: menuUrl, // where QR points to
      key,
      fileName,
      publicUrl: url,
      size: pngBuffer.length,
      generatedAt: new Date()
    };
  }

  async deleteQRCode(keyOrUrl) {
    const target =
      keyOrUrl.startsWith("http") && keyOrUrl.includes(this.blobPublicBase)
        ? keyOrUrl
        : `${this.blobPublicBase}/${keyOrUrl}`;
    await del(target);
    return true;
  }

  async regenerateQRCode(restaurantId, previousKeyOrUrl) {
    if (previousKeyOrUrl) {
      await this.deleteQRCode(previousKeyOrUrl);
    }
    return this.generateQRCode(restaurantId);
  }
}

export default new QRGenerator();
