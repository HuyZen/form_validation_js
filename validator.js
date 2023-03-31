// Đối tượng `Validator`
function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    // Hàm thực hiện validate
    function validate(inputElement,rule) {
        var errorMessage = rule.test(inputElement.value)
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        if(errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        
        return !errorMessage
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)

    if(formElement) {

        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true

            // Lặp qua từng rule và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })


            if(isFormValid) {
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')

                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values
                    }, {})

                    options.onSubmit(formValues)
                }
            }
        }

        // Lặp qua mỗi rule và xử lý (lắng nghe event blur, input,...)
        options.rules.forEach(function(rule) {
            var inputElement = formElement.querySelector(rule.selector)

            // Xử lý trường hợp blur ra khỏi input
            if(inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement,rule)
                }
            }

            // Xử lý trường hợp người dùng đang nhập vào input
            if(inputElement) {
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        })
    }
}

// Định nghĩa rules
Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : 'Vui lòng nhập đầy đủ thông tin'
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng email'
        }
    }
}

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.confirmPassword = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}