// =====================================================
// Password Strength Validator
// =====================================================
// Validates password strength and provides feedback
// =====================================================

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: string, score: number }
 */
export function validatePasswordStrength(password) {
    const errors = [];
    let score = 0;

    // Check minimum length
    if (!password || password.length < PASSWORD_RULES.minLength) {
        errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
    } else {
        score += 20;
        // Bonus points for longer passwords
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;
    }

    // Check for uppercase letters
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        score += 20;
    }

    // Check for lowercase letters
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        score += 20;
    }

    // Check for numbers
    if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        score += 20;
    }

    // Check for special characters
    const specialCharRegex = new RegExp(`[${PASSWORD_RULES.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (PASSWORD_RULES.requireSpecialChars && !specialCharRegex.test(password)) {
        errors.push(`Password must contain at least one special character (${PASSWORD_RULES.specialChars})`);
    } else {
        score += 20;
    }

    // Check for common patterns (sequential numbers, repeated characters, etc.)
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Password should not contain repeated characters');
        score -= 10;
    }

    if (/12345|23456|34567|45678|56789|67890/.test(password)) {
        errors.push('Password should not contain sequential numbers');
        score -= 10;
    }

    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        errors.push('Password should not contain sequential letters');
        score -= 10;
    }

    // Common weak passwords
    const weakPasswords = [
        'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
        'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
        'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
        'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael'
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common. Please choose a more unique password');
        score = 0;
    }

    // Determine strength level
    let strength = 'weak';
    if (score >= 90) {
        strength = 'very strong';
    } else if (score >= 70) {
        strength = 'strong';
    } else if (score >= 50) {
        strength = 'moderate';
    } else if (score >= 30) {
        strength = 'fair';
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score: Math.max(0, Math.min(100, score))
    };
}

/**
 * Check if password has been previously compromised (placeholder for future API integration)
 * Can integrate with Have I Been Pwned API in production
 */
export async function checkPasswordBreach(password) {
    // TODO: Integrate with Have I Been Pwned API
    // For now, just check against common passwords
    const commonPasswords = [
        'password', 'password123', '123456', '12345678', 'qwerty', 'abc123'
    ];
    
    return {
        isBreached: commonPasswords.includes(password.toLowerCase()),
        message: 'This password has been found in data breaches. Please choose a different password.'
    };
}

/**
 * Generate password strength indicator for UI
 */
export function getPasswordStrengthIndicator(score) {
    if (score >= 90) {
        return { color: '#22c55e', text: 'Very Strong', width: '100%' };
    } else if (score >= 70) {
        return { color: '#84cc16', text: 'Strong', width: '80%' };
    } else if (score >= 50) {
        return { color: '#eab308', text: 'Moderate', width: '60%' };
    } else if (score >= 30) {
        return { color: '#f97316', text: 'Fair', width: '40%' };
    } else {
        return { color: '#ef4444', text: 'Weak', width: '20%' };
    }
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = PASSWORD_RULES.specialChars;
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
