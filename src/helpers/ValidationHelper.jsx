export const validateRNE = (rne) => {
    // First check: Ensure the RNE is in the correct format (7 digits followed by 1 letter)
    const rneRegex = /^[0-9]{7}[A-Z]$/;
    if (!rneRegex.test(rne)) {
        console.log("Invalid RNE format");
        return false;  // Invalid format
    }

    // Array of valid letters for checksum
    const non = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P',
        'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

    // Sum the products of the digits and their weights (7, 6, ..., 1)
    let sum = 0;
    for (let i = 0; i < 7; i++) {
        sum += parseInt(rne[i]) * (7 - i);
    }

    // Calculate the expected letter from the sum modulus 23
    const expectedLetter = non[sum % 23];

    // Compare the provided letter with the expected letter
    console.log(`Expected letter: ${expectedLetter}`);
    console.log(`Provided letter: ${rne[7]}`);

    // Check if the last character matches the expected letter
    return rne[7] === expectedLetter;
};
