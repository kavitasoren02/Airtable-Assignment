import Airtable from "airtable"

const airtableBase = null

export function initializeAirtableClient(accessToken) {
    const airtable = new Airtable({ apiKey: accessToken })
    return airtable
}

export function getAirtableBase(accessToken, baseId) {
    const airtable = initializeAirtableClient(accessToken)
    return airtable.base(baseId)
}

export async function getAllBases(accessToken) {
    try {
        const airtable = initializeAirtableClient(accessToken)
        return airtable
    } catch (error) {
        console.error("Error initializing Airtable:", error)
        throw error
    }
}
