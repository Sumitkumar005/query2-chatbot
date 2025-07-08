// app/api/chat/route.ts
import { spawn } from 'child_process';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, language, history } = await request.json();
    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'chat_processor.py');
    const pythonProcess = spawn('python3', [pythonScriptPath], {
      env: { ...process.env, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY },
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.stdin.write(JSON.stringify({ message, language, history }));
    pythonProcess.stdin.end();

    await new Promise((resolve) => pythonProcess.on('close', resolve));

    if (errorOutput) {
      throw new Error(errorOutput);
    }

    const result = JSON.parse(output);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
