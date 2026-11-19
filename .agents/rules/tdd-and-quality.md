---
trigger: always_on
---

# Test-Driven Development (TDD) & Quality

In this codebase, all bug fixes and features follow strict verification discipline:

1. **Red**: Write a failing automated test that reproduces the bug or asserts the required feature behavior. Run the test suite and confirm it fails for the expected reason.
2. **Green**: Write the minimal, cleanest production code needed to make the test pass. Run tests and verify success.
3. **Refactor**: Clean up the implementation without altering behavior. Check against Martin Fowler's code smells baseline. Ensure tests remain passing.
4. **No Feature Without Tests**: Never mark an issue, spec, or ticket as complete without passing automated tests.
