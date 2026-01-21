import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { url, method, headers, body } = await req.json();

        const start = Date.now();
        const response = await fetch(url, {
            method,
            headers,
            body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
        });
        const duration = Date.now() - start;

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            data,
            time: duration,
            size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
