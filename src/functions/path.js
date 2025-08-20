import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
export const getPathFileName = () => fileURLToPath(import.meta.url);
export const getPathDirName = () => path.dirname(__filename);
