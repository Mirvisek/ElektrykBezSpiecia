import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const oldFileUrl = formData.get('oldFileUrl') as string | null;

        if (!file) {
            return NextResponse.json({ success: false, message: 'Brak pliku' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Wygeneruj unikalną nazwę pliku, żeby przeglądarka nie cachowała mocno
        const extension = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}.${extension}`;
        
        // Zapisz do public/uploads
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        // Upewnij się że folder istnieje
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, buffer);

        // Usuń stary plik jeśli istniał
        if (oldFileUrl && oldFileUrl.startsWith('/uploads/')) {
            const oldFilePath = path.join(process.cwd(), 'public', oldFileUrl);
            try {
                await fs.unlink(oldFilePath);
                console.log(`Usunięto stary plik: ${oldFilePath}`);
            } catch (err) {
                console.error(`Nie udało się usunąć starego pliku: ${oldFilePath}`, err);
            }
        }

        // Zwróć ścieżkę do nowego pliku dopisując losowy hash (wzmocnienie omijania cache)
        const fileUrl = `/uploads/${uniqueFileName}?v=${Date.now()}`;
        return NextResponse.json({ success: true, url: fileUrl });

    } catch (error) {
        console.error('Błąd podczas wgrywania pliku:', error);
        return NextResponse.json({ success: false, message: 'Błąd sewera' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { fileUrl } = body;

        // Strip the query parameters (like ?v=123) for physical deletion
        const pureUrl = fileUrl.split('?')[0];

        if (fileUrl && pureUrl.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', pureUrl);
            await fs.unlink(filePath);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, message: "Błędna ścieżka pliku" }, { status: 400 });
    } catch (e) {
        console.error('Błąd podczas usuwania', e);
        return NextResponse.json({ success: false, message: "Błąd serwera" }, { status: 500 });
    }
}
