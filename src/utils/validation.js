// Form validation utilities
export const validationRules = {
  // Email validation
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' }
  ],

  // Password validation
  password: [
    { required: true, message: 'Password is required' },
    { min: 8, message: 'Password must be at least 8 characters' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
      message: 'Password must contain uppercase, lowercase, number, and special character'
    }
  ],

  // Confirm password validation
  confirmPassword: (passwordField) => [
    { required: true, message: 'Please confirm your password' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue(passwordField) === value) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('Passwords do not match'))
      }
    })
  ],

  // Name validation
  fullName: [
    { required: true, message: 'Full name is required' },
    { min: 2, message: 'Name must be at least 2 characters' },
    { max: 100, message: 'Name must be less than 100 characters' }
  ],

  // Phone validation
  phone: [
    { required: false },
    {
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    }
  ],

  // URL validation
  url: [
    { required: false },
    { type: 'url', message: 'Please enter a valid URL' }
  ],

  // Required field validation
  required: (fieldName) => [
    { required: true, message: `${fieldName} is required` }
  ],

  // Number validation
  number: [
    { type: 'number', message: 'Please enter a valid number' }
  ],

  // Positive number validation
  positiveNumber: [
    { type: 'number', min: 0, message: 'Please enter a positive number' }
  ],

  // Date validation
  date: [
    { type: 'date', message: 'Please enter a valid date' }
  ],

  // Future date validation
  futureDate: [
    { type: 'date', message: 'Please enter a valid date' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || new Date(value) > new Date()) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('Date must be in the future'))
      }
    })
  ],

  // Text area validation
  textArea: (min = 10, max = 1000) => [
    { required: true, message: 'This field is required' },
    { min, message: `Minimum ${min} characters required` },
    { max, message: `Maximum ${max} characters allowed` }
  ],

  // Company name validation
  companyName: [
    { required: true, message: 'Company name is required' },
    { min: 2, message: 'Company name must be at least 2 characters' },
    { max: 100, message: 'Company name must be less than 100 characters' }
  ],

  // Skills validation
  skills: [
    { required: false },
    { max: 500, message: 'Skills description must be less than 500 characters' }
  ],

  // Bio validation
  bio: [
    { required: false },
    { max: 1000, message: 'Bio must be less than 1000 characters' }
  ],

  // Location validation
  location: [
    { required: true, message: 'Location is required' },
    { min: 2, message: 'Location must be at least 2 characters' },
    { max: 100, message: 'Location must be less than 100 characters' }
  ],

  // Internship title validation
  internshipTitle: [
    { required: true, message: 'Internship title is required' },
    { min: 5, message: 'Title must be at least 5 characters' },
    { max: 200, message: 'Title must be less than 200 characters' }
  ],

  // Internship description validation
  internshipDescription: [
    { required: true, message: 'Description is required' },
    { min: 20, message: 'Description must be at least 20 characters' },
    { max: 2000, message: 'Description must be less than 2000 characters' }
  ],

  // Stipend validation
  stipend: [
    { type: 'number', min: 0, message: 'Stipend must be a positive number' }
  ],

  // Duration validation
  duration: [
    { required: true, message: 'Duration is required' },
    { min: 1, message: 'Duration must be at least 1 month' },
    { max: 24, message: 'Duration must be less than 24 months' }
  ]
}

// Real-time validation functions
export const realTimeValidation = {
  // Email validation
  validateEmail: (email) => {
    if (!email) return { valid: false, message: 'Email is required' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' }
    }
    return { valid: true, message: '' }
  },

  // Password strength validation
  validatePasswordStrength: (password) => {
    if (!password) return { valid: false, message: 'Password is required', strength: 0 }
    
    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password)
    }
    
    Object.values(checks).forEach(check => {
      if (check) strength += 20
    })
    
    let message = ''
    if (strength < 40) message = 'Very weak'
    else if (strength < 60) message = 'Weak'
    else if (strength < 80) message = 'Fair'
    else if (strength < 100) message = 'Good'
    else message = 'Strong'
    
    return { 
      valid: strength >= 60, 
      message, 
      strength,
      checks
    }
  },

  // Phone number validation
  validatePhone: (phone) => {
    if (!phone) return { valid: true, message: '' }
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
      return { valid: false, message: 'Please enter a valid phone number' }
    }
    return { valid: true, message: '' }
  },

  // URL validation
  validateUrl: (url) => {
    if (!url) return { valid: true, message: '' }
    try {
      new URL(url)
      return { valid: true, message: '' }
    } catch {
      return { valid: false, message: 'Please enter a valid URL' }
    }
  },

  // Name validation
  validateName: (name) => {
    if (!name) return { valid: false, message: 'Name is required' }
    if (name.length < 2) return { valid: false, message: 'Name must be at least 2 characters' }
    if (name.length > 100) return { valid: false, message: 'Name must be less than 100 characters' }
    return { valid: true, message: '' }
  },

  // Text length validation
  validateTextLength: (text, min = 0, max = 1000) => {
    if (!text && min > 0) return { valid: false, message: `This field is required` }
    if (text && text.length < min) return { valid: false, message: `Minimum ${min} characters required` }
    if (text && text.length > max) return { valid: false, message: `Maximum ${max} characters allowed` }
    return { valid: true, message: '' }
  }
}

// Form validation helpers
export const formHelpers = {
  // Check if form is valid
  isFormValid: (errors) => {
    return Object.keys(errors).length === 0
  },

  // Get field error
  getFieldError: (errors, fieldName) => {
    return errors[fieldName] || ''
  },

  // Validate all fields
  validateForm: (values, rules) => {
    const errors = {}
    
    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName]
      const value = values[fieldName]
      
      fieldRules.forEach(rule => {
        if (rule.required && !value) {
          errors[fieldName] = rule.message
          return
        }
        
        if (value && rule.min && value.length < rule.min) {
          errors[fieldName] = rule.message
          return
        }
        
        if (value && rule.max && value.length > rule.max) {
          errors[fieldName] = rule.message
          return
        }
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
          errors[fieldName] = rule.message
          return
        }
        
        if (value && rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = rule.message
          return
        }
        
        if (value && rule.type === 'url') {
          try {
            new URL(value)
          } catch {
            errors[fieldName] = rule.message
            return
          }
        }
      })
    })
    
    return errors
  },

  // Sanitize form data
  sanitizeFormData: (data) => {
    const sanitized = {}
    
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        sanitized[key] = data[key].trim()
      } else {
        sanitized[key] = data[key]
      }
    })
    
    return sanitized
  },

  // Format validation errors for display
  formatErrors: (errors) => {
    return Object.keys(errors).map(fieldName => ({
      field: fieldName,
      message: errors[fieldName]
    }))
  }
}

// Custom validation hooks
export const useValidation = () => {
  const validateField = (value, rules) => {
    for (const rule of rules) {
      if (rule.required && !value) {
        return { valid: false, message: rule.message }
      }
      
      if (value && rule.min && value.length < rule.min) {
        return { valid: false, message: rule.message }
      }
      
      if (value && rule.max && value.length > rule.max) {
        return { valid: false, message: rule.message }
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        return { valid: false, message: rule.message }
      }
    }
    
    return { valid: true, message: '' }
  }

  return { validateField }
}

export default {
  validationRules,
  realTimeValidation,
  formHelpers,
  useValidation
} 