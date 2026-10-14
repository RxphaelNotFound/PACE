# Security Specification — PACE 2.0

## 1. Data Invariants
1. **User Data Isolation**: All documents reside under `/users/{userId}/...`. A user can only read, create, update, or delete documents within their own subcollections where `request.auth.uid == userId`.
2. **Identity Integrity**: `userId` field inside every document must strictly match `request.auth.uid`. No user can spoof authorship or inject another user's UID.
3. **Id Format Hardening**: All collection IDs must conform to `isValidId(id)`: length <= 128 chars and regex `^[a-zA-Z0-9_\-]+$`.
4. **Denial-of-Wallet & Payload Bounding**: String lengths (e.g., titles, descriptions, notes) and number ranges must not exceed the defined bounds in `firebase-blueprint.json`.
5. **No Orphaned Documents**: Subcollections are scoped under a valid user profile document.
6. **No Blanket Reads**: Every list operation is strictly scoped to the authenticated owner's path.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: Attempting to read `/users/user123/missions` without auth token.
2. **Cross-User Snooping**: Authenticated user `attacker` attempting to read `/users/victim/missions/m1`.
3. **UID Spoofing on Create**: Authenticated user `attacker` attempting to create `/users/attacker/missions/m1` with `userId: "victim"`.
4. **Cross-User Write**: Authenticated user `attacker` attempting to create `/users/victim/missions/m1` with `userId: "victim"`.
5. **ID Poisoning Attack**: Attempting to write a document with an ID containing path traversal characters like `../../hack`.
6. **Giant Payload / Denial of Wallet**: Writing a mission with a 50,000 character title.
7. **Invalid Enum Attack**: Writing a mission with `priority: "ultra-mega-urgent"`.
8. **Invalid Category Injection**: Writing a mission with `category: "IllegalCategory"`.
9. **Cross-User Calendar Event Mutate**: User `user1` attempting to update `user2`'s calendar event.
10. **Cross-User Study Session Mutate**: User `user1` attempting to delete `user2`'s study session.
11. **Negative Duration Attack**: Submitting a study session or training record with `durationMinutes: -60`.
12. **Shadow Field Injection**: Writing unexpected fields outside the schema.

## 3. Security Rules Plan
- Master gate: Default deny on root `match /{document=**} { allow read, write: if false; }`.
- Scoped match `/users/{userId}`: Only `request.auth != null && request.auth.uid == userId`.
- Subcollections inherit owner verification.
