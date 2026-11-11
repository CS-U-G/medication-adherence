namespace MedicationAdherence.Api.Validators
{
    public static class ValidationHelper
    {
        public static bool IsNumberInRange(int value, int min, int max)
        {
            return value >= min && value <= max;
        }

        public static bool IsValidId(int id)
        {
            return id > 0;
        }

        public static bool IsNotEmpty(string? text)
        {
            return !string.IsNullOrWhiteSpace(text);
        }

        public static bool IsValidGender(char? gender)
        {
            if (gender == null) return true;
            return gender == 'M' || gender == 'F';
        }

        public static bool IsStrongPassword(string? password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            {
                return false;
            }

            bool hasLetter = false;
            bool hasDigit = false;
            bool hasSymbol = false;

            foreach (char c in password)
            {
                if (char.IsLetter(c))
                {
                    hasLetter = true;
                }
                else if (char.IsDigit(c))
                {
                    hasDigit = true;
                }
                else if (!char.IsWhiteSpace(c))
                {
                    hasSymbol = true;
                }
            }

            return hasLetter && hasDigit && hasSymbol;
        }
    }
}
