import { getCurrentTimeTool, getCurrentTime } from './getCurrentTime.js';

export const availableTools = [
    getCurrentTimeTool
];

export async function executeTool(name: string, args: Record<string, any>): Promise<string> {
    switch (name) {
        case 'get_current_time':
            return await getCurrentTime();
        default:
            throw new Error(`Tool ${name} not found`);
    }
}
