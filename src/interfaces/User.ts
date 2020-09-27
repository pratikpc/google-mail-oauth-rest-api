// User Interface for File Storage
// We store
export default interface User {
    // Refresh Token Can be used to find Access Token
    refresh_token: string;
    // User Email
    email: string;
    // User Code Generated on Sign In
    code: string;
}
