const etaRank = {
    'IMMEDIATE': 1,
    'SIX_HOURS': 2, '6 HOURS': 2,
    'TWELVE_HOURS': 3, '12 HOURS': 3,
    'TWENTY_FOUR_HOURS': 4, '24 HOURS': 4,
    'QUICK': 2,
    'STAGED': 3,
    'EXTENDED': 4
};

export const formatETA = (responseTime) => {
    if (!responseTime) return 'TBD';
    const rt = String(responseTime).toUpperCase();
    switch (rt) {
        case 'IMMEDIATE': return 'IMMEDIATE';
        case 'SIX_HOURS': return '6 HOURS';
        case 'TWELVE_HOURS': return '12 HOURS';
        case 'TWENTY_FOUR_HOURS': return '24 HOURS';
        case 'QUICK': return '1-2 HRS';
        case 'STAGED': return '4-6 HRS';
        case 'EXTENDED': return '12+ HRS';
        default: return responseTime;
    }
};

export const calculateAllocations = (camps, providers) => {
    if (!camps || !providers || camps.length === 0 || providers.length === 0) {
        return [];
    }

    const sortedCamps = [...camps].sort((a, b) => {
        const aIdx = etaRank[a.urgency?.toUpperCase()] || 99;
        const bIdx = etaRank[b.urgency?.toUpperCase()] || 99;
        return aIdx - bIdx;
    });

    const newAllocations = [];
    let inventory = providers.map(p => ({ ...p }));

    sortedCamps.forEach(camp => {
        const campNeeds = {
            food: camp.foodPackets || 0,
            water: camp.waterLiters || 0,
            beds: camp.beds || 0,
            medKits: camp.medicalKits || 0,
            ambulances: camp.ambulances || 0
        };

        const resourceKeys = ['food', 'water', 'beds', 'medKits', 'ambulances'];
        const campAllocationsByProvider = {};

        resourceKeys.forEach(resKey => {
            let remainingNeed = campNeeds[resKey];
            if (remainingNeed <= 0) return;

            const campWindowRank = etaRank[camp.urgency?.toUpperCase()] || 99;
            let viableProviders = inventory.filter(p => {
                const provRank = etaRank[p.rawResponseTime?.toUpperCase()] || 99;
                return provRank <= campWindowRank && p[resKey] > 0;
            });

            viableProviders.sort((a, b) => {
                const aRank = etaRank[a.rawResponseTime?.toUpperCase()] || 99;
                const bRank = etaRank[b.rawResponseTime?.toUpperCase()] || 99;

                if (aRank !== bRank) return bRank - aRank;
                if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
                if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;
                return b[resKey] - a[resKey];
            });

            viableProviders.forEach(provider => {
                if (remainingNeed <= 0) return;

                const amountToTake = Math.min(remainingNeed, provider[resKey]);
                if (amountToTake > 0) {
                    if (!campAllocationsByProvider[provider.id]) {
                        campAllocationsByProvider[provider.id] = {
                            provider: provider,
                            resources: []
                        };
                    }

                    campAllocationsByProvider[provider.id].resources.push({
                        label: resKey.charAt(0).toUpperCase() + resKey.slice(1),
                        count: amountToTake
                    });

                    provider[resKey] -= amountToTake;
                    remainingNeed -= amountToTake;
                }
            });
        });

        Object.values(campAllocationsByProvider).forEach(assign => {
            const allocId = `${camp.campId}-${assign.provider.id}`;
            newAllocations.push({
                id: allocId,
                campId: camp.campId,
                providerId: assign.provider.id,
                campName: camp.campName,
                urgency: camp.urgency,
                providerName: assign.provider.name,
                providerLocation: assign.provider.location || assign.provider.city || "Unknown",
                resourcesAssigned: assign.resources,
                eta: assign.provider.eta,
                status: 'ASSIGNED',
                campCoords: camp.latitude && camp.longitude ? [camp.latitude, camp.longitude] : null
            });
        });
    });

    return newAllocations;
};
