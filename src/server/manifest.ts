import path from 'path'
import { readFileSync } from 'fs'

const manifestFilepath = path.resolve(process.env.LAMBDA_TASK_ROOT || __dirname, 'manifest.json')
const manifestContent = readFileSync(manifestFilepath, 'utf8')
export const manifest = JSON.parse(manifestContent)
