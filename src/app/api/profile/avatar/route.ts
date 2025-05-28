import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Get form data from request
        const formData = await req.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (e.g., 5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(file.name);
        const filename = `avatar-${timestamp}${extension}`;
        const filepath = path.join(uploadDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        fs.writeFileSync(filepath, buffer);

        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            avatarUrl: fileUrl
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: 'Upload failed' },
            { status: 500 }
        );
    }
}