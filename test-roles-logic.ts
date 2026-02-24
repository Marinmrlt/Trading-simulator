import { Role } from './src/contexts/users/domain/models/role.enum';

function checkAccess(userRole: number, requiredRoles: number): boolean {
    return (userRole & requiredRoles) !== 0; // The logic in RolesGuard
}

console.log("--- Verifying Bitwise Role Guard Logic (New Roles) ---");

const Classic = Role.Classic;   // 1
const Admin = Role.Admin;       // 2
const Premium = Role.Premium;   // 4

// Scenario 1: Route requires Classic | Admin | Premium (7)
// Use case: Update own profile
const updateProfileRoles = Classic | Admin | Premium;
console.log(`\nScenario 1: Route requires Classic|Admin|Premium (${updateProfileRoles})`);

console.log(`Classic (1) access: ${checkAccess(Classic, updateProfileRoles)} (Expected: true)`);
console.log(`Premium (4) access: ${checkAccess(Premium, updateProfileRoles)} (Expected: true)`);
console.log(`Guest (0) access: ${checkAccess(0, updateProfileRoles)} (Expected: false)`);


// Scenario 2: Route requires Admin (2)
// Use case: View other profiles (Strict)
const adminOnly = Admin;
console.log(`\nScenario 2: Route requires Admin (${adminOnly})`);

console.log(`Classic (1) access: ${checkAccess(Classic, adminOnly)} (Expected: false)`);
console.log(`Admin (2) access: ${checkAccess(Admin, adminOnly)} (Expected: true)`);
console.log(`Admin+Premium (6) access: ${checkAccess(Admin | Premium, adminOnly)} (Expected: true)`);
