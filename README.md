### Welcome!

This package has no dependencies, but assumes you are using Node.js version 22.x

```
❯ node -v
v22.2.0
```

The tests can be executed with

```
npm run test
```

All three tests should be failing with the same error.

```
Error: Invalid CSV: No data rows available.
```

Solving this issue will allow you continue with the other two.
The issues are in order of ascending complexity, and the last one may require the use of Google if you encounter unfamiliar terms. This is expected.

Fixing all three test failures should result in `npm run test` outputting

```
✔ Should return no results for non-existent IDs
✔ Should return correct images for given subject IDs
✔ Should return correct images for given name query
```

### Submission guidelines:

1. Clone this repository
2. Fix the tests locally
3. Be prepared for discussion in-persion; You may bring notes
4. You do not need to submit the fixes prior to the in-person interview

If you are unable to complete the take-home assignment prior to the in-person interview, it is expected that you will attempt to complete it in-person as a live-coding exercise.

### Rules

1. Please refrain from the use of generative AI tools such as Copilot or ChatGPT
2. You may use Google to research unfamiliar terms or concepts
3. If you have questions, you may email the hiring team

### What to expect

There will be discussion about the thought process and debugging methods used.

If time permits, there will be discussion about how the DataProcessor class could be extended, enhanced, or optimized.
