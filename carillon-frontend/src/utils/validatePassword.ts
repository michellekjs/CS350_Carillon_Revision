export default function validatePassword(password: string) {
  // At least 10 characters by combining two or more of English letters, numbers, and special characters (English letter required),
  // or at least 8 characters by combining all English letters, numbers, and special characters.
  // Valid special chracters include !, @, #, $, %, ^, &, or *. Referenced from https://www.ibm.com/support/pages/password-policy-and-passwords-special-characters:
  const regex =
    /(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{10,}|(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}/
  return regex.test(password)
}
