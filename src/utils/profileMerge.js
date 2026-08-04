function normalizeCompanies(companies) {
  if (!companies) return [];
  if (Array.isArray(companies)) return companies.map(c => c.trim()).filter(Boolean);
  return companies.split(",").map(c => c.trim()).filter(Boolean);
}

function mergeProfile(oldProfile, newProfile) {
    return {
        ...oldProfile,
        ...newProfile,
        industries: [
            ...(oldProfile.industries || []),
            ...(newProfile.industries || [])
        ],
        companies: [
            ...new Set([
                ...normalizeCompanies(oldProfile.companies),
                ...normalizeCompanies(newProfile.companies),
            ])
        ]
    };
}

module.exports = mergeProfile;