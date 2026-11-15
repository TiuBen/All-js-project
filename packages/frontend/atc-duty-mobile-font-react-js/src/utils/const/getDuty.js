// const ServerUrl = http://localhost:3104;

const serverURL = import.meta.env.VITE_SERVE_URL;

async function getDuty( params ) {
    const response = await fetch(`${serverURL}/duty?${params}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response;
}

export { getDuty };
