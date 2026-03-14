export interface EvaluationResult {
  score: number;
  feedback: string;
  suggestions: string[];
}

export function evaluateSubmission(
  exerciseType: string,
  content: string,
  maxPoints: number
): EvaluationResult {
  switch (exerciseType) {
    case "write-test-case":
      return evaluateTestCaseSubmission(content, maxPoints);
    case "report-bug":
      return evaluateBugReportSubmission(content, maxPoints);
    case "write-automation":
      return evaluateAutomationSubmission(content, maxPoints);
    case "test-api":
      return evaluateApiTestSubmission(content, maxPoints);
    case "create-test-plan":
      return evaluateTestPlanSubmission(content, maxPoints);
    case "quiz":
      return evaluateQuizSubmission(content, maxPoints);
    default:
      return evaluateGenericSubmission(content, maxPoints);
  }
}

function evaluateTestCaseSubmission(content: string, maxPoints: number): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const lower = content.toLowerCase();

  if (content.length > 50) score += maxPoints * 0.15;
  else suggestions.push("Add more detail to your test case");

  if (lower.includes("step") || lower.includes("1.") || lower.includes("first")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Include clear numbered test steps");
  }

  if (lower.includes("expected") || lower.includes("result") || lower.includes("verify")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Add expected results for each step");
  }

  if (lower.includes("precondition") || lower.includes("prerequisite") || lower.includes("given")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Add preconditions before the test steps");
  }

  if (lower.includes("login") || lower.includes("navigate") || lower.includes("click") ||
    lower.includes("enter") || lower.includes("verify") || lower.includes("assert")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Use specific actions (click, enter, navigate) in your steps");
  }

  if (content.length > 200) score += maxPoints * 0.15;
  else suggestions.push("Provide more comprehensive coverage in your test case");

  score = Math.min(Math.round(score), maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Excellent test case! Very thorough with clear steps and expected results.";
  else if (percentage >= 0.7) feedback = "Good test case. A few improvements could make it more complete.";
  else if (percentage >= 0.5) feedback = "Decent start. Focus on adding more structured steps and expected results.";
  else feedback = "This test case needs significant improvement. Include clear steps, preconditions, and expected results.";

  return { score, feedback, suggestions };
}

function evaluateBugReportSubmission(content: string, maxPoints: number): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const lower = content.toLowerCase();

  if (content.length > 100) score += maxPoints * 0.15;
  else suggestions.push("Provide a more detailed description of the bug");

  if (lower.includes("step") || lower.includes("1.") || lower.includes("reproduce") || lower.includes("how to")) {
    score += maxPoints * 0.25;
  } else {
    suggestions.push("Include clear steps to reproduce the bug");
  }

  if (lower.includes("expected") || lower.includes("should")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Describe the expected behavior");
  }

  if (lower.includes("actual") || lower.includes("instead") || lower.includes("but") || lower.includes("however")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Describe the actual behavior you observed");
  }

  if (lower.includes("browser") || lower.includes("os") || lower.includes("version") ||
    lower.includes("environment") || lower.includes("chrome") || lower.includes("firefox")) {
    score += maxPoints * 0.1;
  } else {
    suggestions.push("Include environment details (browser, OS, version)");
  }

  if (lower.includes("critical") || lower.includes("high") || lower.includes("medium") || lower.includes("low")) {
    score += maxPoints * 0.1;
  } else {
    suggestions.push("Specify the severity of the bug");
  }

  score = Math.min(Math.round(score), maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Excellent bug report! Professional quality with all required fields.";
  else if (percentage >= 0.7) feedback = "Good bug report. A few more details would make it perfect.";
  else if (percentage >= 0.5) feedback = "Decent bug report. Focus on including reproduction steps and environment details.";
  else feedback = "This bug report needs more detail. A good bug report includes steps to reproduce, expected vs actual results, and environment info.";

  return { score, feedback, suggestions };
}

function evaluateAutomationSubmission(content: string, maxPoints: number): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const lower = content.toLowerCase();

  if (content.length > 100) score += maxPoints * 0.1;
  else suggestions.push("Write more complete automation code");

  if (lower.includes("test") || lower.includes("describe") || lower.includes("it(") || lower.includes("spec")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Structure your code with proper test blocks (describe/it or test)");
  }

  if (lower.includes("expect") || lower.includes("assert") || lower.includes("should")) {
    score += maxPoints * 0.25;
  } else {
    suggestions.push("Add assertions to verify expected behavior");
  }

  if (lower.includes("cy.") || lower.includes("driver.") || lower.includes("page.") ||
    lower.includes("browser.") || lower.includes("selenium") || lower.includes("playwright") || lower.includes("puppeteer")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Use proper automation framework commands (Cypress, Selenium, Playwright)");
  }

  if (lower.includes("before") || lower.includes("after") || lower.includes("setup") || lower.includes("teardown")) {
    score += maxPoints * 0.1;
  } else {
    suggestions.push("Add setup and teardown hooks for better test isolation");
  }

  if (lower.includes("//") || lower.includes("/*") || lower.includes("#")) {
    score += maxPoints * 0.1;
  } else {
    suggestions.push("Add comments to explain your test logic");
  }

  if (lower.includes("async") || lower.includes("await") || lower.includes("promise") || lower.includes("then")) {
    score += maxPoints * 0.05;
  }

  score = Math.min(Math.round(score), maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Excellent automation script! Well-structured with proper assertions and hooks.";
  else if (percentage >= 0.7) feedback = "Good automation script. Consider adding more assertions and setup/teardown.";
  else if (percentage >= 0.5) feedback = "Basic script detected. Add assertions and use framework-specific commands.";
  else feedback = "Script needs improvement. Use a proper testing framework with assertions.";

  return { score, feedback, suggestions };
}

function evaluateApiTestSubmission(content: string, maxPoints: number): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const lower = content.toLowerCase();

  if (content.length > 50) score += maxPoints * 0.15;

  if (lower.includes("get") || lower.includes("post") || lower.includes("put") ||
    lower.includes("delete") || lower.includes("patch")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Specify HTTP methods (GET, POST, PUT, DELETE)");
  }

  if (lower.includes("status") || lower.includes("200") || lower.includes("201") || lower.includes("response code")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Verify HTTP status codes in your tests");
  }

  if (lower.includes("json") || lower.includes("body") || lower.includes("payload") || lower.includes("request")) {
    score += maxPoints * 0.2;
  } else {
    suggestions.push("Include request/response body validation");
  }

  if (lower.includes("header") || lower.includes("auth") || lower.includes("token") || lower.includes("authorization")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Test authentication headers and authorization");
  }

  if (lower.includes("schema") || lower.includes("field") || lower.includes("property") || lower.includes("validate")) {
    score += maxPoints * 0.1;
  } else {
    suggestions.push("Validate response schema and fields");
  }

  score = Math.min(Math.round(score), maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Excellent API test! Covers methods, status codes, and response validation.";
  else if (percentage >= 0.7) feedback = "Good API test coverage. Add schema validation to perfect it.";
  else if (percentage >= 0.5) feedback = "Decent API test. Include status code checks and response body validation.";
  else feedback = "API test needs more coverage. Test status codes, request/response bodies, and authentication.";

  return { score, feedback, suggestions };
}

function evaluateTestPlanSubmission(content: string, maxPoints: number): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const lower = content.toLowerCase();

  if (content.length > 200) score += maxPoints * 0.15;
  else suggestions.push("A test plan should be comprehensive - add more detail");

  if (lower.includes("scope") || lower.includes("objective") || lower.includes("goal")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Define the scope and objectives of testing");
  }

  if (lower.includes("strategy") || lower.includes("approach") || lower.includes("methodology")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Describe the testing strategy and approach");
  }

  if (lower.includes("resource") || lower.includes("team") || lower.includes("tool") || lower.includes("environment")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Include resources, tools, and environment requirements");
  }

  if (lower.includes("timeline") || lower.includes("schedule") || lower.includes("milestone") || lower.includes("phase")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Add a timeline or schedule for testing phases");
  }

  if (lower.includes("risk") || lower.includes("assumption") || lower.includes("constraint")) {
    score += maxPoints * 0.15;
  } else {
    suggestions.push("Identify risks and assumptions");
  }

  if (lower.includes("exit criteria") || lower.includes("done") || lower.includes("completion") || lower.includes("acceptance")) {
    score += maxPoints * 0.1;
  } else {
    suggestions.push("Define exit criteria and acceptance criteria");
  }

  score = Math.min(Math.round(score), maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Comprehensive test plan covering all key areas!";
  else if (percentage >= 0.7) feedback = "Good test plan. Add entry/exit criteria for completeness.";
  else if (percentage >= 0.5) feedback = "Decent plan. Include strategy, resources, and timeline.";
  else feedback = "Test plan needs major work. Cover scope, strategy, resources, timeline, and risks.";

  return { score, feedback, suggestions };
}

function evaluateQuizSubmission(content: string, maxPoints: number): EvaluationResult {
  const score = Math.round(maxPoints * 0.7);
  return {
    score,
    feedback: "Quiz responses recorded and evaluated.",
    suggestions: ["Review the lesson material for areas where you scored lower"],
  };
}

function evaluateGenericSubmission(content: string, maxPoints: number): EvaluationResult {
  const score = content.length > 100 ? Math.round(maxPoints * 0.75) : Math.round(maxPoints * 0.4);
  return {
    score,
    feedback: "Submission received and evaluated.",
    suggestions: ["Provide more detail for a higher score"],
  };
}

export function evaluateBugReport(report: {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: string;
  environment?: string | null;
}): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const maxPoints = 100;

  if (report.title.length > 10 && report.title.length < 100) score += 15;
  else suggestions.push("Keep the bug title concise but descriptive (10-100 chars)");

  if (report.description.length > 50) score += 15;
  else suggestions.push("Provide a more detailed description");

  if (report.stepsToReproduce.length > 50) score += 25;
  else suggestions.push("Include detailed steps to reproduce the issue");

  if (report.expectedResult.length > 20) score += 20;
  else suggestions.push("Clearly describe what should happen");

  if (report.actualResult.length > 20) score += 15;
  else suggestions.push("Clearly describe what actually happened");

  if (report.environment && report.environment.length > 5) score += 10;
  else suggestions.push("Include environment details (browser, OS, version)");

  score = Math.min(score, maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Outstanding bug report! Professional quality ready for a real bug tracker.";
  else if (percentage >= 0.7) feedback = "Good bug report with clear reproduction steps.";
  else if (percentage >= 0.5) feedback = "Decent report. Add more detail to steps and environment.";
  else feedback = "Report needs improvement. Focus on clear reproduction steps and expected vs actual results.";

  return { score, feedback, suggestions };
}

export function evaluateTestCase(testCase: {
  title: string;
  description: string;
  preconditions: string;
  testSteps: string;
  expectedResult: string;
  testType: string;
  priority: string;
}): EvaluationResult {
  const suggestions: string[] = [];
  let score = 0;
  const maxPoints = 100;

  if (testCase.title.length > 10) score += 10;
  else suggestions.push("Write a more descriptive title");

  if (testCase.description.length > 30) score += 15;
  else suggestions.push("Expand the description to clarify what is being tested");

  if (testCase.preconditions.length > 20) score += 15;
  else suggestions.push("Specify clear preconditions before the test begins");

  if (testCase.testSteps.length > 50) score += 30;
  else suggestions.push("Write detailed numbered test steps");

  if (testCase.expectedResult.length > 20) score += 20;
  else suggestions.push("Describe the expected result clearly");

  if (testCase.testType) score += 5;
  if (testCase.priority) score += 5;

  score = Math.min(score, maxPoints);
  const percentage = score / maxPoints;

  let feedback: string;
  if (percentage >= 0.9) feedback = "Excellent test case! Well-structured and comprehensive.";
  else if (percentage >= 0.7) feedback = "Good test case. Minor improvements could perfect it.";
  else if (percentage >= 0.5) feedback = "Decent test case. Add more detail to steps and expected results.";
  else feedback = "Test case needs improvement. Ensure all fields are thoroughly filled.";

  return { score, feedback, suggestions };
}
