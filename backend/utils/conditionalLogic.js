export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true
  }

  const { logic, conditions } = rules
  const results = conditions.map((condition) => evaluateCondition(condition, answersSoFar))

  if (logic === "AND") {
    return results.every((result) => result === true)
  } else if (logic === "OR") {
    return results.some((result) => result === true)
  }

  return true
}

function evaluateCondition(condition, answersSoFar) {
  const { questionKey, operator, value } = condition
  const answerValue = answersSoFar[questionKey]

  if (answerValue === undefined || answerValue === null || answerValue === "") {
    return false
  }

  switch (operator) {
    case "equals":
      return answerValue === value
    case "notEquals":
      return answerValue !== value
    case "contains":
      if (Array.isArray(answerValue)) {
        return answerValue.includes(value)
      }
      return String(answerValue).includes(String(value))
    default:
      return false
  }
}
