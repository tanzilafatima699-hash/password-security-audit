import pwinput
print("Security analyzer")
print("Check the secrity of your password  ")
password = pwinput.pwinput("Enter password: ", mask="*")
print("Password received succesfully")
length = len(password)
print("Password length:", length)
if length >= 8:
    print("Length: Good")
else:
    print("Length: Too short")
    
has_upper = any(char.isupper() for char in password)
has_lower = any(char.islower() for char in password)
has_digit = any(char.isdigit() for char in password)
has_symbol = any(not char.isalnum() for char in password)

print("Contains uppercase:", has_upper)
print("Contains lowercase:", has_lower)
print("Contains number:", has_digit)
print("Contains special character:", has_symbol)

score = 0

if length >= 8:
    score += 1

if has_upper:
    score += 1

if has_lower:
    score += 1

if has_digit:
    score += 1

if has_symbol:
    score += 1

print("Password Score:", score, "/ 5")

if score <= 2:
    print("Password Strength: Weak")
elif score <= 4:
    print("Password Strength: Moderate")
else:
    print("Password Strength: Strong")

common_passwords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "admin",
    "password123",
    "Password123!"
]

if password.lower() in [p.lower() for p in common_passwords]:
    print("Warning: This is a common password!")
else:
    print("Common password check: Passed")

print("\n--- Improvement Suggestions ---")

if length < 8:
    print("- Use at least 8 characters.")

if not has_upper:
    print("- Add an uppercase letter (A-Z).")

if not has_lower:
    print("- Add a lowercase letter (a-z).")

if not has_digit:
    print("- Add a number (0-9).")

if not has_symbol:
    print("- Add a special character (!, @, #, etc.).")

if password.lower() in [p.lower() for p in common_passwords]:
    print("- Avoid common passwords. Choose a unique password.")

if (
    length >= 8
    and has_upper
    and has_lower
    and has_digit
    and has_symbol
    and password.lower() not in [p.lower() for p in common_passwords]
):
    print("No basic improvements detected!")

def is_common_password(password, common_passwords):
    for p in common_passwords:
        if password.lower() == p.lower():
            return True

    return False

