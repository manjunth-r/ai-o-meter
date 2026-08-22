/**
 * Curated dictionary of common AI / LLM phrases, buzzwords, and stylistic markers.
 * Used for heuristic detection of AI-generated phrasing.
 */

const AI_CLICHES = [
  // High-confidence GPT-isms
  "delve into", "delves into", "delving into", "delved into",
  "rich tapestry", "tapestry of", "intricate tapestry",
  "in today's fast-paced world", "in today's digital landscape", "in today's interconnected world",
  "in today's world", "in the digital age", "in this digital era", "in the modern era",
  "testament to", "stands as a testament", "serves as a testament",
  "beacon of", "beacon of hope", "beacon of light", "beacon of innovation",
  "it is important to note", "it's important to note", "it is worth noting", "it's worth noting",
  "it is crucial to", "it's crucial to", "it is essential to", "it's essential to remember",
  "vital role", "pivotal role", "crucial role", "plays a vital role", "plays a pivotal role", "plays a crucial role",
  "game-changer", "game changer", "a true game-changer",
  "dive deep into", "deep dive into", "take a deep dive",
  "harness the power of", "harnessing the power", "unleash the potential", "unleashing the power",
  "unlock the potential", "unlocking the potential", "unlocking new possibilities",
  "seamless integration", "seamlessly blends", "seamlessly integrated", "seamless blend",
  "a multitude of", "plethora of", "myriad of", "myriad of ways",
  "of paramount importance", "is paramount", "paramount to success",
  "in the realm of", "within the realm of", "into the realm of",
  "foster a sense of", "fosters innovation", "fostering collaboration", "foster meaningful",
  "ever-evolving landscape", "ever-changing landscape", "ever-evolving world",
  "shed light on", "sheds light on", "shedding light on",
  "embark on a journey", "embarking on a journey", "embark on this journey",
  "at the forefront of", "at the cutting edge of", "at the intersection of",
  "serves as a cornerstone", "cornerstone of", "bedrock of",
  "treasure trove of", "a treasure trove",
  "catalyst for change", "act as a catalyst", "catalyst for growth",
  "navigating the complexities", "navigate the complexities", "navigating the intricate",
  "nuanced understanding", "nuanced approach", "nuances of",
  "holistic approach", "holistic view", "multifaceted approach",
  "symphony of", "kaleidoscope of", "mosaic of",
  "unwavering commitment", "unwavering dedication", "unwavering support",
  "underscores the importance", "underscores the need", "underscoring the significance",
  "poised to revolutionize", "poised to transform", "poised for growth",
  "revolutionary approach", "groundbreaking advancement", "groundbreaking innovation",
  "paradigm shift", "ushering in a new era", "ushers in a new",
  "elevate your", "elevating the experience", "elevate the standard",
  "empower individuals", "empowering users", "empower businesses",
  "resonate deeply", "resonates with", "strike a chord",
  "quintessential example", "epitome of", "pinnacle of",
  "breath of fresh air", "step in the right direction",
  "a double-edged sword", "at the end of the day",
  "without further ado", "it goes without saying",
  "leaves much to be desired", "only time will tell",
  "paint a vivid picture", "crafting a narrative", "weaving a story",
  "harmonious blend", "seamless synergy", "dynamic interplay",
  "profound impact", "far-reaching implications", "indelible mark",
  "poignant reminder", "stark reminder", "compelling case",
  "unparalleled excellence", "unrivaled performance", "unmatched quality",
  "pushing the boundaries", "redefining the way", "setting new benchmarks",
  "transformative power", "monumental shift", "seismic shift",

  // Overused formal transitional connectors
  "furthermore,", "moreover,", "additionally,", "consequently,", "subsequently,",
  "in conclusion,", "to summarize,", "in summary,", "all in all,", "ultimately,",
  "first and foremost,", "last but not least,", "on the one hand,", "on the other hand,",
  "notably,", "importantly,", "significantly,", "crucially,", "essentially,",
  "in essence,", "by and large,", "needless to say,", "as a matter of fact,"
];

// Single word high-frequency AI markers (scored with contextual weighting)
const AI_BUZZWORDS = [
  "delve", "tapestry", "boasts", "plethora", "myriad",
  "paramount", "multifaceted", "holistic", "cornerstone",
  "underscores", "poised", "unwavering", "quintessential",
  "testament", "beacon", "foster", "fostered", "fostering"
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AI_CLICHES, AI_BUZZWORDS };
}
