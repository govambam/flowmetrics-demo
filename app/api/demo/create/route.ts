import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  // Security check - only allow in development or when DEMO_MODE is enabled
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Demo controls are disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { stdout, stderr } = await execAsync('bash scripts/create-demo.sh', {
      cwd: process.cwd(),
      timeout: 60000, // 60 second timeout
      env: { ...process.env, FORCE_COLOR: '0' }, // Disable color codes for cleaner output
    })

    const output = stdout + (stderr ? `\n${stderr}` : '')

    // Check if the output contains success indicators
    const success = output.includes('Demo setup complete') || output.includes('Branch pushed successfully')

    return NextResponse.json({
      success,
      output: cleanOutput(output),
    })
  } catch (error: any) {
    const output = error.stdout || error.stderr || error.message
    return NextResponse.json({
      success: false,
      output: cleanOutput(output),
      error: error.message,
    })
  }
}

// Remove ANSI color codes and clean up output
function cleanOutput(text: string): string {
  return text
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
    .replace(/\[0m|\[31m|\[32m|\[33m|\[1;33m/g, '') // Remove remaining color codes
    .trim()
}
