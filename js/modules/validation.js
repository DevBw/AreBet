// Validation Module - Handles all input validation and data sanitization
class Validation {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    // Clear validation messages
    clearMessages() {
        this.errors = [];
        this.warnings = [];
    }

    // Add error message
    addError(message, field = null) {
        this.errors.push({ message, field, type: 'error' });
    }

    // Add warning message
    addWarning(message, field = null) {
        this.warnings.push({ message, field, type: 'warning' });
    }

    // Get all validation messages
    getMessages() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            hasErrors: this.errors.length > 0,
            hasWarnings: this.warnings.length > 0
        };
    }

    // API Key validation
    validateApiKey(apiKey) {
        this.clearMessages();
        
        if (!apiKey) {
            this.addError('API key is required');
            return false;
        }
        
        if (typeof apiKey !== 'string') {
            this.addError('API key must be a string');
            return false;
        }
        
        if (apiKey.trim().length === 0) {
            this.addError('API key cannot be empty');
            return false;
        }
        
        if (apiKey.length < 10) {
            this.addError('API key appears to be too short');
            return false;
        }
        
        if (apiKey.length > 100) {
            this.addError('API key appears to be too long');
            return false;
        }
        
        // Check for common patterns
        if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
            this.addWarning('API key contains unusual characters');
        }
        
        return this.errors.length === 0;
    }

    // Match data validation
    validateMatch(match) {
        this.clearMessages();
        
        if (!match || typeof match !== 'object') {
            this.addError('Invalid match data');
            return false;
        }
        
        // Required fields
        const requiredFields = ['id', 'homeTeam', 'awayTeam', 'time', 'date', 'league'];
        requiredFields.forEach(field => {
            if (!match[field]) {
                this.addError(`${field} is required`, field);
            }
        });
        
        // Field-specific validation
        if (match.id && (typeof match.id !== 'number' || match.id <= 0)) {
            this.addError('Match ID must be a positive number', 'id');
        }
        
        if (match.homeTeam && typeof match.homeTeam !== 'string') {
            this.addError('Home team must be a string', 'homeTeam');
        }
        
        if (match.awayTeam && typeof match.awayTeam !== 'string') {
            this.addError('Away team must be a string', 'awayTeam');
        }
        
        if (match.homeTeam && match.awayTeam && match.homeTeam === match.awayTeam) {
            this.addError('Home team and away team cannot be the same');
        }
        
        // Date validation
        if (match.date) {
            const date = new Date(match.date);
            if (isNaN(date.getTime())) {
                this.addError('Invalid date format', 'date');
            }
        }
        
        // Time validation
        if (match.time) {
            // More flexible time validation - accept various formats
            const timePatterns = [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, // HH:MM:SS
                /^TBD$/, // To be determined
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM)$/i // HH:MM AM/PM
            ];
            
            const isValidTime = timePatterns.some(pattern => pattern.test(match.time));
            if (!isValidTime) {
                this.addError('Invalid time format', 'time');
            }
        }
        
        // Score validation
        if (match.homeScore !== undefined && match.homeScore !== null) {
            if (typeof match.homeScore !== 'number' || match.homeScore < 0) {
                this.addError('Home score must be a non-negative number', 'homeScore');
            }
        }
        
        if (match.awayScore !== undefined && match.awayScore !== null) {
            if (typeof match.awayScore !== 'number' || match.awayScore < 0) {
                this.addError('Away score must be a non-negative number', 'awayScore');
            }
        }
        
        return this.errors.length === 0;
    }

    // Search query validation
    validateSearchQuery(query) {
        this.clearMessages();
        
        if (!query) {
            this.addError('Search query is required');
            return false;
        }
        
        if (typeof query !== 'string') {
            this.addError('Search query must be a string');
            return false;
        }
        
        const trimmed = query.trim();
        if (trimmed.length === 0) {
            this.addError('Search query cannot be empty');
            return false;
        }
        
        if (trimmed.length < 2) {
            this.addError('Search query must be at least 2 characters long');
            return false;
        }
        
        if (trimmed.length > 100) {
            this.addError('Search query is too long (max 100 characters)');
            return false;
        }
        
        // Check for potentially harmful content
        if (/[<>\"'&]/.test(trimmed)) {
            this.addWarning('Search query contains special characters that will be escaped');
        }
        
        return this.errors.length === 0;
    }

    // User preferences validation
    validateUserPreferences(preferences) {
        this.clearMessages();
        
        if (!preferences || typeof preferences !== 'object') {
            this.addError('Invalid preferences data');
            return false;
        }
        
        // Theme validation
        if (preferences.theme) {
            const validThemes = ['light', 'dark', 'auto'];
            if (!validThemes.includes(preferences.theme)) {
                this.addError('Invalid theme value', 'theme');
            }
        }
        
        // Notifications validation
        if (preferences.notifications !== undefined) {
            if (typeof preferences.notifications !== 'boolean') {
                this.addError('Notifications setting must be a boolean', 'notifications');
            }
        }
        
        // Language validation
        if (preferences.language) {
            const validLanguages = ['en', 'es', 'fr', 'de', 'it'];
            if (!validLanguages.includes(preferences.language)) {
                this.addError('Invalid language value', 'language');
            }
        }
        
        return this.errors.length === 0;
    }

    // Data sanitization
    sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        return input
            .trim()
            .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
            .substring(0, 1000); // Limit length
    }

    sanitizeNumber(input) {
        const num = Number(input);
        return isNaN(num) ? 0 : Math.max(0, num);
    }

    sanitizeDate(input) {
        const date = new Date(input);
        return isNaN(date.getTime()) ? new Date() : date;
    }

    // Input sanitization for forms
    sanitizeFormData(formData) {
        const sanitized = {};
        
        for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else if (typeof value === 'number') {
                sanitized[key] = this.sanitizeNumber(value);
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }

    // Email validation
    validateEmail(email) {
        this.clearMessages();
        
        if (!email) {
            this.addError('Email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.addError('Invalid email format');
            return false;
        }
        
        if (email.length > 254) {
            this.addError('Email is too long');
            return false;
        }
        
        return this.errors.length === 0;
    }

    // Password validation
    validatePassword(password) {
        this.clearMessages();
        
        if (!password) {
            this.addError('Password is required');
            return false;
        }
        
        if (password.length < 8) {
            this.addError('Password must be at least 8 characters long');
        }
        
        if (password.length > 128) {
            this.addError('Password is too long');
        }
        
        if (!/[A-Z]/.test(password)) {
            this.addWarning('Password should contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            this.addWarning('Password should contain at least one lowercase letter');
        }
        
        if (!/[0-9]/.test(password)) {
            this.addWarning('Password should contain at least one number');
        }
        
        return this.errors.length === 0;
    }

    // URL validation
    validateUrl(url) {
        this.clearMessages();
        
        if (!url) {
            this.addError('URL is required');
            return false;
        }
        
        try {
            new URL(url);
        } catch (error) {
            this.addError('Invalid URL format');
            return false;
        }
        
        return this.errors.length === 0;
    }

    // File validation
    validateFile(file, options = {}) {
        this.clearMessages();
        
        if (!file) {
            this.addError('File is required');
            return false;
        }
        
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
            maxNameLength = 255
        } = options;
        
        if (file.size > maxSize) {
            this.addError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.addError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
        
        if (file.name.length > maxNameLength) {
            this.addError(`File name is too long (max ${maxNameLength} characters)`);
        }
        
        return this.errors.length === 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validation;
} 