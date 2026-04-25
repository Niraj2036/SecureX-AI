import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const MODULES_FILE = path.join(process.cwd(), "content/modules/modules.json");

// Helper function to find module recursively
const findModule = (modules: any[], id: string): any => {
  for (const mod of modules) {
    if (mod.id === id) return mod;
    if (mod.children && Array.isArray(mod.children)) {
      const found = findModule(mod.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
};

export async function GET(
  request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    console.log("GET request for module:", params.moduleId);

    // Check if modules file exists
    let modules = [];
    try {
      const modulesData = await fs.readFile(MODULES_FILE, "utf-8");
      modules = JSON.parse(modulesData);
    } catch (error) {
      console.log("Modules file not found, returning empty content");
      return NextResponse.json({ content: "" });
    }

    const targetModule = findModule(modules, params.moduleId);

    if (!targetModule) {
      console.log("Module not found:", params.moduleId);
      return NextResponse.json({ content: "" });
    }

    if (!targetModule.contentPath) {
      console.log("No content path for module:", params.moduleId);
      return NextResponse.json({ content: "" });
    }

    const contentPath = path.join(
      process.cwd(),
      "docs",
      targetModule.contentPath
    );

    console.log("Reading content from:", contentPath);

    try {
      const content = await fs.readFile(contentPath, "utf-8");
      return NextResponse.json({ content });
    } catch (fileError) {
      // File doesn't exist yet, return empty content
      console.log("Content file not found, returning empty content");
      return NextResponse.json({ content: "" });
    }
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to load content", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { content } = await request.json();

    console.log("Saving content for module:", params.moduleId);

    if (content === undefined || content === null) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Ensure modules file exists
    let modules = [];
    try {
      const modulesData = await fs.readFile(MODULES_FILE, "utf-8");
      modules = JSON.parse(modulesData);
    } catch (error) {
      console.error("Error reading modules file:", error);
      return NextResponse.json(
        { error: "Modules file not found" },
        { status: 404 }
      );
    }

    const targetModule = findModule(modules, params.moduleId);

    if (!targetModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // If this is a new module without a contentPath, create one
    if (!targetModule.contentPath) {
      const slug = targetModule.title
        ? sanitizeFilename(targetModule.title)
        : sanitizeFilename(params.moduleId);

      targetModule.contentPath = `content/${slug}.mdx`;

      // Update modules.json with the new contentPath
      try {
        await fs.writeFile(
          MODULES_FILE,
          JSON.stringify(modules, null, 2),
          "utf-8"
        );
        console.log("Updated modules.json with new contentPath");
      } catch (writeError) {
        console.error("Error updating modules.json:", writeError);
        return NextResponse.json(
          { error: "Failed to update module configuration" },
          { status: 500 }
        );
      }
    }

    const contentPath = path.join(
      process.cwd(),
      "docs",
      targetModule.contentPath
    );

    console.log("Saving content to:", contentPath);

    // Ensure the directory exists
    try {
      await fs.mkdir(path.dirname(contentPath), { recursive: true });
    } catch (mkdirError) {
      console.error("Error creating directory:", mkdirError);
    }

    // Write the content with explicit encoding
    try {
      await fs.writeFile(contentPath, content, "utf-8");
      console.log("Content saved successfully to:", contentPath);
    } catch (writeError: any) {
      console.error("Error writing content file:", writeError);
      return NextResponse.json(
        { error: "Failed to write content file", details: writeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Content saved successfully",
      contentPath: targetModule.contentPath,
      moduleId: params.moduleId,
    });
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to save content", details: error.message },
      { status: 500 }
    );
  }
}
