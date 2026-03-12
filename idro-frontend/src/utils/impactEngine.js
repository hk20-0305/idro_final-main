export function calculateImpact(disaster) {
  const people = Number(disaster.affected || 0);
  const injured = Number(disaster.injured || 0);
  const camps = disaster.camps || [];

  const foodPerDay = people * 2;
  const waterPerDay = people * 3;
  const medicalTeams = Math.ceil(injured / 40);
  const ambulances = Math.ceil(injured / 25);
  const volunteers = Math.ceil(people / 30);

  const campNeeds = {};
  camps.forEach(camp => {
    (camp.needs || []).forEach(n => {
      campNeeds[n] = (campNeeds[n] || 0) + 1;
    });
  });

  return {
    title: `${disaster.type} - ${disaster.location}`,
    foodPerDay,
    waterPerDay,
    medicalTeams,
    ambulances,
    volunteers,
    campNeeds,
  };
}
