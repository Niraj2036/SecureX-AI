import { promises as fs } from 'fs'
import path from 'path'

const MODULES_FILE = path.join(process.cwd(), 'content/modules/modules.json')
const CONTENT_DIR = path.join(process.cwd(), 'docs/content')

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(path.dirname(MODULES_FILE), { recursive: true })
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating directories:', error)
  }
}

export async function GET() {
  try {
    // await ensureDirectories()
    
    console.log('Loading modules from:', MODULES_FILE)
    
    // Check if file exists, if not create empty modules array
    let modules = []
    try {
      const data = await fs.readFile(MODULES_FILE, 'utf-8')
      modules = JSON.parse(data)
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(MODULES_FILE, JSON.stringify([], null, 2))
      modules = []
    }
    
    console.log('Loaded modules:', modules)
    return Response.json({ modules })
  } catch (error) {
    console.error('Error loading modules:', error)
    return Response.json(
      { error: 'Failed to load modules', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await ensureDirectories()
    
    const { modules } = await request.json()
    
    if (!Array.isArray(modules)) {
      return Response.json(
        { error: 'Modules must be an array' },
        { status: 400 }
      )
    }
    
    // Write modules with proper formatting
    await fs.writeFile(MODULES_FILE, JSON.stringify(modules, null, 2), 'utf-8')
    
    console.log('Modules saved successfully')
    return Response.json({ success: true, message: 'Modules saved successfully' })
  } catch (error) {
    console.error('Error saving modules:', error)
    return Response.json(
      { error: 'Failed to save modules', details: error },
      { status: 500 }
    )
  }
}
