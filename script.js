"use strict";

// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const form = document.getElementById("passwordForm");
const passwordInput = document.getElementById("password");
const toggleButton = document.getElementById("togglePassword");

const resultSection = document.getElementById("result");
const strengthLabel = document.getElementById("strengthLabel");
const scoreLabel = document.getElementById("scoreLabel");
const strengthMeter = document.getElementById("strengthMeter");
const meterFill = document.getElementById("meterFill");
const checklist = document.getElementById("checklist");
const suggestions = document.getElementById("suggestions");
const commonWarning = document.getElementById("commonWarning");
const entropyValue = document.getElementById("entropyValue");

// ==========================================
// 2. COMMON PASSWORD EXAMPLES
// ==========================================

const commonPasswords = new Set([
    "password",
    "password123",
    "123456",
    "12345678",
    "123456789",
    "qwerty",
    "admin",
    "letmein",
    "welcome",
    "iloveyou",
    "abc123",
    "password1",
    "Password123!"
].map(password => password.toLowerCase()));

// This is only a small educational list,
// not a database of leaked passwords.

// ==========================================
// 3. PASSWORD SECURITY RULES
// ==========================================

const rules = [
    {
        label: "At least 8 characters",
        test: password => password.length >= 8,
        tip: "Use at least 8 characters. A longer, unique passphrase is better."
    },
    {
        label: "Contains an uppercase letter (A-Z)",
        test: password => /[A-Z]/.test(password),
        tip: "Consider adding an uppercase letter."
    },
    {
        label: "Contains a lowercase letter (a-z)",
        test: password => /[a-z]/.test(password),
        tip: "Consider adding a lowercase letter."
    },
    {
        label: "Contains a number (0-9)",
        test: password => /[0-9]/.test(password),
        tip: "Consider adding a number."
    },
    {
        label: "Contains a symbol",
        test: password => /[^A-Za-z0-9]/.test(password),
        tip: "Consider adding a symbol, such as !, @, or #."
    }
];

// ==========================================
// 4. SHOW / HIDE PASSWORD
// ==========================================


const eyeIcon = document.getElementById("eyeIcon");

toggleButton.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    toggleButton.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
    );

    toggleButton.setAttribute("aria-pressed", String(isHidden));

    eyeIcon.innerHTML = isHidden
        ? `
            <path d="M3 3l18 18"/>
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
            <path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a14 14 0 0 1-3 3.8"/>
            <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8"/>
          `
        : `
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3"/>
          `;
});

// ==========================================
// 5. HANDLE FORM SUBMISSION
// ==========================================

form.addEventListener("submit", event => {
    event.preventDefault();

    const password = passwordInput.value;

    if (password.length === 0) {
        resultSection.hidden = false;
        strengthLabel.textContent = "Password required";
        scoreLabel.textContent = "—";
        meterFill.style.width = "0%";
        strengthMeter.setAttribute("aria-valuenow", "0");

        checklist.replaceChildren();
        suggestions.replaceChildren();
        commonWarning.hidden = true;

        if (entropyValue) {
            entropyValue.textContent = "0.0";
        }

        addListItem(suggestions, "Enter a test password to begin.");
        return;
    }

    analyzePassword(password);
});

// ==========================================
// 6. MAIN PASSWORD ANALYZER
// ==========================================

function analyzePassword(password) {
    const results = rules.map(rule => ({
        label: rule.label,
        passed: rule.test(password),
        tip: rule.tip
    }));

    const score = results.filter(item => item.passed).length;
    const isCommon = commonPasswords.has(password.toLowerCase());

    const detectedPatterns = detectPredictablePatterns(password);
    const entropy = estimateEntropy(password);

    if (entropyValue) {
        entropyValue.textContent = entropy.toFixed(1);
    }

    renderChecklist(results);

    renderSuggestions(
        results,
        isCommon,
        detectedPatterns
    );

    renderStrength(
        score,
        isCommon,
        detectedPatterns.length > 0
    );
generateAuditReport(
    results,
    isCommon,
    detectedPatterns,
    entropy
);
    commonWarning.hidden = !isCommon;

    if (isCommon) {
        commonWarning.textContent =
            "Warning: This password matches our small example list. " +
            "Avoid common or reused passwords.";
    }

    resultSection.hidden = false;
}

// ==========================================
// 7. DETECT PREDICTABLE PATTERNS
// ==========================================

function detectPredictablePatterns(password) {
    const patterns = [];

    // Four or more identical consecutive characters
    if (/(.)\1{3,}/i.test(password)) {
        patterns.push(
            "Contains repeated characters, such as aaaa or 1111."
        );
    }

    // Common ascending or descending number sequences
    if (
        /1234|2345|3456|4567|5678|6789|9876|8765|7654|6543/.test(password)
    ) {
        patterns.push(
            "Contains a predictable number sequence."
        );
    }

    // Common keyboard sequences
    if (/qwerty|asdf|zxcv/i.test(password)) {
        patterns.push(
            "Contains a common keyboard pattern."
        );
    }

    // Common password-related words
    if (/password|admin|welcome|letmein/i.test(password)) {
        patterns.push(
            "Contains a commonly used password word."
        );
    }

    return patterns;
}

// ==========================================
// 8. ESTIMATE PASSWORD ENTROPY
// ==========================================

function estimateEntropy(password) {
    if (password.length === 0) {
        return 0;
    }

    let poolSize = 0;

    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) poolSize += 33;

    if (poolSize === 0) {
        return 0;
    }

    return password.length * Math.log2(poolSize);
}

// ==========================================
// 9. DISPLAY SECURITY CHECKLIST
// ==========================================

function renderChecklist(results) {
    checklist.replaceChildren();

    results.forEach(item => {
        const row = document.createElement("li");
        row.className = `check-item ${item.passed ? "pass" : "fail"}`;

        const icon = document.createElement("span");
        icon.className = "check-icon";
        icon.textContent = item.passed ? "✓" : "✕";
        icon.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.textContent = item.label;

        row.append(icon, label);
        checklist.appendChild(row);
    });
}

// ==========================================
// 10. DISPLAY RECOMMENDATIONS
// ==========================================

function renderSuggestions(results, isCommon, detectedPatterns = []) {
    suggestions.replaceChildren();

    const tips = results
        .filter(item => !item.passed)
        .map(item => item.tip);

    if (isCommon) {
        tips.unshift(
            "Choose a unique password that is difficult to guess."
        );
    }

    detectedPatterns.forEach(pattern => {
        tips.push(pattern);
    });

    if (tips.length === 0) {
        tips.push(
            "No obvious patterns were detected by these basic checks."
        );

        tips.push(
            "Use a unique password for every account."
        );

        tips.push(
            "Consider using a password manager and enabling multi-factor authentication."
        );
    }

    tips.forEach(tip => addListItem(suggestions, tip));
}

// ==========================================
// 11. DISPLAY PASSWORD STRENGTH
// ==========================================

function renderStrength(score, isCommon, hasPatterns) {
    let label;
    let color;

    if (isCommon || hasPatterns || score <= 2) {
        label = "Weak";
        color = "var(--red)";
    } else if (score <= 4) {
        label = "Moderate";
        color = "var(--yellow)";
    } else {
        label = "Strong by basic checks";
        color = "var(--green)";
    }

    strengthLabel.textContent = label;
    scoreLabel.textContent = `${score} / 5 checks passed`;

    meterFill.style.width = `${(score / rules.length) * 100}%`;
    meterFill.style.background = color;

    strengthMeter.setAttribute("aria-valuenow", String(score));

    strengthMeter.setAttribute(
        "aria-valuetext",
        `${score} of 5 checks passed`
    );
}

// ==========================================
// 12. HELPER FUNCTION
// ==========================================

function addListItem(list, text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
}

function generateAuditReport(results, isCommon, detectedPatterns, entropy) {
    const auditDate = document.getElementById("auditDate");
    const auditStatus = document.getElementById("auditStatus");
    const auditPassed = document.getElementById("auditPassed");
    const auditEntropy = document.getElementById("auditEntropy");
    const auditRisks = document.getElementById("auditRisks");
    const auditRecommendations =
        document.getElementById("auditRecommendations");

    if (!auditDate) return;

    const passed = results.filter(item => item.passed).length;

    let status = "Needs Improvement";

    if (isCommon || detectedPatterns.length > 0 || passed <= 2) {
        status = "High Risk";
    } else if (passed === 5) {
        status = "Passed Basic Checks";
    } else if (passed >= 3) {
        status = "Moderate Risk";
    }

    auditDate.textContent = new Date().toLocaleString();
    auditStatus.textContent = status;
    auditPassed.textContent = String(passed);
    auditEntropy.textContent = entropy.toFixed(1);

    auditRisks.replaceChildren();
    auditRecommendations.replaceChildren();

    if (isCommon) {
        addListItem(
            auditRisks,
            "Password matches an entry in the small common-password sample list."
        );
    }

    detectedPatterns.forEach(pattern => {
        addListItem(auditRisks, pattern);
    });

    results.filter(item => !item.passed).forEach(item => {
        addListItem(auditRisks, `Failed check: ${item.label}`);
        addListItem(auditRecommendations, item.tip);
    });

    if (!isCommon && detectedPatterns.length === 0 && passed === 5) {
        addListItem(
            auditRisks,
            "No risks detected by the basic checks used in this project."
        );
    }

    if (isCommon || detectedPatterns.length > 0) {
        addListItem(
            auditRecommendations,
            "Choose a unique password without common words or predictable sequences."
        );
    }

    addListItem(
        auditRecommendations,
        "Use a different password for every account."
    );

    addListItem(
        auditRecommendations,
        "Use a password manager and enable multi-factor authentication."
    );
}

const printReportButton = document.getElementById("printReport");

if (printReportButton) {
    printReportButton.addEventListener("click", () => {
        window.print();
    });
}