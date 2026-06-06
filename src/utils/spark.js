export function calculateSparkScore(userA, userB) {
  let score = 0;
  if (!userA || !userB) return 0;
  const aInterests = userA.interests || [];
  const bInterests = userB.interests || [];
  const sharedInterests = aInterests.filter((i) => bInterests.includes(i));
  score += sharedInterests.length * 3;

  const goalPairs = [
    ['стартап', 'сотрудник'], ['программирование', 'разработка'],
    ['дизайн', 'ui'], ['дизайн', 'ux'], ['исследование', 'наука'],
    ['бизнес', 'предприниматель'], ['медицин', 'здоровь'],
    ['право', 'юрист'], ['запустить', 'участвовать'], ['учить', 'изучать'],
  ];
  const aGoal = (userA.goal || '').toLowerCase();
  const bGoal = (userB.goal || '').toLowerCase();
  for (const [kw1, kw2] of goalPairs) {
    if ((aGoal.includes(kw1) && bGoal.includes(kw2)) || (aGoal.includes(kw2) && bGoal.includes(kw1))) {
      score += 5;
      break;
    }
  }

  if (userA.faculty && userA.faculty === userB.faculty) score += 2;
  return score;
}

export const SPARK_THRESHOLD = 6;

export function sharedInterests(userA, userB) {
  const a = userA?.interests || [];
  const b = userB?.interests || [];
  return a.filter((i) => b.includes(i));
}
