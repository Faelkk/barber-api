// src/shared/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Express } from 'express';
import { env } from '../config/env';

@Injectable()
export class SupabaseService {
  private readonly supabaseUrl: string = env.supabaseUrl;
  private readonly supabaseKey: string = env.supabaseKey;

  private supabase;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  async uploadFile(
    bucketName: string,
    file: Express.Multer.File,
  ): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(file.originalname, file.buffer, {
        upsert: true,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    return data?.path
      ? `${this.supabaseUrl}/storage/v1/object/public/${bucketName}/${data.path}`
      : null;
  }
}
