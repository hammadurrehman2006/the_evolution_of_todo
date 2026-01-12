/**
 * Test notification timing logic
 * Verifies that 5-minute and 1-minute notifications fire at correct times
 */

const fiveMinutesMs = 5 * 60 * 1000  // 5 minutes
const oneMinuteMs = 1 * 60 * 1000     // 1 minute

function testNotificationLogic(minutesRemaining) {
  const timeUntilDue = minutesRemaining * 60 * 1000 // Convert to ms

  // 5-minute notification condition: > 1 min AND <= 5 min
  const shouldFire5Min = timeUntilDue > oneMinuteMs && timeUntilDue <= fiveMinutesMs

  // 1-minute notification condition: > 0 AND <= 1 min
  const shouldFire1Min = timeUntilDue > 0 && timeUntilDue <= oneMinuteMs

  return {
    minutesRemaining,
    timeUntilDue,
    shouldFire5Min,
    shouldFire1Min,
    bothFire: shouldFire5Min && shouldFire1Min
  }
}

console.log('\n=== Notification Timing Logic Test ===\n')

// Test cases
const testCases = [
  6,    // 6 minutes - no notification
  5,    // 5 minutes - should fire 5-min notification
  4,    // 4 minutes - should fire 5-min notification
  3,    // 3 minutes - should fire 5-min notification
  2,    // 2 minutes - should fire 5-min notification
  1.5,  // 1.5 minutes - should fire 5-min notification
  1,    // 1 minute - should fire 1-min notification ONLY
  0.5,  // 30 seconds - should fire 1-min notification ONLY
  0.1,  // 6 seconds - should fire 1-min notification ONLY
  0,    // Overdue - no notification
]

testCases.forEach(minutes => {
  const result = testNotificationLogic(minutes)

  let status = '❌ No notification'
  if (result.bothFire) {
    status = '🐛 BUG: BOTH notifications fire!'
  } else if (result.shouldFire5Min) {
    status = '✅ 5-minute notification'
  } else if (result.shouldFire1Min) {
    status = '✅ 1-minute notification'
  }

  console.log(`${minutes.toFixed(1)} min remaining: ${status}`)
})

console.log('\n=== Expected Behavior ===')
console.log('6.0+ minutes: No notification')
console.log('5.0 - 1.1 minutes: 5-minute notification fires')
console.log('1.0 - 0.1 minutes: 1-minute notification fires')
console.log('0.0 minutes (overdue): No notification')
console.log('\n')
