export const getCurrentTimeTool = {
    type: "function" as const,
    function: {
        name: "get_current_time",
        description: "Returns the current date and time in ISO format. Use this to know what time it is.",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    }
};

export async function getCurrentTime() {
    return new Date().toISOString();
}
