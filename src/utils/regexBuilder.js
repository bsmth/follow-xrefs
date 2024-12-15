function regexBuilder(inputLocale = "en-US") {
  // step 1 for making this locale-independent
  // Not sure how to make this user-configurable
  // or what it would look like
  const localeString = `/${inputLocale}/docs/`;

  // Create a regex with a template literal for the locale
  // Group 2 is the slug after ${localeString}
  // Group 3 is the hash / URL fragment after the slug
  // We're ignoring #fragments for now
  return new RegExp(`\\[.*?\\]\\((${localeString}(.*?)(#.*)?)\\)`);
}

module.exports = { regexBuilder };
