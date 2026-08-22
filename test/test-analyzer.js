/**
 * Automated test suite for AI-o-Meter Heuristic Engine
 */

const { analyzeText } = require('../src/analyzer.js');

const HUMAN_SAMPLE = `
Hey folks! So yesterday I spent nearly four agonizing hours tracking down this bizarre memory leak in our production real-time dashboard. We'd deploy a new build, everything would look pristine for about thirty minutes, and then boom — node heap memory started climbing up like a hockey stick until Kubernetes killed the pod.

Naturally, my first instinct was to blame our WebSocket client library. I dug through their GitHub issues, tried downgrading three minor versions, and even wrote a tiny custom wrapper around the reconnect logic. Nothing changed.

It wasn't until around 1:45 AM, after downing a brutally bitter cup of cold brew and mumbling to myself like a crazy person, that I finally took a heap snapshot with Chrome DevTools. Guess what? We had an event listener inside a custom React hook that was capturing a stale state closure and never unsubscribing when components unmounted!

The fix? Literally two lines of code inside a cleanup function. Don't be like me — always double-check your cleanup returns before going down a 4-hour rabbit hole.
`;

const MIXED_SAMPLE = `
When we redesigned our core dashboard last quarter, our biggest headache was keeping complex state synchronized across tabs. I've spent the better part of three weeks profiling re-renders, and honestly, raw Redux wasn't cutting it anymore. We decided to try hierarchical statecharts instead.

First and foremost, let us delve into the architectural foundations of statecharts. It is important to note that state synchronization plays a pivotal role in ensuring deterministic user flows. By eliminating impossible states, developers can harness the power of explicit transitions.

Furthermore, integrating state machines with reactive streams offers a structured mechanism for handling asynchronous side effects. The approach allows engineering teams to unlock new possibilities when orchestrating multi-step authentication workflows.

So if your app is drowning in boolean flags like isLoading and isError, give statecharts a shot. It took us a few days to get used to the syntax, but it completely eliminated our stale UI bugs.
`;

const ROBOT_SAMPLE = `
In today's fast-paced digital landscape, artificial intelligence plays a pivotal role in reshaping traditional enterprise workflows. It is important to note that machine learning stands as a testament to technological innovation, offering a plethora of multifaceted solutions across diverse sectors.

Furthermore, forward-thinking organizations must delve into cutting-edge paradigms to foster sustainable innovation and operational excellence. Harnessing the power of automated intelligence unlocks unprecedented opportunities, creating a rich tapestry of data-driven capabilities.

Additionally, modern enterprises are poised to revolutionize customer engagement by adopting holistic generative frameworks. It is essential to remember that seamless integration across legacy architectures remains a cornerstone of digital transformation.

In conclusion, navigating the complexities of the modern technological era requires an unwavering commitment to continuous advancement. Embracing this revolutionary journey is of paramount importance for long-term strategic success.
`;

console.log('==============================================');
console.log('   AI-o-Meter Heuristic Engine Calibration    ');
console.log('==============================================\n');

const humanRes = analyzeText(HUMAN_SAMPLE, 'journal.samwrites.dev');
console.log(`[SAMPLE 1 - HUMAN]`);
console.log(`Score: ${humanRes.score}% (${humanRes.categoryLabel})`);
console.log(`Verdict: "${humanRes.verdictTitle}"`);
console.log(`Explanation: "${humanRes.subverdict}"`);
console.log(`Breakdown:`, humanRes.breakdown);
console.log(`Details:`, humanRes.details);
console.log('----------------------------------------------\n');

const mixedRes = analyzeText(MIXED_SAMPLE, 'producthub.io/blog');
console.log(`[SAMPLE 2 - MIXED]`);
console.log(`Score: ${mixedRes.score}% (${mixedRes.categoryLabel})`);
console.log(`Verdict: "${mixedRes.verdictTitle}"`);
console.log(`Explanation: "${mixedRes.subverdict}"`);
console.log(`Breakdown:`, mixedRes.breakdown);
console.log(`Details:`, mixedRes.details);
console.log('----------------------------------------------\n');

const robotRes = analyzeText(ROBOT_SAMPLE, 'techinsights-daily.com');
console.log(`[SAMPLE 3 - ROBOT AI]`);
console.log(`Score: ${robotRes.score}% (${robotRes.categoryLabel})`);
console.log(`Verdict: "${robotRes.verdictTitle}"`);
console.log(`Explanation: "${robotRes.subverdict}"`);
console.log(`Breakdown:`, robotRes.breakdown);
console.log(`Details:`, robotRes.details);
console.log('----------------------------------------------\n');

// Assertions
let allPassed = true;

if (humanRes.score > 35) {
  console.error(`FAIL: Human sample scored too high (${humanRes.score}%), expected <= 35%`);
  allPassed = false;
} else {
  console.log(`PASS: Human sample categorized correctly as ${humanRes.category} (${humanRes.score}%)`);
}

if (mixedRes.score < 36 || mixedRes.score > 65) {
  console.error(`FAIL: Mixed sample score (${mixedRes.score}%) outside 36-65% range`);
  allPassed = false;
} else {
  console.log(`PASS: Mixed sample categorized correctly as ${mixedRes.category} (${mixedRes.score}%)`);
}

if (robotRes.score <= 65) {
  console.error(`FAIL: Robot sample scored too low (${robotRes.score}%), expected > 65%`);
  allPassed = false;
} else {
  console.log(`PASS: Robot sample categorized correctly as ${robotRes.category} (${robotRes.score}%)`);
}

if (humanRes.score < mixedRes.score && mixedRes.score < robotRes.score) {
  console.log(`PASS: Monotonic ranking verified: Human (${humanRes.score}%) < Mixed (${mixedRes.score}%) < Robot (${robotRes.score}%)`);
} else {
  console.error(`FAIL: Monotonic ranking violated`);
  allPassed = false;
}

if (allPassed) {
  console.log('\n>>> ALL HEURISTIC ENGINE TESTS PASSED! <<<');
  process.exit(0);
} else {
  console.error('\n>>> SOME TESTS FAILED! <<<');
  process.exit(1);
}
