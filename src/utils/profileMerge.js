function mergeProfile(oldProfile, newProfile) {
    return{
        ...oldProfile,
        ...newProfile,
        
        industries:[
            ...(oldProfile.industries || []),
            ...(newProfile.industries || [])    
        ],
        companies:[
            ...(oldProfile.companies || []),
            ...(newProfile.companies || [])
        ]
    }
}

module.exports=mergeProfile;