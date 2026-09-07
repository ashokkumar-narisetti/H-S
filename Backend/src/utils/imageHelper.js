import { supabase } from '../lib/supabase.js';
import crypto from 'crypto';

/**
 * Base64 Data URI Passthrough Utility for Database Storage
 * Ensures images (base64 Data URIs or URLs) are stored directly in PostgreSQL database columns.
 */

export const saveBase64Image = async (dataUrl) => {
  return await uploadBase64ToSupabase(dataUrl);
};

/**
 * Uploads a base64 string to Supabase Storage and returns the public URL.
 * If it's already a URL or not a base64 string, it returns it as-is.
 */
export const uploadBase64ToSupabase = async (val) => {
  if (typeof val !== 'string' || !val.startsWith('data:image/')) {
    return val;
  }

  try {
    const matches = val.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return val;
    }

    const extension = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, buffer, {
        contentType: `image/${extension}`,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return val; // Fallback to storing base64 if upload fails
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadBase64ToSupabase:', error);
    return val;
  }
};

/**
 * Traverses product payload objects and uploads base64 Data URIs to Supabase.
 */
export const deepSanitizeBase64 = async (val) => {
  if (!val) return val;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return await deepSanitizeBase64(parsed);
      } catch (e) {
        return await uploadBase64ToSupabase(val);
      }
    }
    return await uploadBase64ToSupabase(val);
  }

  if (Array.isArray(val)) {
    return await Promise.all(val.map(item => deepSanitizeBase64(item)));
  }

  if (typeof val === 'object' && val !== null) {
    const res = {};
    for (const key of Object.keys(val)) {
      res[key] = await deepSanitizeBase64(val[key]);
    }
    return res;
  }

  return val;
};

export const sanitizeProductImageFields = async (data) => {
  return await deepSanitizeBase64(data);
};
